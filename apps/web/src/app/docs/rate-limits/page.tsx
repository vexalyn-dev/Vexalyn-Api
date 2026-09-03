"use client"

import { DocsSidebar } from "@/components/docs/sidebar"
import { CodeBlock } from "@/components/docs/code-block"
import { Badge } from "@/components/ui"
import { Zap, Menu, Gauge } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function RateLimitsPage() {
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
              <span className="text-foreground">Rate Limits</span>
            </nav>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Rate Limits
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Understand request limits and how to stay within them.
            </p>

            {/* Plan tiers */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Plan Tiers</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { tier: "Free", rate: "60/min", daily: "1,000/day", color: "bg-slate-100 text-slate-700" },
                  { tier: "Pro", rate: "600/min", daily: "100,000/day", color: "bg-violet-100 text-violet-700" },
                  { tier: "Enterprise", rate: "Custom", daily: "Unlimited", color: "bg-emerald-100 text-emerald-700" },
                ].map((plan) => (
                  <div key={plan.tier} className={`rounded-xl border border-border p-5 ${plan.color.replace("text-", "bg-opacity-10 bg-")}`}>
                    <p className="text-sm font-semibold">{plan.tier}</p>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Per minute</span>
                        <span className="font-mono font-medium">{plan.rate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Per day</span>
                        <span className="font-mono font-medium">{plan.daily}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">How Rate Limiting Works</h2>
              <p className="text-muted-foreground mb-4">
                Rate limits are tracked per API key using a sliding window algorithm. When you exceed your limit,
                the gateway returns a <code className="text-sm font-mono bg-secondary px-1 py-0.5 rounded">429</code> response.
              </p>
              <CodeBlock
                examples={{
                  curl: `// Rate limited response\n{\n  "success": false,\n  "error": {\n    "code": "RATE_LIMITED",\n    "message": "Rate limit exceeded. Try again in 30 seconds."\n  },\n  "meta": {\n    "request_id": "req_1234567890_abc123"\n  }\n}`,
                  javascript: `// Check for rate limit in your error handler\nif (error.code === 'RATE_LIMITED') {\n  const retryAfter = error.details?.retry_after ?? 30;\n  await sleep(retryAfter * 1000);\n  return callApi(endpoint, key); // Retry\n}`,
                  typescript: `// Same as JavaScript`,
                  python: `if error.code == "RATE_LIMITED":\n    retry_after = error.details.get(\"retry_after\", 30)\n    time.sleep(retry_after)\n    return call_api(endpoint, key)  # Retry`,
                  php: `<?php\nif ($error['code'] === 'RATE_LIMITED') {\n    $retryAfter = $error['details']['retry_after'] ?? 30;\n    sleep($retryAfter);\n    return callApi($endpoint, $key); // Retry\n}\n?>`,
                }}
              />
            </div>

            {/* Best practices */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Best Practices</h2>
              <div className="space-y-3">
                {[
                  { title: "Implement exponential backoff", desc: "When rate limited, wait and retry with increasing delays." },
                  { title: "Cache responses", desc: "Cache frequently accessed data to reduce redundant API calls." },
                  { title: "Use pagination", desc: "Request only the data you need with appropriate page sizes." },
                  { title: "Monitor usage", desc: "Track your request count in the dashboard to stay ahead of limits." },
                  { title: "Separate keys by environment", desc: "Use different keys for dev and production to isolate usage." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border p-4">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 mt-0.5">
                      <span className="text-xs font-bold text-violet-700">•</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Headers */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Rate Limit Headers</h2>
              <p className="text-muted-foreground mb-4">
                Each response includes headers showing your current usage:
              </p>
              <CodeBlock
                examples={{
                  curl: `X-RateLimit-Limit: 60\nX-RateLimit-Remaining: 42\nX-RateLimit-Reset: 1704067200\nX-Request-ID: req_abc123`,
                  javascript: `// Access rate limit headers\nconst limit = response.headers.get('X-RateLimit-Limit');\nconst remaining = response.headers.get('X-RateLimit-Remaining');\nconst resetAt = response.headers.get('X-RateLimit-Reset');`,
                  typescript: `// Same as JavaScript`,
                  python: `# Access rate limit headers\nlimit = response.headers.get('X-RateLimit-Limit')\nremaining = response.headers.get('X-RateLimit-Remaining')\nreset_at = response.headers.get('X-RateLimit-Reset')`,
                  php: `<?php\n// Access rate limit headers\n$limit = $response->getHeader('X-RateLimit-Limit');\n$remaining = $response->getHeader('X-RateLimit-Remaining');\n$resetAt = $response->getHeader('X-RateLimit-Reset');\n?>`,
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
