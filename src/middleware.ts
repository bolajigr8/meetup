// src/middleware.ts
import NextAuth from 'next-auth'
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  apiV1AuthPrefix, // ← add this
  DEFAULT_LOGIN_REDIRECT,
} from '@/lib/auth-config'

const { auth } = NextAuth({
  providers: [],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
})

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth?.user

  // ✅ Never block NextAuth or your own v1 auth API routes
  if (
    nextUrl.pathname.startsWith(apiAuthPrefix) ||
    nextUrl.pathname.startsWith(apiV1AuthPrefix)
  )
    return

  if (authRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    if (isLoggedIn)
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    return
  }

  if (publicRoutes.includes(nextUrl.pathname)) return

  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
