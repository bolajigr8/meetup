import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import Meeting from '@/models/Meeting'
import Task from '@/models/Task'
import Program from '@/models/Program'
import { isMeetingPast, isTaskPast, isProgramPast } from '@/lib/date-helpers'

// Literal-typed lean shapes matching the actual Mongoose schema enums exactly
// (status/dueDate are required, non-optional fields at the DB level) — this
// is what date-helpers.ts's MeetingLike/TaskLike/ProgramLike expect.

interface LeanMeeting {
  _id: Types.ObjectId
  title: string
  participants: string[]
  location?: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  date: string
  startTime: string
  endTime: string
  createdAt: Date
}

interface LeanTask {
  _id: Types.ObjectId
  title: string
  assignedToEmail?: string
  priority?: string
  status: 'todo' | 'in_progress' | 'completed' | 'overdue'
  dueDate: string
  createdAt: Date
}

interface LeanProgram {
  _id: Types.ObjectId
  title: string
  participants: string[]
  scheduleType?: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  startDate: string
  endDate: string
  createdAt: Date
}

type ActivityRaw = {
  id: string
  type: 'meeting' | 'task' | 'program'
  title: string
  subtitle: string
  time: string
  status: string
  priority?: string
  createdAt: Date
}

// How many recent docs per type to pull before filtering out past items —
// wider than the final display count (4) so we still have enough left
// after excluding anything whose date has already passed.
const RECENT_FETCH_LIMIT = 15
const RECENT_DISPLAY_LIMIT = 4

export const GET = withErrorHandler(async () => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  await connectToDatabase()

  const uid = session.user.id
  const isAdmin = session.user.isAdmin || session.user.isSuperAdmin

  // Admins see items they created; regular users see items assigned to them
  const meetingFilter = isAdmin
    ? { createdBy: new Types.ObjectId(uid) }
    : { assignedTo: new Types.ObjectId(uid) }

  const taskFilter = isAdmin
    ? { createdBy: new Types.ObjectId(uid) }
    : { assignedTo: new Types.ObjectId(uid) }

  const programFilter = isAdmin
    ? { createdBy: new Types.ObjectId(uid) }
    : { assignedTo: new Types.ObjectId(uid) }

  const [
    meetingsForStats,
    openTasksForStats,
    overdueTasks,
    programsForStats,
    recentMeetingsRaw,
    recentTasksRaw,
    recentProgramsRaw,
  ] = await Promise.all([
    // Fetch candidate "upcoming/ongoing" meetings, then confirm with live
    // date logic rather than trusting the stored status alone — this stays
    // correct even if the cron job hasn't run since the meeting ended.
    Meeting.find({ ...meetingFilter, status: { $in: ['upcoming', 'ongoing'] } })
      .select('date startTime endTime status')
      .lean<Pick<LeanMeeting, 'date' | 'startTime' | 'endTime' | 'status'>[]>(),

    // "Open" tasks = not completed. Overdue tasks intentionally stay counted
    // here too (they're still open/actionable, just late).
    Task.find({
      ...taskFilter,
      status: { $in: ['todo', 'in_progress', 'overdue'] },
    })
      .select('dueDate status')
      .lean<Pick<LeanTask, 'dueDate' | 'status'>[]>(),

    // Plain status count — a dedicated "needs attention" warning stat, not a
    // date-filtered "past" bucket.
    Task.countDocuments({ ...taskFilter, status: 'overdue' }),

    Program.find({ ...programFilter, status: 'active' })
      .select('startDate endDate status')
      .lean<Pick<LeanProgram, 'startDate' | 'endDate' | 'status'>[]>(),

    Meeting.find(meetingFilter)
      .sort({ createdAt: -1 })
      .limit(RECENT_FETCH_LIMIT)
      .select(
        'title participants location status date startTime endTime createdAt',
      )
      .lean<LeanMeeting[]>(),

    Task.find(taskFilter)
      .sort({ createdAt: -1 })
      .limit(RECENT_FETCH_LIMIT)
      .select('title assignedToEmail priority status dueDate createdAt')
      .lean<LeanTask[]>(),

    Program.find(programFilter)
      .sort({ createdAt: -1 })
      .limit(RECENT_FETCH_LIMIT)
      .select(
        'title participants scheduleType status startDate endDate createdAt',
      )
      .lean<LeanProgram[]>(),
  ])

  // ── Stats — confirmed against live dates, not just stored status ──────────
  const upcomingMeetings = meetingsForStats.filter(
    (m) => m.status === 'upcoming' && !isMeetingPast(m),
  ).length

  // Open tasks = everything not completed. Overdue tasks are deliberately
  // included (per product decision: they stay visible/actionable, not archived).
  const openTasks = openTasksForStats.length

  const activePrograms = programsForStats.filter(
    (p) => !isProgramPast(p),
  ).length

  // ── Recent activity — exclude anything whose date has already passed ──────
  const recentMeetings = recentMeetingsRaw
    .filter((m) => !isMeetingPast(m))
    .slice(0, RECENT_DISPLAY_LIMIT)

  const recentTasks = recentTasksRaw
    .filter((t) => !isTaskPast(t))
    .slice(0, RECENT_DISPLAY_LIMIT)

  const recentPrograms = recentProgramsRaw
    .filter((p) => !isProgramPast(p))
    .slice(0, RECENT_DISPLAY_LIMIT)

  const meetingActivity: ActivityRaw[] = recentMeetings.map((doc) => {
    const count = doc.participants?.length ?? 0
    return {
      id: doc._id.toString(),
      type: 'meeting',
      title: doc.title,
      subtitle: `${count} participant${count !== 1 ? 's' : ''}${doc.location ? ' · ' + doc.location : ''}`,
      time: doc.date
        ? `${doc.date}${doc.startTime ? ' ' + doc.startTime : ''}`.trim()
        : 'Scheduled',
      status: doc.status,
      createdAt: doc.createdAt,
    }
  })

  const taskActivity: ActivityRaw[] = recentTasks.map((doc) => ({
    id: doc._id.toString(),
    type: 'task' as const,
    title: doc.title,
    subtitle: doc.assignedToEmail
      ? `Assigned to ${doc.assignedToEmail}`
      : 'No assignee',
    time: doc.dueDate ? `Due ${doc.dueDate}` : 'No due date',
    status: doc.status,
    priority: doc.priority,
    createdAt: doc.createdAt,
  }))

  const programActivity: ActivityRaw[] = recentPrograms.map((doc) => {
    const count = doc.participants?.length ?? 0
    return {
      id: doc._id.toString(),
      type: 'program' as const,
      title: doc.title,
      subtitle: `${count} participant${count !== 1 ? 's' : ''}${doc.scheduleType ? ' · ' + doc.scheduleType : ''}`,
      time: doc.startDate ? `Starts ${doc.startDate}` : 'Upcoming',
      status: doc.status,
      createdAt: doc.createdAt,
    }
  })

  const activity = [...meetingActivity, ...taskActivity, ...programActivity]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 8)
    .map(({ createdAt: _c, ...rest }) => rest)

  return NextResponse.json({
    stats: { upcomingMeetings, openTasks, overdueTasks, activePrograms },
    activity,
  })
})
