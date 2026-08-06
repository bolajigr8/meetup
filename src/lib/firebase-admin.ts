import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import { connectToDatabase } from '@/lib/db'
import FcmToken from '@/models/FcmToken'

let app: App | null = null

function getFirebaseApp(): App | null {
  if (app) return app
  if (getApps().length > 0) {
    app = getApps()[0]
    return app
  }

  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  if (!encoded) return null

  try {
    const json = Buffer.from(encoded, 'base64').toString('utf-8')
    const serviceAccount = JSON.parse(json)
    app = initializeApp({ credential: cert(serviceAccount) })
    return app
  } catch (err) {
    console.error('Failed to initialize Firebase Admin:', err)
    return null
  }
}

export interface FcmPayload {
  title: string
  body: string
  data?: Record<string, string>
}

/**
 * Sends a push to every FCM token a user has registered. Mirrors
 * sendPushToUser in push.ts: never throws, cleans up dead tokens
 * automatically, designed as a fire-and-forget side channel.
 */
export async function sendFcmToUser(
  userId: string,
  payload: FcmPayload,
): Promise<{ sent: number; failed: number }> {
  const result = { sent: 0, failed: 0 }
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) return result

  await connectToDatabase()
  const tokens = await FcmToken.find({ userId }).lean()
  if (tokens.length === 0) return result

  const messaging = getMessaging(firebaseApp)

  await Promise.all(
    tokens.map(async (t) => {
      try {
        await messaging.send({
          token: t.token,
          notification: { title: payload.title, body: payload.body },
          data: payload.data ?? {},
          android: { priority: 'high' },
          apns: { headers: { 'apns-priority': '10' } },
        })
        result.sent++
      } catch (err) {
        result.failed++
        const code = (err as { errorInfo?: { code?: string } }).errorInfo?.code
        if (
          code === 'messaging/registration-token-not-registered' ||
          code === 'messaging/invalid-registration-token'
        ) {
          await FcmToken.deleteOne({ _id: t._id }).catch(() => {})
        }
      }
    }),
  )

  return result
}
