"use client"

import { DocsSidebar } from "@/components/docs/sidebar"
import { EndpointDoc } from "@/components/docs/endpoint-doc"
import { CodeBlock } from "@/components/docs/code-block"
import { Badge } from "@/components/ui"
import { Zap, Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DonghuaDocsPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <DocsSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:hidden">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <Link href="/docs" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">VEXALYN</span>
          </Link>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <nav className="text-sm text-muted-foreground mb-6">
              <Link href="/docs" className="hover:text-foreground">Docs</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Donghua API</span>
            </nav>

            {/* Hero */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                  <span className="text-2xl">🎬</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground">Donghua API</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">v1 · Operasional · 11 endpoints</p>
                </div>
                <Badge variant="outline" className="ml-auto font-mono text-xs">donghua</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Access comprehensive donghua (Chinese animation) data including titles, episodes,
                streams, genres, and schedules. Powered by Anichin and Animexin providers.
              </p>
            </div>

            {/* Base info */}
            <div className="rounded-xl border border-border bg-secondary p-4 mb-10">
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Base URL</p>
                  <code className="font-mono text-foreground">https://api.vexalyn.dev/v1/donghua</code>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Providers</p>
                  <p className="font-medium text-foreground">Anichin, Animexin</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Auth</p>
                  <p className="font-medium text-foreground">Bearer token required</p>
                </div>
              </div>
            </div>

            {/* Endpoints */}
            <div className="space-y-10">
              <EndpointDoc
                method="GET"
                path="/home"
                title="Get Homepage"
                description="Fetch homepage content organized by sections (latest updates, featured, etc.) from a provider."
                slug="home"
                params={[
                  { name: "provider", type: "string", required: false, description: "Provider to query. Defaults to 'anichin'.", example: "anichin" },
                ]}
                codeExamples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/home?provider=anichin" \\
  -H "Authorization: Bearer vx_live_your_key"`,
                  javascript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/home?provider=anichin',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);\nconst data = await res.json();`,
                  typescript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/home?provider=anichin',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);\nconst data = await res.json() as ApiResponse;`,
                  python: `import httpx\nresp = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/home",\n    params={"provider": "anichin"},\n    headers={"Authorization": "Bearer vx_live_your_key"}\n)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/home");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, [\n    "Authorization: Bearer vx_live_your_key"\n]);\n$response = curl_exec($ch);\n$data = json_decode($response, true);\n?>`,
                }}
                responseExample={`{\n  "success": true,\n  "data": [\n    {\n      "section_name": "Latest Updates",\n      "total_items": 20,\n      "data": [\n        {\n          "title": "Perfect World",\n          "url": "https://anichin.moe/perfect-world",\n          "thumbnail": "https://...",\n          "episode": "Ep 98",\n          "type": "Donghua",\n          "status": "Ongoing",\n          "label": "Sub"\n        }\n      ]\n    }\n  ],\n  "meta": { "request_id": "req_xxx", "elapsed_ms": 142 }\n}`}
                errorExamples={`{\n  "success": false,\n  "error": { "code": "PROVIDER_ERROR", "message": "Failed to scrape home page" },\n  "meta": { "request_id": "req_xxx" }\n}`}
              />

              <EndpointDoc
                method="GET"
                path="/search"
                title="Search Donghua"
                description="Search for donghua by keyword. Returns matching titles with episode info and thumbnails."
                slug="search"
                params={[
                  { name: "query", type: "string", required: true, description: "Search keyword (min 1 char, max 200)" },
                  { name: "provider", type: "string", required: false, description: "Provider: anichin or animexin", example: "anichin" },
                ]}
                codeExamples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/search?query=perfect+world&provider=anichin" \\
  -H "Authorization: Bearer vx_live_your_key"`,
                  javascript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/search?query=perfect+world',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  typescript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/search?query=perfect+world',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  python: `resp = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/search",\n    params={"query": "perfect world"},\n    headers={"Authorization": "Bearer vx_live_your_key"}\n)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/search");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer vx_live_your_key"]);\ncurl_setopt($ch, CURLOPT_QUERY, "query=perfect+world");\n$response = curl_exec($ch);\n?>`,
                }}
                responseExample={`{\n  "success": true,\n  "data": {\n    "query": "perfect world",\n    "total_data": 5,\n    "data": [\n      {\n        "title": "Perfect World",\n        "url": "https://anichin.moe/perfect-world",\n        "thumbnail": "https://...",\n        "episode": "Ep 98",\n        "type": "Donghua",\n        "status": "Ongoing",\n        "label": "Sub"\n      }\n    ]\n  },\n  "meta": { "request_id": "req_xxx", "elapsed_ms": 98 }\n}`}
                errorExamples={`{\n  "success": false,\n  "error": { "code": "VALIDATION_ERROR", "message": "Query parameter is required" },\n  "meta": { "request_id": "req_xxx" }\n}`}
              />

              <EndpointDoc
                method="GET"
                path="/detail"
                title="Get Detail"
                description="Get detailed information about a donghua title including synopsis, genres, rating, and metadata."
                slug="detail"
                params={[
                  { name: "slug", type: "string", required: true, description: "Title slug or URL path" },
                  { name: "provider", type: "string", required: false, description: "Provider: anichin or animexin", example: "anichin" },
                ]}
                codeExamples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/detail?slug=perfect-world&provider=anichin" \\
  -H "Authorization: Bearer vx_live_your_key"`,
                  javascript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/detail?slug=perfect-world',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  typescript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/detail?slug=perfect-world',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  python: `resp = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/detail",\n    params={"slug": "perfect-world"},\n    headers={"Authorization": "Bearer vx_live_your_key"}\n)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/detail");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer vx_live_your_key"]);\ncurl_setopt($ch, CURLOPT_QUERY, "slug=perfect-world");\n$response = curl_exec($ch);\n?>`,
                }}
                responseExample={`{\n  "success": true,\n  "data": {\n    "title": "Perfect World",\n    "url": "https://anichin.moe/perfect-world",\n    "rating": "8.5",\n    "thumbnail": "https://...",\n    "genres": ["Action", "Adventure", "Fantasy"],\n    "status": "Ongoing",\n    "studio": "Tencent",\n    "episodes": "98",\n    "synopsis": "In a world where..." ,\n    "type": "Donghua"\n  },\n  "meta": { "request_id": "req_xxx", "elapsed_ms": 156 }\n}`}
                errorExamples={`{\n  "success": false,\n  "error": { "code": "PROVIDER_ERROR", "message": "Title not found" },\n  "meta": { "request_id": "req_xxx" }\n}`}
              />

              <EndpointDoc
                method="GET"
                path="/latest"
                title="Latest Updates"
                description="Get the latest donghua updates and newest episode releases."
                slug="latest"
                params={[
                  { name: "page", type: "integer", required: false, description: "Page number (1-100)", example: "1" },
                  { name: "provider", type: "string", required: false, description: "Provider", example: "anichin" },
                ]}
                codeExamples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/latest?page=1&provider=anichin" \\
  -H "Authorization: Bearer vx_live_your_key"`,
                  javascript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/latest?page=1',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  typescript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/latest?page=1',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  python: `resp = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/latest",\n    params={"page": 1},\n    headers={"Authorization": "Bearer vx_live_your_key"}\n)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/latest");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer vx_live_your_key"]);\ncurl_setopt($ch, CURLOPT_QUERY, "page=1");\n$response = curl_exec($ch);\n?>`,
                }}
                responseExample={`{\n  "success": true,\n  "data": [\n    {\n      "title": "Perfect World",\n      "url": "https://anichin.moe/perfect-world",\n      "episode": "Ep 98",\n      "type": "Donghua",\n      "status": "Ongoing",\n      "label": "Sub"\n    }\n  ],\n  "meta": { "request_id": "req_xxx", "elapsed_ms": 87 }\n}`}
                errorExamples={`{\n  "success": false,\n  "error": { "code": "VALIDATION_ERROR", "message": "Page must be >= 1" },\n  "meta": { "request_id": "req_xxx" }\n}`}
              />

              <EndpointDoc
                method="GET"
                path="/popular"
                title="Popular Titles"
                description="Get the most popular donghua by view count and user engagement."
                slug="popular"
                params={[
                  { name: "provider", type: "string", required: false, description: "Provider" },
                ]}
                codeExamples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/popular?provider=anichin" \\
  -H "Authorization: Bearer vx_live_your_key"`,
                  javascript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/popular',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  typescript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/popular',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  python: `resp = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/popular",\n    headers={"Authorization": "Bearer vx_live_your_key"}\n)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/popular");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer vx_live_your_key"]);\n$response = curl_exec($ch);\n?>`,
                }}
                responseExample={`{\n  "success": true,\n  "data": [\n    {\n      "title": "Battle Through the Heavens",\n      "url": "https://anichin.moe/battle-through-the-heavens",\n      "episode": "Ep 72",\n      "type": "Donghua",\n      "status": "Ongoing"\n    }\n  ],\n  "meta": { "request_id": "req_xxx", "elapsed_ms": 112 }\n}`}
                errorExamples={`{\n  "success": false,\n  "error": { "code": "PROVIDER_ERROR", "message": "Provider temporarily unavailable" },\n  "meta": { "request_id": "req_xxx" }\n}`}
              />

              <EndpointDoc
                method="GET"
                path="/stream"
                title="Resolve Stream"
                description="Get stream URLs and available servers for a donghua episode."
                slug="stream"
                params={[
                  { name: "slug", type: "string", required: true, description: "Episode slug" },
                  { name: "provider", type: "string", required: false, description: "Provider" },
                ]}
                codeExamples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/stream?slug=perfect-world-episode-1" \\
  -H "Authorization: Bearer vx_live_your_key"`,
                  javascript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/stream?slug=perfect-world-ep-1',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  typescript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/stream?slug=perfect-world-ep-1',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  python: `resp = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/stream",\n    params={"slug": "perfect-world-ep-1"},\n    headers={"Authorization": "Bearer vx_live_your_key"}\n)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/stream");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer vx_live_your_key"]);\ncurl_setopt($ch, CURLOPT_QUERY, "slug=perfect-world-ep-1");\n$response = curl_exec($ch);\n?>`,
                }}
                responseExample={`{\n  "success": true,\n  "data": {\n    "title": "Perfect World - Episode 1",\n    "url": "https://anichin.moe/perfect-world-episode-1",\n    "selected_server": "Server 1",\n    "iframe_url": "https://stream.provider.com/embed/abc123",\n    "servers": ["Server 1", "Server 2", "Server 3"]\n  },\n  "meta": { "request_id": "req_xxx", "elapsed_ms": 234 }\n}`}
                errorExamples={`{\n  "success": false,\n  "error": { "code": "PROVIDER_ERROR", "message": "Stream resolver failed" },\n  "meta": { "request_id": "req_xxx" }\n}`}
              />

              <EndpointDoc
                method="GET"
                path="/genres"
                title="List Genres"
                description="Get all available genres for donghua content."
                slug="genres"
                params={[
                  { name: "provider", type: "string", required: false, description: "Provider" },
                ]}
                codeExamples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/genres?provider=anichin" \\
  -H "Authorization: Bearer vx_live_your_key"`,
                  javascript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/genres',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  typescript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/genres',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  python: `resp = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/genres",\n    headers={"Authorization": "Bearer vx_live_your_key"}\n)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/genres");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer vx_live_your_key"]);\n$response = curl_exec($ch);\n?>`,
                }}
                responseExample={`{\n  "success": true,\n  "data": [\n    { "name": "Action", "slug": "action", "count": 156 },\n    { "name": "Adventure", "slug": "adventure", "count": 98 },\n    { "name": "Romance", "slug": "romance", "count": 67 }\n  ],\n  "meta": { "request_id": "req_xxx", "elapsed_ms": 76 }\n}`}
                errorExamples={`{\n  "success": false,\n  "error": { "code": "PROVIDER_ERROR", "message": "Failed to fetch genres" },\n  "meta": { "request_id": "req_xxx" }\n}`}
              />

              <EndpointDoc
                method="GET"
                path="/az-list"
                title="A-Z Listing"
                description="Browse donghua titles alphabetically with optional filtering."
                slug="az-list"
                params={[
                  { name: "show", type: "string", required: false, description: "Filter by letter or show name", example: "p" },
                  { name: "page", type: "integer", required: false, description: "Page number", example: "1" },
                  { name: "provider", type: "string", required: false, description: "Provider" },
                ]}
                codeExamples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/az-list?show=p&page=1&provider=anichin" \\
  -H "Authorization: Bearer vx_live_your_key"`,
                  javascript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/az-list?show=p&page=1',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  typescript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/az-list?show=p&page=1',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  python: `resp = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/az-list",\n    params={"show": "p", "page": 1},\n    headers={"Authorization": "Bearer vx_live_your_key"}\n)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/az-list");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer vx_live_your_key"]);\ncurl_setopt($ch, CURLOPT_QUERY, "show=p&page=1");\n$response = curl_exec($ch);\n?>`,
                }}
                responseExample={`{\n  "success": true,\n  "data": [\n    { "title": "Perfect World", "url": "...", "episode": "Ep 98" }\n  ],\n  "meta": { "request_id": "req_xxx", "elapsed_ms": 95 }\n}`}
                errorExamples={`{\n  "success": false,\n  "error": { "code": "VALIDATION_ERROR", "message": "Page must be >= 1" },\n  "meta": { "request_id": "req_xxx" }\n}`}
              />

              <EndpointDoc
                method="GET"
                path="/filter"
                title="Unified Filter"
                description="Advanced filtering combining genre, status, type, season, studio, and more."
                slug="filter"
                params={[
                  { name: "genre", type: "string", required: false, description: "Filter by genre slug" },
                  { name: "status", type: "string", required: false, description: "Ongoing / Completed / Hiatus" },
                  { name: "type", type: "string", required: false, description: "TV / Movie / OVA / Special" },
                  { name: "season", type: "string", required: false, description: "Season name" },
                  { name: "studio", type: "string", required: false, description: "Studio name" },
                  { name: "sub_dub", type: "string", required: false, description: "Sub / Dub" },
                  { name: "page", type: "integer", required: false, description: "Page number" },
                  { name: "provider", type: "string", required: false, description: "Provider" },
                ]}
                codeExamples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/filter?genre=action&status=ongoing&page=1" \\
  -H "Authorization: Bearer vx_live_your_key"`,
                  javascript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/filter?genre=action&status=ongoing',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  typescript: `const res = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/filter?genre=action&status=ongoing',\n  { headers: { 'Authorization': 'Bearer vx_live_your_key' } }\n);`,
                  python: `resp = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/filter",\n    params={"genre": "action", "status": "ongoing"},\n    headers={"Authorization": "Bearer vx_live_your_key"}\n)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/filter");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer vx_live_your_key"]);\ncurl_setopt($ch, CURLOPT_QUERY, "genre=action&status=ongoing");\n$response = curl_exec($ch);\n?>`,
                }}
                responseExample={`{\n  "success": true,\n  "data": [\n    { "title": "Perfect World", "url": "...", "episode": "Ep 98" }\n  ],\n  "meta": { "request_id": "req_xxx", "elapsed_ms": 134 }\n}`}
                errorExamples={`{\n  "success": false,\n  "error": { "code": "PROVIDER_ERROR", "message": "Filter query failed" },\n  "meta": { "request_id": "req_xxx" }\n}`}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
