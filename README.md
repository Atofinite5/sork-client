# SORK Cloud

**The AI DevSecOps Engineer for secure code delivery.**

SORK is a multi-agent AI security platform that scans, fixes, verifies, and ships your code clean. One license key in the CLI, one connected GitHub repo on the web — every commit is protected.

> Scan. Fix. Verify. Ship.

🌐 Live: **[sorkcloud.space](https://sorkcloud.space)**

---

## What SORK does

| Stage | What happens |
|---|---|
| 🛡 **Safety Gate** | Every request is screened by Nemotron-tier guardrails before any agent runs |
| 🔍 **Scan** | 40+ language-specific vulnerability patterns across TS, JS, Python, Rust, Go, Java, Ruby, PHP, C# |
| 🛠 **Fix** | Minimal-diff patches — only the vulnerable lines change. No refactoring |
| ✓ **Verify** | Re-scans patched code. Score 0–100. Threshold 80 = auto-approved for deploy |
| 🧠 **Memory** | Hybrid semantic + recency memory keeps fixes consistent with your codebase |

---

## Repo structure

This is the **sork-client** repo — the Next.js dashboard at `sorkcloud.space`.

| Repo | Stack | Where |
|---|---|---|
| **sork-client** (this) | Next.js 15 · React · Tailwind | Vercel · `sorkcloud.space` |
| sork-back | Hono · Drizzle · Neon Postgres | Render · `sork-back.onrender.com` |
| sork-cli | Node.js npm package | `npm i -g sork-cli` |

---

## Features

### Dashboard (`/dashboard`)
- ⚡ **Command** — chat with sork.ai for scans, fixes, BYOK setup, model switching, full GitHub repo scans
- 🔍 **Scans** — full analytics: 7-day activity chart, severity donut, fix rate gauge, code health ring, language breakdown, expandable scan history table
- 📁 **Repositories** — connect GitHub, browse repos with search/filter, trigger full repo scans
- 🔀 **Pull Requests** — list open PRs with conflict detection, Monaco diff editor, AI merge conflict resolution, push fixes directly to GitHub, AI code review
- 🔑 **API Keys** — issue license keys + BYOK credentials (AES-256-GCM encrypted)
- ⚙ **Settings** & **Billing**

### Landing page (`/`)
- Romer-style hero with interactive auto-cursor demo
- Step-by-step product walkthrough with floating tooltip cards
- 3 FIG diagrams (Triage / Fix / Verify) with real UI mockups (live scan table, diff view, verify score ring)
- Sork.ai right panel with live-typing terminal exchanges
- 6-card core features section with custom shimmer SVG icons

### CLI integration
- `sork scan` — full project scan
- `sork fix` — apply AI-generated patches
- `sork verify` — re-scan after fix
- `sork guard` — watch mode, 150ms feedback
- `sork doctor` — health score 0–100
- `sork send <file>` — push file directly to web dashboard
- `// sork-ignore: CWE-XXX` — suppress false positives inline

---

## Multi-tier model routing

SORK is BYOK-first. Users connect their own provider keys and the **router** picks the best one for each task:

| Task | Preferred providers (in order) | Fallback |
|---|---|---|
| `chat` | Groq → OpenAI → NVIDIA → custom | Inbuilt Groq |
| `embed` | Cohere → OpenAI | Inbuilt Cohere |
| `heavy` (deep scans, complex fixes) | NVIDIA → Anthropic → OpenAI → Groq | Inbuilt NVIDIA NIM |
| `safety` (guardrails) | NVIDIA Nemotron → Anthropic | Inbuilt Nemotron |

If a BYOK call fails, the router auto-falls back so the chat never breaks. The user sees a system note explaining which key failed.

---

## Tech stack

**Frontend** (this repo)
- Next.js 15 (App Router, force-dynamic)
- React 19
- Tailwind CSS
- Framer Motion
- Monaco Editor (`@monaco-editor/react`) for diff view
- Clerk (auth)
- ReactMarkdown + remark-gfm
- Custom shimmer SVG icons + interactive demo cursor

**Backend** (`sork-back`)
- Hono TypeScript
- Drizzle ORM
- Neon PostgreSQL
- Groq SDK (llama-3.3-70b-versatile)
- OpenAI-compatible client (NVIDIA NIM, OpenAI, Cohere, custom)
- Cohere embed-english-v3.0
- Octokit (GitHub OAuth + API)

**Infrastructure**
- Vercel (frontend, auto-deploy from `main`)
- Render (backend, free tier)
- Neon (Postgres)
- Clerk (auth)
- Skydo (payments — not Stripe)

---

## Local development

```bash
# Frontend
git clone https://github.com/Atofinite5/sork-client
cd sork-client
npm install
cp .env.example .env.local       # add Clerk keys + API URL
npm run dev                       # → http://localhost:3000

# Backend (separate terminal)
git clone https://github.com/Atofinite5/sork-back
cd sork-back
npm install
cp .env.example .env              # add DB, Clerk, Groq, NVIDIA, Cohere, GitHub keys
npm run dev                       # → http://localhost:8080
```

### Required env vars

**sork-client** (`.env.local`):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**sork-back** (`.env`):
```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
GROQ_API_KEY=gsk_...
NVIDIA_API_KEY=nvapi-...
COHERE_API_KEY=...
JWT_SECRET=<32-byte hex>
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
FRONTEND_URL=https://sorkcloud.space
CLIENT_ORIGIN=https://sorkcloud.space
```

---

## API surface (backend)

### License key (CLI auth)
- `POST /api/scan` — full pipeline
- `POST /api/scan/sast` · `/secrets` · `/dependencies` · `/iac` · `/licenses` · `/quality`

### Clerk session (dashboard auth)
- `GET  /api/license/list` · `POST /api/license/issue` · `DELETE /api/license/revoke/:id`
- `GET  /api/byok/list` · `POST /api/byok/add` · `GET /api/byok/status` · `PATCH /api/byok/:id` · `DELETE /api/byok/:id`
- `POST /api/chat`
- `GET  /api/stats` · `/api/stats/history` · `/api/stats/keys-usage`
- `GET  /api/usage`

### GitHub integration
- `GET  /api/github/oauth/init` · `/api/github/oauth/callback`
- `GET  /api/github/status` · `DELETE /api/github/disconnect`
- `GET  /api/github/repos`
- `GET  /api/github/repos/:owner/:repo/pulls`
- `GET  /api/github/repos/:owner/:repo/pulls/:n/conflicts`
- `POST /api/github/repos/:owner/:repo/scan` — full repo security scan
- `POST /api/github/repos/:owner/:repo/pulls/:n/review`
- `POST /api/github/resolve/ai` — AI merge conflict resolver
- `POST /api/github/resolve/push` — commit resolved file back to branch

### Multi-agent orchestrator
- `POST /api/agent/scan` — 4-stage pipeline (embed → fast triage → heavy review → summary)
- `POST /api/agent/heavy` — single-file deep dive
- `GET  /api/agent/status` — which providers user has wired

---

## Pricing

| Plan | Price | Includes |
|---|---|---|
| **Free** | $0 | 14 lifetime scans · 1 license key · All 3 agents · BYOK support |
| **Pro** | $19/mo | Unlimited scans · 5 license keys · Hybrid memory · GitHub integration |
| **Pro Plus** | $28/mo | Everything in Pro · 20 keys · Team workspace · SLA |

Payments via Skydo. No credit card required for Free tier.

---

## Security model

- License keys are JWT-signed, Bearer-token authenticated for CLI
- Dashboard requests use Clerk session tokens
- BYOK keys stored **AES-256-GCM encrypted** at rest
- Code submitted for scanning is **never persisted** beyond the pipeline run
- Only metadata (file paths, CWE IDs, severity, scores) is stored
- Cohere memory embeddings store snippets only, not full files
- GitHub OAuth tokens encrypted in DB; can be revoked from `/dashboard?view=repos`

---

## Project structure

```
app/
├── _home.tsx               # Landing page (real content)
├── page.tsx                # Server wrapper → _home
├── layout.tsx              # Root layout w/ ClerkProvider
├── dashboard/
│   ├── page.tsx            # Sidebar router (Command/Scans/Repos/PRs/Keys/Settings/Billing)
│   └── _components/
│       ├── ChatSection.tsx       # Chat UI w/ repo picker + model settings
│       ├── ScansView.tsx         # Full analytics dashboard (charts + history)
│       ├── ReposView.tsx         # GitHub connect + repo grid
│       ├── PullRequestsView.tsx  # PR list + Monaco diff + AI resolve
│       ├── KeyManager.tsx        # License key issuer
│       ├── ByokManager.tsx       # BYOK credentials
│       ├── KeysUsage.tsx         # Per-key analytics
│       └── UsageBar.tsx          # Quota indicator
├── docs/                   # System architecture docs (force-dynamic + DocsContent.tsx)
├── pricing/                # Skydo payment links
├── sign-in/  sign-up/      # Clerk
└── payment-success/

components/
├── SiteNav.tsx             # Shared navbar (Platform · Docs · Pricing)
└── ShimmerIcon.tsx         # Custom SVG sidebar icons w/ animated gradients

public/
├── sork-logo.png           # Metallic shield logo
└── sork-wordmark.png
```

---

## Branches

`main` is the only branch. All work happens on `main` → Vercel auto-deploys to production.

---

## Built by

Bhargav Kalambhe — [Atofinite5](https://github.com/Atofinite5)

Powered by Groq · Nemotron · Cohere
