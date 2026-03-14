// route: GET /api/v1/analytics?range=7d|30d|90d

import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import Meeting from '@/models/Meeting'
import Task from '@/models/Task'
import Program from '@/models/Program'

function getRangeStart(range: string): Date {
  const now = new Date()
  const days = range === '7d' ? 7 : range === '90d' ? 90 : 30
  now.setDate(now.getDate() - days)
  now.setHours(0, 0, 0, 0)
  return now
}

function groupLabel(range: string, date: Date): string {
  if (range === '90d') {
    return date.toLocaleString('default', { month: 'short', year: '2-digit' })
  }
  // Week label e.g. "Mar 10"
  return date.toLocaleString('default', { month: 'short', day: 'numeric' })
}

function buildWeekBuckets(
  rangeStart: Date,
  range: string,
): { label: string; start: Date; end: Date }[] {
  const buckets: { label: string; start: Date; end: Date }[] = []
  const now = new Date()

  if (range === '90d') {
    // Monthly buckets
    const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1)
    while (cursor <= now) {
      const start = new Date(cursor)
      const end = new Date(
        cursor.getFullYear(),
        cursor.getMonth() + 1,
        0,
        23,
        59,
        59,
      )
      buckets.push({ label: groupLabel(range, start), start, end })
      cursor.setMonth(cursor.getMonth() + 1)
    }
  } else {
    // Weekly buckets (7-day chunks)
    const cursor = new Date(rangeStart)
    while (cursor <= now) {
      const start = new Date(cursor)
      const end = new Date(cursor)
      end.setDate(end.getDate() + 6)
      end.setHours(23, 59, 59)
      if (end > now) end.setTime(now.getTime())
      buckets.push({
        label: groupLabel(range, start),
        start,
        end: new Date(end),
      })
      cursor.setDate(cursor.getDate() + 7)
    }
  }
  return buckets
}

export const GET = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const url = new URL(req.url)
  const range = ['7d', '30d', '90d'].includes(
    url.searchParams.get('range') ?? '',
  )
    ? (url.searchParams.get('range') as string)
    : '30d'

  await connectToDatabase()
  const uid = new Types.ObjectId(session.user.id)
  const rangeStart = getRangeStart(range)
  const buckets = buildWeekBuckets(rangeStart, range)

  // ── Task completion ────────────────────────────────────────────────────────
  const allTasks = await Task.find({
    createdBy: uid,
    createdAt: { $gte: rangeStart },
  })
    .select('status createdAt')
    .lean()

  const taskCompletion = buckets.map(({ label, start, end }) => {
    const inBucket = allTasks.filter((t) => {
      const d = new Date(t.createdAt)
      return d >= start && d <= end
    })
    return {
      period: label,
      completed: inBucket.filter((t) => t.status === 'completed').length,
      total: inBucket.length,
    }
  })

  // ── Meeting frequency ──────────────────────────────────────────────────────
  const allMeetings = await Meeting.find({
    createdBy: uid,
    createdAt: { $gte: rangeStart },
  })
    .select('priority createdAt')
    .lean()

  const meetingFrequency = buckets.map(({ label, start, end }) => {
    const inBucket = allMeetings.filter((m) => {
      const d = new Date(m.createdAt)
      return d >= start && d <= end
    })
    return {
      period: label,
      total: inBucket.length,
      high: inBucket.filter((m) => m.priority === 'high').length,
    }
  })

  // ── Program summary (overall counts by status) ─────────────────────────────
  const programCounts = await Program.aggregate([
    { $match: { createdBy: uid } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])
  const programSummary = ['upcoming', 'active', 'completed', 'cancelled'].map(
    (s) => ({
      status: s,
      count: programCounts.find((p) => p._id === s)?.count ?? 0,
    }),
  )

  // ── Overdue trend ──────────────────────────────────────────────────────────
  const allTasksForTrend = await Task.find({
    createdBy: uid,
    createdAt: { $gte: rangeStart },
  })
    .select('status dueDate createdAt')
    .lean()

  const overdueTrend = buckets.map(({ label, start, end }) => {
    const inBucket = allTasksForTrend.filter((t) => {
      const d = new Date(t.createdAt)
      return d >= start && d <= end
    })
    return {
      period: label,
      overdue: inBucket.filter((t) => t.status === 'overdue').length,
      completed: inBucket.filter((t) => t.status === 'completed').length,
    }
  })

  return NextResponse.json({
    taskCompletion,
    meetingFrequency,
    programSummary,
    overdueTrend,
    range,
  })
})
