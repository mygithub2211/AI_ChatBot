import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/chats - list the signed-in user's chats, most recently updated first
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chats = await prisma.chat.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, title: true, createdAt: true, updatedAt: true }
  })

  return NextResponse.json(chats)
}

// POST /api/chats - create a new chat for the signed-in user
export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chat = await prisma.chat.create({
    data: {
      userId: session.user.id,
      title: 'New Chat',
      messages: {
        create: [
          {
            role: 'assistant',
            content: 'Hi, I am your Support Agent. How can I help you today?'
          }
        ]
      }
    },
    include: { messages: true }
  })

  return NextResponse.json(chat)
}
