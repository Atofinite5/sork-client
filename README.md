# SORK Cloud

**The AI DevSecOps Engineer for secure code delivery.**

SORK is a multi-agent AI security platform that scans, fixes, verifies, learns from your edits, generates regression tests, and ships your code clean. One license key in the CLI, one connected GitHub repo on the web -- every commit is protected.

> Scan. Fix. Verify. Learn. Ship.

Live: **[sorkcloud.space](https://sorkcloud.space)**

---

## What SORK does

| Stage | What happens |
|---|---|
| **Safety Gate** | Every request is screened by guardrails before any agent runs |
| **Scan** | 40+ language-specific vulnerability patterns across TS, JS, Python, Rust, Go, Java, Ruby, PHP, C# |
| **Fix** | Minimal-diff patches -- only the vulnerable lines change. Adapts to your coding preferences |
| **Verify** | Re-scans patched code. Score 0-100. Threshold 80 = auto-approved |
| **Test Gen** | Generates runnable regression tests proving the vulnerability is patched |
| **Memory** | Tracks recurring patterns across scans. Learns from your edits to improve future fixes |

---

## Repo structure

This is the **sork-client** repo -- the Next.js dashboard at `sorkcloud.space`.

| Repo | Stack | Where |
|---|---|---|
| **sork-client** (this) | Next.js 15 - React - Tailwind | Vercel - `sorkcloud.space` |
| sork-back | Hono - Drizzle - Neon Postgres | Render - `sork-back.onrender.com` |
| sork-cli | Node.js npm package | `npm i -g sork-cli` |

---

## Features

### Dashboard (`/dashboard`)
- **Command** -- chat with SORK Engine for scans, fixes, BYOK setup, model switching, full GitHub repo scans
- **Scans** -- full analytics: 7-day activity chart, severity donut, fix rate gauge, code health ring, language breakdown, expandable scan history table
- **Repositories** -- connect GitHub, browse repos with search/filter, trigger full repo scans
- **Pull Requests** -- list open PRs with conflict detection, Monaco diff editor, AI merge conflict resolution, push fixes directly to GitHub, AI code review
- **API Keys** -- issue license keys + BYOK credentials (AES-256-GCM encrypted)
- **Settings** & **Billing**

### Interactive code diff editor (NEW)
- Side-by-side diff view with line-level +/- indicators and flash animations
- Per-change accordion with issue ID, title, and explanation
- **Edit mode** -- switch to a live editor to modify the AI-proposed fix before applying
- **Fix learning** -- when you edit a fix and click Apply, SORK records the delta and learns your preferences for future fixes
- **Generated test display** -- collapsible section showing the auto-generated security regression test with framework badge and one-click copy
- Score badge (0-100) and recommendation label (approve / rework / escalate)

### SSE streaming chat (NEW)
- Real-time streaming responses from the multi-agent harness
- Live agent step visualization (which tier is running, duration badges, status indicators)
- Intent detection badges (TRIAGE, FIX, VERIFY, etc.)
- Seamless fallback to non-streaming for compatibility

### CLI integration
- `sork chat` -- interactive AI security REPL (NEW in v1.3.0)
- `sork scan` -- full project scan
- `sork fix` -- apply AI-generated patches
- `sork guard` -- watch mode, 150ms feedback
- `sork doctor` -- health score 0-100
- `sork review` -- pre-commit code review
- `sork send <file>` -- push file directly to web dashboard
- `// sork-ignore: CWE-XXX` -- suppress false positives inline

### GitHub Action CI (NEW)
- Automated PR-level security scanning
- Structured PR comments with severity tables
- Configurable fail thresholds
- HMAC-SHA256 webhook verification

---

## Multi-tier model routing

SORK is BYOK-first. Users connect their own provider keys and the **SORK Engine router** picks the best one for each task:

| Task | Tier | What it does |
|---|---|---|
| `chat` | Fast tier | Quick responses, intent detection, general security Q&A |
| `embed` | Embed tier | Memory storage, semantic search, similarity matching |
| `heavy` | Deep tier | Complex analysis, fix generation, code review |
| `safety` | Safety tier | Content safety screening before any agent runs |

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
- SORK Engine multi-tier router
- Octokit (GitHub OAuth + API)

**Infrastructure**
- Vercel (frontend, auto-deploy from `main`)
- Render (backend)
- Neon (Postgres)
- Clerk (auth)
- Skydo (payments)

---

## Local development

```bash
# Frontend
git clone https://github.com/Atofinite5/sork-client
cd sork-client
npm install
cp .env.example .env.local       # add Clerk keys + API URL
npm run dev                       # -> http://localhost:3000

# Backend (separate terminal)
git clone https://github.com/Atofinite5/sork-back
cd sork-back
npm install
cp .env.example .env              # add DB, Clerk, AI provider keys, GitHub keys
npm run dev                       # -> http://localhost:8080
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
JWT_SECRET=<32-byte hex>
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
FRONTEND_URL=https://sorkcloud.space
CLIENT_ORIGIN=https://sorkcloud.space
```

---

## API surface (backend)

### License key (CLI auth)
- `POST /api/scan` -- full pipeline
- `POST /api/scan/sast` - `/secrets` - `/dependencies` - `/iac` - `/licenses` - `/quality`
- `POST /api/cli/chat` -- interactive CLI chat

### Clerk session (dashboard auth)
- `GET  /api/license/list` - `POST /api/license/issue` - `DELETE /api/license/revoke/:id`
- `GET  /api/byok/list` - `POST /api/byok/add` - `GET /api/byok/status` - `PATCH /api/byok/:id` - `DELETE /api/byok/:id`
- `POST /api/chat` - `POST /api/chat/stream` (SSE)
- `POST /api/fixlearn/edit` - `GET /api/fixlearn/preferences` - `GET /api/fixlearn/history` - `GET /api/fixlearn/insights`
- `GET  /api/stats` - `/api/stats/history` - `/api/stats/keys-usage`
- `GET  /api/usage`

### GitHub integration
- `GET  /api/github/oauth/init` - `/api/github/oauth/callback`
- `GET  /api/github/status` - `DELETE /api/github/disconnect`
- `GET  /api/github/repos`
- `POST /api/github/repos/:owner/:repo/scan` -- full repo security scan
- `POST /api/github/repos/:owner/:repo/pulls/:n/review` -- AI PR review
- `POST /api/github/resolve/ai` -- AI merge conflict resolver

### CI integration
- `POST /ci/webhook/:id` -- GitHub webhook receiver (HMAC-SHA256)
- `POST /api/ci/scan` -- direct scan for GitHub Action
- `GET /api/ci/runs` - `GET /api/ci/webhooks`

### Multi-agent orchestrator
- `POST /api/agent/scan` -- 4-stage pipeline (embed - fast triage - deep review - summary)
- `POST /api/agent/heavy` -- single-file deep analysis
- `GET  /api/agent/status` -- which providers user has wired

---

## Pricing

| Plan | Price | Includes |
|---|---|---|
| **Free** | $0 | 14 lifetime scans - 1 license key - All agents - BYOK support |
| **Pro** | $19/mo | Unlimited scans - 5 license keys - Memory - GitHub integration - CI |
| **Pro Plus** | $28/mo | Everything in Pro - 20 keys - Team workspace - SLA |

Payments via Skydo. No credit card required for Free tier.

---

## Security model

- License keys are JWT-signed, Bearer-token authenticated for CLI
- Dashboard requests use Clerk session tokens
- BYOK keys stored AES-256-GCM encrypted at rest
- CI webhooks verified with HMAC-SHA256 signatures
- Code submitted for scanning is never persisted beyond the pipeline run
- Only metadata (file paths, CWE IDs, severity, scores) is stored
- Memory embeddings store snippets only, not full files
- GitHub OAuth tokens encrypted in DB

---

## Project structure

```
app/
+-- _home.tsx               # Landing page
+-- page.tsx                # Server wrapper
+-- layout.tsx              # Root layout w/ ClerkProvider
+-- dashboard/
|   +-- page.tsx            # Sidebar router (Command/Scans/Repos/PRs/Keys/Settings/Billing)
|   +-- _components/
|       +-- ChatSection.tsx       # Chat UI w/ SSE streaming, agent steps, fix proposals
|       +-- ScansView.tsx         # Full analytics dashboard
|       +-- ReposView.tsx         # GitHub connect + repo grid
|       +-- PullRequestsView.tsx  # PR list + Monaco diff + AI resolve
|       +-- KeyManager.tsx        # License key issuer
|       +-- ByokManager.tsx       # BYOK credentials
|       +-- KeysUsage.tsx         # Per-key analytics
|       +-- UsageBar.tsx          # Quota indicator
+-- docs/                   # System architecture docs
+-- pricing/                # Skydo payment links
+-- sign-in/  sign-up/      # Clerk

components/
+-- CodeDiffEditor.tsx      # Interactive diff viewer w/ edit mode, fix learning, test display
+-- SiteNav.tsx             # Shared navbar
+-- ShimmerIcon.tsx         # Custom SVG sidebar icons

public/
+-- sork-logo.png           # Metallic shield logo
+-- sork-wordmark.png
```

---

## Branches

- `main` -- production, Vercel auto-deploys
- `dev` -- active development, PRs merge to main

---

## Built by

Bhargav Kalambhe -- [Atofinite5](https://github.com/Atofinite5)

Powered by SORK Engine -- multi-tier AI routing
