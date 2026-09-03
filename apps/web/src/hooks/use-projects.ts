"use client"

import * as React from "react"
import { getProjects, type Project } from "@/lib/projects/list"

export function useProjects() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    getProjects().then((res) => {
      setProjects(res.projects)
      setError(res.error)
      setLoading(false)
    })
  }, [])

  return { projects, loading, error }
}
