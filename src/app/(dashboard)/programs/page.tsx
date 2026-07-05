'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, GraduationCap } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import ViewModeToggle from '@/components/shared/ViewModeToggle'
import ProgramCard, { Program } from '@/components/programs/ProgramCard'
import ProgramDialog from '@/components/programs/ProgramDialog'
import DeleteProgramDialog from '@/components/programs/DeleteProgramDialog'
import type { ProgramFormData } from '@/validations/program'
import { isProgramPast } from '@/lib/date-helpers'

const ACTIVE_FILTER_OPTIONS = ['all', 'upcoming', 'active'] as const
const PAST_FILTER_OPTIONS = ['all', 'completed', 'cancelled'] as const
type ActiveFilter = (typeof ACTIVE_FILTER_OPTIONS)[number]
type PastFilter = (typeof PAST_FILTER_OPTIONS)[number]

export default function ProgramsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const isAdmin = session?.user?.isAdmin || session?.user?.isSuperAdmin || false

  const [allPrograms, setAllPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'upcoming' | 'past'>('upcoming')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [pastFilter, setPastFilter] = useState<PastFilter>('all')

  const [programDialogOpen, setProgramDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>()

  const fetchPrograms = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch everything once — active/past split and filtering happen
      // entirely client-side below.
      const res = await fetch('/api/v1/programs?status=all&limit=100')
      const json = await res.json()
      if (!res.ok)
        throw new Error(json.error?.message ?? 'Failed to load programs')
      setAllPrograms(json.data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load programs',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus !== 'loading') fetchPrograms()
  }, [fetchPrograms, sessionStatus])

  const { activePrograms, pastPrograms } = useMemo(() => {
    const active: Program[] = []
    const past: Program[] = []
    for (const p of allPrograms) {
      if (isProgramPast(p)) past.push(p)
      else active.push(p)
    }
    active.sort((a, b) => a.startDate.localeCompare(b.startDate))
    past.sort((a, b) => b.endDate.localeCompare(a.endDate))
    return { activePrograms: active, pastPrograms: past }
  }, [allPrograms])

  const displayedPrograms = useMemo(() => {
    if (viewMode === 'upcoming') {
      if (activeFilter === 'all') return activePrograms
      return activePrograms.filter((p) => p.status === activeFilter)
    }
    if (pastFilter === 'all') return pastPrograms
    return pastPrograms.filter((p) => p.status === pastFilter)
  }, [viewMode, activeFilter, pastFilter, activePrograms, pastPrograms])

  const openCreateDialog = () => {
    if (!isAdmin) return
    setSelectedProgram(undefined)
    setProgramDialogOpen(true)
  }

  const openEditDialog = (id: string) => {
    if (!isAdmin) return
    const p = allPrograms.find((p) => p.id === id)
    if (!p) return
    setSelectedProgram(p)
    setProgramDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    if (!isAdmin) return
    const p = allPrograms.find((p) => p.id === id)
    if (!p) return
    setSelectedProgram(p)
    setDeleteDialogOpen(true)
  }

  const handleSuccess = (_data: ProgramFormData) => {
    fetchPrograms()
    setSelectedProgram(undefined)
  }

  const handleDeleteConfirm = async (id: string) => {
    if (!isAdmin) return
    setAllPrograms((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'cancelled' as const } : p,
      ),
    )
    setSelectedProgram(undefined)
    try {
      const res = await fetch(`/api/v1/programs/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error?.message ?? 'Failed to cancel program')
      }
      toast.success('Program cancelled')
    } catch (err) {
      fetchPrograms()
      toast.error(
        err instanceof Error ? err.message : 'Failed to cancel program',
      )
    }
  }

  const activeCount = activePrograms.filter((p) => p.status === 'active').length

  if (sessionStatus === 'loading') {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='h-48 rounded-xl border animate-pulse'
            style={{ background: 'var(--of-border)' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title='Training Programs'
        subtitle={
          viewMode === 'upcoming'
            ? `${activePrograms.length} active · ${activeCount} in progress`
            : `${pastPrograms.length} past program${pastPrograms.length !== 1 ? 's' : ''}`
        }
        action={
          isAdmin ? (
            <Button
              onClick={openCreateDialog}
              style={{ background: 'var(--of-teal)' }}
              className='text-white hover:opacity-90'
            >
              <Plus size={15} className='mr-1.5' />
              New program
            </Button>
          ) : undefined
        }
      />

      <div className='flex flex-wrap items-center gap-3 mb-6'>
        <ViewModeToggle
          mode={viewMode}
          onChange={setViewMode}
          pastCount={pastPrograms.length}
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
              className='h-48 rounded-xl border animate-pulse'
              style={{ background: 'var(--of-border)' }}
            />
          ))}
        </div>
      ) : displayedPrograms.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title={viewMode === 'past' ? 'No past programs' : 'No programs found'}
          description={
            viewMode === 'past'
              ? 'Programs move here automatically once their end date has passed.'
              : activeFilter === 'all'
                ? isAdmin
                  ? "You haven't created any training programs yet."
                  : 'No programs have been assigned to you yet.'
                : `No ${activeFilter} programs.`
          }
          actionLabel={
            viewMode === 'upcoming' && isAdmin ? 'Create a program' : undefined
          }
          onAction={
            viewMode === 'upcoming' && isAdmin ? openCreateDialog : undefined
          }
        />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {displayedPrograms.map((p) => (
            <ProgramCard
              key={p.id}
              program={p}
              onEdit={isAdmin ? openEditDialog : undefined}
              onDelete={isAdmin ? openDeleteDialog : undefined}
            />
          ))}
        </div>
      )}

      {isAdmin && (
        <>
          <ProgramDialog
            open={programDialogOpen}
            onOpenChange={setProgramDialogOpen}
            program={selectedProgram}
            onSuccess={handleSuccess}
          />
          <DeleteProgramDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            program={selectedProgram}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  )
}
