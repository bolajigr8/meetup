import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { resetPasswordSchema } from '@/schemas/auth.schemas'
import User from '@/models/User'
import PasswordResetToken from '@/models/PasswordResetToken'

export const POST = withErrorHandler(async (req) => {
  const body = await req.json()

  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request', [
      ...parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    ])
  }

  const { token: rawToken, password } = parsed.data

  await connectToDatabase()

  // Fix: instead of fetching all valid tokens and bcrypt-comparing each one
  // (O(n × bcrypt_cost), DoS risk), derive a SHA-256 digest of the raw token
  // and use it to do a direct indexed lookup. We still bcrypt-compare the single
  // candidate as the authoritative check — SHA-256 is only used for indexing.
  const tokenSHA = crypto.createHash('sha256').update(rawToken).digest('hex')

  const candidate = await PasswordResetToken.findOne({
    tokenSHA,
    usedAt: null,
    expiresAt: { $gt: new Date() }, // always check manually (TTL has ~60s lag)
  })

  if (!candidate) {
    throw new ApiError(
      400,
      'INVALID_TOKEN',
      'This reset link is invalid or has expired',
    )
  }

  // Authoritative check — bcrypt-compare against the stored hash
  const matches = await bcrypt.compare(rawToken, candidate.tokenHash)
  if (!matches) {
    throw new ApiError(
      400,
      'INVALID_TOKEN',
      'This reset link is invalid or has expired',
    )
  }

  const user = await User.findById(candidate.userId)
  if (!user) {
    throw new ApiError(
      400,
      'INVALID_TOKEN',
      'This reset link is invalid or has expired',
    )
  }

  const newPasswordHash = await bcrypt.hash(password, 12)

  // Update password and set passwordChangedAt to invalidate all existing JWTs
  await User.updateOne(
    { _id: user._id },
    {
      passwordHash: newPasswordHash,
      passwordChangedAt: new Date(),
    },
  )

  // Mark token as used (one-time use)
  await PasswordResetToken.updateOne(
    { _id: candidate._id },
    { usedAt: new Date() },
  )

  return NextResponse.json(
    { message: 'Password updated successfully. Please sign in.' },
    { status: 200 },
  )
})
