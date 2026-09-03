"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Key,
  Copy,
  Check,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import { type CreatedKey } from "@/lib/api-keys/actions"

interface KeySuccessModalProps {
  open: boolean
  keyData: CreatedKey | null
  onDone: () => void
}

export function KeySuccessModal({ open, keyData, onDone }: KeySuccessModalProps) {
  const [copied, setCopied] = React.useState(false)
  const [showKey, setShowKey] = React.useState(false)

  React.useEffect(() => {
    if (open) setShowKey(false)
  }, [open])

  async function handleCopy() {
    if (!keyData) return
    await navigator.clipboard.writeText(keyData.rawKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!keyData) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onDone()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-4 w-4 text-emerald-600" />
            </div>
            API Key Created
          </DialogTitle>
          <DialogDescription>
            Your new API key has been generated successfully.
          </DialogDescription>
        </DialogHeader>

        {/* Warning */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Save this key securely</p>
            <p className="mt-1 text-sm text-amber-700">
              You won&apos;t be able to see this key again. Copy it now and store
              it in a secure location.
            </p>
          </div>
        </div>

        {/* Key display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Your API Key
            </p>
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary p-3">
            <CodeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <code className="flex-1 text-sm font-mono text-foreground truncate">
              {showKey ? keyData.rawKey : keyData.maskedKey}
            </code>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-8 w-8 p-0"
              onClick={handleCopy}
              aria-label="Copy key"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Key info */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {keyData.environment}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {keyData.permissions.length} permissions
          </Badge>
          <Badge variant="outline" className="text-xs font-mono">
            {keyData.name}
          </Badge>
        </div>

        <DialogFooter>
          <Button onClick={onDone} className="w-full">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
