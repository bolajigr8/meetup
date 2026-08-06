// import { NextResponse } from 'next/server'
// import { auth } from '@/lib/auth'
// import { connectToDatabase } from '@/lib/db'
// import { ApiError, withErrorHandler } from '@/lib/api-error'
// import {
//   createMeetingSchema,
//   listMeetingsQuerySchema,
// } from '@/schemas/meeting.schemas'
// import Meeting from '@/models/Meeting'
// import { Types } from 'mongoose'
// import { serialize } from '@/lib/serialize'

// export const GET = withErrorHandler(async (req) => {
//   const session = await auth()
//   if (!session?.user?.id)
//     throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

//   const url = new URL(req.url)
//   const queryParsed = listMeetingsQuerySchema.safeParse({
//     status: url.searchParams.get('status') ?? 'all',
//     page: url.searchParams.get('page') ?? 1,
//     limit: url.searchParams.get('limit') ?? 20,
//   })

//   if (!queryParsed.success)
//     throw new ApiError(
//       400,
//       'VALIDATION_ERROR',
//       'Invalid query parameters',
//       queryParsed.error.issues.map((e) => ({
//         field: e.path.join('.'),
//         message: e.message,
//       })),
//     )

//   const { status, page, limit } = queryParsed.data
//   await connectToDatabase()

//   const uid = new Types.ObjectId(session.user.id)
//   const isAdmin = session.user.isAdmin || session.user.isSuperAdmin

//   const filter: Record<string, unknown> = isAdmin
//     ? { createdBy: uid }
//     : { assignedTo: uid }

//   if (status !== 'all') filter.status = status

//   const [meetings, total] = await Promise.all([
//     Meeting.find(filter)
//       .sort({ date: 1, startTime: 1 })
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .populate('assignedTo', 'name email image')
//       .lean(),
//     Meeting.countDocuments(filter),
//   ])

//   return NextResponse.json({
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     data: meetings.map((m) => serialize(m as Record<string, any>)),
//     meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
//   })
// })

// export const POST = withErrorHandler(async (req) => {
//   const session = await auth()
//   if (!session?.user?.id)
//     throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
//   if (!session.user.isAdmin && !session.user.isSuperAdmin)
//     throw new ApiError(403, 'FORBIDDEN', 'Only admins can create meetings')

//   const body = await req.json()
//   const parsed = createMeetingSchema.safeParse(body)
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

//   const meeting = await Meeting.create({
//     ...parsed.data,
//     assignedTo: parsed.data.assignedTo.map((id) => new Types.ObjectId(id)),
//     createdBy: session.user.id,
//     status: 'upcoming',
//   })

//   return NextResponse.json(serialize(meeting.toObject()), { status: 201 })
// })
import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import {
  createMeetingSchema,
  listMeetingsQuerySchema,
} from '@/schemas/meeting.schemas'
import Meeting from '@/models/Meeting'
import { Types } from 'mongoose'
import { serialize } from '@/lib/serialize'
import { getHybridSession } from '@/lib/hybrid-auth'
import { sendFcmToUser } from '@/lib/firebase-admin'

export const GET = withErrorHandler(async (req) => {
  const session = await getHybridSession(req)
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const url = new URL(req.url)
  const queryParsed = listMeetingsQuerySchema.safeParse({
    status: url.searchParams.get('status') ?? 'all',
    page: url.searchParams.get('page') ?? 1,
    limit: url.searchParams.get('limit') ?? 20,
  })

  if (!queryParsed.success)
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Invalid query parameters',
      queryParsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    )

  const { status, page, limit } = queryParsed.data
  await connectToDatabase()

  const uid = new Types.ObjectId(session.user.id)
  const isAdmin = session.user.isAdmin || session.user.isSuperAdmin

  const filter: Record<string, unknown> = isAdmin
    ? { createdBy: uid }
    : { assignedTo: uid }

  if (status !== 'all') filter.status = status

  const [meetings, total] = await Promise.all([
    Meeting.find(filter)
      .sort({ date: 1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('assignedTo', 'name email image')
      .lean(),
    Meeting.countDocuments(filter),
  ])

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: meetings.map((m) => serialize(m as Record<string, any>)),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })
})

export const POST = withErrorHandler(async (req) => {
  const session = await getHybridSession(req)
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  if (!session.user.isAdmin && !session.user.isSuperAdmin)
    throw new ApiError(403, 'FORBIDDEN', 'Only admins can create meetings')

  const body = await req.json()
  const parsed = createMeetingSchema.safeParse(body)
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

  const meeting = await Meeting.create({
    ...parsed.data,
    assignedTo: parsed.data.assignedTo.map((id) => new Types.ObjectId(id)),
    createdBy: session.user.id,
    status: 'upcoming',
  })

  // Fire-and-forget FCM push so the Flutter app can resync + reschedule its
  // local alarm immediately, instead of waiting for the next app open.
  // Never blocks or fails the actual API response.
  const fcmTargets = Array.from(
    new Set([...parsed.data.assignedTo, session.user.id]),
  )
  Promise.all(
    fcmTargets.map((uid) =>
      sendFcmToUser(uid, {
        title: 'New meeting',
        body: `"${meeting.title}" was scheduled for ${meeting.date} ${meeting.startTime} WAT`,
        data: { type: 'meeting_changed', meetingId: meeting._id.toString() },
      }),
    ),
  ).catch((err) => console.error('FCM push failed (meeting create):', err))

  return NextResponse.json(serialize(meeting.toObject()), { status: 201 })
})
