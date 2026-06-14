// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  apiV1AuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
} from '@/lib/auth-config'

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req

  // Never block API routes
  if (
    nextUrl.pathname.startsWith(apiAuthPrefix) ||
    nextUrl.pathname.startsWith(apiV1AuthPrefix) ||
    nextUrl.pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // Read the JWT token directly — works reliably with NextAuth v5 App Router
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    // NextAuth v5 uses a different cookie name by default
    cookieName:
      process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
  })

  const isLoggedIn = !!token?.id

  // Auth pages — redirect logged-in users to dashboard
  if (authRoutes.some((r) => nextUrl.pathname.startsWith(r))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return NextResponse.next()
  }

  // Public routes — always allow
  if (publicRoutes.includes(nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Protected routes — require login
  if (!isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    if (nextUrl.pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
