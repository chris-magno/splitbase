# 🚀 SplitBase AI — Complete Setup Guide

> **AI-powered bill splitting with Google Gemini 2.0 Flash**  
> Built with Next.js 14 · Supabase · NextAuth.js · Tailwind CSS · Vercel

---

## 📋 Table of Contents

1. [What You're Building](#what-youre-building)
2. [Phase 0 — Prerequisites](#phase-0--prerequisites-10-min)
3. [Phase 1 — Supabase Database](#phase-1--supabase-database-15-min)
4. [Phase 2 — Google Gemini API Key](#phase-2--google-gemini-api-key-5-min)
5. [Phase 3 — Google OAuth](#phase-3--google-oauth-credentials-10-min)
6. [Phase 4 — Project Setup](#phase-4--project-setup-5-min)
7. [Phase 5 — Environment Variables](#phase-5--environment-variables-5-min)
8. [Phase 6 — Run Locally](#phase-6--run-locally-2-min)
9. [Phase 7 — Deploy to Vercel](#phase-7--deploy-to-vercel-10-min)
10. [Troubleshooting](#troubleshooting)
11. [How the AI Features Work](#how-the-ai-features-work)

---

## What You're Building

SplitBase AI is a bill-splitting app powered by **Google Gemini 2.0 Flash**:

| Feature | How it works |
|---|---|
| 📝 Natural language expense entry | Type "Dinner $80, Alice had steak so +$20 for her" → Gemini parses it |
| 📸 Receipt photo scanning | Upload a photo → Gemini reads every line item automatically |
| 🤖 AI debt reminders | Gemini drafts human-sounding messages to collect what you're owed |
| 💬 AI chat assistant | Ask "What do I owe this month?" and get a real answer |
| 👥 Group management | Create groups, invite friends, track who owes whom |

---

## Phase 0 — Prerequisites (10 min)

You need these installed on your computer before starting.

### Step 1 — Install Node.js

Node.js is the JavaScript runtime that runs the app.

1. Go to **https://nodejs.org**
2. Download the **LTS** (Long-Term Support) version
3. Run the installer, click "Next" through all steps
4. Verify it worked: open Terminal (Mac) or Command Prompt (Windows) and type:
   ```bash
   node --version
   ```
   You should see something like `v20.11.0`

### Step 2 — Install Git

Git is used to track your code.

- **Mac**: It's usually already installed. Type `git --version` to check. If not, install Xcode Command Line Tools: `xcode-select --install`
- **Windows**: Download from **https://git-scm.com** and install

### Step 3 — Create accounts (all free)

You'll need accounts on these services:

| Service | URL | What it's for |
|---|---|---|
| Supabase | https://supabase.com | Database (PostgreSQL) |
| Google Cloud | https://console.cloud.google.com | OAuth sign-in + Gemini AI |
| Vercel | https://vercel.com | Hosting/deployment |
| GitHub | https://github.com | Code storage (needed for Vercel) |

---

## Phase 1 — Supabase Database (15 min)

Supabase is your database. All groups, expenses, and user data is stored here.

### Step 1 — Create a Supabase project

1. Go to **https://supabase.com** and click **Start your project**
2. Sign in with GitHub
3. Click **New project**
4. Fill in:
   - **Organization**: your username (auto-filled)
   - **Name**: `splitbase-ai`
   - **Database Password**: create a strong password (save it somewhere safe)
   - **Region**: pick the closest to you
5. Click **Create new project**
6. Wait ~2 minutes for it to set up

### Step 2 — Run the database schema

This creates all the tables your app needs.

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project
4. Copy the **entire contents** of that file
5. Paste it into the SQL Editor
6. Click the green **Run** button
7. You should see "Success. No rows returned" — that's correct!

### Step 3 — Create a storage bucket for receipts

1. In Supabase, click **Storage** in the left sidebar
2. Click **New bucket**
3. Name it exactly: `receipts`
4. Toggle **Public bucket** to OFF (keep it private)
5. Click **Create bucket**

### Step 4 — Get your Supabase credentials

1. In Supabase, click **Settings** (gear icon) → **API**
2. Find and copy these values — you'll need them in Phase 5:

```
Project URL:        https://xxxxxxxxxxxx.supabase.co
anon public key:    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key:   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Important**: The `service_role` key is secret — never share it publicly or commit it to Git.

---

## Phase 2 — Google Gemini API Key (5 min)

Gemini is the AI brain of the app. It parses receipts, understands natural language, and drafts reminders.

### Step 1 — Get a Gemini API key

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **Create API key**
4. Copy the key — it looks like: `AIzaSyD...`

> ✅ The free tier gives you **1,500 requests/day** — more than enough for development and a hackathon demo.

---

## Phase 3 — Google OAuth Credentials (10 min)

This lets users sign in with their Google account (one click, no password).

### Step 1 — Create a Google Cloud project

1. Go to **https://console.cloud.google.com**
2. Click the project dropdown at the top → **New Project**
3. Name it `SplitBase AI` → click **Create**

### Step 2 — Enable required APIs

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Google+ API"** and click **Enable**
3. Search for **"Identity Toolkit API"** and click **Enable**

### Step 3 — Create OAuth credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure the consent screen first:
   - User Type: **External**
   - App name: `SplitBase AI`
   - User support email: your email
   - Developer contact: your email
   - Click **Save and Continue** through all steps
4. Back at Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `SplitBase AI Web`
   - **Authorized redirect URIs** — add these:
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-app.vercel.app/api/auth/callback/google
     ```
     (replace `your-app` with your actual Vercel URL — you can update this later)
5. Click **Create**
6. Copy your **Client ID** and **Client Secret**

---

## Phase 4 — Project Setup (5 min)

### Step 1 — Extract the project files

1. Unzip `splitbase-ai.zip` to a folder on your computer
2. Open Terminal and navigate to that folder:
   ```bash
   cd path/to/splitbase-ai
   ```

### Step 2 — Install dependencies

This downloads all the packages the app needs (~200MB, takes 1-3 minutes):

```bash
npm install
```

You should see a progress bar and then `added X packages`.

---

## Phase 5 — Environment Variables (5 min)

Environment variables are secret configuration values the app needs to run.

### Step 1 — Create your .env.local file

```bash
cp .env.example .env.local
```

This copies the template file. Now open `.env.local` in any text editor.

### Step 2 — Fill in your values

Replace every `your_xxx_here` with your actual values:

```bash
# Gemini AI (from Phase 2)
GEMINI_API_KEY=AIzaSyD_your_actual_key_here

# Supabase (from Phase 1, Step 4)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth (generate a random secret)
NEXTAUTH_SECRET=run_the_command_below_to_generate_this
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (from Phase 3)
GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3 — Generate NEXTAUTH_SECRET

Run this command in Terminal and paste the output as your `NEXTAUTH_SECRET`:

**Mac/Linux:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

---

## Phase 6 — Run Locally (2 min)

### Step 1 — Start the development server

```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local
✓ Ready
```

### Step 2 — Open the app

Go to **http://localhost:3000** in your browser.

You should see the SplitBase AI landing page! Click **Get Started** and sign in with Google.

### Step 3 — Test the AI features

1. **Sign in** with Google
2. **Create a group** — click "New Group", name it "Test Group"
3. **Add an expense** — click "Add Expense" → "AI Entry"
4. Type: `Dinner at Nobu $120, split equally between 3 people`
5. Watch Gemini parse it in real-time!
6. **Test receipt scan** — take a photo of any receipt, upload it under "Receipt Scan"

---

## Phase 7 — Deploy to Vercel (10 min)

Vercel is where your app lives online. It auto-deploys every time you push code to GitHub.

### Step 1 — Push to GitHub

1. Create a new repository at **https://github.com/new**
   - Name: `splitbase-ai`
   - Keep it **Private**
   - Don't initialize with README (your project already has files)
2. In Terminal:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: SplitBase AI"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/splitbase-ai.git
   git push -u origin main
   ```

### Step 2 — Deploy on Vercel

1. Go to **https://vercel.com** → **Add New Project**
2. Click **Import** next to your `splitbase-ai` repository
3. Keep all defaults, then click **Deploy**
4. It will fail at first because it needs environment variables — that's OK!

### Step 3 — Add environment variables to Vercel

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add every variable from your `.env.local`, but change these two:
   ```
   NEXTAUTH_URL = https://your-actual-app.vercel.app
   NEXT_PUBLIC_APP_URL = https://your-actual-app.vercel.app
   ```
3. Click **Save**

### Step 4 — Redeploy

1. Go to **Deployments** → click **Redeploy** on the latest deployment
2. Wait ~2 minutes
3. Click the live URL — your app is live! 🎉

### Step 5 — Update Google OAuth

1. Go back to **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Click your OAuth Client ID
3. Add your Vercel URL to **Authorized redirect URIs**:
   ```
   https://your-actual-app.vercel.app/api/auth/callback/google
   ```
4. Click **Save**

---

## Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### "Invalid API key" from Gemini
- Check `GEMINI_API_KEY` in `.env.local` is correct (no spaces, no quotes)
- Make sure you enabled the Gemini API at aistudio.google.com

### Google sign-in fails (redirect_uri_mismatch)
- Make sure `http://localhost:3000/api/auth/callback/google` is in your OAuth redirect URIs
- Check `NEXTAUTH_URL=http://localhost:3000` in `.env.local`

### Supabase "Row Level Security" errors
- Make sure you ran the full `schema.sql` — it includes all RLS policies
- Check `SUPABASE_SERVICE_ROLE_KEY` is the full `service_role` key (not the anon key)

### Database errors / tables not found
- Go to Supabase SQL Editor and re-run `schema.sql`
- Make sure the SQL ran without errors (green "Success" message)

### App builds but AI doesn't work
- The Gemini API call happens server-side — check Vercel Function Logs
- Verify `GEMINI_API_KEY` is set in Vercel environment variables

---

## How the AI Features Work

### Natural Language Expense Entry

When you type `"Dinner $80, Alice had steak so +$20"`:

1. Your browser sends the text to `/api/ai/parse-expense`
2. That route calls **Gemini 2.0 Flash** with a structured JSON schema
3. Gemini returns: `{ total: 80, splits: [{ member: "Alice", amount: 40 }, ...], confidence: 0.9 }`
4. The UI shows you the parsed result for confirmation before saving

### Receipt Photo Scanning

When you upload a receipt photo:

1. The image is converted to base64 in your browser
2. Sent to `/api/ai/parse-receipt`
3. That route calls Gemini with the image using **multimodal vision**
4. Gemini reads every line item, subtotal, tax, tip, and total
5. Returns structured JSON you can confirm and assign to members

### AI Reminders

When you click "Remind" on a debt:

1. The debtor's name, amount, and context go to `/api/ai/draft-reminder`
2. Gemini generates a friendly, human-sounding message in your chosen tone
3. You can edit the draft before sending

### AI Chat

The chat uses **Vercel AI SDK's streaming** with Gemini:

- Responses stream word-by-word (no waiting for the full response)
- Gemini has access to "tools" — functions that query your real database
- Ask "Who owes me the most?" and Gemini calls `getUserNetBalance` to get real data

---

## Project Structure

```
splitbase-ai/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/
│   │   ├── dashboard/         # Main dashboard
│   │   └── groups/[groupId]/  # Group detail page
│   ├── api/
│   │   ├── ai/
│   │   │   ├── parse-expense/ # Gemini NLP parsing
│   │   │   ├── parse-receipt/ # Gemini vision
│   │   │   ├── draft-reminder/# Gemini reminder drafts
│   │   │   └── chat/          # Gemini streaming chat
│   │   ├── groups/            # Group CRUD
│   │   ├── expenses/          # Expense creation
│   │   └── settlements/       # Mark debts as paid
│   └── page.tsx               # Landing page
├── components/
│   ├── ai/                    # AI-powered UI components
│   ├── expenses/              # Expense list & dialogs
│   ├── groups/                # Group management UI
│   ├── layout/                # Navbar, providers
│   └── ui/                    # Base components (Button, Card, etc.)
├── supabase/
│   ├── schema.sql             # Full database schema with RLS
│   └── client.ts              # Supabase client helpers
├── lib/utils.ts               # Helper functions
├── types/index.ts             # TypeScript types
├── auth.ts                    # NextAuth configuration
└── .env.example               # Environment variable template
```

---

## Tech Stack Cheat Sheet

| Question | Answer |
|---|---|
| Where is my data stored? | Supabase (PostgreSQL in the cloud) |
| Where does the AI live? | Google Gemini API (called server-side) |
| Is my API key safe? | Yes — it's only on the server, never sent to browsers |
| How do users sign in? | Google OAuth or email magic link (via NextAuth.js) |
| Where is the app hosted? | Vercel (auto-deploys from GitHub) |
| Can I use it offline? | No — it requires internet for Gemini and Supabase |
| Does it cost money? | All free tiers are sufficient for development & demo |

---

*SplitBase AI · Built with Next.js 14 + Gemini 2.0 Flash + Supabase + Vercel*
