'use client'

import { useMemo, useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  InputAdornment,
  Divider,
  Avatar,
  Tooltip,
  Skeleton
} from '@mui/material'
import AddCommentIcon from '@mui/icons-material/AddComment'
import SearchIcon from '@mui/icons-material/Search'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LogoutIcon from '@mui/icons-material/Logout'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'

function initials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Sidebar({
  chats,
  loadingChats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  user,
  mode,
  toggleColorMode,
  onLogout
}) {
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const filteredChats = useMemo(() => {
    if (!search.trim()) return chats
    return chats.filter((c) => c.title.toLowerCase().includes(search.trim().toLowerCase()))
  }, [chats, search])

  const startRename = (chat) => {
    setEditingId(chat.id)
    setEditValue(chat.title)
  }

  const commitRename = (chatId) => {
    if (editValue.trim()) onRenameChat(chatId, editValue.trim())
    setEditingId(null)
  }

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRight: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* brand + new chat */}
      <Box p={2}>
        <Box display='flex' alignItems='center' gap={1} mb={2}>
          <SupportAgentIcon sx={{ color: 'primary.main' }} />
          <Typography variant='subtitle1' fontWeight={700}>
            SupportAI
          </Typography>
        </Box>

        <Box
          onClick={onNewChat}
          role='button'
          tabIndex={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 1.5,
            py: 1,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <AddCommentIcon fontSize='small' color='primary' />
          <Typography variant='body2' fontWeight={600}>
            New chat
          </Typography>
        </Box>
      </Box>

      {/* search */}
      <Box px={2} pb={1}>
        <TextField
          size='small'
          fullWidth
          placeholder='Search chats'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon fontSize='small' />
              </InputAdornment>
            )
          }}
        />
      </Box>

      {/* chat list */}
      <Box flexGrow={1} overflow='auto' px={1}>
        {loadingChats ? (
          <Box px={1}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} height={44} sx={{ my: 0.5 }} />
            ))}
          </Box>
        ) : (
          <List dense>
            {filteredChats.length === 0 && (
              <Typography variant='body2' color='text.secondary' textAlign='center' mt={2}>
                No chats yet
              </Typography>
            )}
            {filteredChats.map((chat) => (
              <ListItemButton
                key={chat.id}
                selected={chat.id === activeChatId}
                onClick={() => editingId !== chat.id && onSelectChat(chat.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover .chat-actions': { opacity: 1 }
                }}
              >
                {editingId === chat.id ? (
                  <Box display='flex' alignItems='center' gap={0.5} width='100%'>
                    <TextField
                      size='small'
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename(chat.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      fullWidth
                    />
                    <IconButton size='small' onClick={(e) => { e.stopPropagation(); commitRename(chat.id) }}>
                      <CheckIcon fontSize='small' />
                    </IconButton>
                    <IconButton size='small' onClick={(e) => { e.stopPropagation(); setEditingId(null) }}>
                      <CloseIcon fontSize='small' />
                    </IconButton>
                  </Box>
                ) : (
                  <>
                    <ListItemText
                      primary={chat.title}
                      primaryTypographyProps={{ noWrap: true, variant: 'body2' }}
                    />
                    <Box
                      className='chat-actions'
                      sx={{ opacity: 0, transition: 'opacity 0.15s', display: 'flex' }}
                    >
                      <Tooltip title='Rename'>
                        <IconButton size='small' onClick={(e) => { e.stopPropagation(); startRename(chat) }}>
                          <EditOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Delete'>
                        <IconButton
                          size='small'
                          onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id) }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </>
                )}
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      <Divider />

      {/* user footer */}
      <Box p={1.5} display='flex' alignItems='center' gap={1}>
        <Avatar sx={{ width: 32, height: 32, fontSize: 14, bgcolor: 'primary.main' }}>
          {initials(user?.name)}
        </Avatar>
        <Box flexGrow={1} minWidth={0}>
          <Typography variant='body2' noWrap fontWeight={600}>
            {user?.name}
          </Typography>
          <Typography variant='caption' color='text.secondary' noWrap component='div'>
            {user?.email}
          </Typography>
        </Box>
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <IconButton size='small' onClick={toggleColorMode}>
            {mode === 'dark' ? <LightModeIcon fontSize='small' /> : <DarkModeIcon fontSize='small' />}
          </IconButton>
        </Tooltip>
        <Tooltip title='Sign out'>
          <IconButton size='small' onClick={onLogout}>
            <LogoutIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
