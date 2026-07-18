// src/app/api/v1/dev/test-email/route.ts
// Manual diagnostic endpoint — hits Resend directly with dummy data so you
// can confirm email delivery without creating real meetings/tasks/programs.
// Reuses CRON_SECRET as a simple guard since it's already in your env.
// Delete this route (or add a NODE_ENV check) before going fully live.
import { NextResponse } from 'next/server'
import {
  sendWelcomeEmail,
  sendMeetingReminderEmail,
  sendTaskReminderEmail,
  sendProgramReminderEmail,
} from '@/lib/mailer'

function isAuthorized(req: Request): boolean {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return token === process.env.CRON_SECRET
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(req.url)
  const to = url.searchParams.get('to')
  const type = url.searchParams.get('type') ?? 'welcome'

  if (!to) {
    return NextResponse.json(
      { error: 'Missing ?to=you@example.com' },
      { status: 400 },
    )
  }

  try {
    switch (type) {
      case 'welcome':
        await sendWelcomeEmail(to, 'Test User')
        break
      case 'meeting':
        await sendMeetingReminderEmail(
          to,
          'Test User',
          {
            title: 'Test Meeting',
            date: '2026-07-20',
            startTime: '10:00',
            endTime: '11:00',
            location: 'Conference Room A',
          },
          '1day',
        )
        break
      case 'task':
        await sendTaskReminderEmail(to, 'Test User', {
          title: 'Test Task',
          dueDate: '2026-07-19',
          priority: 'high',
        })
        break
      case 'program':
        await sendProgramReminderEmail(to, 'Test User', {
          title: 'Test Programme',
          startDate: '2026-07-19',
          endDate: '2026-08-19',
          scheduleType: 'standard',
        })
        break
      default:
        return NextResponse.json(
          { error: 'type must be welcome | meeting | task | program' },
          { status: 400 },
        )
    }
    return NextResponse.json({
      ok: true,
      message: `${type} email sent to ${to}`,
    })
  } catch (err) {
    // With the mailer.ts fix in place, this will now surface the REAL
    // Resend rejection reason (e.g. domain not verified) instead of a fake success.
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    )
  }
}
