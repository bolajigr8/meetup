// page: /analytics

'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/shared/PageHeader'
import TaskCompletionChart from '@/components/tasks/Taskcompletioncharts'
import MeetingFrequencyChart from '@/components/meetings/Meetingfrequencychart'
import ProgramSummaryChart from '@/components/programs/Programsummarychart'
import OverdueTrendChart from '@/components/dashboard/Overduetrendchart'

type Range = '7d' | '30d' | '90d'

const RANGES: { value: Range; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

interface AnalyticsData {
  taskCompletion: { period: string; completed: number; total: number }[]
  meetingFrequency: { period: string; total: number; high: number }[]
  programSummary: { status: string; count: number }[]
  overdueTrend: { period: string; overdue: number; completed: number }[]
}

function ChartCard({
  title,
  subtitle,
  children,
  loading,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  loading: boolean
}) {
  return (
    <div
      className='bg-white rounded-xl border p-5'
      style={{ borderColor: 'var(--of-border)' }}
    >
      <div className='mb-4'>
        <h3
          className='font-jakarta text-sm font-semibold'
          style={{ color: 'var(--of-heading)' }}
        >
          {title}
        </h3>
        <p className='text-xs mt-0.5' style={{ color: 'var(--of-muted)' }}>
          {subtitle}
        </p>
      </div>
      {loading ? (
        <div
          className='h-55 rounded-lg animate-pulse'
          style={{ background: 'var(--of-border)' }}
        />
      ) : (
        children
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/analytics?range=${range}`)
      const json = await res.json()
      if (!res.ok)
        throw new Error(json.error?.message ?? 'Failed to load analytics')
      setData(json)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load analytics',
      )
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  // Summary stat from data
  const completedTasks =
    data?.taskCompletion.reduce((s, d) => s + d.completed, 0) ?? 0
  const totalTasks = data?.taskCompletion.reduce((s, d) => s + d.total, 0) ?? 0
  const totalMeetings =
    data?.meetingFrequency.reduce((s, d) => s + d.total, 0) ?? 0
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div>
      <PageHeader
        title='Analytics'
        subtitle='Track productivity trends across your workspace.'
        action={
          /* Range filter */
          <div
            className='flex gap-1 p-1 rounded-lg'
            style={{ background: 'var(--of-border)' }}
          >
            {RANGES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                className='px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150'
                style={
                  range === value
                    ? {
                        background: '#fff',
                        color: 'var(--of-heading)',
                        boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                      }
                    : { color: 'var(--of-muted)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      {/* Summary strip */}
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6'>
        {[
          {
            label: 'Tasks created',
            value: loading ? '—' : totalTasks,
            color: 'var(--of-amber)',
          },
          {
            label: 'Tasks completed',
            value: loading ? '—' : completedTasks,
            color: '#10b981',
          },
          {
            label: 'Completion rate',
            value: loading ? '—' : `${completionRate}%`,
            color: 'var(--of-blue)',
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className='bg-white rounded-xl border p-4'
            style={{ borderColor: 'var(--of-border)' }}
          >
            <p className='text-2xl font-jakarta font-bold' style={{ color }}>
              {value}
            </p>
            <p className='text-xs mt-0.5' style={{ color: 'var(--of-muted)' }}>
              {label}
            </p>
          </div>
        ))}

        <div
          className='bg-white rounded-xl border p-4 sm:col-span-0 hidden sm:block'
          style={{ borderColor: 'var(--of-border)' }}
        >
          <p
            className='text-2xl font-jakarta font-bold'
            style={{ color: 'var(--of-blue)' }}
          >
            {loading ? '—' : totalMeetings}
          </p>
          <p className='text-xs mt-0.5' style={{ color: 'var(--of-muted)' }}>
            Meetings scheduled
          </p>
        </div>
      </div>

      {/* Charts grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        <ChartCard
          title='Task completion'
          subtitle='Tasks created vs completed per period'
          loading={loading}
        >
          <TaskCompletionChart data={data?.taskCompletion ?? []} />
        </ChartCard>

        <ChartCard
          title='Meeting frequency'
          subtitle='Total meetings and high-priority breakdown'
          loading={loading}
        >
          <MeetingFrequencyChart data={data?.meetingFrequency ?? []} />
        </ChartCard>

        <ChartCard
          title='Program summary'
          subtitle='All programs by current status'
          loading={loading}
        >
          <ProgramSummaryChart data={data?.programSummary ?? []} />
        </ChartCard>

        <ChartCard
          title='Overdue trend'
          subtitle='Overdue vs completed tasks over time'
          loading={loading}
        >
          <OverdueTrendChart data={data?.overdueTrend ?? []} />
        </ChartCard>
      </div>

      {/* Footer note */}
      {!loading && (
        <div className='mt-4 flex items-center gap-2'>
          <BarChart2 size={13} style={{ color: 'var(--of-muted)' }} />
          <p className='text-xs' style={{ color: 'var(--of-muted)' }}>
            Data reflects items created within the selected period.
          </p>
        </div>
      )}
    </div>
  )
}
