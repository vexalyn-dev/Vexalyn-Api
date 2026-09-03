"use client"

import { Zap, Radio, BookOpen, Brain, Cpu } from "lucide-react"
import { Card, CardContent } from "@/components/ui"
import { FadeIn, StaggerContainer, StaggerItem, HoverCard } from "@/lib/animations"
import { cn } from "@/lib/utils"

const apis = [
  {
    name: "Donghua API",
    endpoint: "/v1/donghua",
    status: "Operational",
    version: "v1",
    icon: Zap,
    description: "Comprehensive donghua data including titles, episodes, streams, and schedules.",
    endpoints: ["GET /latest", "GET /search", "GET /detail/:slug", "GET /stream/:slug"],
  },
  {
    name: "Anime API",
    endpoint: "/v1/anime",
    status: "Coming Soon",
    version: "v2",
    icon: Radio,
    description: "Japanese anime catalog with episode data, streaming links, and metadata.",
    endpoints: ["GET /latest", "GET /search", "GET /genre/:slug"],
  },
  {
    name: "Manga API",
    endpoint: "/v1/manga",
    status: "Coming Soon",
    version: "v1",
    icon: BookOpen,
    description: "Manga and manhwa data with chapter tracking and reading lists.",
    endpoints: ["GET /latest", "GET /search", "GET /chapter/:id"],
  },
  {
    name: "AI API",
    endpoint: "/v1/ai",
    status: "Beta",
    version: "v1",
    icon: Brain,
    description: "AI-powered recommendations, similarity search, and content classification.",
    endpoints: ["POST /recommend", "POST /classify", "GET /similar/:id"],
  },
  {
    name: "Utility API",
    endpoint: "/v1/util",
    status: "Operational",
    version: "v1",
    icon: Cpu,
    description: "Helpers for scraping, validation, and data normalization.",
    endpoints: ["POST /parse", "POST /validate", "GET /health"],
  },
]

export function APIShowcase() {
  return (
    <section id="api" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 mb-3">
            API Catalog
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            One platform. Every data source.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Access multiple media providers through a single consistent API
            interface. No more juggling different endpoints and formats.
          </p>
        </div>

        <StaggerContainer staggerDelay={0.08}>
          {apis.map((api, i) => (
            <StaggerItem key={api.name}>
              <HoverCard>
                <Card className="h-full border-border/60 hover:border-violet-200 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                        <api.icon className="h-5 w-5 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-foreground">
                            {api.name}
                          </h3>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                              api.status === "Operational" &&
                                "bg-emerald-100 text-emerald-700",
                              api.status === "Beta" &&
                                "bg-amber-100 text-amber-700",
                              api.status === "Coming Soon" &&
                                "bg-slate-100 text-slate-600"
                            )}
                          >
                            {api.status === "Operational" && (
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            )}
                            {api.status}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">
                            {api.version}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-mono text-muted-foreground">
                          {api.endpoint}
                        </p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {api.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {api.endpoints.map((ep) => (
                            <span
                              key={ep}
                              className="rounded-lg bg-secondary px-2 py-1 text-xs font-mono text-muted-foreground"
                            >
                              {ep}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </HoverCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}
