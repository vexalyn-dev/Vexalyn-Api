"use server"

import { createClient } from "@/lib/auth/client"

export async function getSession() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const session = await getSession()
  if (!session) return null
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser(session.access_token)
  if (error || !user) return null
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) throw new Error("UNAUTHORIZED")
  return user
}
