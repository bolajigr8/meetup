// src/lib/hybrid-auth.ts
// Lets every meetings API route accept EITHER a web browser's cookie
// session OR the Flutter app's Bearer token, without having two separate
// code paths in each route. Call this instead of auth() directly.
import { auth } from '@/lib/auth'
import { verifyMobileToken } from '@/lib/mobile-auth'

export interface HybridSession {
  user: {
    id: string
    email: string
    name: string
    isAdmin: boolean
    isSuperAdmin: boolean
  }
}

export async function getHybridSession(
  req: Request,
): Promise<HybridSession | null> {
  // Try the web's cookie-based session first — cheapest check, and covers
  // the vast majority of requests (the web dashboard).
  const webSession = await auth()
  if (webSession?.user?.id) {
    return {
      user: {
        id: webSession.user.id,
        email: webSession.user.email ?? '',
        name: webSession.user.name ?? '',
        isAdmin: webSession.user.isAdmin ?? false,
        isSuperAdmin: webSession.user.isSuperAdmin ?? false,
      },
    }
  }

  // No cookie session — check for a mobile Bearer token instead.
  const mobileUser = await verifyMobileToken(req.headers.get('authorization'))
  if (mobileUser) {
    return { user: mobileUser }
  }

  return null
}
