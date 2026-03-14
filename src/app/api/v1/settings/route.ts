// route: GET /api/v1/settings  |  PATCH /api/v1/settings

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { z } from 'zod'
import User from '@/models/User'
import UserSettings from '@/models/UserSettings'

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(80)
    .trim()
    .optional(),
  email: z.string().email('Enter a valid email').optional(),
  notificationPrefs: z
    .object({
      meetingReminder2Days: z.boolean().optional(),
      meetingReminder1Day: z.boolean().optional(),
      meetingReminder2Hours: z.boolean().optional(),
      taskOverdueAlert: z.boolean().optional(),
      taskDueSoon: z.boolean().optional(),
      programStartReminder: z.boolean().optional(),
    })
    .optional(),
})

export const GET = withErrorHandler(async () => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  await connectToDatabase()
  const uid = session.user.id

  const [user, settings] = await Promise.all([
    User.findById(uid).select('name email image providers').lean(),
    UserSettings.findOne({ userId: uid }).lean(),
  ])

  if (!user) throw new ApiError(404, 'NOT_FOUND', 'User not found')

  const defaultPrefs = {
    meetingReminder2Days: true,
    meetingReminder1Day: true,
    meetingReminder2Hours: true,
    taskOverdueAlert: true,
    taskDueSoon: true,
    programStartReminder: true,
  }

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: (user as any).name ?? '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    email: (user as any).email ?? '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    image: (user as any).image ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    providers: (user as any).providers ?? [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notificationPrefs: (settings as any)?.notificationPrefs ?? defaultPrefs,
  })
})

export const PATCH = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const body = await req.json()
  const parsed = updateProfileSchema.safeParse(body)

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
  const uid = session.user.id

  const { notificationPrefs, ...profileFields } = parsed.data

  const updates: Promise<unknown>[] = []

  if (Object.keys(profileFields).length > 0) {
    updates.push(
      User.findByIdAndUpdate(
        uid,
        { $set: profileFields },
        { new: true, runValidators: true },
      ),
    )
  }

  if (notificationPrefs) {
    const prefUpdate: Record<string, boolean> = {}
    for (const [k, v] of Object.entries(notificationPrefs)) {
      if (v !== undefined) prefUpdate[`notificationPrefs.${k}`] = v as boolean
    }
    updates.push(
      UserSettings.findOneAndUpdate(
        { userId: uid },
        { $set: prefUpdate },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      ),
    )
  }

  await Promise.all(updates)

  return NextResponse.json({ message: 'Settings updated successfully' })
})
