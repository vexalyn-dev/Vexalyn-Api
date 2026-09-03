# VEXALYN API — API Catalog

## Overview

This document catalogs planned and existing API endpoints.

---

## Existing Scraper Modules (Phase 01 — Preserved)

These modules exist in `services/scrapers/donghua/` and will be wrapped by the Gateway in PHASE 03.

### Anichin Provider (`donghua/anichin/`)

| Module | Description | Status |
| --- | --- | --- |
| `home.py` | Homepage sectioned content | IMPLEMENTED |
| `search.py` | Search by keyword | IMPLEMENTED |
| `detail.py` | Anime detail page (title, synopsis, genres, rating) | IMPLEMENTED |
| `stream.py` | Episode stream URL resolver (iframe extraction) | IMPLEMENTED |
| `donghua_list.py` | Full donghua list | IMPLEMENTED |
| `popular.py` | Popular donghua | IMPLEMENTED |
| `latest.py` | Latest updates | IMPLEMENTED |
| `schedule.py` | Release schedule | IMPLEMENTED |
| `genre.py` | Genre filter | IMPLEMENTED |
| `type.py` | Type filter (TV, Movie, OVA, etc.) | IMPLEMENTED |
| `status.py` | Status filter (Ongoing, Completed, etc.) | IMPLEMENTED |
| `season.py` | Season filter | IMPLEMENTED |
| `studio.py` | Studio filter | IMPLEMENTED |
| `sub.py` | Sub/Dub filter | IMPLEMENTED |
| `orderby.py` | Orderby results | IMPLEMENTED |
| `filter.py` | Combined filters | IMPLEMENTED |
| `az_list.py` | A-Z listing | IMPLEMENTED |
| `banner.py` | Banner/slider content | IMPLEMENTED |

### Animexin Provider (`donghua/animexin/`)

| Module | Description | Status |
| --- | --- | --- |
| `home.py` | Homepage sectioned content | IMPLEMENTED |
| `search.py` | Search by keyword | IMPLEMENTED |
| `detail.py` | Anime detail page | IMPLEMENTED |
| `donghua_list.py` | Full list | IMPLEMENTED |
| `genre.py` | Genre filter | IMPLEMENTED |
| `az_list.py` | A-Z listing | IMPLEMENTED |

---

## Planned API Endpoints (Gateway — Phase 03)

| Method | Path | Description | Status |
| --- | --- | --- | --- |
| `GET` | `/api/v1/donghua/anichin/home` | Homepage sections | PLANNED |
| `GET` | `/api/v1/donghua/anichin/search?q=` | Search donghua | PLANNED |
| `GET` | `/api/v1/donghua/anichin/detail/:slug` | Detail page | PLANNED |
| `GET` | `/api/v1/donghua/anichin/stream/:slug` | Stream resolver | PLANNED |
| `GET` | `/api/v1/donghua/anichin/list` | Full list | PLANNED |
| `GET` | `/api/v1/donghua/anichin/popular` | Popular | PLANNED |
| `GET` | `/api/v1/donghua/anichin/latest` | Latest updates | PLANNED |
| `GET` | `/api/v1/donghua/animexin/home` | Homepage sections | PLANNED |
| `GET` | `/api/v1/donghua/animexin/search?q=` | Search | PLANNED |
| `GET` | `/api/v1/donghua/animexin/detail/:slug` | Detail page | PLANNED |

---

## Future Categories

| Category | Status | Notes |
| --- | --- | --- |
| `anime` | FUTURE | Not yet implemented |
| `manga` | FUTURE | Directory reserved in `services/scrapers/manga/` |

---

## Response Format (Planned)

All Gateway responses will follow a consistent envelope:

```json
{
  "statusCode": 200,
  "status": "success",
  "message": "...",
  "data": { ... },
  "meta": {
    "provider": "anichin",
    "category": "donghua",
    "elapsed_ms": 342
  }
}
```

Error responses:

```json
{
  "statusCode": 404,
  "status": "error",
  "message": "...",
  "data": null
}
```
