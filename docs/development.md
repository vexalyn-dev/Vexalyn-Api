# VEXALYN API — Development Guide

## Prerequisites

- **Node.js** 18+
- **pnpm** 8+
- **Python** 3.11+
- **Supabase CLI** (optional, for local development)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Run web app
cd apps/web && pnpm dev

# Run a scraper (standalone)
cd services/scrapers/donghua/anichin
python home.py
```

---

## Project Structure

```text
vexalyn-api/
├── apps/web/                  # Next.js frontend
├── services/gateway/          # API Gateway (placeholder — PHASE 03)
├── services/scrapers/         # Python scraper services
│   └── donghua/
│       ├── anichin/           # Anichin.moe provider (18 modules)
│       └── animexin/          # Animexin.dev provider (7 modules)
├── packages/                  # Shared TypeScript packages
│   ├── database/
│   ├── api-types/
│   ├── api-client/
│   └── config/
├── supabase/                  # Database migrations & seed
└── docs/                      # Documentation
```

---

## Commands

| Command | Description |
| --- | --- |
| `pnpm install` | Install all workspace dependencies |
| `pnpm dev` | Run all apps in parallel |
| `pnpm build` | Build all packages and apps |
| `pnpm typecheck` | Type-check all TypeScript projects |
| `pnpm lint` | Lint all projects |
| `pnpm format` | Format all files with Prettier |

---

## Adding a New Scraper Provider

1. Create directory: `services/scrapers/<category>/<provider>/`
2. Copy existing module pattern (e.g., `anichin/` structure)
3. Update `docs/api-catalog.md` with new endpoints
4. Add provider to Gateway routing in PHASE 03

---

## Adding a New Package

```bash
cd packages
mkdir <package-name>
# Create package.json, tsconfig.json, src/index.ts
```

Then reference in `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
```

---

## Database (Supabase)

```bash
# Initialize Supabase locally
supabase init

# Apply migrations
supabase db push

# Reset with seed
supabase db reset --seed-file supabase/seed.sql
```

---

## Branching Strategy

- `main` — stable, deployable state
- `feat/<feature>` — feature branches
- `fix/<issue>` — bug fix branches

---

## Coding Standards

- TypeScript strict mode enabled across all packages
- Prettier for formatting (run `pnpm format`)
- No hardcoded credentials
- All new features must document their phase assignment in `docs/`
