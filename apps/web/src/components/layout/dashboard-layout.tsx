import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <main className={cn("px-4 py-8 sm:px-6 lg:px-8")}>
          {children}
        </main>
      </div>
    </div>
  )
}
