import { AuthLayout } from "@/components/layout/auth-layout"
import { LoginForm } from "@/components/auth/login-form"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}

function LoginFormSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-sm animate-pulse">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-12 w-12 rounded-xl bg-muted" />
        <div className="h-7 w-40 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>
      <div className="mt-8 space-y-4">
        <div className="h-10 rounded-xl bg-muted" />
        <div className="h-10 rounded-xl bg-muted" />
        <div className="h-10 rounded-xl bg-muted" />
        <div className="h-12 rounded-xl bg-muted" />
      </div>
    </div>
  )
}
