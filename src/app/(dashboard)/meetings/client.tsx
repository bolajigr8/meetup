'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import ViewModeToggle from '@/components/shared/ViewModeToggle'
import MeetingCard, { Meeting } from '@/components/meetings/MeetingCard'
import MeetingDialog from '@/components/meetings/MeetingDialog'
import DeleteMeetingDialog from '@/components/meetings/DeleteMeetingDialog'
import type { MeetingFormData } from '@/validations/meeting'
import { isMeetingPast } from '@/lib/date-helpers'

const ACTIVE_FILTER_OPTIONS = ['all', 'upcoming', 'ongoing'] as const
const PAST_FILTER_OPTIONS = ['all', 'completed', 'cancelled'] as const
type ActiveFilter = (typeof ACTIVE_FILTER_OPTIONS)[number]
type PastFilter = (typeof PAST_FILTER_OPTIONS)[number]

export default function MeetingsClient() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin || session?.user?.isSuperAdmin || false

  const [allMeetings, setAllMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'upcoming' | 'past'>('upcoming')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [pastFilter, setPastFilter] = useState<PastFilter>('all')

  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | undefined>()

  const fetchMeetings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/meetings?status=all&limit=100')
      const json = await res.json()
      if (!res.ok)
        throw new Error(
          json.error?.message ?? json.message ?? 'Failed to load meetings',
        )
      setAllMeetings(json.data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load meetings',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  const { activeMeetings, pastMeetings } = useMemo(() => {
    const active: Meeting[] = []
    const past: Meeting[] = []
    for (const m of allMeetings) {
      if (isMeetingPast(m)) past.push(m)
      else active.push(m)
    }
    active.sort((a, b) =>
      (a.date + a.startTime).localeCompare(b.date + b.startTime),
    )
    past.sort((a, b) =>
      (b.date + b.startTime).localeCompare(a.date + a.startTime),
    )
    return { activeMeetings: active, pastMeetings: past }
  }, [allMeetings])

  const displayedMeetings = useMemo(() => {
    if (viewMode === 'upcoming') {
      if (activeFilter === 'all') return activeMeetings
      return activeMeetings.filter((m) => m.status === activeFilter)
    }
    if (pastFilter === 'all') return pastMeetings
    return pastMeetings.filter((m) => m.status === pastFilter)
  }, [viewMode, activeFilter, pastFilter, activeMeetings, pastMeetings])

  const openCreateDialog = () => {
    setSelectedMeeting(undefined)
    setMeetingDialogOpen(true)
  }
  const openEditDialog = (id: string) => {
    const m = allMeetings.find((m) => m.id === id)
    if (!m) return
    setSelectedMeeting(m)
    setMeetingDialogOpen(true)
  }
  const openDeleteDialog = (id: string) => {
    const m = allMeetings.find((m) => m.id === id)
    if (!m) return
    setSelectedMeeting(m)
    setDeleteDialogOpen(true)
  }

  const handleMeetingSuccess = (_data: MeetingFormData) => {
    fetchMeetings()
    setSelectedMeeting(undefined)
  }

  const handleDeleteConfirm = async (id: string) => {
    setAllMeetings((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: 'cancelled' as const } : m,
      ),
    )
    setSelectedMeeting(undefined)
    try {
      const res = await fetch(`/api/v1/meetings/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error?.message ?? 'Failed to cancel')
      }
      toast.success('Meeting cancelled')
    } catch (err) {
      fetchMeetings()
      toast.error(
        err instanceof Error ? err.message : 'Failed to cancel meeting',
      )
    }
  }

  const upcomingCount = activeMeetings.filter(
    (m) => m.status === 'upcoming',
  ).length

  return (
    <div>
      <PageHeader
        title='Meetings'
        subtitle={
          viewMode === 'upcoming'
            ? `${activeMeetings.length} active · ${upcomingCount} upcoming`
            : `${pastMeetings.length} past meeting${pastMeetings.length !== 1 ? 's' : ''}`
        }
        action={
          isAdmin ? (
            <Button
              onClick={openCreateDialog}
              style={{ background: 'var(--of-blue)' }}
              className='text-white hover:opacity-90'
            >
              <Plus size={15} className='mr-1.5' />
              New meeting
            </Button>
          ) : undefined
        }
      />

      <div className='flex flex-wrap items-center gap-3 mb-6'>
        <ViewModeToggle
          mode={viewMode}
          onChange={setViewMode}
          pastCount={pastMeetings.length}
        />

        <div
          className='flex flex-wrap gap-1 p-1 rounded-lg w-fit'
          style={{ background: 'var(--of-border)' }}
        >
          {(viewMode === 'upcoming'
            ? ACTIVE_FILTER_OPTIONS
            : PAST_FILTER_OPTIONS
          ).map((f) => (
            <button
              key={f}
              onClick={() =>
                viewMode === 'upcoming'
                  ? setActiveFilter(f as ActiveFilter)
                  : setPastFilter(f as PastFilter)
              }
              className='px-3.5 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-150'
              style={
                (viewMode === 'upcoming' ? activeFilter : pastFilter) === f
                  ? {
                      background: '#fff',
                      color: 'var(--of-heading)',
                      boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                    }
                  : { color: 'var(--of-muted)' }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='h-44 rounded-xl border animate-pulse'
              style={{ background: 'var(--of-border)' }}
            />
          ))}
        </div>
      ) : displayedMeetings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={viewMode === 'past' ? 'No past meetings' : 'No meetings found'}
          description={
            viewMode === 'past'
              ? 'Meetings move here automatically once their scheduled time has passed.'
              : activeFilter === 'all'
                ? isAdmin
                  ? "You haven't created any meetings yet. Schedule your first one."
                  : 'No meetings have been assigned to you yet.'
                : `No ${activeFilter} meetings.`
          }
          actionLabel={
            viewMode === 'upcoming' && isAdmin
              ? 'Schedule a meeting'
              : undefined
          }
          onAction={
            viewMode === 'upcoming' && isAdmin ? openCreateDialog : undefined
          }
        />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {displayedMeetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              onEdit={isAdmin ? openEditDialog : undefined}
              onDelete={isAdmin ? openDeleteDialog : undefined}
            />
          ))}
        </div>
      )}

      <MeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        meeting={selectedMeeting}
        onSuccess={handleMeetingSuccess}
      />
      <DeleteMeetingDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        meeting={selectedMeeting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
