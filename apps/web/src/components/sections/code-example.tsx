"use client"

import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui"
import { FadeIn } from "@/lib/animations"

const codeBlock = `import { VexalynClient } from '@vexalyn/sdk';

const client = new VexalynClient({
  apiKey: process.env.VEXALYN_API_KEY,
});

async function main() {
  const latest = await client.donghua.latest();
  console.log(latest.data);
}`

export function CodeExample() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(codeBlock)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="docs" className="py-24 sm:py-32 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeIn>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-violet-600 mb-3">
                Developer Experience
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Write less. Ship more.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                Our SDK handles authentication, retries, and pagination so you
                can focus on building your product. Install it and make your
                first request in under a minute.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Auto-retry with exponential backoff",
                  "Type-safe response shapes",
                  "Zero-config authentication",
                  "Comprehensive TypeScript support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                      <Check className="h-3 w-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-3">
                <Button>View Documentation</Button>
                <Button variant="outline">Try Playground</Button>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-2xl border border-border bg-[#0B0B12] shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  index.ts
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-muted-foreground"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-sm font-mono text-slate-300 leading-relaxed">
                  <code>{codeBlock}</code>
                </pre>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
