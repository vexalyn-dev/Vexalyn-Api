"use client"

import { TrendingUp, Activity, Globe, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { FadeIn } from "@/lib/animations"

const stats = [
  { icon: TrendingUp, label: "Requests Today", value: "2.4M", change: "+12.5%" },
  { icon: Activity, label: "Avg Latency", value: "87ms", change: "-8.2%" },
  { icon: Globe, label: "Uptime", value: "99.98%", change: "Last 30d" },
  { icon: Clock, label: "Errors", value: "0.02%", change: "Below threshold" },
]

export function AnalyticsPreview() {
  return (
    <section id="analytics" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 mb-3">
            Analytics
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Full visibility into your usage
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Monitor request volume, latency, and errors in real time. Get
            insights that help you make better decisions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <stat.icon className="h-4 w-4 text-violet-500" />
                  </div>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-emerald-600 font-medium">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Request Volume — Last 24 Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-end gap-1">
                {Array.from({ length: 48 }).map((_, i) => {
                  const height = 20 + Math.random() * 70
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-violet-500/60 hover:bg-violet-500 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${Math.round(height * 100)} requests`}
                    />
                  )
                })}
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>24h ago</span>
                <span>Now</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </div>
    </section>
  )
}
