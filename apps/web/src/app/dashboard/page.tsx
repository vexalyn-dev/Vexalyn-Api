import { getUser, getSession } from "@/lib/auth/session"
import { Skeleton } from "@/components/ui"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui"
import { Zap, Key, ArrowUpRight, Activity, Shield, Clock } from "lucide-react"
import Link from "next/link"

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  change?: string
  href: string
}

function StatCard({ icon: Icon, label, value, change, href }: StatCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md hover:shadow-violet-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
              <Icon className="h-4 w-4 text-violet-600" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default async function DashboardPage() {
  let user = null
  let session = null
  try {
    ;[user, session] = await Promise.all([getUser(), getSession()])
  } catch {
    // handled by layout
  }

  if (!user || !session) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {user.email?.split("@")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your VEXALYN API account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Zap}
          label="Total Requests"
          value="0"
          change="+0 this month"
          href="/dashboard/requests"
        />
        <StatCard
          icon={Key}
          label="Active API Keys"
          value="0"
          href="/dashboard/keys"
        />
        <StatCard
          icon={Activity}
          label="Avg Latency"
          value="—"
          href="/dashboard/usage"
        />
        <StatCard
          icon={Shield}
          label="Error Rate"
          value="0%"
          href="/dashboard/usage"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Clock className="h-4 w-4 text-violet-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                <Zap className="h-4 w-4 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground">Your API requests will appear here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Key className="h-4 w-4 text-violet-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { label: "Create Project", href: "/dashboard/projects/new", desc: "Start a new project" },
                { label: "API Catalog", href: "/dashboard/catalog", desc: "Browse available endpoints" },
                { label: "Playground", href: "/dashboard/playground", desc: "Test endpoints interactively" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-xl border border-border p-3 hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { step: "01", title: "Create a Project", desc: "Organize your APIs into projects." },
              { step: "02", title: "Generate a Key", desc: "Create your first API key." },
              { step: "03", title: "Make a Request", desc: "Start integrating with the API." },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-border p-4">
                <span className="text-2xl font-black text-violet-200">{item.step}</span>
                <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
