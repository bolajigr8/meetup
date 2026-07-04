'use client'

import { Bell, BellOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/hooks/use-push-notifications'

export default function PushNotificationToggle() {
  const { status, loading, subscribe, unsubscribe } = usePushNotifications()

  if (status === 'unsupported') {
    return (
      <p className='text-xs' style={{ color: 'var(--of-muted)' }}>
        Push notifications aren&apos;t supported on this browser. On Android,
        install Gablink to your home screen from Chrome for the best experience.
      </p>
    )
  }

  if (status === 'denied') {
    return (
      <p className='text-xs' style={{ color: 'var(--of-muted)' }}>
        Notifications are blocked for Gablink in your browser settings. Enable
        them from your browser&apos;s site settings to receive push reminders.
      </p>
    )
  }

  const isSubscribed = status === 'subscribed'

  return (
    <div
      className='flex items-center justify-between px-4 py-3.5 rounded-xl border'
      style={{ borderColor: 'var(--of-border)' }}
    >
      <div className='flex items-center gap-3'>
        <div
          className='w-9 h-9 rounded-lg grid place-items-center shrink-0'
          style={{ background: isSubscribed ? '#D1FAE5' : 'var(--of-border)' }}
        >
          {isSubscribed ? (
            <Bell size={16} style={{ color: '#065F46' }} />
          ) : (
            <BellOff size={16} style={{ color: 'var(--of-muted)' }} />
          )}
        </div>
        <div>
          <p
            className='text-sm font-medium'
            style={{ color: 'var(--of-heading)' }}
          >
            Push notifications
          </p>
          <p className='text-xs mt-0.5' style={{ color: 'var(--of-muted)' }}>
            {isSubscribed
              ? 'Enabled on this device'
              : 'Get reminders on this device, even when Gablink is closed'}
          </p>
        </div>
      </div>
      <Button
        size='sm'
        variant='outline'
        disabled={loading}
        onClick={async () => {
          if (isSubscribed) {
            await unsubscribe()
            toast.success('Push notifications disabled on this device')
          } else {
            const ok = await subscribe()
            if (ok) toast.success('Push notifications enabled')
            else toast.error('Could not enable push notifications')
          }
        }}
        className='h-8 text-xs flex items-center gap-1.5'
      >
        {loading ? (
          <Loader2 size={12} className='animate-spin' />
        ) : isSubscribed ? (
          'Disable'
        ) : (
          'Enable'
        )}
      </Button>
    </div>
  )
}
