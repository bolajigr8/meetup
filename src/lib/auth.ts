// src/lib/auth.ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import User from '@/models/User'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        await connectToDatabase()
        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase(),
        })
        if (!user || !user.passwordHash) return null
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        )
        if (!valid) return null
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image ?? null,
          isAdmin: user.isAdmin ?? false,
          isSuperAdmin: user.isSuperAdmin ?? false,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials sign-in is handled entirely in authorize()
      if (account?.provider === 'credentials') return true
      if (!user.email) return false

      await connectToDatabase()
      const existingUser = await User.findOne({
        email: user.email.toLowerCase(),
      })

      if (existingUser) {
        const hasGoogle = existingUser.providers.some(
          (p: { provider: string }) => p.provider === 'google',
        )
        if (hasGoogle) {
          // Update avatar if changed
          if (user.image && user.image !== existingUser.image) {
            await User.updateOne(
              { _id: existingUser._id },
              { $set: { image: user.image } },
            )
          }
          return true
        }
        // Email exists with credentials — redirect to link-account flow
        const token = await createPendingGoogleToken({
          email: user.email,
          name: user.name ?? existingUser.name,
          googleProviderId: account?.providerAccountId ?? '',
          image: user.image,
        })
        return `/link-account?pendingToken=${token}`
      }

      // New Google user — create account
      await User.create({
        email: user.email.toLowerCase(),
        name: user.name ?? user.email.split('@')[0],
        passwordHash: null,
        emailVerified: new Date(),
        image: user.image ?? null,
        isAdmin: false,
        isSuperAdmin: false,
        providers: [
          {
            provider: 'google',
            providerId: account?.providerAccountId ?? '',
          },
        ],
      })
      return true
    },

    async jwt({ token, user, account }) {
      // Initial sign-in — populate token from the user object
      if (user && account) {
        if (account.provider === 'credentials') {
          token.id = user.id
          token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false
          token.isSuperAdmin =
            (user as { isSuperAdmin?: boolean }).isSuperAdmin ?? false
        } else {
          // OAuth sign-in — look up DB for the real user ID and roles
          await connectToDatabase()
          const dbUser = await User.findOne({
            email: token.email?.toLowerCase(),
          }).select('_id passwordChangedAt isAdmin isSuperAdmin')

          if (!dbUser) {
            token.id = undefined
            return token
          }
          token.id = dbUser._id.toString()
          token.isAdmin = dbUser.isAdmin ?? false
          token.isSuperAdmin = dbUser.isSuperAdmin ?? false
          token.passwordChangedAt = dbUser.passwordChangedAt
            ? Math.floor(dbUser.passwordChangedAt.getTime() / 1000)
            : undefined
        }
      }

      // Every subsequent request — refresh admin flags from DB so promotions
      // take effect without requiring a full sign-out/sign-in cycle
      if (token.id && !user) {
        await connectToDatabase()
        const dbUser = await User.findById(token.id).select(
          'passwordChangedAt isAdmin isSuperAdmin',
        )
        if (!dbUser) {
          token.id = undefined
          return token
        }

        token.isAdmin = dbUser.isAdmin ?? false
        token.isSuperAdmin = dbUser.isSuperAdmin ?? false

        // Invalidate token if password was changed after it was issued
        if (
          dbUser.passwordChangedAt &&
          token.iat &&
          Math.floor(dbUser.passwordChangedAt.getTime() / 1000) >
            (token.iat as number)
        ) {
          token.id = undefined
          return token
        }
      }

      return token
    },

    async session({ session, token }) {
      // If token has no id the session is invalid — clear user
      if (!token.id) {
        session.user = undefined as never
        return session
      }
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = (token.isAdmin as boolean) ?? false
        session.user.isSuperAdmin = (token.isSuperAdmin as boolean) ?? false
      }
      return session
    },
  },
})

// ─── Pending Google Token (for link-account flow) ────────────────────────────

import * as jose from 'jose'

async function getPendingTokenSecret() {
  return new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
}

export async function createPendingGoogleToken(payload: {
  email: string
  name: string
  googleProviderId: string
  image?: string | null
}): Promise<string> {
  const secret = await getPendingTokenSecret()
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30m')
    .setIssuedAt()
    .sign(secret)
}

export async function verifyPendingGoogleToken(token: string): Promise<{
  email: string
  name: string
  googleProviderId: string
  image?: string | null
} | null> {
  try {
    const secret = await getPendingTokenSecret()
    const { payload } = await jose.jwtVerify(token, secret)
    return payload as {
      email: string
      name: string
      googleProviderId: string
      image?: string | null
    }
  } catch {
    return null
  }
}
