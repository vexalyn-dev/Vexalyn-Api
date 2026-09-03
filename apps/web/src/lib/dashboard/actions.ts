"use server"

import { createClient } from "@/lib/auth/client"
import { getUser } from "@/lib/auth/session"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface UsageStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgLatencyMs: number
  requestsByApi: Array<{ api: string; count: number }>
  requestsByDay: Array<{ date: string; count: number }>
}

export interface LogEntry {
  id: string
  request_id: string
  method: string
  path: string
  status_code: number
  latency_ms: number
  created_at: string
  api_name: string | null
  endpoint_path: string | null
  key_name: string | null
  key_prefix: string | null
}

export interface LogsResponse {
  data: LogEntry[]
  total: number
  page: number
  pageSize: number
}

type DateRange = "today" | "7d" | "30d" | "90d" | "custom"
export interface UsageFilters {
  range: DateRange
  startDate?: string
  endDate?: string
}

async function getProjectIdForUser(userId: string): Promise<string | null> {
  const supabase = createClient()
  const { data } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
  return data?.[0]?.id ?? null
}

export async function getUsageStats(filters: UsageFilters): Promise<UsageStats> {
  const user = await getUser()
  if (!user) return { totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgLatencyMs: 0, requestsByApi: [], requestsByDay: [] }

  const projectId = await getProjectIdForUser(user.id)
  if (!projectId) return { totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgLatencyMs: 0, requestsByApi: [], requestsByDay: [] }

  const supabase = createClient()
  const startOfDay = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() - days)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }

  let dateFilter = ""
  if (filters.range === "today") dateFilter = `created_at.gte.${startOfDay(0)}`
  else if (filters.range === "7d") dateFilter = `created_at.gte.${startOfDay(7)}`
  else if (filters.range === "30d") dateFilter = `created_at.gte.${startOfDay(30)}`
  else if (filters.range === "90d") dateFilter = `created_at.gte.${startOfDay(90)}`

  const { data: requests, error, count } = await supabase
    .from("api_requests")
    .select(`
      id, method, status_code, latency_ms, created_at,
      api_id, endpoint_id, api_keys (project_id, name, prefix),
      apis (name, slug),
      api_endpoints (path)
    `, { count: "exact" })
    .eq("api_keys.project_id", projectId)
    .or(dateFilter)
    .order("created_at", { ascending: false })
    .limit(10000)

  if (error) return { totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgLatencyMs: 0, requestsByApi: [], requestsByDay: [] }

  const rows = requests ?? []
  const total = rows.length
  const successful = rows.filter((r: any) => r.status_code >= 200 && r.status_code < 400).length
  const failed = rows.filter((r: any) => r.status_code >= 400).length
  const avgLatency = total > 0
    ? Math.round(rows.reduce((sum: number, r: any) => sum + (r.latency_ms ?? 0), 0) / total)
    : 0

  const byApi: Record<string, number> = {}
  const byDay: Record<string, number> = {}
  for (const r of rows) {
    const apiName = (r as any).apis?.name ?? (r as any).apis?.slug ?? "Unknown"
    byApi[apiName] = (byApi[apiName] ?? 0) + 1
    const day = ((r as any).created_at ?? "").split("T")[0]
    if (day) byDay[day] = (byDay[day] ?? 0) + 1
  }

  return {
    totalRequests: total,
    successfulRequests: successful,
    failedRequests: failed,
    avgLatencyMs: avgLatency,
    requestsByApi: Object.entries(byApi).map(([api, count]) => ({ api, count })),
    requestsByDay: Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count })),
  }
}

export async function getLogs(filters: UsageFilters & { page?: number; pageSize?: number }): Promise<LogsResponse> {
  const user = await getUser()
  if (!user) return { data: [], total: 0, page: 1, pageSize: 20 }

  const projectId = await getProjectIdForUser(user.id)
  if (!projectId) return { data: [], total: 0, page: 1, pageSize: 20 }

  const supabase = createClient()
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 20

  let dateFilter = ""
  if (filters.range === "today") dateFilter = `created_at.gte.${new Date(Date.now() - 86400000).toISOString()}`
  else if (filters.range === "7d") dateFilter = `created_at.gte.${new Date(Date.now() - 86400000 * 7).toISOString()}`
  else if (filters.range === "30d") dateFilter = `created_at.gte.${new Date(Date.now() - 86400000 * 30).toISOString()}`
  else if (filters.range === "90d") dateFilter = `created_at.gte.${new Date(Date.now() - 86400000 * 90).toISOString()}`

  let query = supabase
    .from("api_requests")
    .select(`
      id, request_id, method, path, status_code, latency_ms, created_at,
      api_id, endpoint_id, api_key_id,
      api_keys (name, prefix, project_id),
      apis (name, slug),
      api_endpoints (path)
    `, { count: "exact" })
    .eq("api_keys.project_id", projectId)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (dateFilter) query = query.or(dateFilter)

  const { data, error, count } = await query

  if (error) return { data: [], total: 0, page, pageSize }

  const entries: LogEntry[] = (data ?? []).map((r: any) => ({
    id: r.id,
    request_id: r.request_id,
    method: r.method,
    path: r.path,
    status_code: r.status_code,
    latency_ms: r.latency_ms ?? 0,
    created_at: r.created_at,
    api_name: r.apis?.name ?? null,
    endpoint_path: r.api_endpoints?.path ?? null,
    key_name: r.api_keys?.name ?? null,
    key_prefix: r.api_keys?.prefix ?? null,
  }))

  return { data: entries, total: count ?? 0, page, pageSize }
}

export async function getLogDetail(requestId: string): Promise<LogEntry | null> {
  const user = await getUser()
  if (!user) return null

  const projectId = await getProjectIdForUser(user.id)
  if (!projectId) return null

  const supabase = createClient()
  const { data, error } = await supabase
    .from("api_requests")
    .select(`
      id, request_id, method, path, status_code, latency_ms, created_at,
      query_params, request_body, ip_hash, user_agent, error_message, response_size_bytes,
      api_id, endpoint_id, api_key_id,
      api_keys (name, prefix, project_id),
      apis (name, slug),
      api_endpoints (path)
    `)
    .eq("id", requestId)
    .eq("api_keys.project_id", projectId)
    .single()

  if (error || !data) return null

  const r = data as any
  return {
    id: r.id,
    request_id: r.request_id,
    method: r.method,
    path: r.path,
    status_code: r.status_code,
    latency_ms: r.latency_ms ?? 0,
    created_at: r.created_at,
    api_name: r.apis?.name ?? null,
    endpoint_path: r.api_endpoints?.path ?? null,
    key_name: r.api_keys?.name ?? null,
    key_prefix: r.api_keys?.prefix ?? null,
  }
}
