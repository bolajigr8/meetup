'use client'

import {
  CalendarDays,
  GraduationCap,
  Clock,
  MapPin,
  Users,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CalendarMeeting, CalendarProgram } from './CalendarGrid'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const priorityStyles: Record<string, { bg: string; text: string }> = {
  high: { bg: '#FEE2E2', text: '#991B1B' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  low: { bg: '#F0FDF4', text: '#166534' },
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  upcoming: { bg: 'var(--of-blue-light)', text: 'var(--of-blue)' },
  active: { bg: '#D1FAE5', text: '#065F46' },
  completed: { bg: '#F1F5F9', text: '#475569' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
}

interface DayPanelProps {
  date: string // YYYY-MM-DD
  meetings: CalendarMeeting[]
  programs: CalendarProgram[]
  onClose: () => void
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return `${d.toLocaleDateString('en-GB', { weekday: 'long' })}, ${day} ${MONTH_NAMES[month - 1]} ${year}`
}

function programCoversDate(p: CalendarProgram, date: string): boolean {
  return date >= p.startDate && date <= p.endDate
}

export default function DayPanel({
  date,
  meetings,
  programs,
  onClose,
}: DayPanelProps) {
  const dayMeetings = meetings.filter((m) => m.date === date)
  const dayPrograms = programs.filter((p) => programCoversDate(p, date))
  const total = dayMeetings.length + dayPrograms.length

  return (
    <div
      className='bg-white rounded-xl border h-full flex flex-col'
      style={{ borderColor: 'var(--of-border)' }}
    >
      {/* Header */}
      <div
        className='flex items-start justify-between px-5 py-4 border-b shrink-0'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <div>
          <p
            className='text-sm font-semibold leading-tight'
            style={{ color: 'var(--of-heading)' }}
          >
            {formatDate(date)}
          </p>
          <p className='text-xs mt-0.5' style={{ color: 'var(--of-muted)' }}>
            {total === 0
              ? 'No events'
              : `${total} event${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 shrink-0'
          onClick={onClose}
        >
          <X size={14} />
        </Button>
      </div>

      {/* Event list */}
      <div className='flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3'>
        {total === 0 ? (
          <div className='flex flex-col items-center justify-center py-10 text-center'>
            <div
              className='w-10 h-10 rounded-xl grid place-items-center mb-3'
              style={{ background: 'var(--of-border)' }}
            >
              <CalendarDays size={18} style={{ color: 'var(--of-muted)' }} />
            </div>
            <p
              className='text-sm font-medium'
              style={{ color: 'var(--of-heading)' }}
            >
              Nothing scheduled
            </p>
            <p className='text-xs mt-1' style={{ color: 'var(--of-muted)' }}>
              This day is free.
            </p>
          </div>
        ) : (
          <>
            {/* Meetings */}
            {dayMeetings.map((m) => {
              const pStyle = priorityStyles[m.priority] ?? priorityStyles.low
              return (
                <div
                  key={m.id}
                  className='rounded-xl border p-3.5'
                  style={{ borderColor: 'var(--of-border)' }}
                >
                  <div className='flex items-start gap-2.5 mb-2'>
                    <div
                      className='w-7 h-7 rounded-lg grid place-items-center shrink-0 mt-0.5'
                      style={{ background: 'var(--of-blue-light)' }}
                    >
                      <CalendarDays
                        size={13}
                        style={{ color: 'var(--of-blue)' }}
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p
                        className='text-sm font-semibold leading-snug'
                        style={{ color: 'var(--of-heading)' }}
                      >
                        {m.title}
                      </p>
                      <span
                        className='inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize'
                        style={{ background: pStyle.bg, color: pStyle.text }}
                      >
                        {m.priority}
                      </span>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 pl-9'>
                    {(m.startTime || m.endTime) && (
                      <div className='flex items-center gap-1.5'>
                        <Clock size={11} style={{ color: 'var(--of-muted)' }} />
                        <span
                          className='text-xs font-mono-of'
                          style={{ color: 'var(--of-body)' }}
                        >
                          {m.startTime}
                          {m.endTime ? ` – ${m.endTime}` : ''}
                        </span>
                      </div>
                    )}
                    {m.location && (
                      <div className='flex items-center gap-1.5'>
                        <MapPin
                          size={11}
                          style={{ color: 'var(--of-muted)' }}
                        />
                        <span
                          className='text-xs truncate'
                          style={{ color: 'var(--of-body)' }}
                        >
                          {m.location}
                        </span>
                      </div>
                    )}
                    <div className='flex items-center gap-1.5'>
                      <Users size={11} style={{ color: 'var(--of-muted)' }} />
                      <span
                        className='text-xs'
                        style={{ color: 'var(--of-body)' }}
                      >
                        {m.participantCount} participant
                        {m.participantCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Programs */}
            {dayPrograms.map((p) => {
              const sStyle = statusStyles[p.status] ?? statusStyles.upcoming
              return (
                <div
                  key={p.id}
                  className='rounded-xl border p-3.5'
                  style={{ borderColor: 'var(--of-border)' }}
                >
                  <div className='flex items-start gap-2.5 mb-2'>
                    <div
                      className='w-7 h-7 rounded-lg grid place-items-center shrink-0 mt-0.5'
                      style={{ background: '#CCFBF1' }}
                    >
                      <GraduationCap
                        size={13}
                        style={{ color: 'var(--of-teal)' }}
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p
                        className='text-sm font-semibold leading-snug'
                        style={{ color: 'var(--of-heading)' }}
                      >
                        {p.title}
                      </p>
                      <span
                        className='inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize'
                        style={{ background: sStyle.bg, color: sStyle.text }}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <div className='flex flex-col gap-1 pl-9'>
                    <div className='flex items-center gap-1.5'>
                      <Clock size={11} style={{ color: 'var(--of-muted)' }} />
                      <span
                        className='text-xs font-mono-of'
                        style={{ color: 'var(--of-body)' }}
                      >
                        {p.startDate} → {p.endDate}
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <Users size={11} style={{ color: 'var(--of-muted)' }} />
                      <span
                        className='text-xs'
                        style={{ color: 'var(--of-body)' }}
                      >
                        {p.participantCount} participant
                        {p.participantCount !== 1 ? 's' : ''} · {p.scheduleType}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
