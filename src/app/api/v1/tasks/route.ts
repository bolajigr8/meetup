// src/app/api/v1/tasks/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import { createTaskSchema, listTasksQuerySchema } from '@/schemas/task.schemas'
import Task from '@/models/Task'
import { Types } from 'mongoose'

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
  const queryParsed = listTasksQuerySchema.safeParse({
    status: url.searchParams.get('status') ?? 'all',
    priority: url.searchParams.get('priority') ?? 'all',
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

  const { status, priority, page, limit } = queryParsed.data
  await connectToDatabase()

  const uid = new Types.ObjectId(session.user.id)
  const isAdmin = session.user.isAdmin || session.user.isSuperAdmin

  const filter: Record<string, unknown> = isAdmin
    ? { createdBy: uid }
    : { assignedTo: uid }

  if (status !== 'all') filter.status = status
  if (priority !== 'all') filter.priority = priority

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort({ dueDate: 1, priority: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('assignedTo', 'name email image')
      .lean(),
    Task.countDocuments(filter),
  ])

  return NextResponse.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: tasks.map((t) => serialize(t as Record<string, any>)),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  })
})

export const POST = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')
  if (!session.user.isAdmin && !session.user.isSuperAdmin)
    throw new ApiError(403, 'FORBIDDEN', 'Only admins can create tasks')

  const body = await req.json()
  const parsed = createTaskSchema.safeParse(body)
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

  const task = await Task.create({
    ...parsed.data,
    assignedToEmail: parsed.data.assignedToEmail || undefined,
    assignedTo: parsed.data.assignedTo.map((id) => new Types.ObjectId(id)),
    createdBy: session.user.id,
    status: 'todo',
  })

  return NextResponse.json(serialize(task.toObject()), { status: 201 })
})
