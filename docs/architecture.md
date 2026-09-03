# VEXALYN API — Architecture

## Overview

VEXALYN API is a monorepo containing a Next.js web application, an API Gateway, Python FastAPI scraper services, shared packages, and Supabase infrastructure.

---

## Core Principle

```text
WEB
  ↓
GATEWAY
  ↓
AUTHENTICATION
  ↓
API KEYS
  ↓
PERMISSIONS
  ↓
RATE LIMIT
  ↓
ROUTING
  ↓
API SERVICES
  ↓
SCRAPERS / PROVIDERS
```

**Never allow the web application to directly control scraper internals.**

---

## Layers

### 1. Web Application (`apps/web/`)

- Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- Serves the landing page, dashboard, and auth flows
- Consumes the Gateway exclusively — never calls scrapers directly
- Shared types imported from `@vexalyn/api-types`

**Phase Status:** Foundation implemented. UI completed in PHASE 03. Auth + SSR protection implemented in PHASE 05.

---

### 2. API Gateway (`services/gateway/`)

- Service boundary between the web app and scraper providers
- Handles: authentication, API key validation, rate limiting, routing, usage logging
- Currently a placeholder; full implementation in PHASE 06

**Phase Status:** PLANNED — PHASE 06

---

### 3. Python Scraper Services (`services/scrapers/`)

- FastAPI-based HTTP services wrapping individual scraper providers
- Each provider (anichin, animexin, ...) has its own module directory
- Modules are preserved as-is; no logic changes in Phase 01

**Current providers:**

- `donghua/anichin/` — 18 scraper modules
- `donghua/animexin/` — 7 scraper modules

**Phase Status:** IMPLEMENTED (preserved)

---

### 4. Shared Packages (`packages/`)

| Package | Purpose | Status |
| --- | --- | --- |
| `@vexalyn/database` | DB connection helpers, query builders | IMPLEMENTED — PHASE 04 |
| `@vexalyn/api-types` | Shared TypeScript types for API shapes | PLACEHOLDER — FUTURE |
| `@vexalyn/api-client` | Client SDK for calling the Gateway | PLACEHOLDER — FUTURE |
| `@vexalyn/config` | Environment validation, shared constants | PLACEHOLDER — FUTURE |

---

### 5. Supabase (`supabase/`)

- PostgreSQL database with Supabase Auth
- `migrations/` — DDL migrations (IMPLEMENTED in PHASE 04)
- `seed.sql` — minimal development seed data
- 11 tables with full RLS, indexes, and triggers

**Phase Status:** IMPLEMENTED — PHASE 04

---

## Request Flow (Future)

```text
Browser → Next.js (apps/web)
  → Gateway (services/gateway)
    → authenticate(request)
    → validateApiKey(key)
    → checkRateLimit(key)
    → routeTo(provider)
      → FastAPI scraper service (services/scrapers/donghua/anichin)
        → scrape(endpoint)
        → parse(html)
        → return json
      ← response
    ← logged usage
  ← transformed response
← rendered page / API response
```

---

## Directory Conventions

- `apps/` — Frontend applications (Next.js)
- `services/` — Backend services (Python, future Go/Node)
- `packages/` — Shared TypeScript libraries (monorepo packages)
- `supabase/` — Database migrations and seed data
- `docs/` — Architecture and operational documentation

---

## Phase Roadmap

| Phase | Focus |
| --- | --- |
| 01 | Monorepo foundation, web shell, scraper preservation |
| 02 | Design system, shadcn/ui, animations |
| 03 | Premium landing page |
| 04 | Database schema, RLS, migrations, seed data |
| 05 | Authentication (Supabase Auth, middleware, SSR guards) |
| 06 | API Gateway implementation |
| 07 | FastAPI scraper service wrappers |
| 08 | Usage logging, analytics, playground |
