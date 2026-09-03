"use client"

import * as React from "react"
import { notFound } from "next/navigation"
import { getApi } from "@/lib/registry/server"
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import {
  Clapperboard,
  Play,
  BookOpen,
  Brain,
  Image as ImageIcon,
  Settings,
  Search,
  ArrowLeft,
  Shield,
  Clock,
  Code2,
  Copy,
  Check,
} from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

const iconMap: Record<string, React.ElementType> = {
  Clapperboard,
  Play,
  BookOpen,
  Brain,
  Image: ImageIcon,
  Settings,
  Search,
  Zap: Code2,
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  PATCH: "bg-purple-100 text-purple-700",
}

interface ApiDetailProps {
  params: { slug: string }
}

export default async function ApiDetailPage({ params }: ApiDetailProps) {
  const result = await getApi(params.slug)

  if (result.error === "NOT_FOUND" || !result.data) {
    notFound()
  }
  if (result.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Failed to load API: {result.error}</p>
      </div>
    )
  }

  const api = result.data!
  const IconComponent = iconMap[api.icon] ?? Code2

  return (
    <ApiDetailClient api={api} IconComponent={IconComponent} />
  )
}

function ApiDetailClient({
  api,
  IconComponent,
}: {
  api: NonNullable<Awaited<ReturnType<typeof getApi>>["data"]>
  IconComponent: React.ElementType
}) {
  const [copiedEndpoint, setCopiedEndpoint] = React.useState<string | null>(null)

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopiedEndpoint(id)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/api"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to API Catalog
          </Link>

          {/* Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-100">
              <IconComponent className="h-8 w-8 text-violet-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {api.name}
                </h1>
                <Badge
                  variant={api.enabled ? "default" : "outline"}
                  className={api.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}
                >
                  {api.status}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {api.version}
                </Badge>
              </div>
              <p className="mt-2 text-sm font-mono text-muted-foreground">
                {api.base_url ?? `https://api.vexalyn.dev/v1/${api.slug}`}
              </p>
              <p className="mt-2 text-muted-foreground">{api.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <StatCard label="Endpoints" value={api.endpoint_count.toString()} icon={Code2} />
            <StatCard label="Category" value={api.category} icon={Settings} />
            <StatCard
              label="Auth Required"
              value={api.endpoints.some((e: any) => e.authentication_required) ? "Yes" : "No"}
              icon={Shield}
            />
            <StatCard label="Version" value={api.version} icon={Clock} />
          </div>

          {/* Endpoints */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              Endpoints ({api.endpoints.length})
            </h2>

            {api.endpoints.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No public endpoints configured yet.</p>
                </CardContent>
              </Card>
            ) : (
              api.endpoints.map((endpoint: any) => (
                <EndpointCard
                  key={endpoint.id}
                  endpoint={endpoint}
                  apiSlug={api.slug}
                  onCopy={(text, id) => handleCopy(text, id)}
                  copiedEndpoint={copiedEndpoint}
                />
              ))
            )}
          </div>

          {/* Providers */}
          {api.providers.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Providers</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {api.providers.map((provider: any) => (
                  <Card key={provider.id}>
                    <CardContent className="pt-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                        <span className="text-sm font-bold text-muted-foreground">
                          {provider.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{provider.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {provider.base_url}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {provider.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardContent className="pt-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
          <Icon className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function EndpointCard({
  endpoint,
  apiSlug,
  onCopy,
  copiedEndpoint,
}: {
  endpoint: any
  apiSlug: string
  onCopy: (text: string, id: string) => void
  copiedEndpoint: string | null
}) {
  const fullUrl = `https://api.vexalyn.dev/v1/${apiSlug}${endpoint.path}`

  return (
    <Card>
      <CardContent className="pt-4">
        {/* Endpoint header */}
        <div className="flex items-center gap-3 mb-3">
          <Badge
            className={`${methodColors[endpoint.method] ?? "bg-slate-100 text-slate-700"} font-mono text-xs`}
          >
            {endpoint.method}
          </Badge>
          <code className="text-sm font-mono text-foreground flex-1 truncate">
            {endpoint.path}
          </code>
          <button
            onClick={() => onCopy(fullUrl, endpoint.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            aria-label="Copy URL"
          >
            {copiedEndpoint === endpoint.id ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          {endpoint.authentication_required && (
            <Badge variant="outline" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              Auth Required
            </Badge>
          )}
          {(endpoint.permissions ?? []).map((perm: string) => (
            <Badge key={perm} variant="secondary" className="text-xs font-mono">
              {perm}
            </Badge>
          ))}
        </div>

        {/* Example request */}
        {endpoint.example_request && (
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Example Request
            </p>
            <div className="rounded-xl border border-border bg-[#0B0B12] p-3">
              <code className="text-xs font-mono text-slate-300">{endpoint.example_request}</code>
            </div>
          </div>
        )}

        {/* Example response */}
        {endpoint.example_response && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Example Response
            </p>
            <div className="rounded-xl border border-border bg-[#0B0B12] p-3">
              <code className="text-xs font-mono text-emerald-300">{endpoint.example_response}</code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
