"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  Plus,
  Folder,
  Calendar,
  AlertCircle,
  Loader2,
  Settings,
  ArrowLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Textarea } from "@/components/ui"
import { Badge } from "@/components/ui"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui"
import { createProject, getProjects } from "@/lib/projects/actions"
import { projectSchema, type ProjectInput } from "@/lib/projects/schemas"
import { motion, AnimatePresence } from "framer-motion"

type Project = {
  id: string
  name: string
  description: string | null
  slug: string
  status: string
  created_at: string
  updated_at: string
}

export default function ProjectsPage() {
  const searchParams = useSearchParams()
  const [projects, setProjects] = React.useState<Project[] | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)
  const [showForm, setShowForm] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const createdId = searchParams.get("created")

  React.useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    setError(null)
    const res = await getProjects()
    if (res.error) {
      setError(res.error)
      setProjects([])
    } else {
      setProjects(res.data ?? [])
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setCreating(true)

    const formData = new FormData(e.currentTarget)
    const raw: ProjectInput = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      environment: (formData.get("environment") as "development" | "production") ?? "development",
    }

    const result = projectSchema.safeParse(raw)
    if (!result.success) {
      setFormError(result.error.errors[0]?.message ?? "Invalid input")
      setCreating(false)
      return
    }

    await createProject(result.data)
    setCreating(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your API projects and environments.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Create Project</CardTitle>
                <CardDescription>
                  Projects help you organize your API keys and usage.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {formError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {formError}
                  </div>
                )}
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="name">
                      Project Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="My Awesome Project"
                      required
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="description">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="What is this project for?"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="environment">
                      Environment
                    </label>
                    <select
                      id="environment"
                      name="environment"
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                      defaultValue="development"
                    >
                      <option value="development">Development</option>
                      <option value="production">Production</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={creating}>
                      {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Project
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects list */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                    <Folder className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-3 w-full animate-pulse rounded bg-muted mb-3" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
                  <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
          <p className="text-sm font-medium text-foreground">Failed to load projects</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4" onClick={loadProjects}>
            Try Again
          </Button>
        </div>
      ) : projects!.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 mb-4">
            <Folder className="h-6 w-6 text-violet-600" />
          </div>
          <p className="text-base font-semibold text-foreground">No projects yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Create your first project to start organizing your API keys and
            monitoring usage.
          </p>
          <Button className="mt-6" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects!.map((project) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="group block"
            >
              <Card className="h-full transition-shadow hover:shadow-md hover:shadow-violet-500/5">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 group-hover:bg-violet-200 transition-colors">
                        <Folder className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold text-foreground">
                          {project.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground font-mono">
                          {project.slug}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={project.status === "production" ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {project.description ? (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No description
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Manage <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Add project card */}
          <button
            onClick={() => setShowForm(true)}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-6 text-center hover:border-violet-300 hover:bg-violet-50/50 transition-colors min-h-[180px]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Create Project</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start a new project
            </p>
          </button>
        </div>
      )}
    </div>
  )
}
