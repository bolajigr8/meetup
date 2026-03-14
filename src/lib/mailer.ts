import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const FROM = {
  email: process.env.SENDGRID_FROM_EMAIL!,
  name: 'MeetUp',
}

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

// ─── Shared template wrapper ─────────────────────────────────────────────────

function htmlWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MeetUp</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#2563eb;padding:24px 32px;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                Meet<span style="color:#bfdbfe;">Up</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e2e8f0;background:#f8fafc;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                © ${new Date().getFullYear()} MeetUp · All times in West Africa Time (WAT, UTC+1)
                <br />If you didn't request this email, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function ctaButton(text: string, url: string): string {
  return `
<a href="${url}" target="_blank"
  style="display:inline-block;background:#2563eb;color:#ffffff;padding:12px 24px;
         border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;
         margin:20px 0;">
  ${text}
</a>`
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  rawToken: string,
): Promise<void> {
  const resetUrl = `${BASE_URL}/reset-password?token=${rawToken}`

  await sgMail.send({
    to: email,
    from: FROM,
    subject: 'Reset your MeetUp password',
    html: htmlWrapper(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
        Reset your password
      </h2>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        Hi ${name}, we received a request to reset your password.
        Click the button below — this link expires in <strong>1 hour</strong>.
      </p>
      ${ctaButton('Reset Password', resetUrl)}
      <p style="margin:16px 0 0;font-size:13px;color:#64748b;">
        Or copy this link into your browser:<br />
        <span style="color:#2563eb;word-break:break-all;">${resetUrl}</span>
      </p>
    `),
  })
}

// ─── Welcome Email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  email: string,
  name: string,
): Promise<void> {
  const dashboardUrl = `${BASE_URL}/overview`

  await sgMail.send({
    to: email,
    from: FROM,
    subject: 'Welcome to MeetUp 🎉',
    html: htmlWrapper(`
      <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">
        Welcome to MeetUp, ${name}!
      </h2>
      <p style="margin:0 0 16px;font-size:15px;color:#334155;line-height:1.6;">
        Your account is ready. MeetUp helps you schedule meetings, track tasks,
        and manage training programs — all running on West Africa Time.
      </p>
      ${ctaButton('Go to Dashboard', dashboardUrl)}
      <p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6;">
        All reminders and timestamps are shown in
        <strong>West Africa Time (WAT, UTC+1)</strong>.
      </p>
    `),
  })
}
