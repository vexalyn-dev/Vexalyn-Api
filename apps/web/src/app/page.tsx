import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { HeroVisual } from "@/components/sections/hero-visual"
import { APIShowcase } from "@/components/sections/api-showcase"
import { Features } from "@/components/sections/features"
import { HowItWorks } from "@/components/sections/how-it-works"
import { CodeExample } from "@/components/sections/code-example"
import { AnalyticsPreview } from "@/components/sections/analytics-preview"
import { PricingPreview } from "@/components/sections/pricing-preview"
import { FAQ } from "@/components/sections/faq"
import { CTASection } from "@/components/sections/cta"
import { FadeIn } from "@/lib/animations"
import { Button } from "@/components/ui"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-100/60 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeIn duration={0.3}>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                <span className="text-xs font-semibold text-violet-700">
                  Now in Beta — v1.0 Available
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.1} duration={0.5}>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
                Powerful APIs.
                <br />
                <span className="text-violet-600">One Simple Platform.</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.2} duration={0.5}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Reliable APIs and developer infrastructure designed to help
                developers build faster. Access anime, donghua, and manga data
                through a single gateway.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} duration={0.5}>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="gap-2 bg-violet-600 hover:bg-violet-700 text-white min-w-[160px]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="min-w-[160px]">
                  Explore Documentation
                </Button>
              </div>
            </FadeIn>

            <FadeIn delay={0.4} duration={0.5}>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
                {["Free tier available", "No credit card", "Setup in 2 minutes"].map(
                  (label) => (
                    <span key={label} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {label}
                    </span>
                  )
                )}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.5} duration={0.6}>
            <HeroVisual />
          </FadeIn>
        </div>
      </section>

      {/* API Showcase */}
      <APIShowcase />

      {/* Features */}
      <Features />

      {/* How it works */}
      <HowItWorks />

      {/* Developer Experience / Code Example */}
      <CodeExample />

      {/* Analytics Preview */}
      <AnalyticsPreview />

      {/* Pricing Preview */}
      <PricingPreview />

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </div>
  )
}
