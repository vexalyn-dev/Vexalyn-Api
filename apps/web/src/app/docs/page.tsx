"use client"

import { DocsSidebar } from "@/components/docs/sidebar"
import { Button } from "@/components/ui"
import { Zap, ArrowRight, Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DocsPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <DocsSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:hidden">
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">VEXALYN</span>
          </Link>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Hero */}
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                <span className="text-xs font-semibold text-violet-700">
                  v0.1.0 — Last updated Sept 2026
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                VEXALYN API
                <br />
                <span className="text-violet-600">Documentation</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Everything you need to integrate VEXALYN&apos;s powerful media data APIs into your applications. Start with our quick guide or browse the full API reference.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/docs/quick-start">
                  <Button className="gap-2 bg-violet-600 hover:bg-violet-700">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/docs/donghua">
                  <Button variant="outline">Donghua API Reference</Button>
                </Link>
              </div>
            </div>

            {/* Quick links */}
            <div className="grid gap-4 sm:grid-cols-2 mb-12">
              {[
                {
                  title: "Quick Start",
                  desc: "Get up and running in 5 minutes with a working API call.",
                  href: "/docs/quick-start",
                  icon: "⚡",
                },
                {
                  title: "Authentication",
                  desc: "Learn how to generate and use API keys securely.",
                  href: "/docs/authentication",
                  icon: "🔑",
                },
                {
                  title: "Donghua API",
                  desc: "Complete reference for donghua data endpoints.",
                  href: "/docs/donghua",
                  icon: "🎬",
                },
                {
                  title: "Error Handling",
                  desc: "Understand error codes and how to handle failures.",
                  href: "/docs/errors",
                  icon: "⚠️",
                },
              ].map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group block rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md hover:shadow-violet-500/5 hover:border-violet-200"
                >
                  <div className="text-2xl mb-3">{card.icon}</div>
                  <h3 className="text-base font-semibold text-foreground group-hover:text-violet-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
                </Link>
              ))}
            </div>

            {/* API Overview */}
            <div className="rounded-2xl border border-border bg-card p-6 mb-12">
              <h2 className="text-xl font-semibold text-foreground mb-4">API Overview</h2>
              <div className="space-y-3">
                {[
                  { api: "Donghua API", slug: "donghua", status: "Operational", endpoints: 11, provider: "Anichin, Animexin" },
                  { api: "Anime API", slug: "anime", status: "Coming Soon", endpoints: 0, provider: "—" },
                  { api: "Manga API", slug: "manga", status: "Coming Soon", endpoints: 0, provider: "—" },
                  { api: "AI API", slug: "ai", status: "Beta", endpoints: 3, provider: "Internal" },
                  { api: "Utility API", slug: "utility", status: "Operational", endpoints: 3, provider: "Internal" },
                ].map((item) => (
                  <div key={item.slug} className="flex items-center gap-4 rounded-xl border border-border p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                      <span className="text-lg">{item.slug === "donghua" ? "🎬" : item.slug === "anime" ? "🎌" : item.slug === "manga" ? "📖" : item.slug === "ai" ? "🤖" : "⚙️"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">{item.api}</p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          item.status === "Operational" ? "bg-emerald-100 text-emerald-700" :
                          item.status === "Beta" ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.endpoints} endpoints · {item.provider}
                      </p>
                    </div>
                    {item.slug !== "anime" && item.slug !== "manga" && (
                      <Link href={`/docs/${item.slug}`} className="shrink-0 text-sm font-medium text-violet-600 hover:text-violet-700">
                        Docs →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Base URL */}
            <div className="rounded-2xl border border-border bg-secondary p-6 mb-12">
              <h2 className="text-lg font-semibold text-foreground mb-3">Base URL</h2>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-[#0B0B12] px-4 py-3">
                <code className="text-sm font-mono text-slate-300 flex-1">
                  https://api.vexalyn.dev/v1
                </code>
                <span className="text-xs text-muted-foreground">v1</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
