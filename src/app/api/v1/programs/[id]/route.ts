import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { updateProgramSchema } from '@/schemas/program.schemas'
import Program from '@/models/Program'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(doc: Record<string, any>) {
  const { _id, __v, ...rest } = doc
  return { id: (_id as { toString(): string }).toString(), ...rest }
}

async function getProgramOrThrow(id: string, userId: string) {
  if (!id || id === 'undefined')
    throw new ApiError(400, 'BAD_REQUEST', 'Program ID is required')
  const program = await Program.findById(id).lean()
  if (!program) throw new ApiError(404, 'NOT_FOUND', 'Program not found')
  if (program.createdBy.toString() !== userId) {
    throw new ApiError(
      403,
      'FORBIDDEN',
      'You do not have access to this program',
    )
  }
  return program
}

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const { id } = await ctx.params
  await connectToDatabase()
  const program = await getProgramOrThrow(id, session.user.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json(serialize(program as Record<string, any>))
})

export const PATCH = withErrorHandler(async (req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const { id } = await ctx.params
  const body = await req.json()

  const parsed = updateProgramSchema.safeParse(body)
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
  await getProgramOrThrow(id, session.user.id)

  const updated = await Program.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true, runValidators: true },
  ).lean()

  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Program not found')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json(serialize(updated as Record<string, any>))
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const { id } = await ctx.params
  await connectToDatabase()
  await getProgramOrThrow(id, session.user.id)

  const cancelled = await Program.findByIdAndUpdate(
    id,
    { $set: { status: 'cancelled' } },
    { new: true },
  ).lean()

  if (!cancelled) throw new ApiError(404, 'NOT_FOUND', 'Program not found')

  return NextResponse.json({ message: 'Program cancelled successfully' })
})
