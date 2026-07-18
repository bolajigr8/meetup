// src/lib/mailer.ts
import { Resend } from 'resend'

const resend = new Resend(
  process.env.RESEND_API_KEY ?? 're_dummy_key_replace_me',
)

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? 'Gablink <noreply@yourdomain.com>'
const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

// ─── Send wrapper ─────────────────────────────────────────────────────────────
// IMPORTANT: the Resend SDK does NOT throw on API-level failures (bad domain,
// unverified sender, rate limit, invalid recipient, etc). It resolves with
// { data: null, error: {...} } instead. Without this check, every send()
// call below would silently "succeed" even when Resend rejected the email,
// which is why reminders were failing with no error anywhere in the logs.
// Every caller in this file must go through this wrapper, not resend.emails.send() directly.
async function sendEmail(
  params: Parameters<typeof resend.emails.send>[0],
  context: string,
): Promise<void> {
  const { error } = await resend.emails.send(params)
  if (error) {
    throw new Error(
      `Resend rejected email (${context}) to ${
        typeof params === 'object' && 'to' in params ? params.to : 'unknown'
      }: ${error.name ?? 'error'} — ${error.message ?? JSON.stringify(error)}`,
    )
  }
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const COLORS = {
  brand: '#1a56db',
  brandDark: '#1e429f',
  brandLight: '#ebf5ff',
  amber: '#d97706',
  amberLight: '#fffbeb',
  teal: '#0d9488',
  tealLight: '#f0fdfa',
  red: '#dc2626',
  redLight: '#fef2f2',
  green: '#059669',
  greenLight: '#ecfdf5',
  text: '#111928',
  textMuted: '#6b7280',
  textLight: '#9ca3af',
  border: '#e5e7eb',
  surface: '#f9fafb',
  white: '#ffffff',
}

// ─── Base layout ──────────────────────────────────────────────────────────────

function layout(content: string, previewText: string = ''): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Gablink</title>
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
</head>
<body style="margin:0;padding:0;background-color:${COLORS.surface};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:${COLORS.surface};padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:580px;width:100%;">

          <!-- Logo bar -->
          <tr>
            <td style="padding-bottom:24px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${COLORS.brand};border-radius:10px;width:36px;height:36px;text-align:center;vertical-align:middle;">
                                       <span style="color:${COLORS.white};font-size:18px;font-weight:700;line-height:36px;display:inline-block;width:36px;">G</span>

                  </td>
                   <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:20px;font-weight:700;color:${COLORS.text};letter-spacing:-0.3px;">
                      Gab<span style="color:${COLORS.brand};">link</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:${COLORS.white};border-radius:16px;border:1px solid ${COLORS.border};overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

              ${content}

              <!-- Footer inside card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:20px 32px;border-top:1px solid ${COLORS.border};background-color:${COLORS.surface};">
                    <p style="margin:0;font-size:12px;color:${COLORS.textLight};text-align:center;line-height:1.6;">
                      This email was sent by Gablink on behalf of your organisation.<br />
                      All times are in <strong>West Africa Time (WAT, UTC+1)</strong>.<br />
                      If you believe you received this in error, please disregard it.
                    </p>
                    <p style="margin:12px 0 0;font-size:11px;color:${COLORS.textLight};text-align:center;">
                      © ${new Date().getFullYear()} Gablink &nbsp;·&nbsp; Powered by Gablink Platform
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// ─── Shared blocks ────────────────────────────────────────────────────────────

function heroStripe(
  accentColor: string,
  iconChar: string,
  label: string,
): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="background-color:${accentColor};padding:28px 32px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background-color:rgba(255,255,255,0.18);border-radius:8px;width:40px;height:40px;text-align:center;vertical-align:middle;">
              <span style="font-size:20px;line-height:40px;display:inline-block;">${iconChar}</span>
            </td>
            <td style="padding-left:14px;vertical-align:middle;">
              <p style="margin:0;font-size:11px;font-weight:600;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:1px;">${label}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`
}

function badge(text: string, bg: string, color: string): string {
  return `<span style="display:inline-block;background-color:${bg};color:${color};font-size:11px;font-weight:700;padding:4px 12px;border-radius:100px;letter-spacing:0.5px;text-transform:uppercase;">${text}</span>`
}

function detailRow(icon: string, label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid ${COLORS.border};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="width:28px;vertical-align:top;padding-top:1px;">
            <span style="font-size:15px;">${icon}</span>
          </td>
          <td style="vertical-align:top;">
            <p style="margin:0;font-size:11px;font-weight:600;color:${COLORS.textMuted};text-transform:uppercase;letter-spacing:0.5px;">${label}</p>
            <p style="margin:3px 0 0;font-size:14px;color:${COLORS.text};font-weight:500;line-height:1.4;">${value}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`
}

