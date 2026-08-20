import { Inter } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: 'SupportAI — AI Customer Support Assistant',
  description:
    'An AI-powered customer support chat assistant with secure sign-in, sign-up, and private per-user chat history.'
}

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={inter.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
