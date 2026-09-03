import { createClient } from "@/lib/auth/client"
import { revalidatePath } from "next/cache"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function listPlaygroundApis() {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("list_apis", {
    p_category: null,
    p_enabled: true,
    p_search: null,
  })

  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as any[], error: null }
}
