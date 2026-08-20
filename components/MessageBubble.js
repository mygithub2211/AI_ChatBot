'use client'

import { useState } from 'react'
import { Box, Typography, IconButton, Avatar, Tooltip } from '@mui/material'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckIcon from '@mui/icons-material/Check'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import PersonIcon from '@mui/icons-material/Person'

function formatTime(dateInput) {
  if (!dateInput) return ''
  const date = new Date(dateInput)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessageBubble({ message, onSpeak }) {
  const [copied, setCopied] = useState(false)
  const isAssistant = message.role === 'assistant'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable, ignore
    }
  }

  return (
    <Box
      display='flex'
      justifyContent={isAssistant ? 'flex-start' : 'flex-end'}
      alignItems='flex-end'
      gap={1}
      mb={2}
    >
      {isAssistant && (
        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
          <SupportAgentIcon fontSize='small' />
        </Avatar>
      )}

      <Box maxWidth='75%'>
        <Box
          sx={{
            bgcolor: isAssistant ? 'background.paper' : 'primary.main',
            color: isAssistant ? 'text.primary' : '#fff',
            borderRadius: 3,
            px: 2,
            py: 1.25,
            boxShadow: 1,
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        >
          <Typography variant='body1'>{message.content || ' '}</Typography>
        </Box>

        <Box
          display='flex'
          alignItems='center'
          gap={0.5}
          justifyContent={isAssistant ? 'flex-start' : 'flex-end'}
          mt={0.25}
          px={0.5}
        >
          {message.createdAt && (
            <Typography variant='caption' color='text.secondary'>
              {formatTime(message.createdAt)}
            </Typography>
          )}
          {isAssistant && message.content && (
            <>
              <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                <IconButton size='small' onClick={handleCopy}>
                  {copied ? <CheckIcon sx={{ fontSize: 14 }} /> : <ContentCopyIcon sx={{ fontSize: 14 }} />}
                </IconButton>
              </Tooltip>
              <Tooltip title='Read aloud'>
                <IconButton size='small' onClick={() => onSpeak(message.content)}>
                  <VolumeUpIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>

      {!isAssistant && (
        <Avatar sx={{ bgcolor: 'grey.600', width: 32, height: 32 }}>
          <PersonIcon fontSize='small' />
        </Avatar>
      )}
    </Box>
  )
}
