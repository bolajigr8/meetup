// route: GET /api/v1/cron/send-reminders
// Called every 15 minutes by cron-job.org
// Secured via Authorization: Bearer <CRON_SECRET>

import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import {
  sendMeetingReminderEmail,
  sendTaskReminderEmail,
  sendProgramReminderEmail,
} from '@/lib/mailer'
import Meeting from '@/models/Meeting'
import Task from '@/models/Task'
import Program from '@/models/Program'
import User from '@/models/User'
import ReminderLog from '@/models/ReminderLog'
import type { ReminderType } from '@/models/ReminderLog'

// ─── Auth guard ───────────────────────────────────────────────────────────────

function isAuthorized(req: Request): boolean {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return token === process.env.CRON_SECRET
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0')

/** Returns today and tomorrow as YYYY-MM-DD strings in WAT (UTC+1) */
function getWATDateStrings(): { todayStr: string; tomorrowStr: string } {
  // Shift UTC clock forward by 1 hour to get WAT wall time
  const nowWAT = new Date(Date.now() + 60 * 60 * 1000)

  const todayStr = `${nowWAT.getUTCFullYear()}-${pad(nowWAT.getUTCMonth() + 1)}-${pad(nowWAT.getUTCDate())}`

  const tmrWAT = new Date(nowWAT)
  tmrWAT.setUTCDate(nowWAT.getUTCDate() + 1)
  const tomorrowStr = `${tmrWAT.getUTCFullYear()}-${pad(tmrWAT.getUTCMonth() + 1)}-${pad(tmrWAT.getUTCDate())}`

  return { todayStr, tomorrowStr }
}

/**
 * Converts a WAT date string + time string into a UTC Date.
 * date:     "YYYY-MM-DD"
 * time:     "HH:mm"
 * WAT = UTC+1, so UTC = WAT - 1hr
 */
function watToUTC(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour - 1, minute))
}

/**
 * Checks whether `now` falls within ±WINDOW_MS of `targetTime`.
 * Used so we don't need the cron to fire at an exact second.
 * Window = 7 min  (half of 15-min cron interval, with 2 min safety margin)
 */
const WINDOW_MS = 7 * 60 * 1000

function inWindow(targetTime: Date, now: Date): boolean {
  return Math.abs(targetTime.getTime() - now.getTime()) <= WINDOW_MS
}

// ─── GET handler ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    const now = new Date()
    const { todayStr, tomorrowStr } = getWATDateStrings()

    const results = {
      meetingReminders: 0,
      taskReminders: 0,
      programReminders: 0,
      errors: [] as string[],
    }

    // ── Meetings ─────────────────────────────────────────────────────────────
    // Fetch all upcoming meetings for today and tomorrow.
    // We check today too because the 2hr/30min windows can fall on the same day.
    const meetings = await Meeting.find({
      status: 'upcoming',
      date: { $in: [todayStr, tomorrowStr] },
    }).lean()

    for (const meeting of meetings) {
      try {
        const meetingUTC = watToUTC(meeting.date, meeting.startTime)
        const msUntilMeeting = meetingUTC.getTime() - now.getTime()

        // Skip meetings that have already started or are more than 25 hours away
        if (msUntilMeeting < 0 || msUntilMeeting > 25 * 60 * 60 * 1000) continue

        // Determine which reminder window we're in
        let reminderType: ReminderType | null = null

        const target1day = new Date(meetingUTC.getTime() - 24 * 60 * 60 * 1000)
        const target2hr = new Date(meetingUTC.getTime() - 2 * 60 * 60 * 1000)
        const target30min = new Date(meetingUTC.getTime() - 30 * 60 * 1000)

        if (inWindow(target1day, now)) reminderType = '1day'
        else if (inWindow(target2hr, now)) reminderType = '2hr'
        else if (inWindow(target30min, now)) reminderType = '30min'

        if (!reminderType) continue

        // Deduplicate — skip if already sent
        const alreadySent = await ReminderLog.exists({
          entityId: meeting._id,
          reminderType,
        })
        if (alreadySent) continue

        // Fetch user
        const user = await User.findById(meeting.createdBy)
          .select('email name')
          .lean()
        if (!user) continue

        // Send email
        await sendMeetingReminderEmail(
          user.email,
          user.name,
          meeting,
          reminderType,
        )

        // Record it
        await ReminderLog.create({
          entityId: meeting._id,
          entityType: 'meeting',
          reminderType,
          userId: meeting.createdBy,
        })

        results.meetingReminders++
      } catch (err) {
        results.errors.push(`Meeting ${meeting._id}: ${(err as Error).message}`)
      }
    }

    // ── Tasks ─────────────────────────────────────────────────────────────────
    // Send a single "due tomorrow" reminder for tasks with dueDate = tomorrow
    const tasks = await Task.find({
      status: { $in: ['todo', 'in_progress'] },
      dueDate: tomorrowStr,
    }).lean()

    for (const task of tasks) {
      try {
        const alreadySent = await ReminderLog.exists({
          entityId: task._id,
          reminderType: '1day',
        })
        if (alreadySent) continue

        const user = await User.findById(task.createdBy)
          .select('email name')
          .lean()
        if (!user) continue

        await sendTaskReminderEmail(user.email, user.name, task)

        await ReminderLog.create({
          entityId: task._id,
          entityType: 'task',
          reminderType: '1day',
          userId: task.createdBy,
        })

        results.taskReminders++
      } catch (err) {
        results.errors.push(`Task ${task._id}: ${(err as Error).message}`)
      }
    }

    // ── Programs ──────────────────────────────────────────────────────────────
    // Send a single "starting tomorrow" reminder for programs with startDate = tomorrow
    const programs = await Program.find({
      status: 'upcoming',
      startDate: tomorrowStr,
    }).lean()

    for (const program of programs) {
      try {
        const alreadySent = await ReminderLog.exists({
          entityId: program._id,
          reminderType: '1day',
        })
        if (alreadySent) continue

        const user = await User.findById(program.createdBy)
          .select('email name')
          .lean()
        if (!user) continue

        await sendProgramReminderEmail(user.email, user.name, program)

        await ReminderLog.create({
          entityId: program._id,
          entityType: 'program',
          reminderType: '1day',
          userId: program.createdBy,
        })

        results.programReminders++
      } catch (err) {
        results.errors.push(`Program ${program._id}: ${(err as Error).message}`)
      }
    }

    console.log('[cron] send-reminders completed', results)

    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    console.error('[cron] send-reminders fatal error:', err)
    return NextResponse.json(
      { error: 'Internal server error', message: (err as Error).message },
      { status: 500 },
    )
  }
}
