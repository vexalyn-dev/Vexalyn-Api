import { createClient } from "@/lib/auth/client"
import { getUser } from "@/lib/auth/session"

export interface Project {
  id: string
  name: string
  slug: string
}

export async function getProjects(): Promise<{ projects: Project[]; loading: boolean; error: string | null }> {
  const user = await getUser()
  if (!user) return { projects: [], loading: false, error: "UNAUTHORIZED" }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return { projects: [], loading: false, error: error.message }
  return { projects: (data ?? []) as Project[], loading: false, error: null }
}
