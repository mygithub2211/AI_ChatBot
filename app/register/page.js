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

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      const signInRes = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false
      })

      setLoading(false)

      if (signInRes?.error) {
        router.push('/login')
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setLoading(false)
      setError('Something went wrong. Please try again.')
    }
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
            Create your account
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Sign up to start chatting with SupportAI
          </Typography>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component='form' onSubmit={handleSubmit} display='flex' flexDirection='column' gap={2}>
          <TextField
            label='Full name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            autoFocus
          />
          <TextField
            label='Email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label='Password'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText='At least 8 characters'
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
          <TextField
            label='Confirm password'
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
          />
          <Button type='submit' variant='contained' size='large' disabled={loading} sx={{ mt: 1, py: 1.2 }}>
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Sign Up'}
          </Button>
        </Box>

        <Typography variant='body2' align='center' sx={{ mt: 3 }}>
          Already have an account?{' '}
          <Link href='/login' style={{ color: 'inherit', fontWeight: 600 }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}
