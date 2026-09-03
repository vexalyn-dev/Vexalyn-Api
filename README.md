# VEXALYN API

**Powerful APIs. One Simple Platform.**

Unified anime, donghua, and manga data accessed through a single API gateway.

---

## Architecture

```text
WEB (Next.js)
  ↓
GATEWAY (Service boundary — PLANNED in PHASE 03)
  ↓
AUTHENTICATION / API KEYS / PERMISSIONS / RATE LIMITING
  ↓
API SERVICES (Python FastAPI)
  ↓
SCRAPERS / PROVIDERS (Anichin, Animexin, ...)
```

The frontend **never** directly controls scraper internals.

---

## Repository Structure

```text
vexalyn-api/
├── apps/
│   └── web/                 # Next.js frontend (PHASE 01 — foundation)
│
├── services/
│   ├── gateway/             # API Gateway (PLANNED — PHASE 03)
│   └── scrapers/            # Python FastAPI scraper services
│       └── donghua/         # Donghua scraper providers
│           ├── anichin/     # Anichin.moe scraper
│           └── animexin/    # Animexin.dev scraper
│
├── packages/
│   ├── database/            # DB types & helpers (placeholder — PHASE 04)
│   ├── api-types/           # Shared API types (placeholder — PHASE 04)
│   ├── api-client/          # Client SDK (placeholder — PHASE 04)
│   └── config/              # Shared config (placeholder — PHASE 04)
│
├── supabase/
│   ├── migrations/          # Database migrations (schema — PHASE 04)
│   └── seed.sql             # Seed data (PHASE 04)
│
├── docs/
│   ├── architecture.md      # Architecture overview
│   ├── api-catalog.md       # Planned API endpoints
│   ├── security.md          # Security model
│   └── development.md       # Development guide
│
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Web Application

`apps/web/` — Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui

Routes:

- `/` — Landing page (PHASE 01 ✅)
- `/dashboard` — Dashboard shell (PHASE 02 planned)
- `/auth/*` — Auth pages (PHASE 02 planned)

---

## Gateway

`services/gateway/` — API Gateway service boundary

Responsibilities (PHASE 03):

- Authentication & API key validation
- Rate limiting
- Permission enforcement
- Request routing to scraper services
- Usage logging

---

## Python Services — Scrapers

`services/scrapers/` — Python FastAPI scraper services

Existing providers (preserved as-is):

- `donghua/anichin/` — Anichin.moe scraper (18 modules)
- `donghua/animexin/` — Animexin.dev scraper (7 modules)

Future categories:

- `anime/` — Anime providers
- `manga/` — Manga providers

---

## Supabase

PostgreSQL + Supabase Auth + Realtime

- `supabase/migrations/` — Schema migrations (PHASE 04)
- `supabase/seed.sql` — Seed data (PHASE 04)

---

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.11+
- Supabase CLI (optional, for local dev)

### Install dependencies

```bash
pnpm install
```

### Run web app

```bash
cd apps/web
pnpm dev
```

### Run Python scrapers

```bash
cd services/scrapers/donghua/anichin
python home.py
```

### Type check all packages

```bash
pnpm typecheck

### Build web app

```bash
pnpm build
| Phase | Focus |
| --- | --- |
```

---

## Phase Roadmap

| Phase | Focus |
| --- | --- |
| 02 | Design system, shadcn/ui, animations |
| 03 | Premium landing page |
| 04 | Database schema, RLS, migrations, seed data |
| 05 | Authentication (Supabase Auth, middleware, SSR guards) |
| 06 | Dashboard shell (sidebar, command palette, notifications) |
| 07 | Project management CRUD |
| 08 | API Gateway implementation |
| 09 | FastAPI scraper service wrappers |
| 10 | Usage logging, analytics, playground |

---

## Security

See [docs/security.md](./docs/security.md)

---

## License

Private — VEXALYN Developer
