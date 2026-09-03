"use client"

import { CheckCircle2 } from "lucide-react"
import { FadeIn } from "@/lib/animations"
import { cn } from "@/lib/utils"

const steps = [
  {
    num: "01",
    title: "Create Account",
    description: "Sign up in seconds. No credit card required for the free tier.",
  },
  {
    num: "02",
    title: "Generate API Key",
    description: "Create your first key from the dashboard. Set custom rate limits.",
  },
  {
    num: "03",
    title: "Make a Request",
    description: "Use our SDK or any HTTP client. Docs have ready-to-copy snippets.",
  },
  {
    num: "04",
    title: "Build Something Great",
    description: "Integrate rich media data into your app and ship faster than ever.",
  },
]

export function HowItWorks() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 mb-3">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Up and running in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="relative h-full rounded-2xl border border-border bg-card p-6">
                <span className="text-5xl font-black text-violet-100 leading-none">
                  {step.num}
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <CheckCircle2 className="hidden md:block absolute -right-3 top-1/2 h-6 w-6 text-violet-300" />
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
