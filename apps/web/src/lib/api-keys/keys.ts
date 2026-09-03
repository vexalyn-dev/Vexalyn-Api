/**
 * Generate a cryptographically secure API key.
 * Format: vx_{env}_{32 hex chars}
 * Example: vx_live_a3f8c9d1e2b4... (64 hex chars = 256 bits of entropy)
 */

export function generateApiKey(environment: "development" | "production"): string {
  const prefix = environment === "production" ? "vx_live" : "vx_test"
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return `${prefix}_${hex}`
}

/**
 * Mask an API key for display.
 * Shows prefix + first 6 chars + masked remainder.
 * Example: vx_live_a8f9••••••••
 */
export function maskKey(key: string): string {
  const parts = key.split("_")
  if (parts.length < 2) return key.slice(0, 8) + "••••"
  const prefix = parts[0]
  const env = parts[1]
  const rest = parts.slice(2).join("_")

  if (rest.length <= 6) {
    return `${prefix}_${env}_••••••`
  }

  const visible = rest.slice(0, 4)
  const masked = "•".repeat(rest.length - 4)
  return `${prefix}_${env}_${visible}${masked}`
}

/**
 * Validate that a string looks like a valid VEXALYN API key.
 */
export function isValidApiKey(key: string): boolean {
  return /^(vx_live|vx_test)_[a-f0-9]{64}$/.test(key)
}
