// src/app/api/v1/dev/test-reminder/route.ts
// Manual diagnostic endpoint — fires the real reminder pipeline (email + push)
// for one existing meeting/task/program immediately, bypassing the time-window
// checks in the cron route entirely. Deliberately does NOT write to
// ReminderLog, so running this never blocks the real cron reminder from
// firing later for the same entity.
// Delete this route (or gate it behind NODE_ENV) before going fully live.
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

function isAuthorized(req: Request): boolean {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return token === process.env.CRON_SECRET
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
      recipients.push({ email: normalized, name: normalized.split('@')[0] })
    }
  }

  return recipients
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const entityType = url.searchParams.get('entityType')
  const entityId = url.searchParams.get('entityId')

  if (!entityType || !entityId) {
    return NextResponse.json(
      { error: 'Missing ?entityType=meeting|task|program&entityId=...' },
      { status: 400 },
    )
  }

  await connectToDatabase()

  const results = {
    emailSent: 0,
    emailErrors: [] as string[],
    pushSent: 0,
    pushFailed: 0,
    pushErrors: [] as string[],
  }

  try {
    if (entityType === 'meeting') {
      const meeting = await Meeting.findById(entityId).lean()
      if (!meeting)
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 },
        )

      const assignedIds = (meeting.assignedTo ?? []).map((id: Types.ObjectId) =>
        id.toString(),
      )
      const recipients = await resolveRecipients(
        assignedIds,
        meeting.participants ?? [],
      )

      for (const { email, name } of recipients) {
        try {
          await sendMeetingReminderEmail(email, name, meeting, '1day')
          results.emailSent++
        } catch (err) {
          results.emailErrors.push(`${email}: ${(err as Error).message}`)
        }
      }

      await Promise.all(
        assignedIds.map(async (uid: string | Types.ObjectId) => {
          const r = await sendPushToUser(uid, {
            title: 'Test: Meeting reminder',
            body: `"${meeting.title}" — ${meeting.date} ${meeting.startTime} WAT`,
            tag: `test-meeting-${meeting._id}`,
            url: '/meetings',
            entityId: (meeting._id as Types.ObjectId).toString(),
            entityType: 'meeting',
            priority: meeting.priority as 'low' | 'medium' | 'high',
          })
          results.pushSent += r.sent
          results.pushFailed += r.failed
          results.pushErrors.push(...r.errors)
        }),
      )
    } else if (entityType === 'task') {
      const task = await Task.findById(entityId).lean()
      if (!task)
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })

      const assignedIds = (task.assignedTo ?? []).map((id: Types.ObjectId) =>
        id.toString(),
      )
      const externalEmails = task.assignedToEmail ? [task.assignedToEmail] : []
      const recipients = await resolveRecipients(assignedIds, externalEmails)

      for (const { email, name } of recipients) {
        try {
          await sendTaskReminderEmail(email, name, task)
          results.emailSent++
        } catch (err) {
          results.emailErrors.push(`${email}: ${(err as Error).message}`)
        }
      }

      const pushTargets = Array.from(
        new Set([...assignedIds, task.createdBy.toString()]),
      )
      await Promise.all(
        pushTargets.map(async (uid) => {
          const r = await sendPushToUser(uid, {
            title: 'Test: Task reminder',
            body: `"${task.title}" is due ${task.dueDate}`,
            tag: `test-task-${task._id}`,
            url: '/tasks',
            entityId: (task._id as Types.ObjectId).toString(),
            entityType: 'task',
            priority: task.priority as 'low' | 'medium' | 'high',
          })
          results.pushSent += r.sent
          results.pushFailed += r.failed
          results.pushErrors.push(...r.errors)
        }),
      )
    } else if (entityType === 'program') {
      const program = await Program.findById(entityId).lean()
      if (!program)
        return NextResponse.json(
          { error: 'Program not found' },
          { status: 404 },
        )

      const assignedIds = (program.assignedTo ?? []).map((id: Types.ObjectId) =>
        id.toString(),
      )
      const recipients = await resolveRecipients(
        assignedIds,
        program.participants ?? [],
      )

      for (const { email, name } of recipients) {
        try {
          await sendProgramReminderEmail(email, name, program)
          results.emailSent++
        } catch (err) {
          results.emailErrors.push(`${email}: ${(err as Error).message}`)
        }
      }

      await Promise.all(
        assignedIds.map(async (uid: string | Types.ObjectId) => {
          const r = await sendPushToUser(uid, {
            title: 'Test: Program reminder',
            body: `"${program.title}" starts ${program.startDate}`,
            tag: `test-program-${program._id}`,
            url: '/programs',
            entityId: (program._id as Types.ObjectId).toString(),
            entityType: 'program',
          })
          results.pushSent += r.sent
          results.pushFailed += r.failed
          results.pushErrors.push(...r.errors)
        }),
      )
    } else {
      return NextResponse.json(
        { error: 'entityType must be meeting | task | program' },
        { status: 400 },
      )
    }

    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    )
  }
}
