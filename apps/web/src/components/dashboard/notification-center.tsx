"use client"

import * as React from "react"
import { Bell, Check, Mail, AlertCircle, Settings as SettingsIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
  id: string
  type: "info" | "warning" | "error"
  title: string
  message: string
  time: string
  read: boolean
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "info",
    title: "Welcome to VEXALYN",
    message: "Your account has been created. Start by generating your first API key.",
    time: "Just now",
    read: false,
  },
  {
    id: "2",
    type: "warning",
    title: "Rate limit approaching",
    message: "You have used 80% of your monthly request quota.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "info",
    title: "New feature available",
    message: "API analytics dashboard is now live. Check it out in Analytics.",
    time: "1 day ago",
    read: true,
  },
]

export function NotificationCenter({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, onOpenChange])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
          />
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-14 right-4 z-50 w-80 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-semibold text-foreground">Notifications</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-600 px-1.5 text-[10px] font-bold text-white">
                  2
                </span>
              </div>
              <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Mark all read
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.map((note) => (
                <NotificationItem key={note.id} {...note} />
              ))}
            </div>

            <div className="border-t border-border px-4 py-3">
              <button className="flex w-full items-center justify-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
                <Mail className="h-4 w-4" />
                View all notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function NotificationItem({
  type,
  title,
  message,
  time,
  read,
}: Notification) {
  const iconMap = {
    info: <Bell className="h-4 w-4 text-violet-500" />,
    warning: <AlertCircle className="h-4 w-4 text-amber-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
  }

  return (
    <button
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left border-b border-border/50 hover:bg-accent transition-colors",
        !read && "bg-violet-50/50"
      )}
    >
      <div className="mt-0.5 shrink-0">{iconMap[type]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm font-medium", !read ? "text-foreground" : "text-muted-foreground")}>
            {title}
          </p>
          {!read && <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{message}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{time}</p>
      </div>
    </button>
  )
}
