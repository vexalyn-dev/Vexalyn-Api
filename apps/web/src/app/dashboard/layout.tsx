import { getSession } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default async function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
