import { NextResponse } from 'next/server'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { forgotPasswordSchema } from '@/schemas/auth.schemas'
import User from '@/models/User'
import PasswordResetToken from '@/models/PasswordResetToken'
import { sendPasswordResetEmail } from '@/lib/mailer'

// Factory function — a fresh Response is created per call, avoiding the
// ReadableStream "body already used" bug that a module-level singleton causes.
const safeResponse = () =>
  NextResponse.json(
    { message: 'If that email is registered, a reset link has been sent.' },
    { status: 200 },
  )

export const POST = withErrorHandler(async (req) => {
  const body = await req.json()

  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid email address')
  }

  const { email } = parsed.data

  await connectToDatabase()

  const user = await User.findOne({ email })

  // Return early silently if no user — don't leak email existence
  if (!user || !user.passwordHash) return safeResponse()

  // Invalidate any existing unused tokens for this user
  await PasswordResetToken.deleteMany({ userId: user._id, usedAt: null })

  // Create a new token
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = await bcrypt.hash(rawToken, 10)

  // Store a SHA-256 digest alongside the bcrypt hash so reset-password can do
  // a direct indexed lookup instead of scanning every token in the collection.
  const tokenSHA = crypto.createHash('sha256').update(rawToken).digest('hex')

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    tokenSHA,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
  })

  // Send email — fire and forget
  sendPasswordResetEmail(email, user.name, rawToken).catch(console.error)

  return safeResponse()
})
