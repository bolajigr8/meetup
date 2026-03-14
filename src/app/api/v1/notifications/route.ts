// route: GET /api/v1/notifications  |  PATCH /api/v1/notifications (mark all read)

import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import Notification from '@/models/Notification'
import Meeting from '@/models/Meeting'
import Task from '@/models/Task'
import Program from '@/models/Program'

// ── Lazy notification generation ────────────────────────────────────────────
// Generates notifications for events that don't have one yet.
// Called on every GET so the inbox stays fresh without a cron job.

async function generateNotifications(userId: string) {
  const uid = new Types.ObjectId(userId)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const in2Days = new Date(today)
  in2Days.setDate(today.getDate() + 2)
  const in3Days = new Date(today)
  in3Days.setDate(today.getDate() + 3)

  const todayStr = fmt(today)
  const tomorrowStr = fmt(tomorrow)
  const in2DaysStr = fmt(in2Days)
  const in3DaysStr = fmt(in3Days)

  // ── Overdue tasks ──────────────────────────────────────────────────────────
  const overdueTasks = await Task.find({
    createdBy: uid,
    status: { $in: ['todo', 'in_progress'] },
    dueDate: { $lt: todayStr },
  })
    .select('_id title dueDate')
    .lean()

  // ── Tasks due tomorrow ─────────────────────────────────────────────────────
  const dueSoonTasks = await Task.find({
    createdBy: uid,
    status: { $in: ['todo', 'in_progress'] },
    dueDate: tomorrowStr,
  })
    .select('_id title dueDate')
    .lean()

  // ── Meetings in next 2 days ────────────────────────────────────────────────
  const upcomingMeetings = await Meeting.find({
    createdBy: uid,
    status: 'upcoming',
    date: { $in: [tomorrowStr, in2DaysStr] },
  })
    .select('_id title date startTime')
    .lean()

  // ── Programs starting in next 3 days ──────────────────────────────────────
  const startingPrograms = await Program.find({
    createdBy: uid,
    status: 'upcoming',
    startDate: { $in: [tomorrowStr, in2DaysStr, in3DaysStr] },
  })
    .select('_id title startDate')
    .lean()

  // Build notifications to upsert (avoid duplicates per entity per day)
  type NotifDoc = {
    userId: Types.ObjectId
    type: string
    title: string
    message: string
    entityId: Types.ObjectId
    entityType: string
  }

  const toUpsert: NotifDoc[] = []

  for (const task of overdueTasks) {
    toUpsert.push({
      userId: uid,
      type: 'task_overdue',
      title: 'Task overdue',
      message: `"${task.title}" was due on ${(task as any).dueDate} and is still incomplete.`,
      entityId: task._id as Types.ObjectId,
      entityType: 'task',
    })
  }

  for (const task of dueSoonTasks) {
    toUpsert.push({
      userId: uid,
      type: 'task_due_soon',
      title: 'Task due tomorrow',
      message: `"${task.title}" is due tomorrow. Make sure it's completed on time.`,
      entityId: task._id as Types.ObjectId,
      entityType: 'task',
    })
  }

  for (const meeting of upcomingMeetings) {
    const dayLabel =
      (meeting as any).date === tomorrowStr ? 'tomorrow' : 'in 2 days'
    toUpsert.push({
      userId: uid,
      type: 'meeting_reminder',
      title: 'Meeting reminder',
      message: `"${meeting.title}" is scheduled ${dayLabel}${(meeting as any).startTime ? ' at ' + (meeting as any).startTime : ''}.`,
      entityId: meeting._id as Types.ObjectId,
      entityType: 'meeting',
    })
  }

  for (const program of startingPrograms) {
    toUpsert.push({
      userId: uid,
      type: 'program_start',
      title: 'Program starting soon',
      message: `"${program.title}" starts on ${(program as any).startDate}. Participants should be ready.`,
      entityId: program._id as Types.ObjectId,
      entityType: 'program',
    })
  }

  // Upsert — one notification per entity (avoid flooding)
  await Promise.all(
    toUpsert.map((n) =>
      Notification.findOneAndUpdate(
        { userId: uid, entityId: n.entityId, type: n.type },
        { $setOnInsert: n },
        { upsert: true },
      ),
    ),
  )
}

// ── GET — list notifications ─────────────────────────────────────────────────
export const GET = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  await connectToDatabase()

  // Lazy-generate fresh notifications before returning
  await generateNotifications(session.user.id)

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(url.searchParams.get('limit') ?? '20'))

  const filter = { userId: session.user.id }

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: session.user.id, read: false }),
  ])

  return NextResponse.json({
    data: notifications.map((n) => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: (n._id as any).toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      entityId: n.entityId?.toString(),
      entityType: n.entityType,
      read: n.read,
      createdAt: n.createdAt,
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    },
  })
})

// ── PATCH — mark all as read ──────────────────────────────────────────────────
export const PATCH = withErrorHandler(async () => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  await connectToDatabase()
  await Notification.updateMany(
    { userId: session.user.id, read: false },
    { $set: { read: true } },
  )

  return NextResponse.json({ message: 'All notifications marked as read' })
})
