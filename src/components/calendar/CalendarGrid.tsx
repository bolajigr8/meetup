'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface CalendarMeeting {
  id: string
  type: 'meeting'
  title: string
  date: string
  startTime?: string
  endTime?: string
  location?: string
  participantCount: number
  priority: string
  status: string
}

export interface CalendarProgram {
  id: string
  type: 'program'
  title: string
  startDate: string
  endDate: string
  scheduleType: string
  participantCount: number
  status: string
}

interface CalendarGridProps {
  year: number
  month: number // 1-based
  meetings: CalendarMeeting[]
  programs: CalendarProgram[]
  selectedDate: string | null
  onDateSelect: (date: string) => void
  onMonthChange: (year: number, month: number) => void
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
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

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function dateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`
}

function programCoversDate(p: CalendarProgram, date: string): boolean {
  return date >= p.startDate && date <= p.endDate
}

export default function CalendarGrid({
  year,
  month,
  meetings,
  programs,
  selectedDate,
  onDateSelect,
  onMonthChange,
}: CalendarGridProps) {
  const firstDow = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const daysInPrev = new Date(year, month - 1, 0).getDate()

  // Build grid cells (always 6 rows × 7 cols = 42)
  const cells: { date: string; day: number; thisMonth: boolean }[] = []

  for (let i = 0; i < firstDow; i++) {
    const day = daysInPrev - firstDow + i + 1
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    cells.push({
      date: dateStr(prevYear, prevMonth, day),
      day,
      thisMonth: false,
    })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: dateStr(year, month, d), day: d, thisMonth: true })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear = month === 12 ? year + 1 : year
    cells.push({
      date: dateStr(nextYear, nextMonth, d),
      day: d,
      thisMonth: false,
    })
  }

  const today = new Date()
  const todayStr = dateStr(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  )

  const prevMonth = () =>
    month === 1 ? onMonthChange(year - 1, 12) : onMonthChange(year, month - 1)
  const nextMonth = () =>
    month === 12 ? onMonthChange(year + 1, 1) : onMonthChange(year, month + 1)

  return (
    <div
      className='bg-white rounded-xl border overflow-hidden'
      style={{ borderColor: 'var(--of-border)' }}
    >
      {/* Header */}
      <div
        className='flex items-center justify-between px-5 py-4 border-b'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <h2
          className='font-jakarta text-base font-semibold'
          style={{ color: 'var(--of-heading)' }}
        >
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={prevMonth}
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='text-xs h-8 px-3'
            onClick={() => {
              const now = new Date()
              onMonthChange(now.getFullYear(), now.getMonth() + 1)
            }}
          >
            Today
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={nextMonth}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      {/* Day labels */}
      <div
        className='grid grid-cols-7 border-b'
        style={{ borderColor: 'var(--of-border)' }}
      >
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className='py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide'
            style={{ color: 'var(--of-muted)' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className='grid grid-cols-7'>
        {cells.map(({ date, day, thisMonth }, idx) => {
          const dayMeetings = meetings.filter((m) => m.date === date)
          const dayPrograms = programs.filter((p) => programCoversDate(p, date))
          const isToday = date === todayStr
          const isSelected = date === selectedDate
          const hasEvents = dayMeetings.length > 0 || dayPrograms.length > 0

          const isLastRow = idx >= 35
          const isLastCol = (idx + 1) % 7 === 0

          return (
            <button
              key={date}
              onClick={() => onDateSelect(date)}
              className={`relative min-h-18 p-2 text-left transition-colors hover:bg-slate-50 ${
                !isLastRow ? 'border-b' : ''
              } ${!isLastCol ? 'border-r' : ''}`}
              style={{ borderColor: 'var(--of-border)' }}
            >
              {/* Day number */}
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mb-1 ${
                  isToday ? 'text-white' : ''
                } ${isSelected && !isToday ? 'ring-2' : ''}`}
                style={{
                  background: isToday
                    ? 'var(--of-blue)'
                    : isSelected
                      ? 'var(--of-blue-light)'
                      : 'transparent',
                  color: isToday
                    ? 'white'
                    : thisMonth
                      ? 'var(--of-heading)'
                      : 'var(--of-muted)',
                  outline:
                    isSelected && !isToday
                      ? '2px solid var(--of-blue)'
                      : undefined,
                  outlineOffset: '1px',
                }}
              >
                {day}
              </span>

              {/* Event pills */}
              {hasEvents && (
                <div className='flex flex-col gap-0.5 mt-0.5'>
                  {dayMeetings.slice(0, 2).map((m) => (
                    <div
                      key={m.id}
                      className='text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-tight'
                      style={{
                        background: 'var(--of-blue-light)',
                        color: 'var(--of-blue)',
                      }}
                    >
                      {m.startTime ? `${m.startTime} ` : ''}
                      {m.title}
                    </div>
                  ))}
                  {dayPrograms.slice(0, 1).map((p) => (
                    <div
                      key={p.id}
                      className='text-[10px] font-medium px-1.5 py-0.5 rounded truncate leading-tight'
                      style={{ background: '#CCFBF1', color: 'var(--of-teal)' }}
                    >
                      {p.title}
                    </div>
                  ))}
                  {dayMeetings.length + dayPrograms.length > 3 && (
                    <span
                      className='text-[10px] font-semibold'
                      style={{ color: 'var(--of-muted)' }}
                    >
                      +{dayMeetings.length + dayPrograms.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div
        className='flex items-center gap-4 px-5 py-3 border-t'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <div className='flex items-center gap-1.5'>
          <div
            className='w-2.5 h-2.5 rounded-sm'
            style={{ background: 'var(--of-blue-light)' }}
          />
          <span className='text-xs' style={{ color: 'var(--of-muted)' }}>
            Meeting
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <div
            className='w-2.5 h-2.5 rounded-sm'
            style={{ background: '#CCFBF1' }}
          />
          <span className='text-xs' style={{ color: 'var(--of-muted)' }}>
            Program
          </span>
        </div>
      </div>
    </div>
  )
}
