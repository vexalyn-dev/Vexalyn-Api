"use client"

import { useState } from "react"
import Link from "next/link"
import { Zap } from "lucide-react"
import { Button, Input } from "@/components/ui"
import { resetPassword } from "@/lib/auth/actions"
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/auth/schemas"

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const raw: ForgotPasswordInput = {
      email: formData.get("email") as string,
    }

    const result = forgotPasswordSchema.safeParse(raw)
    if (!result.success) {
      setError(result.error.errors[0]?.message ?? "Invalid email")
      setLoading(false)
      return
    }

    const res = await resetPassword(result.data.email)
    setLoading(false)

    if (!res.success) {
      setError(res.error?.message ?? "Failed to send reset email")
      return
    }

    setSuccess(true)
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">
            If an account exists with that email, you&apos;ll receive a reset link shortly.
          </p>
          <p className="mt-2 text-sm text-emerald-600">
            <Link href="/login" className="font-medium hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      )}

      {!success && (
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

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-violet-600 hover:underline">
          Remember your password? Sign in
        </Link>
      </div>
    </div>
  )
}
