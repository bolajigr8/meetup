'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface NotifPrefs {
  meetingReminder2Days: boolean
  meetingReminder1Day: boolean
  meetingReminder2Hours: boolean
  taskOverdueAlert: boolean
  taskDueSoon: boolean
  programStartReminder: boolean
}

const DEFAULT_PREFS: NotifPrefs = {
  meetingReminder2Days: true,
  meetingReminder1Day: true,
  meetingReminder2Hours: true,
  taskOverdueAlert: true,
  taskDueSoon: true,
  programStartReminder: true,
}

const PREF_GROUPS = [
  {
    group: 'Meetings',
    color: 'var(--of-blue)',
    items: [
      {
        key: 'meetingReminder2Days',
        label: '2 days before',
        desc: 'Get a heads-up 2 days before a meeting.',
      },
      {
        key: 'meetingReminder1Day',
        label: '1 day before',
        desc: 'Reminder the day before a meeting.',
      },
      {
        key: 'meetingReminder2Hours',
        label: '2 hours before',
        desc: 'Last-minute reminder before a meeting starts.',
      },
    ],
  },
  {
    group: 'Tasks',
    color: 'var(--of-amber)',
    items: [
      {
        key: 'taskDueSoon',
        label: 'Due tomorrow',
        desc: 'Alert when a task is due the next day.',
      },
      {
        key: 'taskOverdueAlert',
        label: 'Overdue alert',
        desc: 'Notified when a task passes its due date.',
      },
    ],
  },
  {
    group: 'Programs',
    color: 'var(--of-teal)',
    items: [
      {
        key: 'programStartReminder',
        label: 'Program starting soon',
        desc: 'Reminder before a program begins.',
      },
    ],
  },
]

export default function NotificationPrefsForm() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch('/api/v1/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.notificationPrefs) setPrefs(data.notificationPrefs)
      })
      .catch(() => toast.error('Failed to load notification preferences'))
      .finally(() => setFetching(false))
  }, [])

  const toggle = (key: keyof NotifPrefs) =>
    setPrefs((p) => ({ ...p, [key]: !p[key] }))

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPrefs: prefs }),
      })
      const data = await res.json()
      if (!res.ok)
        throw new Error(data.error?.message ?? 'Failed to save preferences')
      toast.success('Preferences saved', {
        description: (
          <span style={{ color: '#000000', fontSize: '0.8125rem' }}>
            Your notification settings have been updated.
          </span>
        ),
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className='flex flex-col gap-4 max-w-lg'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='h-16 rounded-xl animate-pulse'
            style={{ background: 'var(--of-border)' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-6 max-w-lg'>
      {PREF_GROUPS.map(({ group, color, items }) => (
        <div key={group}>
          <p
            className='text-xs font-semibold uppercase tracking-widest mb-2'
            style={{ color }}
          >
            {group}
          </p>
          <div
            className='rounded-xl border overflow-hidden divide-y'
            style={{ borderColor: 'var(--of-border)' }}
          >
            {items.map(({ key, label, desc }) => (
              <div
                key={key}
                className='flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer'
                onClick={() => toggle(key as keyof NotifPrefs)}
              >
                <div>
                  <p
                    className='text-sm font-medium'
                    style={{ color: 'var(--of-heading)' }}
                  >
                    {label}
                  </p>
                  <p
                    className='text-xs mt-0.5'
                    style={{ color: 'var(--of-muted)' }}
                  >
                    {desc}
                  </p>
                </div>
                {/* Toggle switch */}
                <div
                  className='relative w-10 h-5.5 rounded-full transition-colors duration-200 shrink-0 ml-4'
                  style={{
                    background: prefs[key as keyof NotifPrefs]
                      ? 'var(--of-blue)'
                      : '#CBD5E1',
                    height: '22px',
                    width: '40px',
                  }}
                >
                  <div
                    className='absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200'
                    style={{
                      transform: prefs[key as keyof NotifPrefs]
                        ? 'translateX(20px)'
                        : 'translateX(2px)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <Button
          onClick={handleSave}
          disabled={loading}
          style={{ background: 'var(--of-blue)' }}
          className='text-white hover:opacity-90 min-w-32 flex items-center gap-2 justify-center'
        >
          {loading && <Loader2 size={14} className='animate-spin' />}
          {loading ? 'Saving...' : 'Save preferences'}
        </Button>
      </div>
    </div>
  )
}
