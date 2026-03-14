import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import {
  createProgramSchema,
  listProgramsQuerySchema,
} from '@/schemas/program.schemas'
import Program from '@/models/Program'
import { auth } from '@/lib/auth'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(doc: Record<string, any>) {
  const { _id, __v, ...rest } = doc
  return { id: (_id as { toString(): string }).toString(), ...rest }
}

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

  const [programs, total] = await Promise.all([
    Program.find(filter)
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
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

  const body = await req.json()
  const parsed = createProgramSchema.safeParse(body)

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

  const program = await Program.create({
    ...parsed.data,
    createdBy: session.user.id,
    status: 'upcoming',
  })

  return NextResponse.json(serialize(program.toObject()), { status: 201 })
})
