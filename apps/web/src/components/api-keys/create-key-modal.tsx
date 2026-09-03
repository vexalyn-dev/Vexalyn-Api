"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Key,
  Copy,
  Check,
  Shield,
  AlertTriangle,
  Loader2,
  Plus,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Badge } from "@/components/ui"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui"
import { createApiKey, type CreatedKey } from "@/lib/api-keys/actions"
import { createKeySchema } from "@/lib/api-keys/schemas"
import { useProjects } from "@/hooks/use-projects"

interface CreateKeyModalProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess: (key: CreatedKey) => void
}

export function CreateKeyModal({ open, onOpenChange, onSuccess }: CreateKeyModalProps) {
  const router = useRouter()
  const { projects, loading: projectsLoading } = useProjects()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({
    name: "",
    project_id: "",
    environment: "development" as "development" | "production",
    permissions: [] as string[],
  })

  const togglePermission = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await createApiKey({
      name: form.name,
      project_id: form.project_id,
      environment: form.environment,
      permissions: form.permissions,
    })

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    onSuccess(result.key)
    setForm({ name: "", project_id: "", environment: "development", permissions: [] })
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-violet-600" />
            Create API Key
          </DialogTitle>
          <DialogDescription>
            Generate a new API key for your project. The raw key will be shown
            only once.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="key-name">
              Key Name
            </label>
            <Input
              id="key-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Production API Key"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="project">
              Project
            </label>
            <Select
              value={form.project_id}
              onValueChange={(v) => setForm((p) => ({ ...p, project_id: v }))}
              disabled={projectsLoading}
            >
              <SelectTrigger id="project" className="w-full">
                <SelectValue placeholder={projectsLoading ? "Loading..." : "Select a project"} />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Environment</label>
            <div className="grid grid-cols-2 gap-2">
              {(["development", "production"] as const).map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, environment: env }))}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                    form.environment === env
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-border bg-background text-muted-foreground hover:border-violet-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-current" />
                    {env.charAt(0).toUpperCase() + env.slice(1)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Permissions</label>
            <div className="space-y-2">
              {[
                { value: "api.read", label: "Read API Data", desc: "Access to query and read data" },
                { value: "api.execute", label: "Execute API Calls", desc: "Send requests to endpoints" },
                { value: "usage.read", label: "View Usage Analytics", desc: "See request counts and metrics" },
                { value: "logs.read", label: "View Request Logs", desc: "Access request history" },
              ].map((perm) => (
                <label
                  key={perm.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    form.permissions.includes(perm.value)
                      ? "border-violet-300 bg-violet-50"
                      : "border-border hover:border-violet-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(perm.value)}
                    onChange={() => togglePermission(perm.value)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{perm.label}</p>
                    <p className="text-xs text-muted-foreground">{perm.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !form.project_id || form.permissions.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
