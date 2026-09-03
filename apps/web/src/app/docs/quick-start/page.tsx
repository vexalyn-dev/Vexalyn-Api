"use client"

import { DocsSidebar } from "@/components/docs/sidebar"
import { CodeBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui"
import { Zap, Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function QuickStartPage() {
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
          <div className="mx-auto max-w-3xl">
            <nav className="text-sm text-muted-foreground mb-6">
              <Link href="/docs" className="hover:text-foreground">Docs</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Quick Start</span>
            </nav>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Quick Start
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Get your first API call working in under 5 minutes.
            </p>

            {/* Step 1 */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white text-sm font-bold">1</div>
                <h2 className="text-xl font-semibold text-foreground">Get Your API Key</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Sign up for a free account and generate your first API key from the dashboard.
                Your key will look like <code className="text-sm font-mono bg-secondary px-1.5 py-0.5 rounded">vx_live_a8f9c9d1...</code>
              </p>
              <div className="rounded-xl border border-border bg-secondary p-4">
                <p className="text-sm text-muted-foreground">
                  Free tier includes <strong className="text-foreground">1,000 requests/month</strong>. No credit card required.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white text-sm font-bold">2</div>
                <h2 className="text-xl font-semibold text-foreground">Make Your First Request</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Use any HTTP client. Here are examples in multiple languages:
              </p>
              <CodeBlock
                title="Search for donghua"
                filename="search"
                examples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/search?query=perfect+world&provider=anichin" \\
  -H "Authorization: Bearer vx_live_your_api_key"`,
                  javascript: `const response = await fetch(
  'https://api.vexalyn.dev/v1/donghua/search?query=perfect+world',
  {
    headers: {
      'Authorization': 'Bearer vx_live_your_api_key'
    }
  }
);
const data = await response.json();
console.log(data);`,
                  typescript: `const response = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/search?query=perfect+world',\n  {\n    headers: {\n      'Authorization': 'Bearer vx_live_your_api_key'\n    }\n  }\n);\nconst data: { success: boolean; data: any } = await response.json();\nconsole.log(data);`,
                  python: `import httpx\n\nresponse = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/search",\n    params={"query": "perfect world"},\n    headers={"Authorization": "Bearer vx_live_your_api_key"}\n)\ndata = response.json()\nprint(data)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/search");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, [\n    "Authorization: Bearer vx_live_your_api_key",\n    "Accept: application/json"\n]);\ncurl_setopt($ch, CURLOPT_QUERY, "query=perfect world");\n$response = curl_exec($ch);\n$data = json_decode($response, true);\n?>`,
                }}
              />
            </div>

            {/* Step 3 */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white text-sm font-bold">3</div>
                <h2 className="text-xl font-semibold text-foreground">Parse the Response</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                All responses follow a consistent envelope format:
              </p>
              <CodeBlock
                title="Response Example"
                filename="json"
                examples={{
                  curl: `{
  "success": true,
  "data": {
    "query": "perfect world",
    "total_data": 5,
    "data": [
      {
        "title": "Perfect World",
        "url": "https://anichin.moe/perfect-world",
        "thumbnail": "https://...",
        "episode": "Ep 98",
        "type": "Donghua",
        "status": "Ongoing",
        "label": "Sub"
      }
    ]
  },
  "meta": {
    "request_id": "req_1234567890_abc123",
    "elapsed_ms": 142,
    "provider": "anichin"
  }
}`,
                  javascript: `// TypeScript interface\ninterface ApiResponse<T> {\n  success: boolean;\n  data: T;\n  meta: {\n    request_id: string;\n    elapsed_ms: number;\n    provider: string;\n  };\n}\n\ninterface SearchResponse {\n  query: string;\n  total_data: number;\n  data: AnimeItem[];\n}\n\ninterface AnimeItem {\n  title: string;\n  url: string;\n  thumbnail: string;\n  episode: string;\n  type: string;\n  status: string;\n  label: string;\n}`,
                  typescript: `// Same as JavaScript — full type safety included`,
                  python: `# Pydantic models\nfrom pydantic import BaseModel\nfrom typing import List, Optional\n\nclass AnimeItem(BaseModel):\n    title: str\n    url: str\n    thumbnail: str = ""\n    episode: str = ""\n    type: str = \"Donghua\"\n    status: str = \"\"\n    label: str = \"Sub\"\n\nclass Meta(BaseModel):\n    request_id: str\n    elapsed_ms: int\n    provider: str\n\nclass ApiResponse(BaseModel):\n    success: bool\n    data: List[AnimeItem]\n    meta: Meta`,
                  php: `<?php\n// PHP class structure\nclass AnimeItem {\n    public string $title;\n    public string $url;\n    public string $thumbnail = \"\";\n    public string $episode = \"\";\n    public string $type = \"Donghua\";\n    public string $status = \"\";\n    public string $label = \"Sub\";\n}\n\nclass Meta {\n    public string $request_id;\n    public int $elapsed_ms;\n    public string $provider;\n}\n?>`,
                }}
              />
            </div>

            {/* Step 4 */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white text-sm font-bold">4</div>
                <h2 className="text-xl font-semibold text-foreground">Explore More Endpoints</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                The Donghua API supports 11+ endpoints including search, detail, latest updates, popular titles, and more.
              </p>
              <div className="grid gap-2">
                {[
                  { method: "GET", path: "/v1/donghua/search", desc: "Search by keyword" },
                  { method: "GET", path: "/v1/donghua/detail", desc: "Get detailed info" },
                  { method: "GET", path: "/v1/donghua/latest", desc: "Latest updates" },
                  { method: "GET", path: "/v1/donghua/popular", desc: "Popular titles" },
                  { method: "GET", path: "/v1/donghua/stream", desc: "Stream URLs" },
                ].map((ep) => (
                  <Link
                    key={ep.path}
                    href={`/docs/donghua${ep.path.split("/v1/donghua")[1].toLowerCase()}`}
                    className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent transition-colors"
                  >
                    <span className="font-mono text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{ep.method}</span>
                    <code className="text-sm font-mono text-foreground">{ep.path}</code>
                    <span className="text-sm text-muted-foreground ml-auto">{ep.desc}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 rounded-2xl border border-violet-200 bg-violet-50 p-6">
              <h3 className="text-lg font-semibold text-violet-900">Ready to build?</h3>
              <p className="mt-1 text-sm text-violet-700">
                Jump into the full API reference or try the playground.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/docs/donghua">
                  <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                    Donghua API Reference
                  </Button>
                </Link>
                <Link href="/api">
                  <Button size="sm" variant="outline">
                    API Playground
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
