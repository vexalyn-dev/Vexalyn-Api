"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Key,
  Zap,
  AlertCircle,
  Gauge,
  Code2,
  FileText,
  Search,
  Menu,
  X,
} from "lucide-react"
import { Input } from "@/components/ui"

const navSections = [
  {
    title: "Introduction",
    href: "/docs",
    icon: BookOpen,
    children: [
      { href: "/docs", label: "Overview" },
      { href: "/docs/quick-start", label: "Quick Start" },
    ],
  },
  {
    title: "Authentication",
    href: "/docs/authentication",
    icon: Key,
    children: [
      { href: "/docs/authentication", label: "API Keys" },
      { href: "/docs/authentication#how-to-use", label: "How to Use" },
    ],
  },
  {
    title: "API Catalog",
    href: "/docs/catalog",
    icon: Zap,
    children: [
      { href: "/docs/catalog", label: "All APIs" },
      { href: "/docs/donghua", label: "Donghua API" },
      { href: "/docs/anime", label: "Anime API" },
      { href: "/docs/manga", label: "Manga API" },
    ],
  },
  {
    title: "Donghua API",
    href: "/docs/donghua",
    icon: FileText,
    children: [
      { href: "/docs/donghua#home", label: "GET /home" },
      { href: "/docs/donghua#search", label: "GET /search" },
      { href: "/docs/donghua#detail", label: "GET /detail" },
      { href: "/docs/donghua#latest", label: "GET /latest" },
      { href: "/docs/donghua#popular", label: "GET /popular" },
      { href: "/docs/donghua#stream", label: "GET /stream" },
      { href: "/docs/donghua#genres", label: "GET /genres" },
      { href: "/docs/donghua#az-list", label: "GET /az-list" },
      { href: "/docs/donghua#filter", label: "GET /filter" },
      { href: "/docs/donghua#studio", label: "GET /studio" },
      { href: "/docs/donghua#status", label: "GET /status" },
    ],
  },
  {
    title: "Errors",
    href: "/docs/errors",
    icon: AlertCircle,
    children: [
      { href: "/docs/errors", label: "Error Codes" },
      { href: "/docs/errors#http-codes", label: "HTTP Status Codes" },
    ],
  },
  {
    title: "Rate Limits",
    href: "/docs/rate-limits",
    icon: Gauge,
    children: [
      { href: "/docs/rate-limits", label: "Limits Overview" },
      { href: "/docs/rate-limits#tiers", label: "Plan Tiers" },
    ],
  },
  {
    title: "SDKs",
    href: "/docs/sdks",
    icon: Code2,
    children: [
      { href: "/docs/sdks", label: "Official SDKs" },
      { href: "/docs/sdks#community", label: "Community Libraries" },
    ],
  },
]

export function DocsSidebar({
  className,
  mobileOpen,
  onMobileClose,
}: {
  className?: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}) {
  const pathname = usePathname()
  const [search, setSearch] = useState("")
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const filteredSections = navSections.filter((section) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      section.title.toLowerCase().includes(q) ||
      section.children.some((c) => c.label.toLowerCase().includes(q))
    )
  })

  function toggleSection(href: string) {
    setOpenSections((prev) => ({ ...prev, [href]: !prev[href] }))
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={cn("hidden lg:flex lg:flex-col lg:w-64 xl:w-72 border-r border-border bg-card h-screen sticky top-0", className)}>
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">VEXALYN</span>
          </Link>
        </div>

        <div className="px-3 py-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search docs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {filteredSections.map((section) => {
            const isOpen = openSections[section.href] ?? section.children.some((c) => pathname.startsWith(c.href))
            const isActive = pathname === section.href || pathname.startsWith(section.href + "/")
            
            return (
              <div key={section.href}>
                <button
                  onClick={() => toggleSection(section.href)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-violet-100 text-violet-700"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <section.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{section.title}</span>
                </button>
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                    {section.children.map((child) => {
                      const childActive = pathname === child.href || pathname.startsWith(child.href + "/")
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setSearch("")}
                          className={cn(
                            "block rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                            childActive
                              ? "text-violet-700 font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <a
            href="/api"
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Zap className="h-4 w-4" />
            API Playground
          </a>
        </div>
      </aside>

      {/* Mobile header */}
      {mobileOpen !== undefined && (
        <>
          <button
            className="fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background md:hidden"
            onClick={() => onMobileClose?.()}
            aria-label="Close menu"
          >
            <X className="h-4 w-4 text-foreground" />
          </button>
          <aside
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-72 bg-card border-r border-border transform transition-transform duration-200 lg:hidden",
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <div className="flex h-14 items-center border-b border-border px-4">
              <Link href="/" className="flex items-center gap-2" onClick={onMobileClose}>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold text-foreground">VEXALYN Docs</span>
              </Link>
            </div>
            <div className="px-3 py-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
            <nav className="overflow-y-auto px-3 pb-4 space-y-1">
              {filteredSections.map((section) => {
                const isOpen = openSections[section.href] ?? false
                return (
                  <div key={section.href}>
                    <button
                      onClick={() => toggleSection(section.href)}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <section.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{section.title}</span>
                    </button>
                    {isOpen && (
                      <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-3">
                        {section.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onMobileClose}
                            className="block rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </aside>
          {mobileOpen && (
            <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onMobileClose} />
          )}
        </>
      )}
    </>
  )
}
