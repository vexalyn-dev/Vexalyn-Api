"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertCircle,
  Check,
  ChevronRight,
  Loader2,
  Trash2,
  X,
} from "lucide-react"
import { Button } from "@/components/ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  variant?: "destructive" | "default"
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "default",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const [submitting, setSubmitting] = React.useState(false)

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {variant === "destructive" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
            )}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading || submitting}
          >
            Cancel
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={loading || submitting}
          >
            {(loading || submitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
