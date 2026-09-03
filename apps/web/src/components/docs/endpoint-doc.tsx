import { cn } from "@/lib/utils"
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui"
import { CodeBlock } from "./code-block"
import type { Language } from "./code-block"

interface Param {
  name: string
  type: string
  required?: boolean
  description: string
  example?: string
}

interface EndpointDocProps {
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
  title: string
  description: string
  authentication?: boolean
  params?: Param[]
  requestBody?: Param[]
  responseExample?: string
  errorExamples?: string
  codeExamples: {
    curl: string
    javascript: string
    typescript: string
    python: string
    php: string
  }
  slug?: string
  category?: string
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
}

export function EndpointDoc({
  method,
  path,
  title,
  description,
  authentication = true,
  params,
  requestBody,
  responseExample,
  errorExamples,
  codeExamples,
  slug,
  category,
}: EndpointDocProps) {
  return (
    <section id={slug} className="scroll-mt-20">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <Badge
          className={`${methodColors[method] ?? "bg-slate-100 text-slate-700"} font-mono text-xs shrink-0`}
        >
          {method}
        </Badge>
        <div>
          <code className="text-base font-mono font-semibold text-foreground">
            {path}
          </code>
          {category && (
            <p className="mt-0.5 text-xs text-muted-foreground">{category}</p>
          )}
        </div>
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>

      {/* Auth badge */}
      {authentication && (
        <div className="mb-6 flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Authentication Required
          </Badge>
        </div>
      )}

      {/* Parameters */}
      {params && params.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">Parameters</h4>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-32">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-20">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Description</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-20">Required</th>
                </tr>
              </thead>
              <tbody>
                {params.map((param) => (
                  <tr key={param.name} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2.5">
                      <code className="text-xs font-mono text-violet-600">{param.name}</code>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-mono text-muted-foreground">{param.type}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{param.description}</td>
                    <td className="px-4 py-2.5">
                      {param.required ? (
                        <Badge variant="destructive" className="text-[10px]">Yes</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Request Body */}
      {requestBody && requestBody.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">Request Body</h4>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-32">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-20">Type</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {requestBody.map((param) => (
                  <tr key={param.name} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-2.5">
                      <code className="text-xs font-mono text-violet-600">{param.name}</code>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-mono text-muted-foreground">{param.type}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Code Examples */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-foreground mb-3">Examples</h4>
        <CodeBlock examples={codeExamples} />
      </div>

      {/* Response */}
      {responseExample && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">Response</h4>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary">
              <span className="text-xs font-mono text-emerald-600">200 OK</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm bg-[#0B0B12]">
              <code className="text-emerald-300 font-mono leading-relaxed">{responseExample}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Errors */}
      {errorExamples && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Errors</h4>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-secondary">
              <span className="text-xs font-mono text-red-600">401 Unauthorized</span>
            </div>
            <pre className="p-4 overflow-x-auto text-sm bg-[#0B0B12]">
              <code className="text-red-300 font-mono leading-relaxed">{errorExamples}</code>
            </pre>
          </div>
        </div>
      )}
    </section>
  )
}
