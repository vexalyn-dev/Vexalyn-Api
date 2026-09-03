"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Key,
  Copy,
  Check,
  Loader2,
  Plus,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  RotateCw,
  Trash2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import { revokeApiKey, deleteApiKey, regenerateApiKey, type CreatedKey } from "@/lib/api-keys/actions"
import { CreateKeyModal } from "@/components/api-keys/create-key-modal"
import { KeySuccessModal } from "@/components/api-keys/key-success-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface ApiKey {
  id: string
  name: string
  prefix: string
  environment: string
  status: string
  last_used_at: string | null
  created_at: string
  permissions: string[]
  projects: { name: string; slug: string }
}

export default function ApiKeysPage() {
  const router = useRouter()
  const [keys, setKeys] = React.useState<ApiKey[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [createOpen, setCreateOpen] = React.useState(false)
  const [successKey, setSuccessKey] = React.useState<CreatedKey | null>(null)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [regenResult, setRegenResult] = React.useState<CreatedKey | null>(null)
  const [actionLoading, setActionLoading] = React.useState<string | null>(null)
  const [revokeOpen, setRevokeOpen] = React.useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState<string | null>(null)
  const [regenOpen, setRegenOpen] = React.useState<string | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  React.useEffect(() => {
    loadKeys()
  }, [])

  async function loadKeys() {
    setLoading(true)
    setError(null)
    const { getApiKeys } = await import("@/lib/api-keys/actions")
    const res = await getApiKeys()
    if (res.error) {
      setError(res.error)
      setKeys([])
    } else {
      setKeys((res as any).data ?? [])
    }
    setLoading(false)
  }

  async function handleRevoke(id: string): Promise<void> {
    setActionLoading(id)
    await revokeApiKey(id)
    setActionLoading(null)
    setRevokeOpen(null)
    await loadKeys()
  }

  async function handleDelete(id: string): Promise<void> {
    setActionLoading(id)
    await deleteApiKey(id)
    setActionLoading(null)
    setDeleteOpen(null)
    await loadKeys()
  }

  async function handleRegenerate(id: string): Promise<void> {
    setActionLoading(id)
    const result = await regenerateApiKey(id)
    setActionLoading(null)
    if (result.success && result.key) {
      setRegenResult(result.key)
      setShowSuccess(true)
    }
    setRegenOpen(null)
    await loadKeys()
  }

  function handleCopy(_id: string): void {
    setCopiedId(_id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground">
            Manage your API keys and permissions.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Key
        </Button>
      </div>

      <Card className="border-violet-200 bg-violet-50/50">
        <CardContent className="pt-6 flex items-start gap-3">
          <Shield className="h-5 w-5 text-violet-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-violet-900">Security First</p>
            <p className="mt-1 text-sm text-violet-700">
              API keys are hashed before storage. The raw key is only displayed once at creation.
              Never share your keys publicly or commit them to version control.
            </p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Key className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-48 animate-pulse rounded bg-muted" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
                  <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <AlertTriangle className="mb-3 h-8 w-8 text-red-500" />
          <p className="text-sm font-medium text-foreground">Failed to load API keys</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4" onClick={loadKeys}>
            Try Again
          </Button>
        </div>
      ) : keys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 mb-4">
            <Key className="h-6 w-6 text-violet-600" />
          </div>
          <p className="text-base font-semibold text-foreground">No API keys yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first API key to start integrating with the VEXALYN API.
          </p>
          <Button className="mt-6" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <ApiKeyRow
              key={key.id}
              keyData={key}
              onRevoke={() => setRevokeOpen(key.id)}
              onDelete={() => setDeleteOpen(key.id)}
              onRegenerate={() => setRegenOpen(key.id)}
              actionLoading={actionLoading}
              copiedId={copiedId}
              onCopy={() => handleCopy(key.id)}
            />
          ))}
        </div>
      )}

      <CreateKeyModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={(key) => {
          setSuccessKey(key)
          setShowSuccess(true)
        }}
      />

      <KeySuccessModal
        open={showSuccess}
        keyData={successKey ?? regenResult}
        onDone={() => {
          setShowSuccess(false)
          setSuccessKey(null)
          setRegenResult(null)
        }}
      />

      <ConfirmDialog
        open={revokeOpen !== null}
        onOpenChange={(v: boolean) => !v && setRevokeOpen(null)}
        title="Revoke API Key"
        description="Revoking this key will immediately invalidate it. All pending requests using this key will fail."
        confirmLabel="Revoke Key"
        variant="destructive"
        onConfirm={() => {
          if (revokeOpen) void handleRevoke(revokeOpen)
        }}
        loading={actionLoading === revokeOpen}
      />

      <ConfirmDialog
        open={deleteOpen !== null}
        onOpenChange={(v: boolean) => !v && setDeleteOpen(null)}
        title="Delete API Key"
        description="This action cannot be undone. The key and all associated data will be permanently removed."
        confirmLabel="Delete Key"
        variant="destructive"
        onConfirm={() => {
          if (deleteOpen) void handleDelete(deleteOpen)
        }}
        loading={actionLoading === deleteOpen}
      />

      <ConfirmDialog
        open={regenOpen !== null}
        onOpenChange={(v: boolean) => !v && setRegenOpen(null)}
        title="Regenerate API Key"
        description="A new key will be generated. The old key will be immediately revoked."
        confirmLabel="Regenerate"
        onConfirm={() => {
          if (regenOpen) void handleRegenerate(regenOpen)
        }}
        loading={actionLoading === regenOpen}
      />
    </div>
  )
}

function ApiKeyRow({
  keyData,
  onRevoke,
  onDelete,
  onRegenerate,
  actionLoading,
  copiedId,
  onCopy,
}: {
  keyData: ApiKey
  onRevoke: () => void
  onDelete: () => void
  onRegenerate: () => void
  actionLoading: string | null
  copiedId: string | null
  onCopy: () => void
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100">
            <Key className="h-5 w-5 text-violet-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-foreground">{keyData.name}</p>
              <Badge
                variant={keyData.environment === "production" ? "destructive" : "outline"}
                className="text-xs"
              >
                {keyData.environment}
              </Badge>
              <Badge
                variant={keyData.status === "active" ? "default" : "outline"}
                className="text-xs"
              >
                {keyData.status}
              </Badge>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              {keyData.prefix}_a8f9••••••••••••••••••••••••••••
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span>Project: {keyData.projects?.name ?? "—"}</span>
              <span>·</span>
              <span>Created {new Date(keyData.created_at).toLocaleDateString()}</span>
              {keyData.last_used_at && (
                <>
                  <span>·</span>
                  <span>Used {new Date(keyData.last_used_at).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onCopy}
              disabled={actionLoading === keyData.id}
              aria-label="Copy key"
            >
              {copiedId === keyData.id ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              onClick={onRegenerate}
              disabled={actionLoading === keyData.id}
              aria-label="Regenerate key"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              onClick={onRevoke}
              disabled={actionLoading === keyData.id || keyData.status === "revoked"}
              aria-label="Revoke key"
            >
              {actionLoading === keyData.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={onDelete}
              disabled={actionLoading === keyData.id}
              aria-label="Delete key"
            >
              {actionLoading === keyData.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
