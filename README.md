# sork-client

SORK Cloud Frontend — Next.js 15 dashboard with animated agent pipeline, BYOK manager, and SORK chat assistant.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Auth**: Clerk
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **API**: Calls `sork-back` (Hono)

## Setup

```bash
npm install
cp .env.example .env.local
# fill in Clerk keys + NEXT_PUBLIC_API_URL pointing to sork-back
npm run dev
```

## Features

- Animated agent pipeline visualization (Nemotron → Triage → Fix → Verify)
- Chat with SORK — conversational BYOK setup and scan interface
- BYOK Manager — add Groq, Claude, NVIDIA, OpenAI, Cohere, or custom endpoints
- License key management — issue/revoke CLI keys
- Usage bar — quota tracking per plan
- Dark theme with Framer Motion animations and animated flow lines
