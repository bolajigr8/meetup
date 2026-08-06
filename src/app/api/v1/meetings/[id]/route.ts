// import { NextResponse } from 'next/server'
// import { auth } from '@/lib/auth'
// import { connectToDatabase } from '@/lib/db'
// import { ApiError, withErrorHandler } from '@/lib/api-error'
// import { updateMeetingSchema } from '@/schemas/meeting.schemas'
// import Meeting from '@/models/Meeting'
// import { Types } from 'mongoose'
// import { serialize } from '@/lib/serialize'

// async function getMeetingOrThrow(id: string, userId: string) {
//   if (!id || id === 'undefined')
//     throw new ApiError(400, 'BAD_REQUEST', 'Meeting ID is required')
//   const meeting = await Meeting.findById(id)
//     .populate('assignedTo', 'name email image')
//     .lean()
//   if (!meeting) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   if ((meeting as any).createdBy.toString() !== userId)
//     throw new ApiError(
//       403,
//       'FORBIDDEN',
//       'You do not have access to this meeting',
//     )
//   return meeting
// }

// export const GET = withErrorHandler(async (_req, ctx) => {
//   const session = await auth()
//   if (!session?.user?.id)
//     throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

//   const { id } = await ctx.params
//   await connectToDatabase()

//   const isAdmin = session.user.isAdmin || session.user.isSuperAdmin

//   if (isAdmin) {
//     const meeting = await getMeetingOrThrow(id, session.user.id)
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     return NextResponse.json(serialize(meeting as Record<string, any>))
//   }

//   const meeting = await Meeting.findOne({
//     _id: id,
//     assignedTo: new Types.ObjectId(session.user.id),
//   })
//     .populate('assignedTo', 'name email image')
//     .lean()
//   if (!meeting) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   return NextResponse.json(serialize(meeting as Record<string, any>))
// })

// export const PATCH = withErrorHandler(async (req, ctx) => {
//   const session = await auth()
//   if (!session?.user?.id)
//     throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
//   if (!session.user.isAdmin && !session.user.isSuperAdmin)
//     throw new ApiError(403, 'FORBIDDEN', 'Only admins can edit meetings')

//   const { id } = await ctx.params
//   const body = await req.json()

//   const parsed = updateMeetingSchema.safeParse(body)
//   if (!parsed.success)
//     throw new ApiError(
//       400,
//       'VALIDATION_ERROR',
//       'Invalid request body',
//       parsed.error.issues.map((e) => ({
//         field: e.path.join('.'),
//         message: e.message,
//       })),
//     )

//   await connectToDatabase()
//   await getMeetingOrThrow(id, session.user.id)

//   const updateData = {
//     ...parsed.data,
//     ...(parsed.data.assignedTo && {
//       assignedTo: parsed.data.assignedTo.map((uid) => new Types.ObjectId(uid)),
//     }),
//   }

//   const updated = await Meeting.findByIdAndUpdate(
//     id,
//     { $set: updateData },
//     { new: true, runValidators: true },
//   )
//     .populate('assignedTo', 'name email image')
//     .lean()

//   if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   return NextResponse.json(serialize(updated as Record<string, any>))
// })

// export const DELETE = withErrorHandler(async (_req, ctx) => {
//   const session = await auth()
//   if (!session?.user?.id)
//     throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
//   if (!session.user.isAdmin && !session.user.isSuperAdmin)
//     throw new ApiError(403, 'FORBIDDEN', 'Only admins can cancel meetings')

//   const { id } = await ctx.params
//   await connectToDatabase()
//   await getMeetingOrThrow(id, session.user.id)

//   const cancelled = await Meeting.findByIdAndUpdate(
//     id,
//     { $set: { status: 'cancelled' } },
//     { new: true },
//   ).lean()

//   if (!cancelled) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')
//   return NextResponse.json({ message: 'Meeting cancelled successfully' })
// })

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { updateMeetingSchema } from '@/schemas/meeting.schemas'
import Meeting from '@/models/Meeting'
import { Types } from 'mongoose'
import { serialize } from '@/lib/serialize'
import { getHybridSession } from '@/lib/hybrid-auth'
import { sendFcmToUser } from '@/lib/firebase-admin'

