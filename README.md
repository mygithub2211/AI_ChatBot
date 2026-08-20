# SupportAI — AI Customer Support Assistant

@author Phat Tran

Link: https://ai-chat-bot-nu-inky.vercel.app

An AI-powered customer support chat app built with Next.js, MUI, and OpenAI (GPT-4o-mini), with secure accounts and private per-user chat history.

## Features

- **Sign up / sign in** with email + password (hashed with bcrypt, sessions via NextAuth.js)
- **Private chat history** — each account only ever sees its own conversations
- **New chat** button to start a fresh conversation at any time
- **Streaming AI responses** from GPT-4o-mini, persisted to the database as they arrive
- **Auto-titled chats** based on your first message
- **Rename / delete** any conversation, with a search box to filter your chat list
- **Read aloud** (browser text-to-speech) and **copy** on assistant replies
- **Dark / light theme** toggle (persisted locally)
- **Responsive layout** — collapsible sidebar drawer on mobile

## Tech stack

- Next.js 14 (App Router) + MUI
- NextAuth.js (Credentials provider, JWT sessions)
- Prisma + PostgreSQL for users, chats, and messages
- OpenAI API (`gpt-4o-mini`, streaming)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:

   ```bash
   DATABASE_URL=your-postgres-connection-string
   ```

   and in `.env.local`:

   ```bash
   OPENAI_API_KEY=your-openai-api-key
   NEXTAUTH_SECRET=a-random-secret-string
   NEXTAUTH_URL=http://localhost:3000
   ```

   Neither file is committed — each is `.gitignore`d since both now hold real credentials.

3. Apply the database schema:

   ```bash
   npx prisma migrate deploy
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), create an account, and start chatting.


