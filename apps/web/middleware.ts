import { createClient } from "@/lib/auth/client"

export default async function middleware(req: Request) {
  const res = new Response(null, { status: 302 })
  const url = new URL(req.url)
  const pathname = url.pathname

  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password"

  const isProtectedRoute = pathname.startsWith("/dashboard")

  // Redirect authenticated users away from auth pages
  if (session && isAuthPage) {
    res.headers.set("Location", "/dashboard")
    return res
  }

  // Redirect unauthenticated users to login for protected routes
  if (!session && isProtectedRoute) {
    const loginUrl = new URL("/login", url.origin)
    loginUrl.searchParams.set("callback", pathname)
    res.headers.set("Location", loginUrl.toString())
    return res
  }

  // Pass through — let Next.js render the page
  return fetch(req)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
