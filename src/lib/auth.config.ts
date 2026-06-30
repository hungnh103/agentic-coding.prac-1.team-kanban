import type { NextAuthConfig } from "next-auth"

/**
 * Edge-safe auth config — không import bất kỳ Node.js module nào.
 * Dùng cho middleware (Edge Runtime).
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      const isProtectedRoute =
        pathname === "/" || pathname.startsWith("/boards")
      const isAuthRoute =
        pathname === "/login" || pathname === "/register"

      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl))
      }

      if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return Response.redirect(loginUrl)
      }

      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
