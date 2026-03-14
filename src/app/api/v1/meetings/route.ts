import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import {
  createMeetingSchema,
  listMeetingsQuerySchema,
} from '@/schemas/meeting.schemas'
import Meeting from '@/models/Meeting'

// ─── Serializer: _id → id ─────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(doc: Record<string, any>) {
  const { _id, __v, ...rest } = doc
  return { id: (_id as { toString(): string }).toString(), ...rest }
}

// ─── GET /api/v1/meetings ─────────────────────────────────────────────────────

export const GET = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  }

  const url = new URL(req.url)
  const queryParsed = listMeetingsQuerySchema.safeParse({
    status: url.searchParams.get('status') ?? 'all',
    page: url.searchParams.get('page') ?? 1,
    limit: url.searchParams.get('limit') ?? 20,
  })

  if (!queryParsed.success) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Invalid query parameters',
      queryParsed.error.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    )
  }

  const { status, page, limit } = queryParsed.data

  await connectToDatabase()

  const filter: Record<string, unknown> = { createdBy: session.user.id }
  if (status !== 'all') filter.status = status

  const [meetings, total] = await Promise.all([
    Meeting.find(filter)
      .sort({ date: 1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Meeting.countDocuments(filter),
  ])

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: meetings.map((m) => serialize(m as Record<string, any>)),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  })
})

// ─── POST /api/v1/meetings ────────────────────────────────────────────────────

export const POST = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id) {
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  }

  const body = await req.json()

  const parsed = createMeetingSchema.safeParse(body)
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

  const meeting = await Meeting.create({
    ...parsed.data,
    createdBy: session.user.id,
    status: 'upcoming',
  })

  return NextResponse.json(serialize(meeting.toObject()), { status: 201 })
})
