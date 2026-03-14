// route: PATCH /api/v1/settings/password

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { z } from 'zod'
import User from '@/models/User'

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
  const session = await auth()
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

  // Fetch user with password field
  const user = await User.findById(session.user.id).select('+password').lean()
  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storedPassword = (user as any).password
  if (!storedPassword) {
    throw new ApiError(
      400,
      'BAD_REQUEST',
      'Password change is not available for accounts signed in with Google or another provider',
    )
  }

  const isMatch = await bcrypt.compare(
    parsed.data.currentPassword,
    storedPassword,
  )
  if (!isMatch) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Incorrect current password', [
      { field: 'currentPassword', message: 'Current password is incorrect' },
    ])
  }

  const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
  await User.findByIdAndUpdate(session.user.id, { $set: { password: hashed } })

  return NextResponse.json({ message: 'Password updated successfully' })
})
