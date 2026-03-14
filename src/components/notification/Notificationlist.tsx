'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CalendarDays,
  CheckSquare,
  GraduationCap,
  Bell,
  CheckCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  entityType?: string
  read: boolean
  createdAt: string
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; bg: string; color: string }
> = {
  meeting_reminder: {
    icon: CalendarDays,
    bg: 'var(--of-blue-light)',
    color: 'var(--of-blue)',
  },
  task_overdue: { icon: CheckSquare, bg: '#FEE2E2', color: '#ef4444' },
  task_due_soon: { icon: CheckSquare, bg: '#FEF3C7', color: 'var(--of-amber)' },
  program_start: {
    icon: GraduationCap,
    bg: '#CCFBF1',
    color: 'var(--of-teal)',
  },
  program_end: { icon: GraduationCap, bg: '#F1F5F9', color: '#64748b' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export default function NotificationList() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [unread, setUnread] = useState(0)
  const [marking, setMarking] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/notifications?limit=50')
      const json = await res.json()
      if (!res.ok)
        throw new Error(json.error?.message ?? 'Failed to load notifications')
      setItems(json.data)
      setUnread(json.meta.unreadCount)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load notifications',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markRead = async (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
    setUnread((u) => Math.max(0, u - 1))
    try {
      const res = await fetch(`/api/v1/notifications/${id}`, {
        method: 'PATCH',
      })
      if (!res.ok) throw new Error('Failed to mark as read')
    } catch {
      fetchNotifications()
    }
  }

  const markAllRead = async () => {
    setMarking(true)
    try {
      const res = await fetch('/api/v1/notifications', { method: 'PATCH' })
      if (!res.ok) throw new Error('Failed to mark all as read')
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnread(0)
      toast.success('All caught up', {
        description: 'All notifications marked as read.',
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setMarking(false)
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className='flex items-center justify-between mb-4'>
        <p className='text-sm font-medium' style={{ color: 'var(--of-muted)' }}>
          {loading ? '—' : unread > 0 ? `${unread} unread` : 'All caught up'}
        </p>
        {unread > 0 && (
          <Button
            variant='ghost'
            size='sm'
            onClick={markAllRead}
            disabled={marking}
            className='h-8 text-xs flex items-center gap-1.5'
            style={{ color: 'var(--of-blue)' }}
          >
            <CheckCheck size={13} />
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className='flex flex-col gap-2'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className='h-20 rounded-xl border animate-pulse'
              style={{ background: 'var(--of-border)' }}
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div
          className='bg-white rounded-xl border flex flex-col items-center justify-center py-16 text-center'
          style={{ borderColor: 'var(--of-border)' }}
        >
          <div
            className='w-12 h-12 rounded-xl grid place-items-center mb-4'
            style={{ background: 'var(--of-blue-light)' }}
          >
            <Bell size={20} style={{ color: 'var(--of-blue)' }} />
          </div>
          <p
            className='text-sm font-semibold'
            style={{ color: 'var(--of-heading)' }}
          >
            No notifications yet
          </p>
          <p
            className='text-xs mt-1 max-w-xs'
            style={{ color: 'var(--of-muted)' }}
          >
            You'll see meeting reminders, task alerts, and program updates here.
          </p>
        </div>
      ) : (
        <div
          className='bg-white rounded-xl border overflow-hidden divide-y'
          style={{ borderColor: 'var(--of-border)' }}
        >
          {items.map((item) => {
            const cfg = typeConfig[item.type] ?? typeConfig.meeting_reminder
            const Icon = cfg.icon
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3.5 px-5 py-4 transition-colors cursor-pointer hover:bg-slate-50 ${
                  !item.read ? 'bg-blue-50/40' : ''
                }`}
                onClick={() => !item.read && markRead(item.id)}
              >
                <div
                  className='w-9 h-9 rounded-lg grid place-items-center shrink-0 mt-0.5'
                  style={{ background: cfg.bg }}
                >
                  <Icon
                    size={15}
                    style={{ color: cfg.color }}
                    strokeWidth={2}
                  />
                </div>

                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2'>
                    <p
                      className='text-sm font-semibold leading-tight'
                      style={{ color: 'var(--of-heading)' }}
                    >
                      {item.title}
                    </p>
                    <span
                      className='text-xs shrink-0 font-mono-of'
                      style={{ color: 'var(--of-muted)' }}
                    >
                      {timeAgo(item.createdAt)}
                    </span>
                  </div>
                  <p
                    className='text-xs mt-1 leading-relaxed'
                    style={{ color: 'var(--of-body)' }}
                  >
                    {item.message}
                  </p>
                </div>

                {/* Unread dot */}
                {!item.read && (
                  <div
                    className='w-2 h-2 rounded-full shrink-0 mt-1.5'
                    style={{ background: 'var(--of-blue)' }}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
