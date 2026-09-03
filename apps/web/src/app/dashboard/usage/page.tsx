"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart3,
  Filter,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  getUsageStats,
  type UsageStats,
  type UsageFilters,
} from "@/lib/dashboard/actions"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const TIME_RANGES: { label: string; value: UsageFilters["range"] }[] = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
]

const PIE_COLORS = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6B7280"]

export default function UsagePage() {
  const [range, setRange] = useState<UsageFilters["range"]>("7d")
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getUsageStats({ range })
      setStats(result)
    } catch (e: any) {
      setError(e.message ?? "Failed to load stats")
    } finally {
      setLoading(false)
    }
  }, [range])

  React.useEffect(() => { loadStats() }, [loadStats])

  const errorRate = stats?.totalRequests
    ? ((stats.failedRequests / stats.totalRequests) * 100).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Usage & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor your API usage, latency, and request patterns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {TIME_RANGES.map(({ label, value }) => (
            <Button
              key={value}
              variant={range === value ? "default" : "outline"}
              size="sm"
              onClick={() => setRange(value)}
              className="text-xs h-8"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-4 w-24 bg-muted rounded animate-pulse mb-3" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      ) : stats && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Activity}
              label="Total Requests"
              value={stats.totalRequests.toLocaleString()}
              sub={`${stats.successfulRequests} successful`}
              iconBg="bg-violet-100"
              iconColor="text-violet-600"
            />
            <StatCard
              icon={CheckCircle2}
              label="Successful"
              value={stats.successfulRequests.toLocaleString()}
              sub={`${stats.totalRequests > 0 ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1) : 0}% success rate`}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
            />
            <StatCard
              icon={XCircle}
              label="Failed"
              value={stats.failedRequests.toLocaleString()}
              sub={`${errorRate}% error rate`}
              iconBg="bg-red-100"
              iconColor="text-red-600"
            />
            <StatCard
              icon={Clock}
              label="Avg Latency"
              value={`${stats.avgLatencyMs}ms`}
              iconBg="bg-amber-100"
              iconColor="text-amber-600"
            />
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Requests Over Time */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-violet-600" />
                  Requests Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.requestsByDay.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No requests in this period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={stats.requestsByDay}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => v.slice(5)}
                        tick={{ fontSize: 11 }}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: 12,
                        }}
                        labelFormatter={(v) => `Date: ${v}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#8B5CF6"
                        fillOpacity={1}
                        fill="url(#colorCount)"
                        name="Requests"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Requests by API */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4 text-violet-600" />
                  Requests by API
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.requestsByApi.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Activity className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No data available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.requestsByApi.map((item, i) => {
                      const pct = stats.totalRequests > 0
                        ? (item.count / stats.totalRequests) * 100
                        : 0
                      return (
                        <div key={item.api} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-foreground truncate max-w-[160px]">
                              {item.api}
                            </span>
                            <span className="text-muted-foreground">
                              {item.count} <span className="text-xs">({pct.toFixed(0)}%)</span>
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bar Chart */}
          {stats.requestsByDay.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Daily Request Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.requestsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => v.slice(5)}
                      tick={{ fontSize: 11 }}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#8B5CF6"
                      radius={[4, 4, 0, 0]}
                      name="Requests"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
  iconBg = "bg-violet-100",
  iconColor = "text-violet-600",
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  href?: string
  iconBg?: string
  iconColor?: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
        <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        {sub && (
          <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
        )}
      </CardContent>
    </Card>
  )
}
