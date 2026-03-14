// page: /calendar

'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import PageHeader from '@/components/shared/PageHeader'
import CalendarGrid, {
  CalendarMeeting,
  CalendarProgram,
} from '@/components/calendar/CalendarGrid'
import DayPanel from '@/components/calendar/Daypanel'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const [meetings, setMeetings] = useState<CalendarMeeting[]>([])
  const [programs, setPrograms] = useState<CalendarProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
  )

  const fetchCalendar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/calendar?year=${year}&month=${month}`)
      const json = await res.json()
      if (!res.ok)
        throw new Error(json.error?.message ?? 'Failed to load calendar')
      setMeetings(json.meetings)
      setPrograms(json.programs)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load calendar',
      )
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    fetchCalendar()
  }, [fetchCalendar])

  const handleMonthChange = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
    setSelectedDate(null)
  }

  const totalEvents = meetings.length + programs.length

  return (
    <div>
      <PageHeader
        title='Calendar'
        subtitle={
          loading
            ? 'Loading...'
            : `${totalEvents} event${totalEvents !== 1 ? 's' : ''} this month`
        }
      />

      {loading ? (
        <div
          className='h-130 rounded-xl border animate-pulse'
          style={{ background: 'var(--of-border)' }}
        />
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start'>
          <CalendarGrid
            year={year}
            month={month}
            meetings={meetings}
            programs={programs}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onMonthChange={handleMonthChange}
          />

          {selectedDate ? (
            <DayPanel
              date={selectedDate}
              meetings={meetings}
              programs={programs}
              onClose={() => setSelectedDate(null)}
            />
          ) : (
            <div
              className='bg-white rounded-xl border p-6 flex flex-col items-center justify-center text-center min-h-50'
              style={{ borderColor: 'var(--of-border)' }}
            >
              <p
                className='text-sm font-medium'
                style={{ color: 'var(--of-heading)' }}
              >
                Select a day
              </p>
              <p className='text-xs mt-1' style={{ color: 'var(--of-muted)' }}>
                Click any date to see its scheduled events.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
