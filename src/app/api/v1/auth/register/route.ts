import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { registerSchema } from '@/schemas/auth.schemas'
import User from '@/models/User'
import { sendWelcomeEmail } from '@/lib/mailer'

export const POST = withErrorHandler(async (req) => {
  const body = await req.json()

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body', [
      ...parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    ])
  }

  const { name, email, password } = parsed.data

  await connectToDatabase()

  const existing = await User.findOne({ email })

  if (existing) {
    const hasCredentials = existing.providers.some(
      (p: { provider: string }) => p.provider === 'credentials',
    )
    const hasOAuth = existing.providers.some(
      (p: { provider: string }) => p.provider !== 'credentials',
    )

    if (hasCredentials) {
      throw new ApiError(
        409,
        'EMAIL_EXISTS',
        'An account with this email already exists',
      )
    }

    if (hasOAuth) {
      throw new ApiError(
        409,
        'EMAIL_EXISTS_OAUTH',
        'This email is registered with Google. Please sign in with Google.',
      )
    }

    // Fix: if the user document exists but has an empty providers array (or an
    // unrecognised provider), neither branch above fires and we'd fall through
    // to User.create, hitting a duplicate-key E11000 and returning a 500.
    // This ensures we always return a clean 409 for any existing-email case.
    throw new ApiError(
      409,
      'EMAIL_EXISTS',
      'An account with this email already exists',
    )
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await User.create({
    email,
    name,
    passwordHash,
    providers: [{ provider: 'credentials', providerId: email }],
  })

  // Send welcome email — fire and forget, don't block the response
  sendWelcomeEmail(email, name).catch(console.error)

  return NextResponse.json(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    },
    { status: 201 },
  )
})
