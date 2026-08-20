'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

const ColorModeContext = createContext({ mode: 'dark', toggleColorMode: () => {} })

export const useColorMode = () => useContext(ColorModeContext)

export default function Providers({ children }) {
  const [mode, setMode] = useState('dark')

  useEffect(() => {
    const stored = window.localStorage.getItem('color-mode')
    if (stored === 'light' || stored === 'dark') setMode(stored)
  }, [])

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'dark' ? 'light' : 'dark'
          window.localStorage.setItem('color-mode', next)
          return next
        })
      }
    }),
    [mode]
  )

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#10a37f' },
          ...(mode === 'dark'
            ? {
                background: { default: '#212121', paper: '#2a2a2a' },
                text: { primary: '#ececec' }
              }
            : {
                background: { default: '#f7f7f8', paper: '#ffffff' }
              })
        },
        shape: { borderRadius: 10 },
        typography: {
          fontFamily: 'var(--font-inter), Roboto, sans-serif'
        }
      }),
    [mode]
  )

  return (
    <SessionProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </SessionProvider>
  )
}
