'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, CheckSquare, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

export interface ActivityItem {
  id: string
  type: 'meeting' | 'task' | 'program'
  title: string
  subtitle: string
  time: string
  status?: string
  priority?: 'low' | 'medium' | 'high'
}

const typeConfig = {
  meeting: {
    icon: CalendarDays,
    bg: 'var(--of-blue-light)',
    color: 'var(--of-blue)',
  },
  task: { icon: CheckSquare, bg: '#FEF3C7', color: 'var(--of-amber)' },
  program: { icon: GraduationCap, bg: '#D1FAE5', color: 'var(--of-emerald)' },
}

const priorityColors: Record<string, { bg: string; text: string }> = {
  high: { bg: '#FEE2E2', text: '#991B1B' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  low: { bg: '#F0FDF4', text: '#166534' },
}

export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/overview')
      .then((r) => r.json())
      .then((json) => {
        if (json.activity) setItems(json.activity)
      })
      .catch(() => toast.error('Failed to load recent activity'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div
      className='bg-white rounded-xl border overflow-hidden'
      style={{ borderColor: 'var(--of-border)' }}
    >
      <div
        className='px-5 py-4 border-b'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <h3
          className='font-jakarta text-sm font-semibold'
          style={{ color: 'var(--of-heading)' }}
        >
          Recent Activity
        </h3>
      </div>

      {loading ? (
        <ul className='divide-y' style={{ borderColor: 'var(--of-border)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className='flex items-center gap-3.5 px-5 py-3.5'>
              <div
                className='w-9 h-9 rounded-lg shrink-0 animate-pulse'
                style={{ background: 'var(--of-border)' }}
              />
              <div className='flex-1 flex flex-col gap-1.5'>
                <div
                  className='h-3 rounded animate-pulse w-2/3'
                  style={{ background: 'var(--of-border)' }}
                />
                <div
                  className='h-2.5 rounded animate-pulse w-1/2'
                  style={{ background: 'var(--of-border)' }}
                />
              </div>
              <div
                className='h-2.5 w-16 rounded animate-pulse'
                style={{ background: 'var(--of-border)' }}
              />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className='px-5 py-10 text-center'>
          <p className='text-sm' style={{ color: 'var(--of-muted)' }}>
            No recent activity yet.
          </p>
          <p className='text-xs mt-1' style={{ color: 'var(--of-muted)' }}>
            Create a meeting, task, or program to get started.
          </p>
        </div>
      ) : (
        <ul className='divide-y' style={{ borderColor: 'var(--of-border)' }}>
          {items.map((item) => {
            const cfg = typeConfig[item.type]
            const Icon = cfg.icon
            const pColor = item.priority ? priorityColors[item.priority] : null

            return (
              <li
                key={item.id}
                className='flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50 transition-colors'
              >
                <div
                  className='w-9 h-9 rounded-lg grid place-items-center shrink-0'
                  style={{ background: cfg.bg }}
                >
                  <Icon
                    size={15}
                    style={{ color: cfg.color }}
                    strokeWidth={2}
                  />
                </div>

                <div className='flex-1 min-w-0'>
                  <p
                    className='text-sm font-medium truncate'
                    style={{ color: 'var(--of-heading)' }}
                  >
                    {item.title}
                  </p>
                  <p
                    className='text-xs mt-0.5 truncate'
                    style={{ color: 'var(--of-muted)' }}
                  >
                    {item.subtitle}
                  </p>
                </div>

                <div className='flex flex-col items-end gap-1.5 shrink-0'>
                  <span
                    className='text-xs font-mono-of'
                    style={{ color: 'var(--of-muted)' }}
                  >
                    {item.time}
                  </span>
                  {pColor && item.priority && (
                    <span
                      className='text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize'
                      style={{ background: pColor.bg, color: pColor.text }}
                    >
                      {item.priority}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
