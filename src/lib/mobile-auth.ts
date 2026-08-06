// src/lib/mobile-auth.ts
// Bridges NextAuth's cookie-based web sessions with a Bearer-token flow for
// the Flutter mobile app. The mobile app never gets a browser cookie — it
// gets back a plain token string, then sends it as `Authorization: Bearer <token>`
// on every request. We build/read that token with NextAuth's own encode/decode
// functions so it's byte-for-byte the same kind of token a web session cookie
// contains — nothing bespoke, nothing that could drift out of sync with the
// web app's auth logic.
import { encode, decode } from 'next-auth/jwt'
import type { JWT } from 'next-auth/jwt'

// NextAuth v5 derives its encryption key partly from this "salt" value, which
// it sets to the session cookie's name. To produce a token that decodes
// identically to a real web session, we must use the exact same salt the web
// app's cookie uses — this mirrors the cookieName logic already in middleware.ts.
function getSalt(): string {
  return process.env.NODE_ENV === 'production'
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'
}

const MOBILE_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 // 30 days, matches NextAuth's JWT default

export interface MobileTokenUser {
  id: string
  email: string
  name: string
  isAdmin: boolean
  isSuperAdmin: boolean
}

/**
 * Builds a NextAuth-compatible encrypted JWT for a given user. This is what
 * gets returned to the Flutter app after a successful login — it's the
 * mobile equivalent of the session cookie NextAuth sets for the browser.
 */
export async function createMobileToken(
  user: MobileTokenUser,
): Promise<string> {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error('NEXTAUTH_SECRET is not configured')

  const payload: JWT = {
    sub: user.id,
    id: user.id,
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin,
    isSuperAdmin: user.isSuperAdmin,
  }

  return encode({
    token: payload,
    secret,
    salt: getSalt(),
    maxAge: MOBILE_TOKEN_MAX_AGE,
  })
}

/**
 * Decodes a Bearer token sent by the Flutter app back into the same shape
 * NextAuth's own `auth()` would give a web request. Returns null if the
 * token is missing, malformed, expired, or was signed with a different secret.
 */
export async function verifyMobileToken(
  authHeader: string | null,
): Promise<MobileTokenUser | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const rawToken = authHeader.slice(7).trim()
  if (!rawToken) return null

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return null

  try {
    const decoded = await decode({ token: rawToken, secret, salt: getSalt() })
    if (!decoded?.id) return null
    return {
      id: decoded.id as string,
      email: (decoded.email as string) ?? '',
      name: (decoded.name as string) ?? '',
      isAdmin: (decoded.isAdmin as boolean) ?? false,
      isSuperAdmin: (decoded.isSuperAdmin as boolean) ?? false,
    }
  } catch {
    return null
  }
}
