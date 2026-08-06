// route: PATCH /api/v1/settings/password
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { z } from 'zod'
import User from '@/models/User'
import { getHybridSession } from '@/lib/hybrid-auth'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .max(100, 'Password too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const PATCH = withErrorHandler(async (req) => {
  const session = await getHybridSession(req)
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const body = await req.json()
  const parsed = passwordSchema.safeParse(body)

  if (!parsed.success) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Invalid request body',
      parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    )
  }

  await connectToDatabase()

  // BUG FIX (flagged earlier in this project, fixed now): the field on the
  // User schema is `passwordHash`, not `password` — the old version of
  // this route checked a field that doesn't exist, so password changes
  // ALWAYS failed with "not available for Google accounts", even for
  // legitimate credentials users.
  const user = await User.findById(session.user.id)
    .select('passwordHash')
    .lean()
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storedPasswordHash = (user as any).passwordHash
  if (!storedPasswordHash) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Password change is not available for accounts signed in with Google or another provider',
    )
  }

  const isMatch = await bcrypt.compare(
    parsed.data.currentPassword,
    storedPasswordHash,
  )
  if (!isMatch) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Incorrect current password', [
      { field: 'currentPassword', message: 'Current password is incorrect' },
    ])
  }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12)

  // Second bug fix caught during this review: now also sets
  // passwordChangedAt, matching what reset-password already does
  // correctly. Without this, changing your password did NOT invalidate
  // any existing logged-in sessions/tokens on other devices — a real
  // security gap, since auth.ts's jwt callback specifically checks this
  // field to invalidate stale tokens after a password change.
  await User.findByIdAndUpdate(session.user.id, {
    $set: { passwordHash: hashed, passwordChangedAt: new Date() },
  })

  return NextResponse.json({ message: 'Password updated successfully' })
})
