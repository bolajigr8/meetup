import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { getHybridSession } from '@/lib/hybrid-auth'
import FcmToken from '@/models/FcmToken'

const tokenSchema = z.object({
  token: z.string().min(1),
})

export const POST = withErrorHandler(async (req) => {
  const session = await getHybridSession(req)
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const body = await req.json()
  const parsed = tokenSchema.safeParse(body)
  if (!parsed.success)
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid FCM token payload')

  await connectToDatabase()

  await FcmToken.findOneAndUpdate(
    { token: parsed.data.token },
    { $set: { userId: session.user.id, token: parsed.data.token } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )

  return NextResponse.json({ message: 'FCM token saved' })
})
