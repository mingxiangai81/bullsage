# BullSage 牛智 — Complete Setup & Handover Guide

**Live Site:** https://bullsage.co  
**GitHub Repo:** https://github.com/mingxiangai81/bullsage  
**Last Updated:** June 2026

---

## 1. What Is BullSage?

BullSage is a **bilingual (Chinese/English) AI investment education platform** that gives users:

- **Master Verdict Engine** — 10 legendary investors (Buffett, Graham, Lynch, Munger, Fisher, Greenblatt, Dalio, Wood, Bogle, Klarman) each independently evaluate any stock
- **Wall Street Reports** — DCF valuation, moat scoring, bull/bear cases, earnings analysis
- **Educational Trade Plans** — entry price, stop-loss, position sizing (clearly marked as non-advice)
- **7-Day Free Trial** — 3 full analyses, then upgrade to Pro

**Target users:** Overseas Chinese investors (Singapore, Malaysia, Hong Kong, Australia, Taiwan)

---

## 2. Architecture Overview

```
bullsage.co (Vercel)
├── / ─────────────────→ Landing page (index.html, static)
├── /login ────────────→ React SPA (register / login)
├── /analyze/:ticker ──→ React SPA (AI report page)
├── /dashboard ────────→ React SPA (watchlist + history)
├── /pricing ──────────→ React SPA (Stripe checkout)
├── /feedback ─────────→ React SPA (user feedback form)
├── /legal/:section ───→ React SPA (disclaimer / terms / privacy)
│
└── /api/ ─────────────→ Vercel Serverless Functions (Node.js)
    ├── /api/auth/register    Register + auto-confirm (needs SUPABASE_SERVICE_KEY)
    ├── /api/auth/login       Login → returns JWT
    ├── /api/auth/me          Get current user profile
    ├── /api/analyze/:ticker  AI analysis (Edge Function via Vercel AI Gateway)
    ├── /api/trial-status     Trial days / queries remaining
    ├── /api/watchlist        GET + POST watchlist
    ├── /api/watchlist/:ticker DELETE from watchlist
    └── /api/health           Health check

External services:
├── Supabase ──── Auth + PostgreSQL database (Singapore region)
├── Vercel AI Gateway ── GPT-4o analysis (no API key needed, uses OIDC token)
├── Yahoo Finance ── Real-time stock data (free, no key)
└── Stripe ──── Payments (needs setup)
```

---

## 3. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TailwindCSS |
| Routing | React Router v6 |
| Backend | Vercel Serverless Functions (Node.js / Edge) |
| AI Engine | Vercel AI Gateway → OpenAI GPT-4o (via `ai` npm package) |
| Financial Data | Yahoo Finance REST API (free, no key) |
| Database | Supabase PostgreSQL (ap-southeast-1, Singapore) |
| Auth | Supabase Auth (email + password) |
| Payments | Stripe Checkout |
| Hosting | Vercel (frontend + serverless functions) |
| Domain | bullsage.co (purchased via Vercel) |

---

## 4. Project Structure

```
masterlens/                        ← Git root
├── index.html                     ← Landing page (standalone static HTML)
├── frontend/                      ← React app (what Vercel deploys)
│   ├── api/                       ← Vercel serverless functions
│   │   ├── auth/
│   │   │   ├── register.js        ← POST /api/auth/register
│   │   │   ├── login.js           ← POST /api/auth/login
│   │   │   └── me.js              ← GET /api/auth/me
│   │   ├── analyze/
│   │   │   └── [ticker].js        ← GET /api/analyze/:ticker (Edge Function)
│   │   ├── watchlist/
│   │   │   ├── index.js           ← GET/POST /api/watchlist
│   │   │   └── [ticker].js        ← DELETE /api/watchlist/:ticker
│   │   ├── trial-status.js        ← GET /api/trial-status
│   │   └── health.js              ← GET /api/health
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx           ← Landing (ticker input)
│   │   │   ├── Analyze.jsx        ← Report display page
│   │   │   ├── Login.jsx          ← Register + login form
│   │   │   ├── Dashboard.jsx      ← Watchlist + report history
│   │   │   ├── Pricing.jsx        ← 4-tier pricing + Stripe
│   │   │   ├── Feedback.jsx       ← User feedback form
│   │   │   └── Legal.jsx          ← /legal/disclaimer, /terms, /privacy
│   │   ├── components/
│   │   │   ├── Navbar.jsx         ← Top navigation
│   │   │   ├── MasterVerdict.jsx  ← Single master card
│   │   │   ├── VerdictGrid.jsx    ← Grid of 10 master cards
│   │   │   ├── ConsensusScore.jsx ← Overall consensus display
│   │   │   ├── WallStreetReport.jsx ← Full report sections
│   │   │   ├── TradePlan.jsx      ← Educational trade plan
│   │   │   ├── TickerInput.jsx    ← Stock search input
│   │   │   └── TrialBanner.jsx    ← Trial status indicator
│   │   └── services/
│   │       ├── api.js             ← Axios client (all API calls)
│   │       └── supabase.js        ← Supabase client (auth + DB)
│   ├── vercel.json                ← SPA routing config
│   ├── vite.config.js
│   └── package.json
├── backend/                       ← Original FastAPI backend (NOT deployed)
│   └── app/                       ← (kept for reference, logic moved to api/)
├── docs/
│   └── superpowers/
│       ├── specs/                 ← Design specification
│       └── plans/                 ← Implementation plan
└── SETUP_GUIDE.md                 ← This file
```

