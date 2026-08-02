# CodeLens 🔍
> **Find your blind spots. Fix them fast.**

CodeLens is a poster-style, real-time code analysis engine built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and an intelligent **Dual-LLM Pipeline** (OpenRouter + Groq). It detects algorithmic inefficiency and security vulnerabilities in your source code, tracks your recurring coding habits, and prescribes exact study concepts to level up your engineering skills.

---

## 📖 The Origin Story

Every engineer has blind spots.

Whether it's defaulting to nested loops on a problem solvable in $O(n)$ time, forgetting to sanitize user inputs in database queries, or missing subtle memory allocations—we all repeat specific technical mistakes when coding under pressure. 

**CodeLens was built to answer one question:** *What if your editor could actively analyze your coding patterns, detect your blind spots before code review, and tell you exactly what concept to study next?*

Starting as a clean, single-page diagnostic utility, CodeLens evolved into a complete developer intelligence toolkit featuring:
- **Instant Dual-Mode Analysis:** Algo & Security code scans.
- **Pattern Tracking:** AI meta-analysis that isolates your #1 recurring weakness across past submissions.
- **GitHub Direct Sync:** One-click fetching of raw code from any public GitHub repository.
- **Hybrid Storage:** Automatic fallback between Supabase Cloud DB (when signed in via Google OAuth) and browser `localStorage` (for 100% offline guest mode).
- **Anti-Slop Bold Typography UI:** Built strictly according to the *Bold Typography Design Law*—featuring Vermillion accents (`#FF3D00`), sharp 0px edges, and poster-inspired editorial type.

---

## ✨ Features

### ⚡ 1. Dual-Provider AI Analysis Engine
- **Primary Model:** Anthropic Claude Haiku 4.5 via OpenRouter (`anthropic/claude-haiku-4-5`).
- **Fallback Model:** LLaMA 3.3 70B Versatile via Groq (`llama-3.3-70b-versatile`).
- **Modes:**
  - **Algo Mode:** Scans for time/space complexity, data structure choices, and algorithmic bottlenecks.
  - **Security Mode:** Scans for SQL injection, unsanitized user inputs, hardcoded secrets, and unsafe execution paths.
- Returns structured JSON containing the **blind spot name**, **severity level** (High / Medium / Low), **explanation**, **concrete fix**, and a targeted **InterviewCake study slug**.

### 🎯 2. Recurring Pattern Tracker
- Automatically analyzes your history once 3 or more diagnostics are recorded.
- Synthesizes all past blind spots to highlight your **single biggest recurring coding flaw** and provides a tailored focus area for study.

### 🐙 3. GitHub File Fetcher
- Paste any standard GitHub URL (`github.com/user/repo/blob/main/file.js`) or raw URL.
- Automatically normalizes the path to `raw.githubusercontent.com` and populates the code workspace with live source code.

### 🔐 4. Supabase Cloud Sync & Google OAuth
- Optional Google OAuth authentication powered by Supabase Auth.
- **Signed In:** Analysis history automatically persists to a Supabase Postgres database (`analyses` table) secured with Row Level Security (RLS).
- **Signed Out:** Seamless zero-config fallback to `localStorage`.

### 🎨 5. Bold Typography Design System
- Built under strict **Anti-Slop Design Law**:
  - Zero gradients, zero fake app mockups, zero pill buttons.
  - **Poster Design for Web:** Inter Tight display headlines, JetBrains Mono technical labels, and high-contrast typography ratios.
  - **Vermillion Palette:** Warm `#FF3D00` accents on near-black `#0A0A0A`.
  - **Sharp Edges:** 0px border-radius everywhere for an editorial, gallery-like feel.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, React Router 7 |
| **Styling** | Tailwind CSS v4, PostCSS, Custom CSS Variables |
| **Primary LLM** | OpenRouter (`anthropic/claude-haiku-4-5`) |
| **Fallback LLM** | Groq (`llama-3.3-70b-versatile`) |
| **Auth & Database** | Supabase Auth (Google OAuth) & PostgreSQL with RLS |
| **Build System** | Vite 8 |
| **Deployment** | Render (`render.yaml`) |

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/danielamodu/CodeLens.git
cd CodeLens
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key
VITE_GROQ_API_KEY=your_groq_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note:** API keys are optional to start. The app includes graceful fallbacks for local guest development.

### 3. Setup Supabase Database (Optional)

Run the SQL migration in [`supabase/schema.sql`](./supabase/schema.sql) within your Supabase SQL Editor to enable cloud history and RLS policies:

```sql
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  code text not null,
  mode text not null,
  result jsonb not null,
  created_at timestamptz default now() not null
);

alter table public.analyses enable row level security;
```

### 4. Start Development Server

```bash
npm run dev
```

Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

---

## 🗺️ Project Structure

```
CodeLens/
├── public/                # Static assets (favicon, SVG icons)
├── src/
│   ├── assets/            # Project graphics
│   ├── hooks/             # Custom React hooks (useAuth.ts)
│   ├── pages/             # Route pages (LandingPage.tsx, AppPage.tsx)
│   ├── utils/             # Helpers (github.ts, history.ts)
│   ├── api.ts             # Dual-provider LLM client (OpenRouter & Groq)
│   ├── App.css            # Bold typography layout rules
│   ├── App.tsx            # React Router setup
│   ├── index.css          # Design system tokens & Tailwind v4 imports
│   ├── main.tsx           # React DOM entry point
│   └── supabase.ts        # Supabase client initialization
├── supabase/
│   └── schema.sql         # Postgres database schema & RLS policies
├── .env.example           # Environment template
├── render.yaml            # Render deployment manifest
└── vite.config.ts         # Vite configuration with Tailwind plugin
```

---

## 📦 Deployment

CodeLens is configured for zero-config deployment on **Render**:

1. Push your repository to GitHub.
2. Create a new **Web Service** on Render.
3. Link your repository—Render will auto-detect [`render.yaml`](./render.yaml) and build the Vite production bundle.

---

## 📜 License

MIT License. Built with passion by [Daniel Amodu](https://github.com/danielamodu).
