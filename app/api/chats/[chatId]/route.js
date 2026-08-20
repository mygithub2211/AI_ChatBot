import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getOwnedChat(chatId, userId) {
  const chat = await prisma.chat.findUnique({ where: { id: chatId } })
  if (!chat || chat.userId !== userId) return null
  return chat
}

// GET /api/chats/:chatId - fetch a single chat with its messages (owner only)
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chat = await getOwnedChat(params.chatId, session.user.id)
  if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 })

  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' }
  })

  return NextResponse.json({ ...chat, messages })
}

// PATCH /api/chats/:chatId - rename a chat (owner only)
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chat = await getOwnedChat(params.chatId, session.user.id)
  if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 })

  const { title } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Title is required.' }, { status: 400 })

  const updated = await prisma.chat.update({
    where: { id: chat.id },
    data: { title: title.trim().slice(0, 80) }
  })

  return NextResponse.json(updated)
}

// DELETE /api/chats/:chatId - delete a chat and its messages (owner only)
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const chat = await getOwnedChat(params.chatId, session.user.id)
  if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 })

  await prisma.chat.delete({ where: { id: chat.id } })

  return NextResponse.json({ success: true })
}
