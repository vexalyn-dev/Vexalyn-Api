import { z } from "zod"

export const projectSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters"),
  description: z.string().max(500).optional().or(z.literal("")),
  environment: z.enum(["development", "production"]).default("development"),
})

export type ProjectInput = z.infer<typeof projectSchema>
