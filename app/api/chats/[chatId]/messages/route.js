import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import OpenAI from 'openai'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// system prompt for ai assistant
const systemPrompt = `
You are an AI-powered customer support assistant for a revolutionary platform that empowers users to accomplish anything they desire. This platform offers a wide range of services and tools that cover every aspect of life, from productivity and entertainment to personal growth and well-being.

Your role is to assist users with any questions or issues they might have, providing clear, concise, and helpful responses. You should always aim to enhance the user's experience on the platform, guiding them to the resources, features, or services that best meet their needs.

Key guidelines:
1. Be friendly and professional: maintain a warm, approachable tone while staying professional. The platform is vast, so be patient and understanding as users explore its features.
2. Provide clear and concise information: users may have questions about various services. Break down complex topics into simple, easy-to-understand explanations.
3. Be proactive: suggest additional features or services that could enhance the user's experience, even if they haven't explicitly asked about them.
4. Personalize responses: whenever possible, tailor your responses to the user's specific needs or past interactions with the platform.
5. Handle common issues efficiently: be prepared to address frequently asked questions and common issues, such as account management, service access, or feature navigation.
6. Stay up-to-date: the platform constantly evolves, with new features and services being added. Ensure that your knowledge is current and that you can assist with the latest updates.
7. Escalate when necessary: if you encounter a problem that requires human intervention or is outside your knowledge base, guide the user on how to escalate the issue effectively.

Remember, your goal is to make the user's experience as seamless and enjoyable as possible on this all-encompassing platform.
`

// POST /api/chats/:chatId/messages - send a user message, stream back the assistant reply,
// and persist both messages so chat history is preserved per-user
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chat = await prisma.chat.findUnique({ where: { id: params.chatId } })
  if (!chat || chat.userId !== session.user.id) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
  }

  const { content } = await req.json()
  if (!content?.trim()) {
    return NextResponse.json({ error: 'Message content is required.' }, { status: 400 })
  }

  const priorMessages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' }
  })

  await prisma.message.create({
    data: { chatId: chat.id, role: 'user', content: content.trim() }
  })

  // auto-title the chat from the first user message
  const hasPriorUserMessage = priorMessages.some((m) => m.role === 'user')
  if (!hasPriorUserMessage && (chat.title === 'New Chat' || !chat.title)) {
    const trimmed = content.trim()
    const autoTitle = trimmed.length > 50 ? `${trimmed.slice(0, 50)}…` : trimmed
    await prisma.chat.update({ where: { id: chat.id }, data: { title: autoTitle } })
  }

  const openai = new OpenAI()

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...priorMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: content.trim() }
    ],
    model: 'gpt-4o-mini',
    stream: true
  })

  let assistantContent = ''

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content
          if (text) {
            assistantContent += text
            controller.enqueue(encoder.encode(text))
          }
        }
      } catch (error) {
        controller.error(error)
      } finally {
        controller.close()
        if (assistantContent) {
          await prisma.message.create({
            data: { chatId: chat.id, role: 'assistant', content: assistantContent }
          })
        }
        await prisma.chat.update({ where: { id: chat.id }, data: { updatedAt: new Date() } })
      }
    }
  })

  return new NextResponse(stream)
}
