'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <Box
      minHeight='100vh'
      display='flex'
      alignItems='center'
      justifyContent='center'
      p={2}
      sx={{
        background: (t) =>
          t.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #212121, #171717)'
            : 'linear-gradient(135deg, #f0f2f5, #e4e6eb)'
      }}
    >
      <Paper elevation={4} sx={{ p: { xs: 3, sm: 5 }, width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <Box display='flex' flexDirection='column' alignItems='center' mb={3}>
          <SupportAgentIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1 }} />
          <Typography variant='h5' fontWeight={700}>
            Welcome back
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Sign in to continue to SupportAI
          </Typography>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2}>
          <TextField
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label='Password'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge='end'>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button type='submit' variant='contained' size='large' disabled={loading} sx={{ mt: 1, py: 1.2 }}>
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Sign In'}
          </Button>
        </Box>

        <Typography variant='body2' align='center' sx={{ mt: 3 }}>
          Don&apos;t have an account?{' '}
          <Link href='/register' style={{ color: 'inherit', fontWeight: 600 }}>
            Sign up
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}
