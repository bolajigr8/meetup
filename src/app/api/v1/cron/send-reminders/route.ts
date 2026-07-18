// src/app/api/v1/cron/send-reminders/route.ts
import { NextResponse } from 'next/server'
import { Types } from 'mongoose'
import { connectToDatabase } from '@/lib/db'
import {
  sendMeetingReminderEmail,
  sendTaskReminderEmail,
  sendProgramReminderEmail,
} from '@/lib/mailer'
import { sendPushToUser } from '@/lib/push'
import Meeting from '@/models/Meeting'
import Task from '@/models/Task'
import Program from '@/models/Program'
import User from '@/models/User'
import ReminderLog from '@/models/ReminderLog'
import type { ReminderType } from '@/models/ReminderLog'

function isAuthorized(req: Request): boolean {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return token === process.env.CRON_SECRET
}

const pad = (n: number) => String(n).padStart(2, '0')

function getWATDateStrings(): {
  todayStr: string
  tomorrowStr: string
  nowWAT: Date
} {
  const nowWAT = new Date(Date.now() + 60 * 60 * 1000)
  const todayStr = `${nowWAT.getUTCFullYear()}-${pad(nowWAT.getUTCMonth() + 1)}-${pad(nowWAT.getUTCDate())}`
  const tmrWAT = new Date(nowWAT)
  tmrWAT.setUTCDate(nowWAT.getUTCDate() + 1)
  const tomorrowStr = `${tmrWAT.getUTCFullYear()}-${pad(tmrWAT.getUTCMonth() + 1)}-${pad(tmrWAT.getUTCDate())}`
  return { todayStr, tomorrowStr, nowWAT }
}

function watToUTC(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour - 1, minute))
}

const WINDOW_MS = 8 * 60 * 1000

function inWindow(targetTime: Date, now: Date): boolean {
  return Math.abs(targetTime.getTime() - now.getTime()) <= WINDOW_MS
}

async function resolveRecipients(
  assignedToIds: string[],
  participantEmails: string[],
): Promise<{ email: string; name: string }[]> {
  const recipients: { email: string; name: string }[] = []
  const seen = new Set<string>()

  if (assignedToIds.length > 0) {
    const users = await User.find({ _id: { $in: assignedToIds } })
      .select('email name')
      .lean()
    for (const u of users) {
      const email = u.email.toLowerCase()
      if (!seen.has(email)) {
        seen.add(email)
        recipients.push({ email, name: u.name })
      }
    }
  }

  for (const email of participantEmails) {
    const normalized = email.toLowerCase()
    if (!seen.has(normalized)) {
      seen.add(normalized)
      const name = normalized.split('@')[0]
      recipients.push({ email: normalized, name })
    }
  }

  return recipients
}

// ─── Push helper ──────────────────────────────────────────────────────────────
// Fires push to every registered-user id in parallel with email, per entity.
// Failures are logged but NEVER block or roll back the email path above/below it.
async function pushToAssignedUsers(
  assignedIds: string[],
  payload: {
    title: string
    body: string
    tag: string
    url?: string
    entityId: string
    entityType: 'meeting' | 'task' | 'program'
    priority?: 'low' | 'medium' | 'high'
  },
  errorsSink: string[],
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0
  await Promise.all(
    assignedIds.map(async (uid) => {
      try {
        const result = await sendPushToUser(uid, payload)
        sent += result.sent
        failed += result.failed
        if (result.errors.length) errorsSink.push(...result.errors)
      } catch (err) {
        // sendPushToUser is designed to never throw, but guard anyway —
        // a push failure must never propagate up and affect email sending.
        failed++
        errorsSink.push(
          `Push to user ${uid} for ${payload.entityType} ${payload.entityId}: ${
            (err as Error).message
          }`,
        )
      }
    }),
  )
  return { sent, failed }
}

// ─── Status updater ───────────────────────────────────────────────────────────

