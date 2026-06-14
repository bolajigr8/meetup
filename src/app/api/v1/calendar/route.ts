// route: GET /api/v1/calendar?year=&month=

import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import Meeting from '@/models/Meeting'
import Program from '@/models/Program'

interface LeanMeeting {
  _id: Types.ObjectId
  title: string
  date: string
  startTime?: string
  endTime?: string
  location?: string
  participants: string[]
  priority: string
  status: string
}

interface LeanProgram {
  _id: Types.ObjectId
  title: string
  startDate: string
  endDate: string
  scheduleType: string
  participants: string[]
  status: string
}

export const GET = withErrorHandler(async (req) => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  const url = new URL(req.url)
  const year = parseInt(
    url.searchParams.get('year') ?? String(new Date().getFullYear()),
  )
  const month = parseInt(
    url.searchParams.get('month') ?? String(new Date().getMonth() + 1),
  )

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
    throw new ApiError(400, 'BAD_REQUEST', 'Invalid year or month')
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  const monthStr = pad(month)
  const lastDay = new Date(year, month, 0).getDate()
  const rangeStart = `${year}-${monthStr}-01`
  const rangeEnd = `${year}-${monthStr}-${pad(lastDay)}`

  await connectToDatabase()
  const uid = new Types.ObjectId(session.user.id)
  const isAdmin = session.user.isAdmin || session.user.isSuperAdmin

  // Admins see what they created; users see what's assigned to them
  const meetingFilter = isAdmin
    ? {
        createdBy: uid,
        date: { $gte: rangeStart, $lte: rangeEnd },
        status: { $ne: 'cancelled' },
      }
    : {
        assignedTo: uid,
        date: { $gte: rangeStart, $lte: rangeEnd },
        status: { $ne: 'cancelled' },
      }

  const programFilter = isAdmin
    ? {
        createdBy: uid,
        startDate: { $lte: rangeEnd },
        endDate: { $gte: rangeStart },
        status: { $ne: 'cancelled' },
      }
    : {
        assignedTo: uid,
        startDate: { $lte: rangeEnd },
        endDate: { $gte: rangeStart },
        status: { $ne: 'cancelled' },
      }

  const [meetings, programs] = await Promise.all([
    Meeting.find(meetingFilter)
      .select(
        'title date startTime endTime location participants priority status',
      )
      .lean<LeanMeeting[]>(),

    Program.find(programFilter)
      .select('title startDate endDate scheduleType participants status')
      .lean<LeanProgram[]>(),
  ])

  const meetingEvents = meetings.map((m) => ({
    id: m._id.toString(),
    type: 'meeting' as const,
    title: m.title,
    date: m.date,
    startTime: m.startTime,
    endTime: m.endTime,
    location: m.location,
    participantCount: m.participants?.length ?? 0,
    priority: m.priority,
    status: m.status,
  }))

  const programEvents = programs.map((p) => ({
    id: p._id.toString(),
    type: 'program' as const,
    title: p.title,
    startDate: p.startDate,
    endDate: p.endDate,
    scheduleType: p.scheduleType,
    participantCount: p.participants?.length ?? 0,
    status: p.status,
  }))

  return NextResponse.json({ meetings: meetingEvents, programs: programEvents })
})
