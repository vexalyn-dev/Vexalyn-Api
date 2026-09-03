"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Code2,
  Terminal,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui"

const mockResponse = {
  success: true,
  statusCode: 200,
  data: [
    {
      title: "Perfect World",
      type: "Donghua",
      episode: "Ep 98",
      thumbnail: "",
    },
    {
      title: "Battle Through the Heavens",
      type: "Donghua",
      episode: "Ep 72",
      thumbnail: "",
    },
    {
      title: "Soul Land",
      type: "Donghua",
      episode: "Ep 142",
      thumbnail: "",
    },
  ],
  meta: { provider: "anichin", elapsed_ms: 142 },
}

const codeSnippets = [
  {
    lang: "bash",
    label: "Terminal",
    code: `curl https://api.vexalyn.dev/v1/donghua/latest \\
  -H "Authorization: Bearer vx_live_••••••••"`,
  },
  {
    lang: "js",
    label: "JavaScript",
    code: `const res = await fetch('https://api.vexalyn.dev/v1/donghua/latest', {
  headers: { 'Authorization': 'Bearer vx_live_••••••••' }
});
const data = await res.json();`,
  },
  {
    lang: "python",
    label: "Python",
    code: `import httpx\n\nres = httpx.get(\n    "https://api.vexalyn.dev/v1/donghua/latest",\n    headers={"Authorization": "Bearer vx_live_••••••••"}\n)\ndata = res.json()`,
  },
]

export function HeroVisual() {
  const [activeLang, setActiveLang] = useState(0)

  return (
    <div className="mx-auto mt-16 w-full max-w-4xl px-4 sm:px-6">
      <div className="rounded-2xl border border-border bg-[#0B0B12] shadow-2xl shadow-violet-500/10 overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2 ml-4 flex-1">
            <Terminal className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs text-muted-foreground font-mono">
              api.vexalyn.dev
            </span>
          </div>
          <div className="flex gap-1">
            {codeSnippets.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveLang(i)}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  activeLang === i
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {codeSnippets[i].label}
              </button>
            ))}
          </div>
        </div>

        {/* Code area */}
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {/* Left: request */}
          <div className="p-5 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Request
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">GET</span>
                <span className="text-amber-300">
                  /v1/donghua/latest
                </span>
              </div>
              <div className="pl-0 pt-2 space-y-1">
                <div className="flex gap-3">
                  <span className="text-muted-foreground shrink-0">
                    Authorization:
                  </span>
                  <span className="text-violet-300">
                    Bearer vx_live_••••••••
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="text-muted-foreground shrink-0">
                    Accept:
                  </span>
                  <span className="text-sky-300">application/json</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  200 OK
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {mockResponse.meta.elapsed_ms}ms
                </span>
              </div>
            </div>
          </div>

          {/* Right: response */}
          <div className="p-5 font-mono text-sm">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Response
              </span>
            </div>
            <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre">
{`{
  "success": true,
  "statusCode": 200,
  "data": [
    {
      "title": "Perfect World",
      "type": "Donghua",
      "episode": "Ep 98"
    },
    {
      "title": "Battle Through the Heavens",
      "type": "Donghua",
      "episode": "Ep 72"
    },
    {
      "title": "Soul Land",
      "type": "Donghua",
      "episode": "Ep 142"
    }
  ],
  "meta": {
    "provider": "anichin",
    "elapsed_ms": ${mockResponse.meta.elapsed_ms}
  }
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {[
          { label: "Donghua", color: "bg-violet-100 text-violet-700" },
          { label: "Anime", color: "bg-sky-100 text-sky-700" },
          { label: "Manga", color: "bg-emerald-100 text-emerald-700" },
          { label: "v1.0", color: "bg-amber-100 text-amber-700" },
          { label: "Operational", color: "bg-emerald-100 text-emerald-700" },
        ].map((badge) => (
          <span
            key={badge.label}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              badge.color
            )}
          >
            {badge.label === "Operational" && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            {badge.label}
          </span>
        ))}
      </div>
    </div>
  )
}
