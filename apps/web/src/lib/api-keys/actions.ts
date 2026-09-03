"use server"

import { createClient } from "@/lib/auth/client"
import { getUser } from "@/lib/auth/session"
import { generateApiKey, maskKey } from "./keys"
import { createKeySchema, type CreateKeyInput } from "./schemas"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export interface CreatedKey {
  id: string
  rawKey: string
  maskedKey: string
  name: string
  environment: "development" | "production"
  project_id: string
  permissions: string[]
  created_at: string
}

export async function createApiKey(input: CreateKeyInput): Promise<{ success: true; key: CreatedKey } | { success: false; error: string }> {
  const user = await getUser()
  if (!user) return { success: false, error: "UNAUTHORIZED" }

  const validation = createKeySchema.safeParse(input)
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message ?? "Invalid input" }
  }

  const supabase = createClient()

  // Verify project ownership
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", input.project_id)
    .eq("owner_id", user.id)
    .single()

  if (projectError || !project) {
    return { success: false, error: "Project not found or access denied" }
  }

  // Generate key
  const rawKey = generateApiKey(input.environment)
  // Hash the key for storage — never store plaintext
  const { data: hashed, error: hashError } = await supabase.rpc("generate_api_key", {
    p_prefix: input.environment === "production" ? "vx_live" : "vx_test",
    p_raw_key: rawKey,
  })

  if (hashError || !hashed || hashed.length === 0) {
    return { success: false, error: hashError?.message ?? "Failed to generate key hash" }
  }

  const keyHash = hashed[0].key_hash

  // Insert the key
  const { data: key, error: insertError } = await supabase
    .from("api_keys")
    .insert({
      project_id: input.project_id,
      name: input.name,
      prefix: input.environment === "production" ? "vx_live" : "vx_test",
      key_hash: keyHash,
      environment: input.environment,
      status: "active",
      permissions: input.permissions,
    })
    .select("id, name, environment, prefix, status, created_at, permissions")
    .single()

  if (insertError) {
    return { success: false, error: insertError.message }
  }

  revalidatePath("/dashboard/api-keys")

  return {
    success: true,
    key: {
      id: key.id,
      rawKey,
      maskedKey: maskKey(rawKey),
      name: key.name,
      environment: key.environment,
      project_id: input.project_id,
      permissions: input.permissions,
      created_at: key.created_at,
    },
  }
}

export async function getApiKeys() {
  const user = await getUser()
  if (!user) return { error: "UNAUTHORIZED" }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("api_keys")
    .select(`
      id,
      name,
      prefix,
      environment,
      status,
      last_used_at,
      created_at,
      permissions,
      projects (name, slug)
    `)
    .eq("project_id", (
      await supabase
        .from("projects")
        .select("id")
        .eq("owner_id", user.id)
    ).data?.[0]?.id ?? "")
    .order("created_at", { ascending: false })

  if (error) return { error: error.message }
  return { data }
}

export async function getApiKey(id: string) {
  const user = await getUser()
  if (!user) return { error: "UNAUTHORIZED" }

  const supabase = createClient()
  const { data, error } = await supabase
    .from("api_keys")
    .select(`
      id, name, prefix, environment, status, last_used_at,
      created_at, permissions, project_id, projects (id, name, slug)
    `)
    .eq("id", id)
    .single()

  if (error) return { error: error.message }

  // Verify ownership via project
  const { error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", data.project_id)
    .eq("owner_id", user.id)
    .single()

  if (projectError) return { error: "FORBIDDEN" }
  return { data }
}

export async function revokeApiKey(id: string) {
  const user = await getUser()
  if (!user) return { error: "UNAUTHORIZED" }

  const supabase = createClient()
  const { error } = await supabase
    .from("api_keys")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", id)
    .eq("project_id", (
      await supabase.from("projects").select("id").eq("owner_id", user.id)
    ).data?.[0]?.id ?? "")

  if (error) return { error: error.message }
  revalidatePath("/dashboard/api-keys")
  return { success: true }
}

export async function deleteApiKey(id: string) {
  const user = await getUser()
  if (!user) return { error: "UNAUTHORIZED" }

  const supabase = createClient()
  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", id)
    .eq("project_id", (
      await supabase.from("projects").select("id").eq("owner_id", user.id)
    ).data?.[0]?.id ?? "")

  if (error) return { error: error.message }
  revalidatePath("/dashboard/api-keys")
  return { success: true }
}

export async function regenerateApiKey(id: string) {
  const user = await getUser()
  if (!user) return { error: "UNAUTHORIZED" }

  const supabase = createClient()

  // Get existing key to preserve metadata
  const { data: existing } = await supabase
    .from("api_keys")
    .select("prefix, environment, name, permissions")
    .eq("id", id)
    .single()

  if (!existing) return { error: "NOT_FOUND" }

  // Verify ownership
  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_id", user.id)

  const projectId = ownedProjects?.[0]?.id
  if (!projectId) return { error: "FORBIDDEN" }

  // Generate new key
  const rawKey = generateApiKey(existing.environment)
  const { data: hashed, error: hashError } = await supabase.rpc("generate_api_key", {
    p_prefix: existing.prefix,
    p_raw_key: rawKey,
  })

  if (hashError || !hashed || hashed.length === 0) {
    return { error: hashError?.message ?? "Failed to generate key hash" }
  }

  const { error: updateError } = await supabase
    .from("api_keys")
    .update({
      key_hash: hashed[0].key_hash,
      prefix: existing.prefix,
      revoked_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (updateError) return { error: updateError.message }

  // Insert new key
  const { data: newKey, error: insertError } = await supabase
    .from("api_keys")
    .insert({
      project_id: projectId,
      name: existing.name,
      prefix: existing.prefix,
      key_hash: hashed[0].key_hash,
      environment: existing.environment,
      status: "active",
      permissions: existing.permissions,
    })
    .select("id, name, prefix, environment, status, created_at, permissions")
    .single()

  if (insertError) return { error: insertError.message }

  revalidatePath("/dashboard/api-keys")

  return {
    success: true,
    key: {
      id: newKey.id,
      rawKey,
      maskedKey: maskKey(rawKey),
      name: newKey.name,
      environment: existing.environment as "development" | "production",
      project_id: projectId,
      permissions: existing.permissions,
      created_at: newKey.created_at,
    },
  }
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
