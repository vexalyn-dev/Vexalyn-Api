"use client"

import { DocsSidebar } from "@/components/docs/sidebar"
import { CodeBlock } from "@/components/docs/code-block"
import { Badge } from "@/components/ui"
import { Zap, Menu, Shield, Key, Lock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function AuthenticationPage() {
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
              <span className="text-foreground">Authentication</span>
            </nav>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Authentication
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Secure your API requests with Bearer token authentication.
            </p>

            {/* How it works */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white text-sm font-bold">
                  <Shield className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-semibold text-foreground">How Authentication Works</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Every request to protected endpoints must include a valid API key in the{" "}
                <code className="text-sm font-mono bg-secondary px-1.5 py-0.5 rounded">Authorization</code> header as a Bearer token.
              </p>

              <div className="rounded-xl border border-border bg-secondary p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-4 w-4 text-violet-600" />
                  <span className="text-sm font-semibold text-foreground">Header Format</span>
                </div>
                <code className="text-sm font-mono text-foreground">
                  Authorization: Bearer {"{your_api_key}"}
                </code>
              </div>

              <CodeBlock
                title="Authentication Example"
                examples={{
                  curl: `curl -X GET "https://api.vexalyn.dev/v1/donghua/search?query=test" \\
  -H "Authorization: Bearer vx_live_a8f9c9d1e2b3..." \\
  -H "Accept: application/json"`,
                  javascript: `const response = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/search?query=test',\n  {\n    headers: {\n      'Authorization': 'Bearer vx_live_a8f9c9d1e2b3...',\n      'Accept': 'application/json'\n    }\n  }\n);`,
                  typescript: `const response = await fetch(\n  'https://api.vexalyn.dev/v1/donghua/search?query=test',\n  {\n    headers: {\n      'Authorization': 'Bearer vx_live_a8f9c9d1e2b3...',\n      'Accept': 'application/json'\n    }\n  }\n);\nconst data = await response.json();`,
                  python: `import httpx\n\nresponse = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/search",\n    params={"query": "test"},\n    headers={\n        "Authorization": "Bearer vx_live_a8f9c9d1e2b3...",\n        "Accept": "application/json"\n    }\n)`,
                  php: `<?php\n$ch = curl_init("https://api.vexalyn.dev/v1/donghua/search");\ncurl_setopt($ch, CURLOPT_HTTPHEADER, [\n    "Authorization: Bearer vx_live_a8f9c9d1e2b3...",\n    "Accept: application/json"\n]);\ncurl_setopt($ch, CURLOPT_QUERY, "query=test");\n$response = curl_exec($ch);\n?>`,
                }}
              />
            </div>

            {/* Key format */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">API Key Format</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-foreground">Production</span>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">
                    vx_live_{"<64 hex characters>"}
                  </code>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Use for live application traffic. Rate limit: 60 req/min.
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-sm font-semibold text-foreground">Development</span>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">
                    vx_test_{"<64 hex characters>"}
                  </code>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Use for testing and development. Same rate limits.
                  </p>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="mt-10">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-5 w-5 text-violet-600" />
                <h2 className="text-xl font-semibold text-foreground">Security</h2>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Keys are hashed", desc: "Raw API keys are never stored. We store a bcrypt hash of each key." },
                  { title: "Keys shown once", desc: "The raw key is only displayed at creation time. It cannot be retrieved again." },
                  { title: "Per-key permissions", desc: "Each key can have scoped permissions (read, execute, usage, logs)." },
                  { title: "Revokable anytime", desc: "Revoke or regenerate keys instantly from the dashboard." },
                  { title: "HTTPS only", desc: "All API requests must use HTTPS. HTTP requests are rejected." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border p-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 mt-0.5">
                      <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error responses */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Authentication Errors</h2>
              <div className="space-y-3">
                {[
                  { code: "INVALID_API_KEY", status: 401, desc: "The API key is invalid, malformed, or does not exist." },
                  { code: "KEY_REVOKED", status: 401, desc: "The API key has been revoked by the owner." },
                  { code: "KEY_EXPIRED", status: 401, desc: "The API key has expired." },
                  { code: "MISSING_AUTH_HEADER", status: 401, desc: "The Authorization header is missing." },
                ].map((err) => (
                  <div key={err.code} className="flex items-center gap-4 rounded-xl border border-border p-4">
                    <Badge variant="destructive" className="shrink-0">{err.status}</Badge>
                    <code className="text-sm font-mono text-violet-600 shrink-0">{err.code}</code>
                    <p className="text-sm text-muted-foreground">{err.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
