"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type CommandItem = {
  label: string
  description?: string
  href: string
  section?: string
}

const commands: CommandItem[] = [
  { label: "Dashboard", href: "/dashboard", section: "Overview" },
  { label: "API Catalog", href: "/dashboard/catalog", section: "API" },
  { label: "API Keys", href: "/dashboard/keys", section: "API" },
  { label: "Projects", href: "/dashboard/projects", section: "Development" },
  { label: "Playground", href: "/dashboard/playground", section: "Development" },
  { label: "Logs", href: "/dashboard/logs", section: "Development" },
  { label: "Usage", href: "/dashboard/usage", section: "Analytics" },
  { label: "Requests", href: "/dashboard/requests", section: "Analytics" },
  { label: "Settings", href: "/dashboard/settings", section: "Account" },
  { label: "Billing", href: "/dashboard/billing", section: "Account" },
  { label: "Documentation", href: "#", section: "External" },
  { label: "Website", href: "/", section: "External" },
]

export function useCommandPalette() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return { open, setOpen }
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [query, setQuery] = React.useState("")
  const pathname = usePathname()

  const filtered = React.useMemo(() => {
    if (!query) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.section?.toLowerCase().includes(q)
    )
  }, [query])

  const grouped = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    for (const item of filtered) {
      const s = item.section ?? "Other"
      if (!groups[s]) groups[s] = []
      groups[s].push(item)
    }
    return groups
  }, [filtered])

  React.useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  if (!open) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -16 }}
        transition={{ type: "spring", damping: 20 }}
        className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No results found.
            </div>
          ) : (
            Object.entries(grouped).map(([section, items]) => (
              <div key={section}>
                <p className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {section}
                </p>
                {items.map((item) => {
                  const isActive = item.href === pathname
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-violet-100 text-violet-700"
                          : "text-foreground hover:bg-accent"
                      )}
                    >
                      <span>{item.label}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </a>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </>
  )
}