function ctaButton(text: string, url: string, color: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="border-radius:8px;background-color:${color};">
        <a href="${url}" target="_blank"
          style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:600;color:${COLORS.white};text-decoration:none;border-radius:8px;letter-spacing:0.2px;">
          ${text} &rarr;
        </a>
      </td>
    </tr>
  </table>`
}

function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:8px 0;"><div style="height:1px;background-color:${COLORS.border};"></div></td></tr></table>`
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  rawToken: string,
): Promise<void> {
  const resetUrl = `${BASE_URL}/reset-password?token=${rawToken}`
  const firstName = name.split(' ')[0]

  await sendEmail(
    {
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your Gablink password',
      html: layout(
        `
      ${heroStripe(COLORS.brand, '🔐', 'Security Request')}

      <!-- Body -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:32px 32px 24px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${COLORS.text};letter-spacing:-0.3px;">
              Password reset request
            </h1>
            <p style="margin:0 0 20px;font-size:15px;color:${COLORS.textMuted};line-height:1.7;">
              Dear ${firstName},
            </p>
            <p style="margin:0 0 20px;font-size:15px;color:${COLORS.textMuted};line-height:1.7;">
              We received a request to reset the password associated with your Gablink account.
              If you made this request, please click the button below to proceed.
              This link will expire in <strong style="color:${COLORS.text};">60 minutes</strong>.
            </p>

            ${ctaButton('Reset My Password', resetUrl, COLORS.brand)}

            <p style="margin:24px 0 0;font-size:13px;color:${COLORS.textMuted};line-height:1.6;">
              If the button above does not work, copy and paste the following link into your browser:
            </p>
            <p style="margin:8px 0 0;font-size:12px;color:${COLORS.brand};word-break:break-all;line-height:1.5;">
              ${resetUrl}
            </p>

            ${divider()}

            <p style="margin:16px 0 0;font-size:13px;color:${COLORS.textMuted};line-height:1.6;">
              <strong style="color:${COLORS.text};">Did not request this?</strong>
              Your account remains secure. You may safely ignore this email.
              No changes will be made unless you click the link above.
            </p>
          </td>
        </tr>
      </table>
      `,
        `Reset your Gablink password — link expires in 60 minutes`,
      ),
    },
    'password-reset',
  )
}

