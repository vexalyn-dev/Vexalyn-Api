"use server"

import { createClient } from "@/lib/auth/client"
import { projectSchema, type ProjectInput } from "./schemas"
import { revalidatePath } from "next/cache"
import { getUser } from "@/lib/auth/session"
import { redirect } from "next/navigation"

export async function createProject(input: ProjectInput) {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")

  const supabase = createClient()

  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      description: input.description ?? null,
      slug,
      owner_id: user.id,
      status: input.environment,
    })
    .select()
    .single()

  if (error) {
    if (error.code === "23505") {
      return { error: "A project with this name already exists." }
    }
    return { error: error.message }
  }

  revalidatePath("/dashboard/projects")
  redirect(`/dashboard/projects/${data.id}`)
}

export async function getProjects() {
  const user = await getUser()
  if (!user) return { error: "UNAUTHORIZED" }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, slug, status, created_at, updated_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function getProject(id: string) {
  const user = await getUser()
  if (!user) return { error: "UNAUTHORIZED" }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("projects")
    .select("id, name, description, slug, status, created_at, updated_at")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single()

  if (error) return { error: error.message }
  if (!data) return { error: "NOT_FOUND" }
  return { data }
}

export async function updateProject(id: string, input: ProjectInput) {
  const user = await getUser()
  if (!user) return { error: "UNAUTHORIZED" }

  const supabase = createClient()
  const { data: existing, error: fetchError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single()

  if (fetchError || !existing) return { error: "NOT_FOUND" }

  const { error } = await supabase
    .from("projects")
    .update({
      name: input.name,
      description: input.description ?? null,
      status: input.environment,
    })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/projects/${id}`)
  return { success: true }
}

export async function deleteProject(id: string) {
  const user = await getUser()
  if (!user) return { error: "UNAUTHORIZED" }

  const supabase = createClient()
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id)

  if (error) return { error: error.message }
  revalidatePath("/dashboard/projects")
  redirect("/dashboard/projects")
}
