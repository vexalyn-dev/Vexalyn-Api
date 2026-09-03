"use client"

import { DocsSidebar } from "@/components/docs/sidebar"
import { CodeBlock } from "@/components/docs/code-block"
import { Badge } from "@/components/ui"
import { Zap, Menu, Code2, Package } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SdksPage() {
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
              <span className="text-foreground">SDKs</span>
            </nav>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              SDKs & Libraries
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Official and community libraries to integrate VEXALYN into your app.
            </p>

            {/* Official SDKs */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Official SDKs</h2>
              <div className="space-y-4">
                {[
                  {
                    lang: "TypeScript / JavaScript",
                    status: "Coming Soon",
                    install: "npm install @vexalyn/sdk",
                    description: "Full TypeScript support with auto-generated types from the OpenAPI spec.",
                    example: `import { VexalynClient } from '@vexalyn/sdk';\n\nconst client = new VexalynClient({\n  apiKey: process.env.VEXALYN_API_KEY,\n});\n\n// Search donghua\nconst results = await client.donghua.search('perfect world');\nconsole.log(results.data);`,
                  },
                  {
                    lang: "Python",
                    status: "Coming Soon",
                    install: "pip install vexalyn",
                    description: "Async-first Python client with Pydantic models and type safety.",
                    example: `from vexalyn import VexalynClient\n\nclient = VexalynClient(api_key="vx_live_your_key")\n\n# Search donghua\nresults = await client.donghua.search("perfect world")\nprint(results.data)`,
                  },
                  {
                    lang: "Go",
                    status: "Planned",
                    install: "go get github.com/vexalyn/go-sdk",
                    description: "Lightweight Go client with context support and streaming.",
                    example: `package main\n\nimport (\n    "fmt"\n    "github.com/vexalyn/go-sdk"\n)\n\nfunc main() {\n    client := vexalyn.New("vx_live_your_key")\n    results, _ := client.Donghua.Search("perfect world")\n    fmt.Println(results)\n}`,
                  },
                ].map((sdk) => (
                  <div key={sdk.lang} className="rounded-xl border border-border p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
                        <Code2 className="h-5 w-5 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{sdk.lang}</h3>
                          <Badge variant={sdk.status === "Coming Soon" ? "outline" : "default"} className="text-xs">
                            {sdk.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{sdk.description}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-[#0B0B12] p-3 mb-3">
                      <code className="text-xs font-mono text-emerald-300">{sdk.install}</code>
                    </div>
                    <CodeBlock
                      examples={{
                        curl: sdk.example,
                        javascript: sdk.example,
                        typescript: sdk.example,
                        python: sdk.example,
                        php: "// PHP SDK coming soon",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Community */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Community Libraries</h2>
              <p className="text-muted-foreground mb-4">
                Third-party integrations built by the community.
              </p>
              <div className="space-y-3">
                {[
                  { name: "vexalyn-php", author: "@community", lang: "PHP", stars: "—" },
                  { name: "vexalyn-ruby", author: "@community", lang: "Ruby", stars: "—" },
                  { name: "vexalyn-java", author: "@community", lang: "Java", stars: "—" },
                ].map((lib) => (
                  <div key={lib.name} className="flex items-center gap-4 rounded-xl border border-border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{lib.name}</p>
                      <p className="text-xs text-muted-foreground">{lib.lang} · by {lib.author}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Beta</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* No SDK? */}
            <div className="mt-10 rounded-2xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t see your language? The API is RESTful — use any HTTP client.
              </p>
              <Link href="/docs/quick-start" className="mt-3 inline-block text-sm font-medium text-violet-600 hover:underline">
                View quick start guide →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
