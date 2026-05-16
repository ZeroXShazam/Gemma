# Gemma · German A1–A2 Trainer

A spaced-repetition flashcard app for learning German grammar and vocabulary at A1–A2 level. Built with Next.js, Better Auth, and Supabase.

**Live:** https://gemma-iota.vercel.app

---

## Features

- **SM-2 spaced repetition** — learning steps (1 min → 10 min), review, mature states with configurable ease
- **129 cards across 13 types** — verbs, nouns, prepositions, wh-words, pronouns, possessives, adjectives, modals, Perfekt, negation, comparatives, reflexives, conjunctions
- **Two-phase review** — Phase 1: fill-in-the-blank cloze; Phase 2: rate recall (Again / Hard / Good / Easy)
- **Per-user progress** — SRS state stored in Supabase per user, persists across sessions and devices
- **20 new cards/day limit** — configurable daily intake with automatic reset
- **Filters** — level tabs (A1 / A2 / All) and per-type toggles
- **Keyboard shortcuts** — Enter to submit/continue, 1–4 to rate
- **Auth** — email/password, sign-up, Google OAuth via Better Auth

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | Better Auth v1.6 (email/password + Google OAuth + magic link) |
| Database | Supabase (PostgreSQL via pooler) |
| ORM/adapter | Kysely 0.28 + pg |
| Deployment | Vercel |
| Package manager | pnpm |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[[...all]]/   # Better Auth handler
│   │   ├── user/progress/     # GET/PUT card SRS state
│   │   └── user/settings/     # GET/PUT user settings & daily counters
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Auth gate → AuthForm or Trainer
└── lib/
    ├── auth.ts                # Better Auth server config
    ├── auth-client.ts         # Better Auth React client
    ├── cards.ts               # 129 card definitions
    ├── srs.ts                 # SM-2 algorithm (computeNext, previewIntervals)
    ├── supabase.ts            # Supabase client + admin
    └── types.ts               # Shared TypeScript types
```

---

## Database Schema

Run `schema.sql` (Better Auth core tables) and `schema-progress.sql` (trainer tables) in your Supabase SQL editor, or via the pg client:

```bash
node -e "
const { Pool } = require('pg')
const fs = require('fs')
const pool = new Pool({ host: '...', user: '...', password: '...', database: 'postgres', ssl: { rejectUnauthorized: false } })
pool.query(fs.readFileSync('schema-progress.sql', 'utf8')).then(() => { console.log('done'); pool.end() })
"
```

**`user_card_progress`** — one row per (user, card): ease, interval, reps, lapses, due (unix ms), state, step

**`user_settings`** — one row per user: enabled_types, new_cards_today, today_date, total_reviewed

---

## Local Development

```bash
pnpm install
```

Create `.env.local`:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=no-verify
BETTER_AUTH_SECRET=<random 32-char string>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

```bash
pnpm dev
```

Open http://localhost:3000.

---

## Google OAuth Setup

In [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials → your OAuth 2.0 client:

- **Authorized JavaScript origins:** `https://your-domain.vercel.app`, `http://localhost:3000`
- **Authorized redirect URIs:** `https://your-domain.vercel.app/api/auth/callback/google`, `http://localhost:3000/api/auth/callback/google`

When adding credentials to Vercel, always use `printf` (not `echo`) to avoid trailing newlines:

```bash
printf 'your-secret' | vercel env add GOOGLE_CLIENT_SECRET production
```
