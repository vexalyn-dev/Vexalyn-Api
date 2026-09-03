import { createClient } from "@/lib/auth/client"

export interface AuthError {
  message: string
  code?: string
}

export async function register(
  email: string,
  password: string,
  fullName: string
): Promise<{ success: boolean; error?: AuthError }> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return {
      success: false,
      error: {
        message: mapAuthError(error.message),
        code: error.status?.toString(),
      },
    }
  }

  return { success: true }
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: AuthError }> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      error: {
        message: mapAuthError(error.message),
        code: error.status?.toString(),
      },
    }
  }

  return { success: true }
}

export async function logout(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

export async function resetPassword(email: string): Promise<{ success: boolean; error?: AuthError }> {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
  })

  if (error) {
    // Don't reveal whether the email exists
    return { success: true }
  }

  return { success: true }
}

function mapAuthError(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes("invalid login credentials")) {
    return "Invalid email or password. Please try again."
  }
  if (msg.includes("email not confirmed")) {
    return "Please verify your email address before logging in. Check your inbox for the confirmation link."
  }
  if (msg.includes("user already registered") || msg.includes("already registered")) {
    return "An account with this email already exists. Try logging in instead."
  }
  if (msg.includes("weak password")) {
    return "Password must be at least 8 characters with uppercase, lowercase, and a number."
  }
  if (msg.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again."
  }
  if (msg.includes("invalid email")) {
    return "Please enter a valid email address."
  }
  return message || "Something went wrong. Please try again."
}
