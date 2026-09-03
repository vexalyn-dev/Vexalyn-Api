"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { Send, Copy, Check, Loader2, Zap, AlertCircle, ChevronRight, Code2, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sendPlaygroundRequest, getPlaygroundApis, getPlaygroundEndpoints } from "@/lib/playground/actions"
import type { PlaygroundResponse, ApiOption } from "@/lib/playground/actions"
import { Navbar } from "@/components/layout/navbar"

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700 border-emerald-200",
  POST: "bg-blue-100 text-blue-700 border-blue-200",
  PUT: "bg-amber-100 text-amber-700 border-amber-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  PATCH: "bg-purple-100 text-purple-700 border-purple-200",
}

export default function PlaygroundPage() {
  const [apis, setApis] = useState<ApiOption[]>([])
  const [apisLoading, setApisLoading] = useState(true)
  const [selectedApi, setSelectedApi] = useState<string>("")
  const [endpoints, setEndpoints] = useState<{ path: string; method: string; description: string; is_public: boolean }[]>([])
  const [endpointsLoading, setEndpointsLoading] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("")
  const [apiKey, setApiKey] = useState("")
  const [queryParams, setQueryParams] = useState("")
  const [body, setBody] = useState("")
  const [response, setResponse] = useState<PlaygroundResponse | null>(null)
  const [sending, setSending] = useState(false)
  const [showRequest, setShowRequest] = useState(false)
  const [copied, setCopied] = useState(false)
  const [apiSearch, setApiSearch] = useState("")

  useEffect(() => {
    getPlaygroundApis().then(({ apis: apiList, error }) => {
      setApis(apiList)
      setApisLoading(false)
      if (error && apiList.length === 0) console.error(error)
    })
  }, [])

  useEffect(() => {
    if (!selectedApi) {
      setEndpoints([])
      setSelectedEndpoint("")
      return
    }
    setEndpointsLoading(true)
    setEndpoints([])
    setSelectedEndpoint("")
    getPlaygroundEndpoints(selectedApi).then(({ endpoints: epList, error }) => {
      setEndpoints(epList)
      setEndpointsLoading(false)
    })
  }, [selectedApi])

  const handleSend = useCallback(async () => {
    if (!selectedEndpoint) return
    const method = endpoints.find((e) => e.path === selectedEndpoint)?.method ?? "GET"
    const qp: Record<string, string> = {}
    if (queryParams.trim()) {
      try {
        const parsed = JSON.parse(queryParams)
        Object.assign(qp, parsed)
      } catch {
        const pairs = queryParams.split("&")
        for (const pair of pairs) {
          const [k, ...v] = pair.split("=")
          if (k) qp[k] = v.join("=")
        }
      }
    }
    setSending(true)
    setResponse(null)
    setShowRequest(false)
    try {
      const result = await sendPlaygroundRequest({
        apiId: selectedApi,
        endpointPath: selectedEndpoint,
        method: method as any,
        apiKey,
        queryParams: qp,
        pathParams: {},
        body: body.trim(),
      })
      setResponse(result)
      setShowRequest(true)
    } finally {
      setSending(false)
    }
  }, [selectedApi, selectedEndpoint, endpoints, apiKey, queryParams, body])

  const handleCopy = useCallback(() => {
    if (!response) return
    navigator.clipboard.writeText(JSON.stringify(response.data ?? response.error, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [response])

  const filteredApis = apis.filter(
    (a) =>
      a.name.toLowerCase().includes(apiSearch.toLowerCase()) ||
      a.slug.toLowerCase().includes(apiSearch.toLowerCase())
  )

  const formatJson = (data: unknown) => {
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  const selectedApiData = apis.find((a) => a.id === selectedApi)
  const selectedEndpointData = endpoints.find((e) => e.path === selectedEndpoint)
  const currentMethod = selectedEndpointData?.method ?? "GET"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
              <Zap className="h-5 w-5 text-violet-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">API Playground</h1>
          </div>
          <p className="text-muted-foreground ml-13">
            Test the Vexalyn API in real-time. Send requests and see responses instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Panel */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-violet-600" />
                Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Selection */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">API</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Select value={selectedApi} onValueChange={(v) => { setSelectedApi(v); setEndpoints([]); setSelectedEndpoint(""); setResponse(null); }}>
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select an API..." />
                    </SelectTrigger>
                    <SelectContent>
                      {apisLoading ? (
                        <SelectItem value="_loading" disabled>
                          <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" />Loading...</span>
                        </SelectItem>
                      ) : (
                        filteredApis.map((api) => (
                          <SelectItem key={api.id} value={api.id}>
                            <div className="flex items-center gap-2">
                              <Code2 className="h-3.5 w-3.5 text-violet-500" />
                              {api.name}
                              <span className="text-xs text-muted-foreground">({api.slug})</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Endpoint + Method */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Endpoint</label>
                <div className="flex gap-2">
                  <Select value={selectedEndpoint} onValueChange={(v) => { setSelectedEndpoint(v); setResponse(null); }}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select endpoint..." />
                    </SelectTrigger>
                    <SelectContent>
                      {endpointsLoading ? (
                        <SelectItem value="_loading" disabled>
                          <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" />Loading...</span>
                        </SelectItem>
                      ) : endpoints.length === 0 ? (
                        <SelectItem value="_empty" disabled>
                          No public endpoints found
                        </SelectItem>
                      ) : (
                        endpoints.map((ep) => (
                          <SelectItem key={`${ep.method}:${ep.path}`} value={ep.path}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={cn("text-xs px-1.5 py-0 h-5 font-mono", METHOD_COLORS[ep.method] ?? "bg-gray-100 text-gray-700")}>
                                {ep.method}
                              </Badge>
                              <span className="font-mono text-sm">{ep.path}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  API Key
                  <span className="font-normal text-muted-foreground ml-1">— required for authenticated endpoints</span>
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="vx_live_••••••••••"
                  className="font-mono text-sm"
                />
              </div>

              {/* Query Parameters */}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Query Parameters
                  <span className="font-normal text-muted-foreground ml-1">— JSON object</span>
                </label>
                <Textarea
                  value={queryParams}
                  onChange={(e) => setQueryParams(e.target.value)}
                  placeholder='{"page": 1, "limit": 10}'
                  rows={3}
                  className="font-mono text-sm resize-none"
                />
              </div>

              {/* Request Body */}
              {currentMethod !== "GET" && currentMethod !== "DELETE" && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Request Body
                    <span className="font-normal text-muted-foreground ml-1">— JSON</span>
                  </label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"title": "example"}'
                    rows={4}
                    className="font-mono text-sm resize-none"
                  />
                </div>
              )}

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!selectedEndpoint || sending}
                className={cn(
                  "w-full h-11 font-semibold transition-all",
                  sending
                    ? "bg-violet-400 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-700"
                )}
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Response Panel */}
          <div className="space-y-4">
            {/* Status Bar */}
            {response && (
              <div className="flex flex-wrap items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm font-mono px-3 py-1",
                    response.status >= 200 && response.status < 300
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : response.status === 0
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-amber-300 bg-amber-50 text-amber-700"
                  )}
                >
                  {response.status === 0 ? "ERR" : `${response.status} ${response.statusText}`}
                </Badge>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  {response.latencyMs}ms
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                  <span>ID:</span>
                  <span className="font-mono">{response.requestId}</span>
                </div>
                {response.error && (
                  <div className="flex items-center gap-1.5 text-sm text-red-600 ml-auto">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {response.error}
                  </div>
                )}
              </div>
            )}

            {/* Response Body */}
            <Card className={cn(
              "transition-all",
              !response && "border-dashed opacity-60"
            )}>
              <CardHeader className="pb-3 flex flex-row items-center">
                <CardTitle className="text-base flex-1 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-violet-600" />
                  Response
                </CardTitle>
                {response && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 text-xs"
                  >
                    {copied ? (
                      <><Check className="h-3 w-3 mr-1" />Copied</>
                    ) : (
                      <><Copy className="h-3 w-3 mr-1" />Copy</>
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {!response ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <Send className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select an API and endpoint, then hit <strong>Send Request</strong>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Responses appear here in real-time
                    </p>
                  </div>
                ) : response.error && !response.data ? (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Request Failed</p>
                      <p className="text-sm text-red-600 mt-1 font-mono">{response.error}</p>
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs font-mono text-foreground bg-muted/50 rounded-lg p-4 overflow-auto max-h-96 whitespace-pre-wrap break-all">
                    {formatJson(response.data)}
                  </pre>
                )}
              </CardContent>
            </Card>

            {/* Request Preview */}
            {showRequest && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-violet-600" />
                    Request Sent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs font-mono text-muted-foreground bg-muted/30 rounded-lg p-3 overflow-x-auto">
                    {`${currentMethod} ${selectedEndpoint}\nAuthorization: Bearer ${apiKey ? apiKey.slice(0, 8) + "••••" : "(not provided)"}`}
                    {queryParams && `\nQuery: ${queryParams}`}
                    {body && `\nBody: ${body.slice(0, 100)}${body.length > 100 ? "..." : ""}`}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-foreground mb-4">Available APIs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {apisLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))
            ) : (
              filteredApis.map((api) => (
                <button
                  key={api.id}
                  onClick={() => { setSelectedApi(api.id); setApiSearch(""); }}
                  className={cn(
                    "text-left p-4 rounded-xl border transition-all hover:shadow-md",
                    selectedApi === api.id
                      ? "border-violet-300 bg-violet-50 shadow-sm"
                      : "border-border bg-card hover:border-violet-200"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Code2 className="h-4 w-4 text-violet-600" />
                    <span className="font-semibold text-sm text-foreground">{api.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{api.description}</p>
                  <Badge variant="outline" className="mt-2 text-xs font-mono">/{api.slug}</Badge>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
