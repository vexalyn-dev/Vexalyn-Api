"use client"

import { Zap, Shield, BarChart3, Bolt, FileText, Plug2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui"
import { HoverCard, StaggerContainer, StaggerItem } from "@/lib/animations"

const features = [
  {
    icon: Plug2,
    title: "Developer First",
    description:
      "Clean REST APIs with consistent JSON responses. No parsing headaches — just fetch and use.",
  },
  {
    icon: Shield,
    title: "Secure API Keys",
    description:
      "Generate, rotate, and revoke keys instantly. Every request is authenticated and audited.",
  },
  {
    icon: BarChart3,
    title: "Usage Analytics",
    description:
      "Real-time dashboards showing request volume, latency, and error rates per endpoint.",
  },
  {
    icon: Bolt,
    title: "Fast Infrastructure",
    description:
      "Global edge caching and optimized scrapers deliver sub-200ms responses on average.",
  },
  {
    icon: FileText,
    title: "Detailed Logs",
    description:
      "Every request is logged with full metadata. Debug faster with structured request traces.",
  },
  {
    icon: Zap,
    title: "Easy Integration",
    description:
      "SDKs for TypeScript, Python, and Go. Copy a snippet, paste it in, and you are live.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 mb-3">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for developers who ship fast
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to integrate rich media data into your
            applications — without the infrastructure headache.
          </p>
        </div>

        <StaggerContainer staggerDelay={0.08}>
          {features.map((feature, i) => (
            <StaggerItem key={i}>
              <HoverCard>
                <Card className="h-full border-border/60 bg-card transition-shadow hover:shadow-lg hover:shadow-violet-500/5">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 mb-4">
                      <feature.icon className="h-5 w-5 text-violet-600" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground flex-1">
                      {feature.description}
                    </p>
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
