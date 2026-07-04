const CACHE_VERSION = 'gablink-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const PRECACHE_URLS = ['/', '/manifest.json']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {}),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key.startsWith('gablink-') && key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

// Network-first for API routes — app data is never served stale.
// Cache-first for the static app shell.
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached ?? Response.error()),
      ),
    )
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const clone = response.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone))
            return response
          }),
      ),
    )
  }
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'Gablink', body: event.data.text() }
  }

  const priority = data.priority ?? 'medium'
  const vibratePattern =
    priority === 'high' ? [200, 100, 200, 100, 200] : [150, 75, 150]

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag ?? 'gablink-reminder',
    vibrate: vibratePattern,
    requireInteraction: priority === 'high',
    data: {
      url: data.url ?? '/overview',
      entityId: data.entityId,
      entityType: data.entityType,
      title: data.title,
      body: data.body,
    },
    actions: [
      { action: 'snooze', title: 'Snooze 5 min' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', (event) => {
  const { action, notification } = event
  const data = notification.data || {}
  notification.close()

  if (action === 'dismiss') return

  if (action === 'snooze') {
    // Best-effort only: this relies on the SW staying alive for 5 minutes,
    // which Android/Chrome does not guarantee once backgrounded. There is
    // no server-side reschedule wired up yet (scheduling work is on hold).
    event.waitUntil(
      new Promise((resolve) => {
        setTimeout(
          () => {
            self.registration
              .showNotification(data.title ?? 'Gablink reminder', {
                body: data.body,
                icon: '/icons/icon-192.png',
                tag: notification.tag,
                vibrate: [150, 75, 150],
                data,
                actions: [
                  { action: 'snooze', title: 'Snooze 5 min' },
                  { action: 'dismiss', title: 'Dismiss' },
                ],
              })
              .then(resolve)
          },
          5 * 60 * 1000,
        )
      }),
    )
    return
  }

  const targetUrl = data.url ?? '/overview'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientsArr) => {
        const existing = clientsArr.find((c) => c.url.includes(targetUrl))
        if (existing) return existing.focus()
        return self.clients.openWindow(targetUrl)
      }),
  )
})
