"use client"

import { useState } from "react"
import { ChevronDown, Check, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is Vexalyn API?",
    answer:
      "Vexalyn API is a unified developer platform that provides reliable access to anime, donghua, and manga data through a single API gateway. It abstracts away the complexity of multiple scraper providers and delivers consistent, well-structured JSON responses.",
  },
  {
    question: "How do API keys work?",
    answer:
      "API keys are unique identifiers tied to your account. Each request to the Vexalyn Gateway must include your API key in the Authorization header. Keys can be generated, rotated, and revoked from your dashboard at any time.",
  },
  {
    question: "Is Vexalyn API free?",
    answer:
      "We offer a generous free tier that includes 1,000 requests per month. Paid plans unlock higher rate limits, advanced analytics, and priority support. Check our pricing page for details.",
  },
  {
    question: "How does rate limiting work?",
    answer:
      "Rate limits are applied per API key and vary by plan. The free tier allows 60 requests per minute, while paid plans offer significantly higher limits. When you exceed your limit, the API returns a 429 status code.",
  },
  {
    question: "Can I create multiple API keys?",
    answer:
      "Yes. You can create and manage multiple API keys from your dashboard. This is useful for separating environments (development vs production) or for different team members.",
  },
  {
    question: "How do I authenticate requests?",
    answer:
      "Include your API key in the Authorization header as a Bearer token: <code>Authorization: Bearer vx_live_your_api_key</code>. All requests are served over HTTPS and keys are never logged.",
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 mb-3">
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqData.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <button
                className="flex w-full items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="text-sm font-semibold text-foreground pr-8">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                    openIndex === i && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  openIndex === i ? "max-h-48" : "max-h-0"
                )}
              >
                <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
