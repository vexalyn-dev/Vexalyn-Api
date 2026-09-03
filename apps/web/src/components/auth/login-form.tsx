"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Zap } from "lucide-react"
import { Button, Input } from "@/components/ui"
import { login } from "@/lib/auth/actions"
import { loginSchema, type LoginInput } from "@/lib/auth/schemas"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const callback = searchParams.get("callback")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const raw: LoginInput = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const result = loginSchema.safeParse(raw)
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Invalid input")
      setLoading(false)
      return
    }

    const res = await login(result.data.email, result.data.password)
    setLoading(false)

    if (!res.success) {
      setError(res.error?.message ?? "Login failed")
      return
    }

    router.push(callback ?? "/dashboard")
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your VEXALYN account
        </p>
      </div>

      {registered && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">
            Account created! Please verify your email, then sign in.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input name="remember" type="checkbox" className="rounded border-gray-300" />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-violet-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-violet-600 hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