// ─── Welcome Email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  email: string,
  name: string,
): Promise<void> {
  const dashboardUrl = `${BASE_URL}/overview`
  const firstName = name.split(' ')[0]

  await sendEmail(
    {
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to Gablink, ${firstName}`,
      html: layout(
        `
      ${heroStripe(COLORS.brand, '👋', 'Welcome')}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:32px 32px 28px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${COLORS.text};letter-spacing:-0.3px;">
              Your account is ready, ${firstName}.
            </h1>
            <p style="margin:0 0 16px;font-size:15px;color:${COLORS.textMuted};line-height:1.7;">
              Welcome to Gablink — your organisation's platform for scheduling meetings,
              managing tasks, and coordinating training programmes, all running on
              <strong style="color:${COLORS.text};">West Africa Time (WAT)</strong>.
            </p>

            <!-- Feature highlights -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="background-color:${COLORS.brandLight};border-radius:10px;margin:20px 0 24px;">
              <tr>
                <td style="padding:20px 24px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="font-size:14px;color:${COLORS.brand};">📅</span>
                        <span style="font-size:14px;color:${COLORS.text};margin-left:10px;font-weight:500;">Schedule and track meetings with your team</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="font-size:14px;color:${COLORS.brand};">✅</span>
                        <span style="font-size:14px;color:${COLORS.text};margin-left:10px;font-weight:500;">Manage tasks with due dates and priority levels</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="font-size:14px;color:${COLORS.brand};">🎓</span>
                        <span style="font-size:14px;color:${COLORS.text};margin-left:10px;font-weight:500;">Coordinate training programmes with automated reminders</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:6px 0;">
                        <span style="font-size:14px;color:${COLORS.brand};">🔔</span>
                        <span style="font-size:14px;color:${COLORS.text};margin-left:10px;font-weight:500;">Receive timely email reminders — never miss an event</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${ctaButton('Go to your Dashboard', dashboardUrl, COLORS.brand)}

            <p style="margin:24px 0 0;font-size:13px;color:${COLORS.textMuted};line-height:1.6;">
              If you have any questions or require assistance, please contact your
              organisation administrator.
            </p>
          </td>
        </tr>
      </table>
      `,
        `Welcome to Gablink — your workspace is ready`,
      ),
    },
    'welcome',
  )
}

// ─── Meeting Reminder ─────────────────────────────────────────────────────────

type MeetingReminderPayload = {
  title: string
  date: string
  startTime: string
  endTime: string
  location?: string
  description?: string
}

const MEETING_REMINDER_CONFIG = {
  '1day': {
    label: 'Tomorrow',
    sublabel: 'Your meeting is scheduled for tomorrow',
    urgency: 'Reminder — 1 Day',
    accentColor: COLORS.brand,
    badgeBg: COLORS.brandLight,
    badgeColor: COLORS.brand,
    emoji: '📅',
  },
  '2hr': {
    label: 'In 2 Hours',
    sublabel: 'Your meeting begins in approximately 2 hours',
    urgency: 'Reminder — 2 Hours',
    accentColor: COLORS.amber,
    badgeBg: COLORS.amberLight,
    badgeColor: COLORS.amber,
    emoji: '⏰',
  },
  '30min': {
    label: 'In 30 Minutes',
    sublabel: 'Your meeting is about to begin',
    urgency: 'Reminder — 30 Minutes',
    accentColor: '#b91c1c',
    badgeBg: COLORS.redLight,
    badgeColor: COLORS.red,
    emoji: '🔴',
  },
}

export async function sendMeetingReminderEmail(
  email: string,
  name: string,
  meeting: MeetingReminderPayload,
  reminderType: '1day' | '2hr' | '30min',
): Promise<void> {
  const cfg = MEETING_REMINDER_CONFIG[reminderType]
  const firstName = name.split(' ')[0]
  const meetingsUrl = `${BASE_URL}/meetings`

  await sendEmail(
    {
      from: FROM_EMAIL,
      to: email,
      subject: `Meeting Reminder: "${meeting.title}" — ${cfg.label}`,
      html: layout(
        `
      ${heroStripe(cfg.accentColor, cfg.emoji, cfg.urgency)}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:32px 32px 0;">
            ${badge(cfg.label, cfg.badgeBg, cfg.badgeColor)}
            <h1 style="margin:16px 0 8px;font-size:22px;font-weight:700;color:${COLORS.text};letter-spacing:-0.3px;">
              Meeting Reminder
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:${COLORS.textMuted};line-height:1.7;">
              Dear ${firstName},<br /><br />
              ${cfg.sublabel}. Please review the details below and ensure you are prepared.
            </p>
          </td>
        </tr>

        <!-- Meeting detail card -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="border:1px solid ${COLORS.border};border-radius:10px;overflow:hidden;">
              <tr>
                <td style="background-color:${COLORS.surface};padding:16px 20px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:${COLORS.textMuted};text-transform:uppercase;letter-spacing:1px;">Meeting Details</p>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 20px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${detailRow('📌', 'Meeting', meeting.title)}
                    ${detailRow('📆', 'Date', meeting.date)}
                    ${detailRow('🕐', 'Time', `${meeting.startTime} – ${meeting.endTime} WAT`)}
                    ${meeting.location ? detailRow('📍', 'Location', meeting.location) : ''}
                    ${meeting.description ? detailRow('📝', 'Notes', meeting.description) : ''}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px 32px;">
            ${ctaButton('View Meeting Details', meetingsUrl, cfg.accentColor)}
            <p style="margin:20px 0 0;font-size:13px;color:${COLORS.textMuted};line-height:1.6;">
              This is an automated reminder from Gablink. Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
      `,
        `${cfg.sublabel}: ${meeting.title} on ${meeting.date}`,
      ),
    },
    'meeting-reminder',
  )
}

// ─── Task Reminder ────────────────────────────────────────────────────────────

type TaskReminderPayload = {
  title: string
  dueDate: string
  priority: string
  description?: string
}

const PRIORITY_CONFIG: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  high: { label: 'High Priority', bg: COLORS.redLight, color: COLORS.red },
  medium: {
    label: 'Medium Priority',
    bg: COLORS.amberLight,
    color: COLORS.amber,
  },
  low: {
    label: 'Low Priority',
    bg: COLORS.greenLight,
    color: COLORS.green,
  },
}

export async function sendTaskReminderEmail(
  email: string,
  name: string,
  task: TaskReminderPayload,
): Promise<void> {
  const tasksUrl = `${BASE_URL}/tasks`
  const firstName = name.split(' ')[0]
  const priorityCfg = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium

  await sendEmail(
    {
      from: FROM_EMAIL,
      to: email,
      subject: `Task Due Tomorrow: "${task.title}"`,
      html: layout(
        `
      ${heroStripe(COLORS.amber, '✅', 'Task Reminder')}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:32px 32px 0;">
            ${badge('Due Tomorrow', COLORS.amberLight, COLORS.amber)}
            <h1 style="margin:16px 0 8px;font-size:22px;font-weight:700;color:${COLORS.text};letter-spacing:-0.3px;">
              Task Due Tomorrow
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:${COLORS.textMuted};line-height:1.7;">
              Dear ${firstName},<br /><br />
              This is a reminder that the following task is due tomorrow.
              Please ensure it is completed on time to avoid it being marked as overdue.
            </p>
          </td>
        </tr>

        <!-- Task detail card -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="border:1px solid ${COLORS.border};border-radius:10px;overflow:hidden;">
              <tr>
                <td style="background-color:${COLORS.surface};padding:16px 20px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:${COLORS.textMuted};text-transform:uppercase;letter-spacing:1px;">Task Details</p>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 20px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${detailRow('📌', 'Task', task.title)}
                    ${detailRow('📆', 'Due Date', task.dueDate)}
                    ${detailRow('🏷️', 'Priority', priorityCfg.label)}
                    ${task.description ? detailRow('📝', 'Notes', task.description) : ''}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px;background-color:${priorityCfg.bg};border-top:1px solid ${COLORS.border};">
                  <p style="margin:0;font-size:13px;font-weight:600;color:${priorityCfg.color};">
                    ${priorityCfg.label} — Please action this before the deadline.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px 32px;">
            ${ctaButton('View Task', tasksUrl, COLORS.amber)}
            <p style="margin:20px 0 0;font-size:13px;color:${COLORS.textMuted};line-height:1.6;">
              This is an automated reminder from Gablink. Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
      `,
        `Task due tomorrow: ${task.title}`,
      ),
    },
    'task-reminder',
  )
}

// ─── Program Reminder ─────────────────────────────────────────────────────────

type ProgramReminderPayload = {
  title: string
  startDate: string
  endDate: string
  scheduleType: string
  description?: string
}

export async function sendProgramReminderEmail(
  email: string,
  name: string,
  program: ProgramReminderPayload,
): Promise<void> {
  const programsUrl = `${BASE_URL}/programs`
  const firstName = name.split(' ')[0]
  const scheduleLabel =
    program.scheduleType === 'intensive'
      ? '⚡ Intensive Programme'
      : '📅 Standard Programme'

  await sendEmail(
    {
      from: FROM_EMAIL,
      to: email,
      subject: `Programme Starting Tomorrow: "${program.title}"`,
      html: layout(
        `
      ${heroStripe(COLORS.teal, '🎓', 'Programme Reminder')}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:32px 32px 0;">
            ${badge('Starts Tomorrow', COLORS.tealLight, COLORS.teal)}
            <h1 style="margin:16px 0 8px;font-size:22px;font-weight:700;color:${COLORS.text};letter-spacing:-0.3px;">
              Training Programme Starting Tomorrow
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:${COLORS.textMuted};line-height:1.7;">
              Dear ${firstName},<br /><br />
              This is an advance notice that the following training programme
              is scheduled to commence tomorrow. Please ensure all participants
              are informed and prepared accordingly.
            </p>
          </td>
        </tr>

        <!-- Programme detail card -->
        <tr>
          <td style="padding:0 32px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
              style="border:1px solid ${COLORS.border};border-radius:10px;overflow:hidden;">
              <tr>
                <td style="background-color:${COLORS.surface};padding:16px 20px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:${COLORS.textMuted};text-transform:uppercase;letter-spacing:1px;">Programme Details</p>
                </td>
              </tr>
              <tr>
                <td style="padding:4px 20px 16px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${detailRow('📌', 'Programme', program.title)}
                    ${detailRow('🟢', 'Start Date', program.startDate)}
                    ${detailRow('🔴', 'End Date', program.endDate)}
                    ${detailRow('📋', 'Schedule Type', scheduleLabel)}
                    ${program.description ? detailRow('📝', 'Notes', program.description) : ''}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 20px;background-color:${COLORS.tealLight};border-top:1px solid ${COLORS.border};">
                  <p style="margin:0;font-size:13px;font-weight:600;color:${COLORS.teal};">
                    Please confirm that all participants are aware and ready to begin.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:0 32px 32px;">
            ${ctaButton('View Programme Details', programsUrl, COLORS.teal)}
            <p style="margin:20px 0 0;font-size:13px;color:${COLORS.textMuted};line-height:1.6;">
              This is an automated reminder from Gablink. Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
      `,
        `Programme starting tomorrow: ${program.title}`,
      ),
    },
    'program-reminder',
  )
}
