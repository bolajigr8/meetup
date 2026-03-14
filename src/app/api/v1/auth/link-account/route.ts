import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { linkAccountSchema } from '@/schemas/auth.schemas'
import { verifyPendingGoogleToken } from '@/lib/auth'
import User from '@/models/User'

export const POST = withErrorHandler(async (req) => {
  const body = await req.json()

  const parsed = linkAccountSchema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body', [
      ...parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    ])
  }

  const { password, pendingToken } = parsed.data

  // Verify the pending Google token (30-min signed JWT)
  const pending = await verifyPendingGoogleToken(pendingToken)
  if (!pending) {
    throw new ApiError(
      400,
      'INVALID_PENDING_TOKEN',
      'This link request has expired. Please try signing in with Google again.',
    )
  }

  await connectToDatabase()

  const user = await User.findOne({ email: pending.email })
  if (!user || !user.passwordHash) {
    throw new ApiError(400, 'INVALID_PENDING_TOKEN', 'Account not found')
  }

  // Verify the password — proves ownership of the existing account
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw new ApiError(401, 'INVALID_PASSWORD', 'Incorrect password')
  }

  // Check if already linked (idempotent)
  const alreadyLinked = user.providers.some(
    (p: { provider: string }) => p.provider === 'google',
  )

  if (!alreadyLinked) {
    // Fix: raw field assignments must go inside $set — MongoDB forbids mixing
    // update operators (like $push) with bare field keys in the same document.
    await User.updateOne(
      { _id: user._id },
      {
        $push: {
          providers: {
            provider: 'google',
            providerId: pending.googleProviderId,
          },
        },
        $set: {
          // Update image and emailVerified from Google if not already set
          ...(user.image ? {} : { image: pending.image }),
          emailVerified: user.emailVerified ?? new Date(),
        },
      },
    )
  }

  return NextResponse.json(
    {
      message: 'Google account linked successfully.',
      email: user.email,
      name: user.name,
    },
    { status: 200 },
  )
})
