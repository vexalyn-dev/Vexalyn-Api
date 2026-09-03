"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  FileText,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getLogs, type LogsResponse, type UsageFilters } from "@/lib/dashboard/actions"

const TIME_RANGES: { label: string; value: UsageFilters["range"] }[] = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
]

export default function LogsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPage = parseInt(searchParams.get("page") ?? "1") || 1
  const initialRange = (searchParams.get("range") ?? "7d") as UsageFilters["range"]

  const [range, setRange] = useState<UsageFilters["range"]>(initialRange)
  const [page, setPage] = useState(initialPage)
  const [logs, setLogs] = useState<LogsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const PAGE_SIZE = 20

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getLogs({ range, page, pageSize: PAGE_SIZE })
      setLogs(result)
    } catch (e: any) {
      setError(e.message ?? "Failed to load logs")
    } finally {
      setLoading(false)
    }
  }, [range, page])

  useEffect(() => { loadLogs() }, [loadLogs])

  const statusColor = (code: number) => {
    if (code >= 200 && code < 300) return "bg-emerald-100 text-emerald-700 border-emerald-200"
    if (code >= 400 && code < 500) return "bg-amber-100 text-amber-700 border-amber-200"
    if (code >= 500) return "bg-red-100 text-red-700 border-red-200"
    return "bg-gray-100 text-gray-700 border-gray-200"
  }

  const methodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "POST": return "bg-blue-100 text-blue-700 border-blue-200"
      case "PUT": return "bg-amber-100 text-amber-700 border-amber-200"
      case "DELETE": return "bg-red-100 text-red-700 border-red-200"
      case "PATCH": return "bg-purple-100 text-purple-700 border-purple-200"
      default: return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString("en-US", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    })
  }

  const handleRangeChange = (r: UsageFilters["range"]) => {
    setRange(r)
    setPage(1)
  }

  const totalPages = Math.ceil((logs?.total ?? 0) / PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Request Logs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {logs ? `${logs.total} requests` : "Loading..."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {TIME_RANGES.map(({ label, value }) => (
            <Button
              key={value}
              variant={range === value ? "default" : "outline"}
              size="sm"
              onClick={() => handleRangeChange(value)}
              className="text-xs h-8"
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by request ID or path..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-4" />
              <p className="text-sm text-muted-foreground">Loading logs...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mb-3" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : !logs?.data?.length ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No requests found</p>
              <p className="text-xs text-muted-foreground mt-1">Send a request via the Playground to see logs here</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Latency</TableHead>
                    <TableHead>API</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead className="text-right">Request ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.data.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer hover:bg-violet-50/50 transition-colors"
                      onClick={() => router.push(`/dashboard/logs/${log.id}`)}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(log.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs px-1.5 py-0 font-mono border ${methodColor(log.method)}`}>
                          {log.method}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate">
                        {log.path}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs px-1.5 py-0 font-mono border ${statusColor(log.status_code)}`}>
                          {log.status_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.latency_ms}ms
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.api_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {log.key_prefix ? `${log.key_prefix}…${log.key_name ?? ""}` : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono text-xs text-muted-foreground">
                          {log.request_id.slice(0, 12)}…
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, logs.total)} of {logs.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0) }}
                    className="h-8 text-xs"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Prev
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {page} / {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0) }}
                    className="h-8 text-xs"
                  >
                    Next
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
