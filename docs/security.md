# VEXALYN API — Security

## Overview

Security model for VEXALYN API, covering authentication, API keys, rate limiting, and data handling.

---

## Principles

1. **Frontend never touches scrapers directly** — all requests flow through the Gateway
2. **API keys are required** for all Gateway access (PHASE 05)
3. **Rate limiting** is enforced per API key (PHASE 05)
4. **No secrets in code** — all credentials come from environment variables
5. **Usage logging** for audit trails (PHASE 06)
6. **Row Level Security** enforces data isolation at the database layer (PHASE 04)
7. **API keys are hashed** with bcrypt (BCrypt cost 12) before storage — raw keys never persisted (PHASE 04)

---

## Authentication (Implemented — PHASE 05)

- Supabase Auth handles all auth flows
- API key passed via `Authorization: Bearer <key>` header (Gateway PHASE 06)
- Keys are hashed (bcrypt) before storage
- Keys can be rotated and revoked
- Email verification enforced
- Session persistence via Supabase cookies

## Rate Limiting (Planned — PHASE 06)

- API key passed via `Authorization: Bearer <key>` header
- Key validated against Supabase `api_keys` table
- Keys are hashed (bcrypt, cost 12) before storage
- Keys can be rotated and revoked

---

## Rate Limiting (Planned — PHASE 05)

- Per-key rate limits enforced at the Gateway
- Configurable limits per plan tier
- Sliding window counter stored in Supabase `usage_records`

## Row Level Security (Implemented — PHASE 04)

All tables have RLS enabled. Users can only access data belonging to their own projects. Service role bypasses all policies.

---

## Environment Variables

Never commit real values. Use `.env.example` as reference.

| Variable | Purpose | Required |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes (web) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes (web) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access | Yes (gateway) |
| `VEXALYN_API_URL` | Gateway base URL | Optional |
| `VEXALYN_GATEWAY_URL` | Internal gateway address | Optional |
| `API_SECRET` | JWT/signing secret | Yes (gateway) |
| `ENCRYPTION_KEY` | Data encryption key | Yes (gateway) |

---

## Python Scraper Security

- Scrapers use fixed `User-Agent` headers (no dynamic identity)
- No credentials are embedded in scraper code
- Cloudflare blocks are handled gracefully (403 returned)
- Timeouts prevent hanging connections

---

## Future Security Items

| Item | Status | Phase |
| --- | --- | --- |
| CORS policy | PLANNED | PHASE 05 |
| Request signing | PLANNED | PHASE 05 |
| Audit log retention | PLANNED | PHASE 06 |
| DDoS protection | PLANNED | PHASE 06 |