async function getMeetingOrThrow(id: string, userId: string) {
  if (!id || id === 'undefined')
    throw new ApiError(400, 'BAD_REQUEST', 'Meeting ID is required')
  const meeting = await Meeting.findById(id)
    .populate('assignedTo', 'name email image')
    .lean()
  if (!meeting) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((meeting as any).createdBy.toString() !== userId)
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You do not have access to this meeting',
    )
  return meeting
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fcmTargetsFor(meeting: Record<string, any>): string[] {
  const assignedIds = Array.isArray(meeting.assignedTo)
    ? meeting.assignedTo.map((u: { id?: string; toString: () => string }) =>
        typeof u === 'object' && u.id ? u.id : u.toString(),
      )
    : []
  return Array.from(new Set([...assignedIds, meeting.createdBy.toString()]))
}

export const GET = withErrorHandler(async (req, ctx) => {
  const session = await getHybridSession(req)
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const { id } = await ctx.params
  await connectToDatabase()

  const isAdmin = session.user.isAdmin || session.user.isSuperAdmin

  if (isAdmin) {
    const meeting = await getMeetingOrThrow(id, session.user.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json(serialize(meeting as Record<string, any>))
  }

  const meeting = await Meeting.findOne({
    _id: id,
    assignedTo: new Types.ObjectId(session.user.id),
  })
    .populate('assignedTo', 'name email image')
    .lean()
  if (!meeting) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json(serialize(meeting as Record<string, any>))
})

export const PATCH = withErrorHandler(async (req, ctx) => {
  const session = await getHybridSession(req)
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  if (!session.user.isAdmin && !session.user.isSuperAdmin)
    throw new ApiError(403, 'FORBIDDEN', 'Only admins can edit meetings')

  const { id } = await ctx.params
  const body = await req.json()

  const parsed = updateMeetingSchema.safeParse(body)
  if (!parsed.success)
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Invalid request body',
      parsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    )

  await connectToDatabase()
  await getMeetingOrThrow(id, session.user.id)

  const updateData = {
    ...parsed.data,
    ...(parsed.data.assignedTo && {
      assignedTo: parsed.data.assignedTo.map((uid) => new Types.ObjectId(uid)),
    }),
  }

  const updated = await Meeting.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true },
  )
    .populate('assignedTo', 'name email image')
    .lean()

  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedRecord = updated as Record<string, any>
  Promise.all(
    fcmTargetsFor(updatedRecord).map((uid) =>
      sendFcmToUser(uid, {
        title: 'Meeting updated',
        body: `"${updatedRecord.title}" was changed`,
        data: { type: 'meeting_changed', meetingId: id },
      }),
    ),
  ).catch((err) => console.error('FCM push failed (meeting update):', err))

  return NextResponse.json(serialize(updatedRecord))
})

export const DELETE = withErrorHandler(async (req, ctx) => {
  const session = await getHybridSession(req)
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  if (!session.user.isAdmin && !session.user.isSuperAdmin)
    throw new ApiError(403, 'FORBIDDEN', 'Only admins can cancel meetings')

  const { id } = await ctx.params
  await connectToDatabase()
  const existing = await getMeetingOrThrow(id, session.user.id)

  const cancelled = await Meeting.findByIdAndUpdate(
    id,
    { $set: { status: 'cancelled' } },
    { new: true },
  ).lean()

  if (!cancelled) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const existingRecord = existing as Record<string, any>
  Promise.all(
    fcmTargetsFor(existingRecord).map((uid) =>
      sendFcmToUser(uid, {
        title: 'Meeting cancelled',
        body: `"${existingRecord.title}" was cancelled`,
        data: { type: 'meeting_changed', meetingId: id },
      }),
    ),
  ).catch((err) => console.error('FCM push failed (meeting cancel):', err))

  return NextResponse.json({ message: 'Meeting cancelled successfully' })
})