async function updateExpiredStatuses(
  todayStr: string,
  nowUTC: Date,
): Promise<{
  meetingsCompleted: number
  meetingsOngoing: number
  tasksOverdue: number
  programsActivated: number
  programsCompleted: number
}> {
  const stats = {
    meetingsCompleted: 0,
    meetingsOngoing: 0,
    tasksOverdue: 0,
    programsActivated: 0,
    programsCompleted: 0,
  }

  const activeMeetings = await Meeting.find({
    status: { $in: ['upcoming', 'ongoing'] },
  })
    .select('_id date startTime endTime status')
    .lean()

  for (const meeting of activeMeetings) {
    const startUTC = watToUTC(meeting.date, meeting.startTime)
    const endUTC = watToUTC(meeting.date, meeting.endTime)

    if (nowUTC >= endUTC) {
      await Meeting.findByIdAndUpdate(meeting._id, {
        $set: { status: 'completed' },
      })
      stats.meetingsCompleted++
    } else if (nowUTC >= startUTC && meeting.status === 'upcoming') {
      await Meeting.findByIdAndUpdate(meeting._id, {
        $set: { status: 'ongoing' },
      })
      stats.meetingsOngoing++
    }
  }

  const overdueTasks = await Task.updateMany(
    {
      status: { $in: ['todo', 'in_progress'] },
      dueDate: { $lt: todayStr },
    },
    { $set: { status: 'overdue' } },
  )
  stats.tasksOverdue = overdueTasks.modifiedCount

  const activatedPrograms = await Program.updateMany(
    { status: 'upcoming', startDate: { $lte: todayStr } },
    { $set: { status: 'active' } },
  )
  stats.programsActivated = activatedPrograms.modifiedCount

  const completedPrograms = await Program.updateMany(
    { status: { $in: ['upcoming', 'active'] }, endDate: { $lt: todayStr } },
    { $set: { status: 'completed' } },
  )
  stats.programsCompleted = completedPrograms.modifiedCount

  return stats
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  if (!isAuthorized(req))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await connectToDatabase()
    const now = new Date()
    const { todayStr, tomorrowStr } = getWATDateStrings()

    const results = {
      statusUpdates: {} as Record<string, number>,
      meetingReminders: 0,
      taskReminders: 0,
      programReminders: 0,
      pushSent: 0,
      pushFailed: 0,
      errors: [] as string[],
    }

    // ── Step 1: Update expired statuses first ─────────────────────────────────
    try {
      results.statusUpdates = await updateExpiredStatuses(todayStr, now)
    } catch (err) {
      results.errors.push(`Status update failed: ${(err as Error).message}`)
    }

    // ── Step 2: Meeting reminders (email + push) ──────────────────────────────
    const meetings = await Meeting.find({
      status: 'upcoming',
      date: { $in: [todayStr, tomorrowStr] },
    }).lean()

    for (const meeting of meetings) {
      try {
        const meetingUTC = watToUTC(meeting.date, meeting.startTime)
        const msUntilMeeting = meetingUTC.getTime() - now.getTime()
        if (msUntilMeeting < 0 || msUntilMeeting > 25 * 60 * 60 * 1000) continue

        let reminderType: ReminderType | null = null
        const target1day = new Date(meetingUTC.getTime() - 24 * 60 * 60 * 1000)
        const target2hr = new Date(meetingUTC.getTime() - 2 * 60 * 60 * 1000)
        const target30min = new Date(meetingUTC.getTime() - 30 * 60 * 1000)

        if (inWindow(target1day, now)) reminderType = '1day'
        else if (inWindow(target2hr, now)) reminderType = '2hr'
        else if (inWindow(target30min, now)) reminderType = '30min'
        if (!reminderType) continue

        const alreadySent = await ReminderLog.exists({
          entityId: meeting._id,
          reminderType,
        })
        if (alreadySent) continue

        const assignedIds = (meeting.assignedTo ?? []).map(
          (id: Types.ObjectId) => id.toString(),
        )
        const recipients = await resolveRecipients(
          assignedIds,
          meeting.participants ?? [],
        )

        // Creator (often an admin) is not necessarily in assignedTo — without
        // this, admins/superadmins who create a meeting but aren't separately
        // assigned to it never receive their own reminder emails.
        const meetingCreator = await User.findById(meeting.createdBy)
          .select('email name')
          .lean()
        if (meetingCreator) {
          const creatorEmail = meetingCreator.email.toLowerCase()
          if (!recipients.find((r) => r.email === creatorEmail)) {
            recipients.push({ email: creatorEmail, name: meetingCreator.name })
          }
        }

        // Email — per-recipient failures are non-fatal, but we track how many
        // actually succeeded so a fully-failed batch can retry next run
        // instead of being marked as sent forever.
        let emailSuccessCount = 0
        for (const { email, name } of recipients) {
          try {
            await sendMeetingReminderEmail(email, name, meeting, reminderType)
            emailSuccessCount++
          } catch (emailErr) {
            results.errors.push(
              `Meeting ${meeting._id} email to ${email}: ${(emailErr as Error).message}`,
            )
          }
        }

        // Push — fires to registered users only (participants without accounts
        // have no subscription to target). Fully independent of the email loop above.
        // Includes the creator alongside assignedTo, for the same reason as the
        // email recipients above.
        const meetingPushTargets = Array.from(
          new Set([...assignedIds, meeting.createdBy.toString()]),
        )
        const labelMap: Record<ReminderType, string> = {
          '1day': 'tomorrow',
          '2hr': 'in 2 hours',
          '30min': 'in 30 minutes',
        }
        const { sent, failed } = await pushToAssignedUsers(
          meetingPushTargets,
          {
            title: `Meeting ${labelMap[reminderType]}`,
            body: `"${meeting.title}" — ${meeting.date} ${meeting.startTime} WAT${
              meeting.location ? ` · ${meeting.location}` : ''
            }`,
            tag: `meeting-${meeting._id}-${reminderType}`,
            url: '/meetings',
            entityId: (meeting._id as Types.ObjectId).toString(),
            entityType: 'meeting',
            priority: meeting.priority as 'low' | 'medium' | 'high',
          },
          results.errors,
        )
        results.pushSent += sent
        results.pushFailed += failed

        const anySuccess = emailSuccessCount > 0 || sent > 0
        if (anySuccess || recipients.length === 0) {
          await ReminderLog.create({
            entityId: meeting._id,
            entityType: 'meeting',
            reminderType,
            userId: meeting.createdBy,
          })
          results.meetingReminders++
        } else {
          results.errors.push(
            `Meeting ${meeting._id} (${reminderType}): all notifications failed — will retry next run while still in window`,
          )
        }
      } catch (err) {
        results.errors.push(`Meeting ${meeting._id}: ${(err as Error).message}`)
      }
    }

    // ── Step 3: Task reminders (email + push) ─────────────────────────────────
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

        const assignedIds = (task.assignedTo ?? []).map((id: Types.ObjectId) =>
          id.toString(),
        )
        const externalEmails = task.assignedToEmail
          ? [task.assignedToEmail]
          : []
        const recipients = await resolveRecipients(assignedIds, externalEmails)

        const creator = await User.findById(task.createdBy)
          .select('email name')
          .lean()
        if (creator) {
          const creatorEmail = creator.email.toLowerCase()
          if (!recipients.find((r) => r.email === creatorEmail)) {
            recipients.push({ email: creatorEmail, name: creator.name })
          }
        }

        let emailSuccessCount = 0
        for (const { email, name } of recipients) {
          try {
            await sendTaskReminderEmail(email, name, task)
            emailSuccessCount++
          } catch (emailErr) {
            results.errors.push(
              `Task ${task._id} email to ${email}: ${(emailErr as Error).message}`,
            )
          }
        }

        const pushTargets = Array.from(
          new Set([...assignedIds, task.createdBy.toString()]),
        )
        const { sent, failed } = await pushToAssignedUsers(
          pushTargets,
          {
            title: 'Task due tomorrow',
            body: `"${task.title}" is due ${task.dueDate}`,
            tag: `task-${task._id}-1day`,
            url: '/tasks',
            entityId: (task._id as Types.ObjectId).toString(),
            entityType: 'task',
            priority: task.priority as 'low' | 'medium' | 'high',
          },
          results.errors,
        )
        results.pushSent += sent
        results.pushFailed += failed

        const anySuccess = emailSuccessCount > 0 || sent > 0
        if (anySuccess || recipients.length === 0) {
          await ReminderLog.create({
            entityId: task._id,
            entityType: 'task',
            reminderType: '1day',
            userId: task.createdBy,
          })
          results.taskReminders++
        } else {
          results.errors.push(
            `Task ${task._id}: all notifications failed — will retry next run while still in window`,
          )
        }
      } catch (err) {
        results.errors.push(`Task ${task._id}: ${(err as Error).message}`)
      }
    }

    // ── Step 4: Program reminders (email + push) ──────────────────────────────
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

        const assignedIds = (program.assignedTo ?? []).map(
          (id: Types.ObjectId) => id.toString(),
        )
        const recipients = await resolveRecipients(
          assignedIds,
          program.participants ?? [],
        )

        // Creator (often an admin) is not necessarily in assignedTo — see the
        // matching fix in the meeting block above for why this is needed.
        const programCreator = await User.findById(program.createdBy)
          .select('email name')
          .lean()
        if (programCreator) {
          const creatorEmail = programCreator.email.toLowerCase()
          if (!recipients.find((r) => r.email === creatorEmail)) {
            recipients.push({ email: creatorEmail, name: programCreator.name })
          }
        }

        let emailSuccessCount = 0
        for (const { email, name } of recipients) {
          try {
            await sendProgramReminderEmail(email, name, program)
            emailSuccessCount++
          } catch (emailErr) {
            results.errors.push(
              `Program ${program._id} email to ${email}: ${(emailErr as Error).message}`,
            )
          }
        }

        const programPushTargets = Array.from(
          new Set([...assignedIds, program.createdBy.toString()]),
        )
        const { sent, failed } = await pushToAssignedUsers(
          programPushTargets,
          {
            title: 'Program starting soon',
            body: `"${program.title}" starts ${program.startDate}`,
            tag: `program-${program._id}-1day`,
            url: '/programs',
            entityId: (program._id as Types.ObjectId).toString(),
            entityType: 'program',
          },
          results.errors,
        )
        results.pushSent += sent
        results.pushFailed += failed

        const anySuccess = emailSuccessCount > 0 || sent > 0
        if (anySuccess || recipients.length === 0) {
          await ReminderLog.create({
            entityId: program._id,
            entityType: 'program',
            reminderType: '1day',
            userId: program.createdBy,
          })
          results.programReminders++
        } else {
          results.errors.push(
            `Program ${program._id}: all notifications failed — will retry next run while still in window`,
          )
        }
      } catch (err) {
        results.errors.push(`Program ${program._id}: ${(err as Error).message}`)
      }
    }

    console.log('[cron] completed', results)
    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    console.error('[cron] fatal error:', err)
    return NextResponse.json(
      { error: 'Internal server error', message: (err as Error).message },
      { status: 500 },
    )
  }
}
