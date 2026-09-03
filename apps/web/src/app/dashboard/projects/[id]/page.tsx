"use client"

import * as React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Edit3,
  Folder,
  Loader2,
  Trash2,
} from "lucide-react"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Skeleton,
} from "@/components/ui"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { getProject, deleteProject } from "@/lib/projects/actions"

type Project = {
  id: string
  name: string
  description: string | null
  slug: string
  status: string
  created_at: string
  updated_at: string
}

export default function ProjectPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [project, setProject] = React.useState<Project | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    getProject(params.id).then((res) => {
      setLoading(false)
      if (res.error === "NOT_FOUND" || res.error === "UNAUTHORIZED") {
        notFound()
      }
      if (res.error) {
        setError(res.error)
        return
      }
      setProject(res.data!)
    })
  }, [params.id])

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteProject(project!.id)
      router.replace("/dashboard/projects")
    } catch {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="ml-auto">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <Separator />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-red-600">Failed to load project</p>
        <Link href="/dashboard/projects" className="mt-4 text-sm text-violet-600 hover:underline">
          ← Back to projects
        </Link>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
            <Folder className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {project.name}
            </h1>
            <p className="text-sm text-muted-foreground font-mono">{project.slug}</p>
          </div>
        </div>
        <div className="ml-auto">
          <Badge
            variant={project.status === "production" ? "destructive" : "outline"}
            className="text-xs"
          >
            {project.status}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Description
              </p>
              <p className="mt-1 text-sm text-foreground">
                {project.description || "No description provided."}
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last updated</span>
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(project.updated_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start gap-2" variant="outline" disabled>
              <Edit3 className="h-4 w-4" />
              Edit Project
            </Button>
            <Button
              className="w-full justify-start gap-2"
              variant="outline"
              disabled
            >
              <Folder className="h-4 w-4" />
              API Keys
            </Button>
            <Button
              className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              variant="outline"
              onClick={() => setDeleteOpen(true)}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Project
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Project Settings</CardTitle>
          <CardDescription>
            Configure your project settings, integrations, and team members.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-3">
              <Edit3 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Settings coming soon</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Project configuration and team management will be available in a
              future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${project.name}"? This action cannot be undone and all associated data will be permanently removed.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
