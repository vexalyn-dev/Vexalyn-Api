"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Shield,
  Globe,
  Terminal,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLogDetail, type LogEntry } from "@/lib/dashboard/actions"

export default function LogDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [log, setLog] = useState<LogEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getLogDetail(params.id).then((data) => {
      if (!data) notFound()
      setLog(data)
      setLoading(false)
    }).catch(() => notFound())
  }, [params.id])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading request details...</p>
        </div>
      </div>
    )
  }

  if (!log) return null

  const statusColor = log.status_code >= 200 && log.status_code < 300
    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
    : log.status_code >= 400
    ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-red-100 text-red-700 border-red-200"

  const methodColor = log.method === "GET" ? "bg-emerald-100 text-emerald-700"
    : log.method === "POST" ? "bg-blue-100 text-blue-700"
    : log.method === "DELETE" ? "bg-red-100 text-red-700"
    : "bg-amber-100 text-amber-700"

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleString("en-US", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      timeZoneName: "short",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Request Detail</h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">{log.request_id}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Request Info */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Terminal className="h-4 w-4 text-violet-600" />
              Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className={`font-mono px-2 py-0.5 ${methodColor}`}>
                {log.method}
              </Badge>
              <code className="text-sm font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                {log.path}
              </code>
              <Badge className={`font-mono px-2 py-0.5 border ${statusColor}`}>
                {log.status_code}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <InfoRow label="API" value={log.api_name ?? "—"} />
              <InfoRow label="Endpoint" value={log.endpoint_path ?? log.path ?? "—"} />
              <InfoRow label="Key" value={log.key_prefix ? `${log.key_prefix}•••• •••• ${log.key_name ?? ""}` : "—"} />
              <InfoRow label="Time" value={formatDate(log.created_at)} />
              <InfoRow label="Latency" value={`${log.latency_ms}ms`} icon={<Clock className="h-3 w-3" />} />
              <InfoRow label="Request ID" value={log.request_id} copyable />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={`text-xs ${statusColor}`}>{log.status_code}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <span className="text-sm font-mono font-semibold text-foreground">{log.latency_ms}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API</span>
                  <span className="text-sm font-medium text-foreground">{log.api_name ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Method</span>
                  <Badge className={`text-xs font-mono ${methodColor}`}>{log.method}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-violet-600" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">IP Hash</span>
                  <span className="font-mono text-xs text-muted-foreground">••••••••</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User Agent</span>
                  <span className="text-muted-foreground truncate max-w-[140px]" title="Masked for security">••••••••</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Error</span>
                  <span className={log.status_code >= 400 ? "text-red-600 text-xs" : "text-emerald-600 text-xs"}>
                    {log.status_code >= 400 ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value, icon, copyable }: {
  label: string
  value: string
  icon?: React.ReactNode
  copyable?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground font-mono truncate max-w-[200px]">
          {value}
        </span>
        {copyable && (
          <CopyButton text={value} />
        )}
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-7 w-7 p-0 shrink-0"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
}
