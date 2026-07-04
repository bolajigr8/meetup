import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import PushSubscription from '@/models/PushSubscription'

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

const unsubscribeSchema = z.object({
  endpoint: z.string().url(),
})

// GET — used by the settings UI to check if this device already has a subscription
export const GET = withErrorHandler(async () => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  await connectToDatabase()
  const deviceCount = await PushSubscription.countDocuments({
    userId: session.user.id,
  })

  return NextResponse.json({ subscribed: deviceCount > 0, deviceCount })
})

export const POST = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const body = await req.json()
  const parsed = subscribeSchema.safeParse(body)
  if (!parsed.success)
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Invalid push subscription payload',
      parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    )

  await connectToDatabase()
  const { endpoint, keys } = parsed.data

  // Upsert by endpoint — a re-subscribe (e.g. browser rotated keys) just overwrites
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      $set: {
        userId: session.user.id,
        endpoint,
        keys,
        userAgent: req.headers.get('user-agent') ?? undefined,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  return NextResponse.json({ message: 'Push subscription saved' })
})

export const DELETE = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const body = await req.json()
  const parsed = unsubscribeSchema.safeParse(body)
  if (!parsed.success)
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid request body')

  await connectToDatabase()
  await PushSubscription.deleteOne({
    endpoint: parsed.data.endpoint,
    userId: session.user.id,
  })

  return NextResponse.json({ message: 'Push subscription removed' })
})
