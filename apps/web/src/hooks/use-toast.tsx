"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

type ToastItem = {
  id: string
  title?: string
  description?: string
  action?: React.ReactElement
  variant?: "default" | "destructive" | "success" | "violet"
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ToastOptions = {
  id?: string
  title?: string
  description?: string
  action?: React.ReactElement
  variant?: "default" | "destructive" | "success" | "violet"
  duration?: number
}

const TOAST_REMOVE_DELAY = 1000000

type ContextType = {
  toasts: ToastItem[]
  toast: (opts: ToastOptions) => void
  dismiss: (id?: string) => void
}

const ToastContext = React.createContext<ContextType | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    return {
      toasts: [],
      toast: () => {},
      dismiss: () => {},
    }
  }
  return context
}

export function ToastProviderComponent({
  children,
}: {
  children: React.ReactNode
}) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const toast = React.useCallback((opts: ToastOptions) => {
    const id = opts.id ?? genId()
    const dismiss = () => setToasts((prev) => prev.filter((t) => t.id !== id))
    setToasts((prev) => [...prev, { id, ...opts }])
    const duration = opts.duration ?? TOAST_REMOVE_DELAY
    if (duration > 0 && duration !== TOAST_REMOVE_DELAY) {
      setTimeout(dismiss, duration)
    }
  }, [])

  const dismiss = React.useCallback((id?: string) => {
    setToasts((prev) => (id ? prev.filter((t) => t.id !== id) : []))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastProvider>
        {toasts.map((toastItem) => (
          <Toast key={toastItem.id} variant={toastItem.variant} className="animate-slide-up">
            <div className="grid gap-1">
              {toastItem.title && <ToastTitle>{toastItem.title}</ToastTitle>}
              {toastItem.description && (
                <ToastDescription>{toastItem.description}</ToastDescription>
              )}
            </div>
            {toastItem.action}
            <ToastClose onClick={() => dismiss(toastItem.id)} />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  )
}
