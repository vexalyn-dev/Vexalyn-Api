"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Zap,
  Key,
  Settings,
  FileText,
  BarChart3,
  Terminal,
  ClipboardList,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui"

const sidebarSections = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "API",
    items: [
      { label: "API Catalog", href: "/dashboard/catalog", icon: Zap },
      { label: "API Keys", href: "/dashboard/keys", icon: Key },
    ],
  },
  {
    title: "Development",
    items: [
      { label: "Projects", href: "/dashboard/projects", icon: ClipboardList },
      { label: "Playground", href: "/dashboard/playground", icon: Terminal },
      { label: "Logs", href: "/dashboard/logs", icon: FileText },
    ],
  },
  {
    title: "Analytics",
    items: [
      { label: "Usage", href: "/dashboard/usage", icon: BarChart3 },
      { label: "Requests", href: "/dashboard/requests", icon: Zap },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Billing", href: "/dashboard/billing", icon: Key },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4 text-foreground" />
      </button>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex",
          collapsed && "w-16"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-sm font-bold tracking-tight text-foreground">
                VEXALYN API
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden h-7 w-7 items-center justify-center rounded-md hover:bg-accent text-muted-foreground lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              {!collapsed && (
                <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-violet-100 text-violet-700"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-3 space-y-2">
          {!collapsed && (
            <div className="rounded-xl bg-violet-50 px-3 py-2.5">
              <p className="text-xs font-semibold text-violet-700">Free Plan</p>
              <p className="mt-0.5 text-[11px] text-violet-600">1,000 req/month</p>
            </div>
          )}
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border lg:hidden flex flex-col"
            >
              <div className="flex h-14 items-center justify-between border-b border-border px-4">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">VEXALYN API</span>
                </Link>
                <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                {sidebarSections.map((section) => (
                  <div key={section.title} className="mb-4">
                    <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </p>
                    {section.items.map((item) => {
                      const active = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            active
                              ? "bg-violet-100 text-violet-700"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
