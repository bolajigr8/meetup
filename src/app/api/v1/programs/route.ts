import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import {
  createProgramSchema,
  listProgramsQuerySchema,
} from '@/schemas/program.schemas'
import Program from '@/models/Program'
import { Types } from 'mongoose'
import { serialize } from '@/lib/serialize'

export const GET = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const url = new URL(req.url)
  const queryParsed = listProgramsQuerySchema.safeParse({
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

  const [programs, total] = await Promise.all([
    Program.find(filter)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('assignedTo', 'name email image')
      .lean(),
    Program.countDocuments(filter),
  ])

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: programs.map((p) => serialize(p as Record<string, any>)),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })
})

export const POST = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  if (!session.user.isAdmin && !session.user.isSuperAdmin)
    throw new ApiError(403, 'FORBIDDEN', 'Only admins can create programs')

  const body = await req.json()
  const parsed = createProgramSchema.safeParse(body)
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

  const program = await Program.create({
    ...parsed.data,
    assignedTo: parsed.data.assignedTo.map((id) => new Types.ObjectId(id)),
    createdBy: session.user.id,
    status: 'upcoming',
  })

  return NextResponse.json(serialize(program.toObject()), { status: 201 })
})
