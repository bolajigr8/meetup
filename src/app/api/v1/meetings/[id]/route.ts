import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { updateMeetingSchema } from '@/schemas/meeting.schemas'
import Meeting from '@/models/Meeting'
import { auth } from '@/lib/auth'

// ─── Serializer: _id → id ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(doc: Record<string, any>) {
  const { _id, __v, ...rest } = doc
  return { id: (_id as { toString(): string }).toString(), ...rest }
}

// ─── Shared: fetch & authorise ────────────────────────────────────────────────

async function getMeetingOrThrow(id: string, userId: string) {
  if (!id || id === 'undefined') {
    throw new ApiError(400, 'BAD_REQUEST', 'Meeting ID is required')
  }

  const meeting = await Meeting.findById(id).lean()
  if (!meeting) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')
  if (meeting.createdBy.toString() !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You do not have access to this meeting',
    )
  }
  return meeting
}

// ─── GET /api/v1/meetings/[id] ────────────────────────────────────────────────

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  }

  const { id } = await ctx.params

  await connectToDatabase()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meeting = await getMeetingOrThrow(id, session.user.id)

  return NextResponse.json(serialize(meeting as Record<string, any>))
})

// ─── PATCH /api/v1/meetings/[id] ─────────────────────────────────────────────

export const PATCH = withErrorHandler(async (req, ctx) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  }

  const { id } = await ctx.params
  const body = await req.json()

  const parsed = updateMeetingSchema.safeParse(body)
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

  await getMeetingOrThrow(id, session.user.id)

  const updated = await Meeting.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true, runValidators: true },
  ).lean()

  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')

  return NextResponse.json(serialize(updated as Record<string, any>))
})

// ─── DELETE /api/v1/meetings/[id] ────────────────────────────────────────────
// Soft-delete: marks as cancelled rather than removing the document

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  }

  const { id } = await ctx.params

  await connectToDatabase()

  await getMeetingOrThrow(id, session.user.id)

  const cancelled = await Meeting.findByIdAndUpdate(
    id,
    { $set: { status: 'cancelled' } },
    { new: true },
  ).lean()

  if (!cancelled) throw new ApiError(404, 'NOT_FOUND', 'Meeting not found')

  return NextResponse.json({ message: 'Meeting cancelled successfully' })
})
