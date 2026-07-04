import webpush from 'web-push'
import { Types } from 'mongoose'
import { connectToDatabase } from '@/lib/db'
import PushSubscription from '@/models/PushSubscription'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:admin@gablink.app'

let vapidConfigured = false
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  vapidConfigured = true
}

export interface PushPayload {
  title: string
  body: string
  tag: string
  url?: string
  entityId?: string
  entityType?: 'meeting' | 'task' | 'program'
  priority?: 'low' | 'medium' | 'high'
}

interface PushResult {
  sent: number
  failed: number
  errors: string[]
}

/**
 * Sends a web push to every device a user has subscribed on.
 * Designed to be a pure side channel: it never throws, so a caller can
 * fire-and-forget it alongside an email send without risking the email path.
 * Dead subscriptions (410/404 from the push service) are cleaned up automatically.
 */
export async function sendPushToUser(
  userId: string | Types.ObjectId,
  payload: PushPayload,
): Promise<PushResult> {
  const result: PushResult = { sent: 0, failed: 0, errors: [] }

  if (!vapidConfigured) {
    result.errors.push('VAPID keys not configured — push skipped')
    return result
  }

  try {
    await connectToDatabase()
    const subs = await PushSubscription.find({ userId }).lean()
    if (subs.length === 0) return result

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
            },
            JSON.stringify({
              title: payload.title,
              body: payload.body,
              tag: payload.tag,
              url: payload.url ?? '/overview',
              entityId: payload.entityId,
              entityType: payload.entityType,
              priority: payload.priority ?? 'medium',
            }),
          )
          result.sent++
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode
          if (statusCode === 404 || statusCode === 410) {
            await PushSubscription.deleteOne({ _id: sub._id }).catch(() => {})
          }
          result.failed++
          result.errors.push(
            `Push to subscription ${sub._id}: ${
              (err as Error).message ?? 'unknown error'
            }`,
          )
        }
      }),
    )
  } catch (err) {
    result.errors.push(`Push lookup failed: ${(err as Error).message}`)
  }

  return result
}
