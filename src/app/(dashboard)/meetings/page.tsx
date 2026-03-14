'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import MeetingCard, { Meeting } from '@/components/meetings/MeetingCard'
import MeetingDialog from '@/components/meetings/MeetingDialog'
import DeleteMeetingDialog from '@/components/meetings/DeleteMeetingDialog'
import type { MeetingFormData } from '@/validations/meeting'

const FILTER_OPTIONS = [
  'all',
  'upcoming',
  'ongoing',
  'completed',
  'cancelled',
] as const
type Filter = (typeof FILTER_OPTIONS)[number]

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  // ── Dialog state ──────────────────────────────────────────────────────────────
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | undefined>()

  // ── Fetch meetings ────────────────────────────────────────────────────────────
  const fetchMeetings = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const res = await fetch(`/api/v1/meetings${params}`)
      const json = await res.json()

      if (!res.ok) throw new Error(json.message ?? 'Failed to load meetings')

      setMeetings(json.data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load meetings',
        {
          description: (
            <span style={{ color: '#000000', fontSize: '0.8125rem' }}>
              Check your connection and try refreshing the page.
            </span>
          ),
        },
      )
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setSelectedMeeting(undefined)
    setMeetingDialogOpen(true)
  }

  const openEditDialog = (id: string) => {
    const meeting = meetings.find((m) => m.id === id)
    if (!meeting) return
    setSelectedMeeting(meeting)
    setMeetingDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    const meeting = meetings.find((m) => m.id === id)
    if (!meeting) return
    setSelectedMeeting(meeting)
    setDeleteDialogOpen(true)
  }

  const handleMeetingSuccess = (_data: MeetingFormData) => {
    // Refetch to stay in sync with server
    fetchMeetings()
    setSelectedMeeting(undefined)
  }

  const handleDeleteConfirm = async (id: string) => {
    // Optimistic update
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: 'cancelled' as const } : m,
      ),
    )
    setSelectedMeeting(undefined)

    try {
      const res = await fetch(`/api/v1/meetings/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.message ?? 'Failed to cancel meeting')
      }
      toast.success('Meeting cancelled', {
        description: (
          <span style={{ color: '#000000', fontSize: '0.8125rem' }}>
            The meeting has been marked as cancelled
          </span>
        ),
      })
    } catch (err) {
      // Rollback
      fetchMeetings()
      toast.error(
        err instanceof Error ? err.message : 'Failed to cancel meeting',
        // {
        //   description: 'The meeting was restored. Please try again.',
        // },
      )
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────────
  const upcomingCount = meetings.filter((m) => m.status === 'upcoming').length

  return (
    <div>
      <PageHeader
        title='Meetings'
        subtitle={`${meetings.length} total · ${upcomingCount} upcoming`}
        action={
          <Button
            onClick={openCreateDialog}
            style={{ background: 'var(--of-blue)' }}
            className='text-white hover:opacity-90'
          >
            <Plus size={15} className='mr-1.5' />
            New meeting
          </Button>
        }
      />

      {/* Filter tabs */}
      <div
        className='flex flex-wrap gap-1 p-1 rounded-lg mb-6 w-fit'
        style={{ background: 'var(--of-border)' }}
      >
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className='px-3.5 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-150'
            style={
              filter === f
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

      {/* Grid */}
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
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title='No meetings found'
          description={
            filter === 'all'
              ? "You haven't created any meetings yet. Schedule your first one."
              : `No ${filter} meetings.`
          }
          actionLabel='Schedule a meeting'
          onAction={openCreateDialog}
        />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {meetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
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
