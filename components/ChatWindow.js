'use client'

import { useEffect, useRef } from 'react'
import { Box, Typography, TextField, IconButton, InputAdornment, CircularProgress } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import MenuIcon from '@mui/icons-material/Menu'
import MessageBubble from './MessageBubble'

export default function ChatWindow({
  chatTitle,
  messages,
  message,
  setMessage,
  onSend,
  sending,
  onSpeak,
  onOpenMobileSidebar
}) {
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <Box flexGrow={1} display='flex' flexDirection='column' height='100%' minWidth={0}>
      {/* top bar */}
      <Box
        display='flex'
        alignItems='center'
        gap={1}
        px={2}
        py={1.5}
        borderBottom='1px solid'
        borderColor='divider'
      >
        <IconButton onClick={onOpenMobileSidebar} sx={{ display: { xs: 'inline-flex', md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <Typography variant='subtitle1' fontWeight={600} noWrap>
          {chatTitle || 'SupportAI'}
        </Typography>
      </Box>

      {/* messages */}
      <Box ref={scrollRef} flexGrow={1} overflow='auto' px={{ xs: 2, sm: 4 }} py={3}>
        <Box maxWidth={760} mx='auto'>
          {messages.map((msg, idx) => (
            <MessageBubble key={msg.id || idx} message={msg} onSpeak={onSpeak} />
          ))}
          {sending && messages[messages.length - 1]?.content === '' && (
            <Box display='flex' alignItems='center' gap={1} ml={5} mb={2}>
              <CircularProgress size={16} />
              <Typography variant='caption' color='text.secondary'>
                SupportAI is typing…
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* composer */}
      <Box px={{ xs: 2, sm: 4 }} pb={2.5} pt={1}>
        <Box maxWidth={760} mx='auto'>
          <TextField
            placeholder='Send a message… (Enter to send, Shift+Enter for a new line)'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            multiline
            maxRows={6}
            InputProps={{
              sx: { borderRadius: 4, bgcolor: 'background.paper' },
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={onSend} disabled={!message.trim() || sending} color='primary'>
                    <SendIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
