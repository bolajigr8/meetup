// src/types/next-auth.d.ts
import { DefaultSession, DefaultJWT } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      isSuperAdmin: boolean
    } & DefaultSession['user']
  }

  interface User {
    id: string
    isAdmin?: boolean
    isSuperAdmin?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id?: string
    isAdmin?: boolean
    isSuperAdmin?: boolean
    passwordChangedAt?: number
  }
}
