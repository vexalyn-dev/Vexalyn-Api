import { requireAuth } from "@/lib/auth/session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Zap, TrendingUp, Users, Activity } from "lucide-react"
import { getSession } from "@/lib/auth/session"

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: string
  sub: string
}

function StatCard({ icon: Icon, label, value, sub }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-violet-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const user = await requireAuth()
  const session = await getSession()

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user.email?.split("@")[0]}
          </h1>
          <p className="text-muted-foreground">
            Your VEXALYN dashboard — Phase 05 — Authentication implemented
          </p>
          {session && (
            <p className="text-xs text-muted-foreground mt-1">
              Session expires:{" "}
              {new Date(session.expires_at! * 1000).toLocaleString()}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Zap}
            label="Total Requests"
            value="0"
            sub="Phase 05 — Auth foundation"
          />
          <StatCard
            icon={Activity}
            label="Active Keys"
            value="0"
            sub="Create keys in Settings"
          />
          <StatCard
            icon={Users}
            label="Providers"
            value="2"
            sub="Anichin, Animexin"
          />
          <StatCard
            icon={TrendingUp}
            label="Status"
            value="v0.5"
            sub="Phase 05 — Auth"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-foreground">
                Logged in as <strong>{user.email}</strong>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Dashboard is protected. Unauthenticated users are redirected to /login.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
