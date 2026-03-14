// route: PATCH /api/v1/notifications/[id] (mark single as read)

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import Notification from '@/models/Notification'

export const PATCH = withErrorHandler(async (_req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const { id } = await ctx.params
  if (!id || id === 'undefined')
    throw new ApiError(400, 'BAD_REQUEST', 'Notification ID is required')

  await connectToDatabase()

  const notification = await Notification.findById(id)
  if (!notification)
    throw new ApiError(404, 'NOT_FOUND', 'Notification not found')
  if (notification.userId.toString() !== session.user.id) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You do not have access to this notification',
    )
  }

  notification.read = true
  await notification.save()

  return NextResponse.json({ message: 'Notification marked as read' })
})
