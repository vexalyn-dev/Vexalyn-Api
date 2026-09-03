"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Zap } from "lucide-react"
import { Button, Input, Badge } from "@/components/ui"
import { register } from "@/lib/auth/actions"
import { registerSchema, type RegisterInput } from "@/lib/auth/schemas"

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const raw: RegisterInput = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    }

    const result = registerSchema.safeParse(raw)
    if (!result.success) {
      const firstError = result.error.errors[0]
      setError(firstError?.message ?? "Invalid input")
      setLoading(false)
      return
    }

    const res = await register(result.data.email, result.data.password, result.data.name)
    setLoading(false)

    if (!res.success) {
      setError(res.error?.message ?? "Registration failed")
      return
    }

    setSuccess(true)
    router.push("/login?registered=1")
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Start building with VEXALYN API today
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
            Account created! Check your email for verification, then sign in.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="name">
            Full Name
          </label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required />
        </div>

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
            placeholder="Min 8 chars, uppercase, number"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Repeat your password"
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-violet-600 hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
