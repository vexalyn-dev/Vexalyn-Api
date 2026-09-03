import { createClient } from "@/lib/auth/client"

export interface RegistryApi {
  id: string
  name: string
  slug: string
  description: string
  version: string
  status: string
  category: string
  icon: string
  enabled: boolean
  endpoint_count: number
  base_url: string | null
  created_at: string
}

export interface RegistryEndpoint {
  id: string
  slug: string
  name: string
  path: string
  method: string
  description: string
  authentication_required: boolean
  permissions: string[]
  request_schema: any
  response_schema: any
  example_request: string | null
  example_response: string | null
}

export interface RegistryProvider {
  id: string
  name: string
  slug: string
  base_url: string
  status: string
}

export interface RegistryApiDetail extends RegistryApi {
  endpoints: RegistryEndpoint[]
  providers: RegistryProvider[]
}

export async function listApis(params?: {
  category?: string
  search?: string
  enabled?: boolean
}): Promise<{ data: RegistryApi[]; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("list_apis", {
    p_category: params?.category ?? null,
    p_enabled: params?.enabled ?? true,
    p_search: params?.search ?? null,
  })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as RegistryApi[], error: null }
}

export async function getApi(slug: string): Promise<{ data: RegistryApiDetail | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_api_with_endpoints", { p_slug: slug })

  if (error) return { data: null, error: error.message }
  if (!data || data.length === 0) return { data: null, error: "NOT_FOUND" }

  const row = data[0]
  return {
    data: {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      version: row.version,
      status: row.status,
      category: row.category,
      icon: row.icon,
      enabled: row.enabled,
      endpoint_count: row.endpoint_count,
      base_url: row.base_url,
      created_at: row.created_at,
      endpoints: (row.endpoints ?? []) as RegistryEndpoint[],
      providers: (row.providers ?? []) as RegistryProvider[],
    },
    error: null,
  }
}

export async function getCategories(): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("apis")
    .select("category")
    .eq("enabled", true)
    .not("category", "is", null)

  if (error) return []
  const unique = new Set(data.map((r) => r.category))
  return Array.from(unique)
}
