"use client"

import { useState } from "react"
import { Check, Zap, Shield, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, Badge } from "@/components/ui"
import { FadeIn, HoverCard } from "@/lib/animations"
import { Card, CardContent } from "@/components/ui"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for hobby projects and experimentation.",
    features: [
      "1,000 requests/month",
      "Donghua API access",
      "Community support",
      "Basic analytics",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For developers building production applications.",
    features: [
      "100,000 requests/month",
      "All API endpoints",
      "Priority support",
      "Advanced analytics",
      "Custom rate limits",
      "Webhook notifications",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "tailored to you",
    description: "For teams with high-volume and custom requirements.",
    features: [
      "Unlimited requests",
      "Dedicated infrastructure",
      "SLA guarantee",
      "Custom integrations",
      "Dedicated account manager",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export function PricingPreview() {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 mb-3">
            Pricing
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free. Scale as you grow. No hidden fees or surprises.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-background p-1">
            <button
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                !annual
                  ? "bg-violet-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setAnnual(false)}
            >
              Monthly
            </button>
            <button
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                annual
                  ? "bg-violet-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setAnnual(true)}
            >
              Annual
              <span className="ml-1.5 text-xs opacity-80">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <HoverCard>
                <Card
                  className={cn(
                    "h-full flex flex-col transition-shadow hover:shadow-lg",
                    plan.highlighted && "border-violet-500 shadow-md shadow-violet-500/10"
                  )}
                >
                  <CardContent className="pt-6 flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        {plan.name}
                      </h3>
                      {plan.highlighted && (
                        <Badge variant="violet" className="text-xs">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-4xl font-bold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{plan.period}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      {plan.description}
                    </p>
                    <ul className="space-y-2.5 mb-8">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <Check className="h-4 w-4 text-violet-600 shrink-0 mt-0.5" />
                          <span className="text-foreground">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <div className="px-6 pb-6">
                    <Button
                      variant={plan.highlighted ? "default" : "outline"}
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </Card>
              </HoverCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
