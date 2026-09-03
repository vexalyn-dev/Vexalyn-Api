"use client"

import * as React from "react"
import { Bell, ChevronDown, Settings, User, LogOut, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationCenter } from "@/components/dashboard/notification-center"
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette"
import { Sidebar } from "./sidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-1">
            <CommandTrigger />
            <NotificationButton />
            <UserMenu />
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

function CommandTrigger() {
  const { open, setOpen } = useCommandPalette()
  return (
    <>
      <button
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm text-muted-foreground hover:bg-accent transition-colors"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="pointer-events-none hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground lg:flex">
          <span>⌘</span>K
        </kbd>
      </button>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  )
}

function NotificationButton() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
          "hover:bg-accent text-muted-foreground hover:text-foreground"
        )}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500" />
      </button>
      {open && <NotificationCenter open={open} onOpenChange={setOpen} />}
    </>
  )
}

function UserMenu() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <button
        className="flex h-9 items-center gap-2 rounded-lg px-2 hover:bg-accent transition-colors"
        onClick={() => setOpen(!open)}
        aria-label="User menu"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
          V
        </div>
        <span className="hidden text-sm font-medium text-foreground sm:inline">User</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="fixed top-14 right-4 z-50 w-48 rounded-xl border border-border bg-card shadow-lg py-1 animate-in fade-in-0 zoom-in-95">
          <div className="px-3 py-2.5 border-b border-border">
            <p className="text-sm font-medium text-foreground">user@vexalyn.dev</p>
            <p className="text-xs text-muted-foreground">Free Plan</p>
          </div>
          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <User className="h-4 w-4" />
            Profile
          </button>
          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </>
  )
}
