'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import ProgramCard, { Program } from '@/components/programs/ProgramCard'
import ProgramDialog from '@/components/programs/ProgramDialog'
import DeleteProgramDialog from '@/components/programs/DeleteProgramDialog'
import type { ProgramFormData } from '@/validations/program'

const FILTER_OPTIONS = [
  'all',
  'upcoming',
  'active',
  'completed',
  'cancelled',
] as const
type Filter = (typeof FILTER_OPTIONS)[number]

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')

  const [programDialogOpen, setProgramDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>()

  const fetchPrograms = useCallback(async () => {
    setLoading(true)
    try {
      const params = filter !== 'all' ? `?status=${filter}` : ''
      const res = await fetch(`/api/v1/programs${params}`)
      const json = await res.json()
      if (!res.ok)
        throw new Error(json.error?.message ?? 'Failed to load programs')
      setPrograms(json.data)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to load programs',
      )
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  const openCreateDialog = () => {
    setSelectedProgram(undefined)
    setProgramDialogOpen(true)
  }
  const openEditDialog = (id: string) => {
    const p = programs.find((p) => p.id === id)
    if (!p) return
    setSelectedProgram(p)
    setProgramDialogOpen(true)
  }
  const openDeleteDialog = (id: string) => {
    const p = programs.find((p) => p.id === id)
    if (!p) return
    setSelectedProgram(p)
    setDeleteDialogOpen(true)
  }

  const handleSuccess = (_data: ProgramFormData) => {
    fetchPrograms()
    setSelectedProgram(undefined)
  }

  const handleDeleteConfirm = async (id: string) => {
    setPrograms((prev) =>
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
      toast.success('Program cancelled', {
        description: 'The program has been marked as cancelled.',
      })
    } catch (err) {
      fetchPrograms()
      toast.error(
        err instanceof Error ? err.message : 'Failed to cancel program',
        {
          description: 'The program was restored. Please try again.',
        },
      )
    }
  }

  const activeCount = programs.filter((p) => p.status === 'active').length

  return (
    <div>
      <PageHeader
        title='Training Programs'
        subtitle={`${programs.length} total · ${activeCount} active`}
        action={
          <Button
            onClick={openCreateDialog}
            style={{ background: 'var(--of-teal)' }}
            className='text-white hover:opacity-90'
          >
            <Plus size={15} className='mr-1.5' />
            New program
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
      ) : programs.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title='No programs found'
          description={
            filter === 'all'
              ? "You haven't created any training programs yet."
              : `No ${filter} programs.`
          }
          actionLabel='Create a program'
          onAction={openCreateDialog}
        />
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {programs.map((p) => (
            <ProgramCard
              key={p.id}
              program={p}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

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
    </div>
  )
}
