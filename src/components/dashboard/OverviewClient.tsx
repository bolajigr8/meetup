'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  CalendarDays,
  CheckSquare,
  GraduationCap,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import StatCard from '@/components/dashboard/StatCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import QuickActions from '@/components/dashboard/QuickActions'
import PageHeader from '@/components/shared/PageHeader'

interface OverviewStats {
  upcomingMeetings: number
  openTasks: number
  overdueTasks: number
  activePrograms: number
}

function getGreeting(name?: string | null): string {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return name ? `${greeting}, ${name.split(' ')[0]} 👋` : `${greeting} 👋`
}

export default function OverviewClient() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<OverviewStats>({
    upcomingMeetings: 0,
    openTasks: 0,
    overdueTasks: 0,
    activePrograms: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/v1/overview')
      .then((r) => r.json())
      .then((json) => {
        if (json.stats) setStats(json.stats)
      })
      .catch(() => toast.error('Failed to load overview stats'))
      .finally(() => setStatsLoading(false))
  }, [])

  const greeting = getGreeting(session?.user?.name)

  return (
    <div>
      <PageHeader
        title={greeting}
        subtitle="Here's what's happening across your workspace today."
      />

      {/* Stat cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <StatCard
          label='Upcoming meetings'
          value={statsLoading ? '—' : stats.upcomingMeetings}
          icon={CalendarDays}
          color='blue'
          trend={{ value: 'scheduled', direction: 'up' }}
        />
        <StatCard
          label='Open tasks'
          value={statsLoading ? '—' : stats.openTasks}
          icon={CheckSquare}
          color='amber'
          trend={
            stats.overdueTasks > 0
              ? { value: `${stats.overdueTasks} overdue`, direction: 'down' }
              : { value: 'on track', direction: 'up' }
          }
        />
        <StatCard
          label='Active programs'
          value={statsLoading ? '—' : stats.activePrograms}
          icon={GraduationCap}
          color='teal'
        />
        <StatCard
          label='Overdue tasks'
          value={statsLoading ? '—' : stats.overdueTasks}
          icon={AlertCircle}
          color='red'
          trend={
            stats.overdueTasks === 0
              ? { value: 'all clear', direction: 'up' }
              : { value: 'needs attention', direction: 'down' }
          }
        />
      </div>

      {/* Activity feed + quick actions */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2'>
          <ActivityFeed />
        </div>

        <div className='flex flex-col gap-4'>
          <QuickActions />

          {/* WAT timezone note */}
          <div
            className='rounded-xl border px-4 py-3.5'
            style={{
              borderColor: 'var(--of-blue-mid)',
              background: 'var(--of-blue-light)',
            }}
          >
            <p
              className='text-xs font-semibold mb-1'
              style={{ color: 'var(--of-blue)' }}
            >
              🕐 All times in WAT
            </p>
            <p
              className='text-xs leading-relaxed'
              style={{ color: 'var(--of-body)' }}
            >
              All dates and reminders are in{' '}
              <strong>West Africa Time (UTC+1)</strong>. Email reminders go out
              2 days, 1 day, and 2 hours before each event.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