---

## 5. Database (Supabase)

**Project ID:** `hlraxyshjnmtqioonejh`  
**Region:** ap-southeast-1 (Singapore)  
**Dashboard:** https://supabase.com/dashboard/project/hlraxyshjnmtqioonejh

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User data, plan, trial status |
| `reports` | Cached AI reports (24h TTL) |
| `watchlist` | User watchlist |
| `purchases` | Stripe purchase history |

### Key Fields in `profiles`

```sql
id                   UUID (= auth user ID)
display_name         TEXT
full_name            TEXT
country              TEXT
date_of_birth        DATE
plan                 TEXT  -- 'trial', 'single', 'pro', 'lifetime'
is_trial             BOOL
trial_reports_used   INT   -- max 3
trial_expires_at     TIMESTAMPTZ  -- 7 days after signup
stripe_customer_id   TEXT
language_pref        TEXT  -- 'zh' or 'en'
```

### RLS (Row Level Security)
All tables have RLS enabled. Users can only read/write their own rows.

---

## 6. Environment Variables

### Vercel (Production) — set at:
https://vercel.com/ming-xiang-technology/masterlens/settings/environment-variables

| Variable | Value | Required For |
|----------|-------|-------------|
| `SUPABASE_SERVICE_KEY` | service_role key from Supabase | **Auto-confirm email on register** |
| `SUPABASE_ANON_KEY` | anon key | Serverless functions (fallback) |
| `VITE_SUPABASE_URL` | `https://hlraxyshjnmtqioonejh.supabase.co` | Frontend |
| `VITE_SUPABASE_ANON_KEY` | anon key | Frontend |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | Payments |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhooks |

> **Note:** `VERCEL_OIDC_TOKEN` is automatically injected by Vercel — no action needed. It powers the Vercel AI Gateway (GPT-4o analysis).

### Where to Get Keys

**Supabase keys:**
1. Go to https://supabase.com/dashboard/project/hlraxyshjnmtqioonejh/settings/api
2. `anon` key → `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`
3. `service_role` key → `SUPABASE_SERVICE_KEY` (**keep this secret, server-side only**)

**Stripe keys:**
1. Go to https://dashboard.stripe.com/apikeys
2. Publishable key → `VITE_STRIPE_PUBLISHABLE_KEY`
3. Secret key → `STRIPE_SECRET_KEY`
4. Webhook secret: Create webhook at dashboard.stripe.com/webhooks pointing to `https://bullsage.co/api/webhook/stripe`

---

## 7. One Critical Setup Step

### ⚠️ Disable Supabase Email Confirmation

By default, Supabase requires users to click a confirmation email before logging in. This breaks the free trial UX.

**Fix Option A (Recommended — 30 seconds):**
1. Open: https://supabase.com/dashboard/project/hlraxyshjnmtqioonejh/auth/providers
2. Find **Email** section
3. Toggle **"Confirm email"** → **OFF**
4. Click **Save**

**Fix Option B (Programmatic):**
1. Get the `service_role` key from Supabase (Settings → API)
2. Add it as `SUPABASE_SERVICE_KEY` in Vercel environment variables
3. Redeploy — the register function auto-confirms emails via admin API

Without this fix, users see a "check your email" screen after registration.

---

## 8. Local Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+ (for backend only, optional)

### Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run dev
# → http://localhost:5173
```

**.env.local values:**
```
VITE_API_URL=http://localhost:5173   # Use same origin (API functions are in /api/)
VITE_SUPABASE_URL=https://hlraxyshjnmtqioonejh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Testing Serverless Functions Locally

```bash
cd frontend
vercel dev   # Runs Vite + serverless functions at localhost:3000
```

### Backend (Legacy FastAPI — not used in production)

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with GEMINI_API_KEY, SUPABASE_URL, etc.
uvicorn app.main:app --reload --port 8000
```

---

## 9. Deployment

### Deploy Frontend (+ Serverless Functions) to Vercel

```bash
cd frontend
vercel deploy --prod --yes
# → Deploys to bullsage.co automatically
```

### Auto-Deploy via GitHub

The project is linked to GitHub at: https://github.com/mingxiangai81/bullsage

To enable auto-deploy on every push:
1. Go to Vercel Dashboard → masterlens project → Settings → Git
2. Connect to GitHub repo
3. Every push to `master` → auto-deploys to bullsage.co

---

## 10. Pricing Tiers

| Plan | Price | Reports | Features |
|------|-------|---------|---------|
| Trial | Free (7 days) | 3 total | 10 watchlist items |
| Single Report | $9/report | 1 | Full analysis, 30-day access |
| Pro Monthly | $19/month | Unlimited | All features |
| Pro Annual | $179/year | Unlimited | All features (save 25%) |
| Founding Member | $299 one-time | Unlimited | Lifetime, limited to 500 |

---

## 11. AI Analysis Flow

When a user submits a ticker (e.g., `AAPL`):

1. **Frontend** → `GET /api/analyze/AAPL?lang=zh`
2. **Edge Function** (`api/analyze/[ticker].js`):
   - Checks trial quota (max 3 for trial users)
   - Fetches financial data from **Yahoo Finance API** (free)
   - Builds a comprehensive prompt with all 10 master frameworks
   - Calls **Vercel AI Gateway** → `openai/gpt-4o`
   - Parses JSON response into structured report
   - Increments trial usage counter in Supabase
   - Returns full report JSON
3. **Frontend** renders:
   - 10 Master Verdict cards
   - Consensus Score (avg of 10)
   - Wall Street Report (DCF, moat, bull/bear)
   - Educational Trade Plan

**No API key needed for AI** — Vercel AI Gateway uses `VERCEL_OIDC_TOKEN` (auto-injected).

---

## 12. Known Issues & Next Steps

### Currently Working ✅
- Landing page with live ticker navigation
- Registration form (name, country, DOB, email, password)
- Login / logout
- 7-day trial with 3-query limit
- AI analysis via Vercel AI Gateway (GPT-4o)
- Financial data from Yahoo Finance
- Watchlist (add/remove)
- Legal pages (disclaimer, terms, privacy)
- Feedback page
- Bilingual (Chinese/English)
- Deployed at bullsage.co

### Needs Action ⚠️
1. **Disable email confirmation** in Supabase (see Section 7) — or add SUPABASE_SERVICE_KEY to Vercel
2. **Set up Stripe** — add STRIPE_SECRET_KEY and create webhook for payment processing
3. **Test end-to-end** registration → analysis → trial limit → upgrade flow

### Future Improvements 🔮
- Portfolio X-Ray (analyze multiple holdings)
- Public performance tracking (compare AI ratings vs actual returns)
- Email notifications (trial expiry, price alerts)
- Community discussion features (moderated, no stock tips)
- A-share (China mainland) market support
- Full RAG with SEC EDGAR document embeddings

---

## 13. Key URLs

| Service | URL |
|---------|-----|
| Live Site | https://bullsage.co |
| GitHub | https://github.com/mingxiangai81/bullsage |
| Vercel Dashboard | https://vercel.com/ming-xiang-technology/masterlens |
| Supabase Dashboard | https://supabase.com/dashboard/project/hlraxyshjnmtqioonejh |
| Supabase Auth Settings | https://supabase.com/dashboard/project/hlraxyshjnmtqioonejh/auth/providers |
| Stripe Dashboard | https://dashboard.stripe.com |

---

## 14. Support & Contact

**Email:** legal@bullsage.co  
**For technical issues:** Check Vercel function logs at https://vercel.com/ming-xiang-technology/masterlens

---

*This guide covers everything needed to understand, run, and extend BullSage. For questions about specific components, refer to the design spec at `docs/superpowers/specs/2026-05-30-masterlens-mvp-design.md`.*
