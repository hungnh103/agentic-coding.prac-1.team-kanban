import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"

// Allowlist for CORS: restrict API to same origin (no external cross-origin access)
const ALLOWED_ORIGINS = process.env.NEXTAUTH_URL
  ? [process.env.NEXTAUTH_URL]
  : ["http://localhost:3000"]

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req

  // CORS: Block cross-origin requests to API routes from non-allowlisted origins
  const origin = req.headers.get("origin")
  if (nextUrl.pathname.startsWith("/api/") && !nextUrl.pathname.startsWith("/api/auth")) {
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return new Response(null, { status: 403 })
    }
  }

  return undefined
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
