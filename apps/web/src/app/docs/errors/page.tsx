"use client"

import { DocsSidebar } from "@/components/docs/sidebar"
import { CodeBlock } from "@/components/docs/code-block"
import { Badge } from "@/components/ui"
import { Zap, Menu, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const errorCodes = [
  { code: "SUCCESS", status: 200, desc: "Request processed successfully." },
  { code: "VALIDATION_ERROR", status: 400, desc: "Invalid request parameters. Check query params and body." },
  { code: "INVALID_API_KEY", status: 401, desc: "The API key is invalid, malformed, or missing." },
  { code: "KEY_REVOKED", status: 401, desc: "The API key has been revoked." },
  { code: "KEY_EXPIRED", status: 401, desc: "The API key has expired." },
  { code: "RATE_LIMITED", status: 429, desc: "Too many requests. Wait and retry." },
  { code: "PROVIDER_ERROR", status: 502, desc: "The scraper provider returned an error." },
  { code: "API_UNAVAILABLE", status: 503, desc: "The provider service is temporarily unavailable." },
  { code: "INTERNAL_ERROR", status: 500, desc: "An unexpected server error occurred." },
]

export default function ErrorsPage() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <DocsSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:hidden">
          <button className="flex h-9 w-9 items-center justify-center rounded-lg" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <Link href="/docs" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">VEXALYN</span>
          </Link>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <nav className="text-sm text-muted-foreground mb-6">
              <Link href="/docs" className="hover:text-foreground">Docs</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Errors</span>
            </nav>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Error Handling
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Understanding error responses and how to handle them gracefully.
            </p>

            {/* Error envelope */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Error Response Format</h2>
              <p className="text-muted-foreground mb-4">
                All errors follow a consistent envelope structure:
              </p>
              <CodeBlock
                examples={{
                  curl: `{\n  "success": false,\n  "error": {\n    "code": "INVALID_API_KEY",\n    "message": "The provided API key is invalid."\n  },\n  "meta": {\n    "request_id": "req_1234567890_abc123"\n  }\n}`,
                  javascript: `// All errors share this shape\ninterface ApiError {\n  success: false;\n  error: {\n    code: string;    // Machine-readable error code\n    message: string; // User-friendly message\n    details?: object; // Optional extra context\n  };\n  meta: {\n    request_id: string; // For support queries\n  };\n}`,
                  typescript: `// Same as JavaScript`,
                  python: `# All errors share this shape\nclass ApiError(BaseModel):\n    success: bool = False\n    error: dict  # {"code": str, "message": str, "details?: dict"}\n    meta: dict   # {"request_id": str}`,
                  php: `<?php\n// All errors share this shape\nclass ApiError {\n    public bool $success = false;\n    public array $error;   // ['code' => str, 'message' => str]\n    public array $meta;    // ['request_id' => str]\n}\n?>`,
                }}
              />
            </div>

            {/* Error codes */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Error Codes</h2>
              <div className="space-y-2">
                {errorCodes.map((err) => (
                  <div key={err.code} className="flex items-center gap-4 rounded-xl border border-border p-4">
                    <span className={`inline-flex shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
                      err.status < 400 ? "bg-emerald-100 text-emerald-700" :
                      err.status < 500 ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {err.status}
                    </span>
                    <code className="text-sm font-mono text-violet-600 w-48 shrink-0">{err.code}</code>
                    <p className="text-sm text-muted-foreground">{err.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Handling errors */}
            <div className="mt-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">Handling Errors in Your App</h2>
              <CodeBlock
                title="Error Handling Pattern"
                examples={{
                  curl: `// Check success flag first\nif (!data.success) {\n  console.error(data.error.message);\n  // Use data.error.code for programmatic handling\n  if (data.error.code === "RATE_LIMITED") {\n    // Retry with backoff\n  }\n}`,
                  javascript: `async function callApi(endpoint, key) {\n  const res = await fetch(\n    \`https://api.vexalyn.dev\${endpoint}\`,\n    { headers: { 'Authorization': \`Bearer \${key}\` } }\n  );\n  \n  const data = await res.json();\n  \n  if (!data.success) {\n    // Handle by error code\n    switch (data.error.code) {\n      case 'INVALID_API_KEY':\n        throw new Error('Invalid key — check your dashboard');\n      case 'RATE_LIMITED':\n        await sleep(1000); // Retry after delay\n        return callApi(endpoint, key);\n      case 'PROVIDER_ERROR':\n        throw new Error('Provider temporarily down');\n      default:\n        throw new Error(data.error.message);\n    }\n  }\n  \n  return data.data;\n}`,
                  typescript: `async function callApi<T>(endpoint: string, key: string): Promise<T> {\n  const res = await fetch(\n    \`https://api.vexalyn.dev\${endpoint}\`,\n    { headers: { 'Authorization': \`Bearer \${key}\` } }\n  );\n  \n  const data = await res.json() as ApiResponse<T>;\n  \n  if (!data.success) {\n    throw new ApiError(data.error.code, data.error.message);\n  }\n  \n  return data.data;\n}`,
                  python: `import httpx\nfrom typing import TypeVar, Generic\nT = TypeVar('T')\n\ndef call_api(endpoint: str, key: str) -> dict:\n    resp = httpx.get(\n        f"https://api.vexalyn.dev{endpoint}",\n        headers={"Authorization": f"Bearer {key}"},\n        timeout=30.0\n    )\n    data = resp.json()\n    \n    if not data.get("success"):\n        error = data["error"]\n        if error["code"] == "RATE_LIMITED":\n            time.sleep(1)\n            return call_api(endpoint, key)  # Retry\n        raise ApiError(error["code"], error["message"])\n    \n    return data["data"]`,
                  php: `<?php\nfunction callApi($endpoint, $key) {\n    $ch = curl_init("https://api.vexalyn.dev" . $endpoint);\n    curl_setopt($ch, CURLOPT_HTTPHEADER, [\n        "Authorization: Bearer " . $key\n    ]);\n    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);\n    $response = curl_exec($ch);\n    curl_close($ch);\n    \n    $data = json_decode($response, true);\n    \n    if (!$data['success']) {\n        throw new ApiError(\n            $data['error']['code'],\n            $data['error']['message']\n        );\n    }\n    \n    return $data['data'];\n}\n?>`,
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
