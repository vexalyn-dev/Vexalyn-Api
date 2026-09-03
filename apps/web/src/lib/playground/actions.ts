"use server"

import { revalidatePath } from "next/cache"

const GATEWAY_URL = process.env.VEXALYN_GATEWAY_URL ?? "http://localhost:8000"
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface PlaygroundRequest {
  apiId: string
  endpointPath: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  apiKey: string
  queryParams: Record<string, string>
  pathParams: Record<string, string>
  body: string
}

export interface PlaygroundResponse {
  status: number
  statusText: string
  latencyMs: number
  requestId: string
  data: unknown
  error: string | null
}

export async function sendPlaygroundRequest(input: PlaygroundRequest): Promise<PlaygroundResponse> {
  const requestId = `pg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const start = Date.now()

  if (!input.apiKey || input.apiKey.trim() === "") {
    return {
      status: 401,
      statusText: "Unauthorized",
      latencyMs: 0,
      requestId,
      data: null,
      error: "API key is required. Get one from Dashboard > API Keys.",
    }
  }

  let url = `${GATEWAY_URL}${input.endpointPath}`

  const queryParams = new URLSearchParams()
  for (const [key, value] of Object.entries(input.queryParams)) {
    if (value) queryParams.append(key, value)
  }
  if (queryParams.toString()) url += `?${queryParams.toString()}`

  try {
    const fetchOptions: RequestInit = {
      method: input.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.apiKey}`,
        "X-Request-Id": requestId,
      },
    }

    if (input.method !== "GET" && input.body.trim()) {
      fetchOptions.body = input.body
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    })
    clearTimeout(timeout)

    const latencyMs = Date.now() - start
    const contentType = response.headers.get("content-type") ?? ""
    const text = await response.text()

    let data: unknown
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = text || null
    }

    return {
      status: response.status,
      statusText: response.statusText,
      latencyMs,
      requestId,
      data,
      error: response.ok ? null : `HTTP ${response.status} ${response.statusText}`,
    }
  } catch (e: any) {
    const latencyMs = Date.now() - start
    return {
      status: 0,
      statusText: "Connection Error",
      latencyMs,
      requestId,
      data: null,
      error: e?.name === "AbortError" ? "Request timed out after 15s" : e?.message ?? "Unknown error",
    }
  }
}

export interface ApiOption {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  endpoints: { path: string; method: string; description: string }[]
}

export async function getPlaygroundApis(): Promise<{ apis: ApiOption[]; error: string | null }> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/apis?select=id,name,slug,description,icon&enabled=true&status=eq.production`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: "no-store",
      }
    )

    if (!res.ok) return { apis: [], error: "Failed to fetch APIs" }

    const apis = await res.json() as Array<{ id: string; name: string; slug: string; description: string; icon: string }>

    const apiMap = new Map<string, ApiOption>()
    for (const api of apis) {
      apiMap.set(api.slug, {
        id: api.id,
        name: api.name,
        slug: api.slug,
        description: api.description,
        icon: api.icon,
        endpoints: [],
      })
    }

    return { apis: Array.from(apiMap.values()), error: null }
  } catch {
    return { apis: [], error: "Failed to fetch APIs" }
  }
}

export async function getPlaygroundEndpoints(apiSlug: string): Promise<{
  endpoints: { path: string; method: string; description: string; is_public: boolean }[]
  error: string | null
}> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/api_endpoints?api_id=eq.${encodeURIComponent(apiSlug)}&is_public=true&select=path,method,description,is_public`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        cache: "no-store",
      }
    )

    if (!res.ok) return { endpoints: [], error: "Failed to fetch endpoints" }
    const data = await res.json() as Array<{ path: string; method: string; description: string; is_public: boolean }>
    return { endpoints: data, error: null }
  } catch {
    return { endpoints: [], error: "Failed to fetch endpoints" }
  }
}
