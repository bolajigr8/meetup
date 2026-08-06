import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { createMobileToken } from '@/lib/mobile-auth'
import User from '@/models/User'

const mobileLoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
})

export const POST = withErrorHandler(async (req) => {
  const body = await req.json()
  const parsed = mobileLoginSchema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Invalid email or password',
      parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    )
  }

  const { email, password } = parsed.data
  await connectToDatabase()

  const user = await User.findOne({ email })
  if (!user || !user.passwordHash) {
    // Same generic message whether the email doesn't exist or the password
    // is wrong — never reveal which one it was, same principle as the web login.
    throw new ApiError(
      401,
      'INVALID_CREDENTIALS',
      'Incorrect email or password',
    )
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    throw new ApiError(
      401,
      'INVALID_CREDENTIALS',
      'Incorrect email or password',
    )
  }

  const token = await createMobileToken({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    isAdmin: user.isAdmin ?? false,
    isSuperAdmin: user.isSuperAdmin ?? false,
  })

  return NextResponse.json({
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin ?? false,
      isSuperAdmin: user.isSuperAdmin ?? false,
    },
  })
})
