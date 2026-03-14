import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { auth } from '@/lib/auth'
import { connectToDatabase } from '@/lib/db'
import { ApiError, withErrorHandler } from '@/lib/api-error'
import Meeting from '@/models/Meeting'
import Task from '@/models/Task'
import Program from '@/models/Program'

// Typed lean shapes — only the fields we .select()
interface LeanMeeting {
  _id: Types.ObjectId
  title: string
  participants: string[]
  location?: string
  status: string
  date: string
  startTime?: string
  createdAt: Date
}

interface LeanTask {
  _id: Types.ObjectId
  title: string
  assignedTo?: string
  priority?: string
  status: string
  dueDate?: string
  createdAt: Date
}

interface LeanProgram {
  _id: Types.ObjectId
  title: string
  participants: string[]
  scheduleType?: string
  status: string
  startDate?: string
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

export const GET = withErrorHandler(async () => {
  const session = await auth()
  if (!session?.user?.id)
    throw new ApiError(401, 'UNAUTHORIZED', 'You must be signed in')

  await connectToDatabase()

  const uid = session.user.id

  const [
    upcomingMeetings,
    openTasks,
    overdueTasks,
    activePrograms,
    recentMeetings,
    recentTasks,
    recentPrograms,
  ] = await Promise.all([
    Meeting.countDocuments({ createdBy: uid, status: 'upcoming' }),
    Task.countDocuments({
      createdBy: uid,
      status: { $in: ['todo', 'in_progress'] },
    }),
    Task.countDocuments({ createdBy: uid, status: 'overdue' }),
    Program.countDocuments({ createdBy: uid, status: 'active' }),

    Meeting.find({ createdBy: uid })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('title participants location status date startTime createdAt')
      .lean<LeanMeeting[]>(),

    Task.find({ createdBy: uid })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('title assignedTo priority status dueDate createdAt')
      .lean<LeanTask[]>(),

    Program.find({ createdBy: uid })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('title participants scheduleType status startDate createdAt')
      .lean<LeanProgram[]>(),
  ])

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
    subtitle: doc.assignedTo ? `Assigned to ${doc.assignedTo}` : 'No assignee',
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
