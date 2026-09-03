"use client"

import { Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui"
import { FadeIn } from "@/lib/animations"

export function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl bg-[#0B0B12] px-6 py-16 sm:px-12 sm:py-20">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
            </div>

            <div className="relative text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 mb-6">
                <Star className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-violet-300">
                  Phase 03 — Premium Landing
                </span>
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Ready to build something{" "}
                <span className="text-violet-400">extraordinary</span>?
              </h2>
              <p className="mt-6 text-lg text-slate-400 leading-relaxed">
                Join thousands of developers who trust VEXALYN API for their
                media data needs. Start for free, scale when you are ready.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="gap-2 bg-violet-600 hover:bg-violet-700 text-white min-w-[160px]"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[160px] border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  View Documentation
                </Button>
              </div>

              <p className="mt-6 text-xs text-slate-500">
                Free tier includes 1,000 requests/month. No credit card required.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
