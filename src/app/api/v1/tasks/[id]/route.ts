import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { updateTaskSchema } from '@/schemas/task.schemas'
import Task from '@/models/Task'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(doc: Record<string, any>) {
  const { _id, __v, ...rest } = doc
  return { id: (_id as { toString(): string }).toString(), ...rest }
}

async function getTaskOrThrow(id: string, userId: string) {
  if (!id || id === 'undefined')
    throw new ApiError(400, 'BAD_REQUEST', 'Task ID is required')
  const task = await Task.findById(id).lean()
  if (!task) throw new ApiError(404, 'NOT_FOUND', 'Task not found')
  if (task.createdBy.toString() !== userId) {
    throw new ApiError(403, 'FORBIDDEN', 'You do not have access to this task')
  }
  return task
}

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const { id } = await ctx.params
  await connectToDatabase()
  const task = await getTaskOrThrow(id, session.user.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json(serialize(task as Record<string, any>))
})

export const PATCH = withErrorHandler(async (req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const { id } = await ctx.params
  const body = await req.json()

  const parsed = updateTaskSchema.safeParse(body)
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
  await getTaskOrThrow(id, session.user.id)

  const updated = await Task.findByIdAndUpdate(
    id,
    { $set: parsed.data },
    { new: true, runValidators: true },
  ).lean()

  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Task not found')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json(serialize(updated as Record<string, any>))
})

// Hard delete for tasks (no soft-delete — tasks are owned actions, not calendar events)
export const DELETE = withErrorHandler(async (_req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const { id } = await ctx.params
  await connectToDatabase()
  await getTaskOrThrow(id, session.user.id)

  await Task.findByIdAndDelete(id)

  return NextResponse.json({ message: 'Task deleted successfully' })
})
