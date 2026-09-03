import { listApis, getCategories } from "@/lib/registry/server"
import { Badge, Card, CardContent } from "@/components/ui"
import {
  Clapperboard,
  Play,
  BookOpen,
  Brain,
  Image as ImageIcon,
  Settings,
  Search,
  ArrowRight,
  Zap,
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
  Zap,
}

const categoryLabels: Record<string, string> = {
  entertainment: "Entertainment",
  ai: "AI",
  utility: "Utility",
}

export default async function ApiCatalogPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const [apisResult, categoriesResult] = await Promise.all([
    listApis({
      category: searchParams.category,
      search: searchParams.q,
    }),
    getCategories(),
  ])

  const apis = apisResult.data
  const categories = categoriesResult

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 mb-6">
              <Zap className="h-3.5 w-3.5 text-violet-600" />
              <span className="text-xs font-semibold text-violet-700">
                API Registry
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Powerful APIs.
              <br />
              <span className="text-violet-600">One Platform.</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse our complete API catalog. Each endpoint is documented with
              request/response schemas, examples, and authentication requirements.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <Link
              href="/api"
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                !searchParams.category
                  ? "bg-violet-600 text-white"
                  : "border border-border bg-background text-muted-foreground hover:bg-accent"
              }`}
            >
              All
            </Link>
            {categories.map((cat: string) => (
              <Link
                key={cat}
                href={`/api?category=${cat}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  searchParams.category === cat
                    ? "bg-violet-600 text-white"
                    : "border border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                {categoryLabels[cat] ?? cat}
              </Link>
            ))}
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {apis.length} API{apis.length !== 1 ? "s" : ""} available
          </p>

          {/* API Grid */}
          {apis.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No APIs found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {apis.map((api) => {
                const IconComponent = iconMap[api.icon] ?? Zap
                const statusColors: Record<string, string> = {
                  enabled: "bg-emerald-100 text-emerald-700",
                  beta: "bg-amber-100 text-amber-700",
                  development: "bg-slate-100 text-slate-600",
                }
                return (
                  <Link
                    key={api.slug}
                    href={`/api/${api.slug}`}
                    className="group block"
                  >
                    <Card className="h-full transition-all hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 group-hover:bg-violet-200 transition-colors">
                            <IconComponent className="h-6 w-6 text-violet-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-semibold text-foreground group-hover:text-violet-700 transition-colors">
                                {api.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`text-xs ${statusColors[api.status] ?? "bg-slate-100 text-slate-600"}`}
                              >
                                {api.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs font-mono">
                                {api.version}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs font-mono text-muted-foreground">
                              /v1/{api.slug}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {api.description}
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {api.endpoint_count} endpoint{api.endpoint_count !== 1 ? "s" : ""}
                              </span>
                              <span className="flex items-center gap-1 text-sm font-medium text-violet-600 group-hover:gap-2 transition-all">
                                View API <ArrowRight className="h-4 w-4" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
