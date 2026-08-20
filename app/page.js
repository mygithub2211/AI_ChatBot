'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Box, Drawer, Snackbar, Alert, CircularProgress } from '@mui/material'
import Sidebar from '@/components/Sidebar'
import ChatWindow from '@/components/ChatWindow'
import { useColorMode } from './providers'

export default function Home() {
  const { data: session, status } = useSession()
  const { mode, toggleColorMode } = useColorMode()

  const [chats, setChats] = useState([])
  const [loadingChats, setLoadingChats] = useState(true)
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentSpeech, setCurrentSpeech] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' })

  const hasLoadedRef = useRef(false)

  const notify = (message, severity = 'error') => setSnackbar({ open: true, message, severity })

  const selectChat = useCallback(async (chatId) => {
    setActiveChatId(chatId)
    setMobileOpen(false)
    try {
      const res = await fetch(`/api/chats/${chatId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(data.messages)
    } catch {
      notify('Could not load that chat.')
    }
  }, [])

  const createChat = useCallback(async () => {
    try {
      const res = await fetch('/api/chats', { method: 'POST' })
      const chat = await res.json()
      setChats((prev) => [{ id: chat.id, title: chat.title, updatedAt: chat.createdAt }, ...prev])
      setActiveChatId(chat.id)
      setMessages(chat.messages)
      setMobileOpen(false)
    } catch {
      notify('Could not start a new chat.')
    }
  }, [])

  // load the user's chats once authenticated
  useEffect(() => {
    if (status !== 'authenticated' || hasLoadedRef.current) return
    hasLoadedRef.current = true

    const loadChats = async () => {
      setLoadingChats(true)
      try {
        const res = await fetch('/api/chats')
        const data = await res.json()
        setChats(data)

        if (data.length > 0) {
          selectChat(data[0].id)
        } else {
          await createChat()
        }
      } catch {
        notify('Could not load your chats. Please refresh.')
      } finally {
        setLoadingChats(false)
      }
    }

    loadChats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const deleteChat = async (chatId) => {
    const remaining = chats.filter((c) => c.id !== chatId)
    try {
      await fetch(`/api/chats/${chatId}`, { method: 'DELETE' })
      setChats(remaining)
      if (activeChatId === chatId) {
        if (remaining.length > 0) {
          selectChat(remaining[0].id)
        } else {
          await createChat()
        }
      }
    } catch {
      notify('Could not delete that chat.')
    }
  }

  const renameChat = async (chatId, title) => {
    const previous = chats
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title } : c)))
    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      })
      if (!res.ok) throw new Error()
    } catch {
      setChats(previous)
      notify('Could not rename that chat.')
    }
  }

  const sendMessage = async () => {
    const content = message.trim()
    if (!content || !activeChatId || sending) return

    if (currentSpeech) {
      speechSynthesis.cancel()
      setCurrentSpeech(null)
    }

    setMessage('')
    setSending(true)
    setMessages((prev) => [
      ...prev,
      { role: 'user', content, createdAt: new Date().toISOString() },
      { role: 'assistant', content: '' }
    ])

    try {
      const res = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (!res.ok || !res.body) throw new Error()

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          const rest = prev.slice(0, -1)
          return [...rest, { ...last, content: last.content + text }]
        })
      }

      // refresh chat list so title/ordering stays in sync
      const listRes = await fetch('/api/chats')
      if (listRes.ok) setChats(await listRes.json())
    } catch {
      notify('Something went wrong sending your message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const speakMessage = (text) => {
    if (currentSpeech) speechSynthesis.cancel()
    const speech = new SpeechSynthesisUtterance(text)
    setCurrentSpeech(speech)
    speechSynthesis.speak(speech)
  }

  if (status === 'loading') {
    return (
      <Box height='100vh' display='flex' alignItems='center' justifyContent='center'>
        <CircularProgress />
      </Box>
    )
  }

  const activeChat = chats.find((c) => c.id === activeChatId)

  const sidebarProps = {
    chats,
    loadingChats,
    activeChatId,
    onSelectChat: selectChat,
    onNewChat: createChat,
    onDeleteChat: deleteChat,
    onRenameChat: renameChat,
    user: session?.user,
    mode,
    toggleColorMode,
    onLogout: () => signOut({ callbackUrl: '/login' })
  }

  return (
    <Box width='100vw' height='100vh' display='flex' overflow='hidden'>
      {/* desktop sidebar */}
      <Box sx={{ display: { xs: 'none', md: 'block' }, height: '100%' }}>
        <Sidebar {...sidebarProps} />
      </Box>

      {/* mobile sidebar */}
      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Sidebar {...sidebarProps} />
      </Drawer>

      <ChatWindow
        chatTitle={activeChat?.title}
        messages={messages}
        message={message}
        setMessage={setMessage}
        onSend={sendMessage}
        sending={sending}
        onSpeak={speakMessage}
        onOpenMobileSidebar={() => setMobileOpen(true)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant='filled'>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
