// src/lib/session.ts
import { auth } from '@/lib/auth'
import { ApiError } from '@/lib/api-error'

export async function getSessionUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function requireAuth() {
  const user = await getSessionUser()
  if (!user?.id) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required')
  }
  return user as {
    id: string
    email: string
    name: string
    isAdmin: boolean
    isSuperAdmin: boolean
  }
}

export function isAdminUser(user: {
  isAdmin?: boolean
  isSuperAdmin?: boolean
}): boolean {
  return !!(user.isAdmin || user.isSuperAdmin)
}
