"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Zap,
  Key,
  BarChart3,
  Settings,
  FileText,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "API Catalog",
    href: "/dashboard/catalog",
    icon: Zap,
  },
  {
    title: "API Keys",
    href: "/dashboard/keys",
    icon: Key,
  },
  {
    title: "Usage",
    href: "/dashboard/usage",
    icon: BarChart3,
  },
  {
    title: "Documentation",
    href: "/docs",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <button
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-border bg-card transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">VEXALYN</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarNavItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-violet-100 text-violet-700"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-xl bg-violet-50 p-4">
            <p className="text-xs font-semibold text-violet-700">Free Plan</p>
            <p className="mt-1 text-xs text-violet-600">1,000 requests / month</p>
            <Button variant="violet" size="sm" className="mt-3 w-full text-xs">
              Upgrade
            </Button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
