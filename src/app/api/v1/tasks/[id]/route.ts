import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { updateTaskSchema } from '@/schemas/task.schemas'
import Task from '@/models/Task'
import { Types } from 'mongoose'
import { serialize } from '@/lib/serialize'

async function getTaskOrThrow(id: string, userId: string) {
  if (!id || id === 'undefined')
    throw new ApiError(400, 'BAD_REQUEST', 'Task ID is required')
  const task = await Task.findById(id)
    .populate('assignedTo', 'name email image')
    .lean()
  if (!task) throw new ApiError(404, 'NOT_FOUND', 'Task not found')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((task as any).createdBy.toString() !== userId)
    throw new ApiError(403, 'FORBIDDEN', 'You do not have access to this task')
  return task
}

export const GET = withErrorHandler(async (_req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const { id } = await ctx.params
  await connectToDatabase()

  const isAdmin = session.user.isAdmin || session.user.isSuperAdmin

  if (isAdmin) {
    const task = await getTaskOrThrow(id, session.user.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json(serialize(task as Record<string, any>))
  }

  const task = await Task.findOne({
    _id: id,
    assignedTo: new Types.ObjectId(session.user.id),
  })
    .populate('assignedTo', 'name email image')
    .lean()
  if (!task) throw new ApiError(404, 'NOT_FOUND', 'Task not found')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json(serialize(task as Record<string, any>))
})

export const PATCH = withErrorHandler(async (req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  if (!session.user.isAdmin && !session.user.isSuperAdmin)
    throw new ApiError(403, 'FORBIDDEN', 'Only admins can edit tasks')

  const { id } = await ctx.params
  const body = await req.json()
  const parsed = updateTaskSchema.safeParse(body)
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
  await getTaskOrThrow(id, session.user.id)

  const updateData = {
    ...parsed.data,
    ...(parsed.data.assignedTo && {
      assignedTo: parsed.data.assignedTo.map((uid) => new Types.ObjectId(uid)),
    }),
  }

  const updated = await Task.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true },
  )
    .populate('assignedTo', 'name email image')
    .lean()

  if (!updated) throw new ApiError(404, 'NOT_FOUND', 'Task not found')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return NextResponse.json(serialize(updated as Record<string, any>))
})

export const DELETE = withErrorHandler(async (_req, ctx) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  if (!session.user.isAdmin && !session.user.isSuperAdmin)
    throw new ApiError(403, 'FORBIDDEN', 'Only admins can delete tasks')

  const { id } = await ctx.params
  await connectToDatabase()
  await getTaskOrThrow(id, session.user.id)
  await Task.findByIdAndDelete(id)
  return NextResponse.json({ message: 'Task deleted successfully' })
})
