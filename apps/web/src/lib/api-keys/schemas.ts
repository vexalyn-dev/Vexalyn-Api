import { z } from "zod"

export const createKeySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters"),
  project_id: z.string().uuid("Please select a project"),
  environment: z.enum(["development", "production"]),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
})

export type CreateKeyInput = z.infer<typeof createKeySchema>

export const keyPermissions = [
  { value: "api.read", label: "Read API Data" },
  { value: "api.execute", label: "Execute API Calls" },
  { value: "usage.read", label: "View Usage Analytics" },
  { value: "logs.read", label: "View Request Logs" },
] as const
