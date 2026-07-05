'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, CheckSquare } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import ViewModeToggle from '@/components/shared/ViewModeToggle'
import TaskCard, { Task } from '@/components/tasks/TaskCard'
import TaskDialog from '@/components/tasks/TaskDialog'
import DeleteTaskDialog from '@/components/tasks/DeleteTaskDialog'
import type { TaskFormData } from '@/validations/task'
import { isTaskPast } from '@/lib/date-helpers'

const ACTIVE_STATUS_FILTERS = [
  'all',
  'todo',
  'in_progress',
  'completed',
] as const
const PAST_STATUS_FILTERS = ['all', 'overdue', 'completed'] as const
const PRIORITY_FILTERS = ['all', 'high', 'medium', 'low'] as const

type ActiveStatusFilter = (typeof ACTIVE_STATUS_FILTERS)[number]
type PastStatusFilter = (typeof PAST_STATUS_FILTERS)[number]
type PriorityFilter = (typeof PRIORITY_FILTERS)[number]

export default function TasksPage() {
  const { data: session, status: sessionStatus } = useSession()
  const isAdmin = session?.user?.isAdmin || session?.user?.isSuperAdmin || false

  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'upcoming' | 'past'>('upcoming')
  const [activeStatusFilter, setActiveStatusFilter] =
    useState<ActiveStatusFilter>('all')
  const [pastStatusFilter, setPastStatusFilter] =
    useState<PastStatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch everything once — active/past split and filtering happen
      // entirely client-side below.
      const res = await fetch('/api/v1/tasks?status=all&priority=all&limit=100')
      const json = await res.json()
      if (!res.ok)
        throw new Error(json.error?.message ?? 'Failed to load tasks')
      setAllTasks(json.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus !== 'loading') fetchTasks()
  }, [fetchTasks, sessionStatus])

  const { activeTasks, pastTasks } = useMemo(() => {
    const active: Task[] = []
    const past: Task[] = []
    for (const t of allTasks) {
      if (isTaskPast(t)) past.push(t)
      else active.push(t)
    }
    active.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    past.sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    return { activeTasks: active, pastTasks: past }
  }, [allTasks])

  const displayedTasks = useMemo(() => {
    const base =
      viewMode === 'upcoming'
        ? activeStatusFilter === 'all'
          ? activeTasks
          : activeTasks.filter((t) => t.status === activeStatusFilter)
        : pastStatusFilter === 'all'
          ? pastTasks
          : pastTasks.filter((t) => t.status === pastStatusFilter)

    if (priorityFilter === 'all') return base
    return base.filter((t) => t.priority === priorityFilter)
  }, [
    viewMode,
    activeStatusFilter,
    pastStatusFilter,
    priorityFilter,
    activeTasks,
    pastTasks,
  ])

  const openCreateDialog = () => {
    if (!isAdmin) return
    setSelectedTask(undefined)
    setTaskDialogOpen(true)
  }

  const openEditDialog = (id: string) => {
    if (!isAdmin) return
    const t = allTasks.find((t) => t.id === id)
    if (!t) return
    setSelectedTask(t)
    setTaskDialogOpen(true)
  }

  const openDeleteDialog = (id: string) => {
    if (!isAdmin) return
    const t = allTasks.find((t) => t.id === id)
    if (!t) return
    setSelectedTask(t)
    setDeleteDialogOpen(true)
  }

  const handleSuccess = (_data: TaskFormData) => {
    fetchTasks()
    setSelectedTask(undefined)
  }

  const handleToggle = async (id: string) => {
    if (!isAdmin) return
    const task = allTasks.find((t) => t.id === id)
    if (!task) return
    const newStatus = task.status === 'completed' ? 'todo' : 'completed'
    setAllTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    )
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error?.message ?? 'Failed to update task')
      }
      toast.success(
        newStatus === 'completed' ? 'Task completed' : 'Task reopened',
      )
    } catch (err) {
      fetchTasks()
      toast.error(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const handleDeleteConfirm = async (id: string) => {
    if (!isAdmin) return
    const task = allTasks.find((t) => t.id === id)
    setAllTasks((prev) => prev.filter((t) => t.id !== id))
    setSelectedTask(undefined)
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error?.message ?? 'Failed to delete task')
      }
      toast.success('Task deleted', {
        description: task
          ? `"${task.title}" has been permanently deleted.`
          : '',
      })
    } catch (err) {
      fetchTasks()
      toast.error(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  // Wait for session to load before rendering to avoid flash of wrong UI
  if (sessionStatus === 'loading') {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='h-36 rounded-xl border animate-pulse'
            style={{ background: 'var(--of-border)' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title='Tasks'
        subtitle={
          viewMode === 'upcoming'
            ? `${activeTasks.length} active`
            : `${pastTasks.length} past task${pastTasks.length !== 1 ? 's' : ''}`
        }
        action={
          isAdmin ? (
            <Button
              onClick={openCreateDialog}
              style={{ background: 'var(--of-amber)' }}
              className='text-white hover:opacity-90'
            >
              <Plus size={15} className='mr-1.5' />
              New task
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className='flex flex-wrap items-center gap-3 mb-6'>
        <ViewModeToggle
          mode={viewMode}
          onChange={setViewMode}
          pastCount={pastTasks.length}
        />

        <div
          className='flex flex-wrap gap-1 p-1 rounded-lg w-fit'
          style={{ background: 'var(--of-border)' }}
        >
          {(viewMode === 'upcoming'
            ? ACTIVE_STATUS_FILTERS
            : PAST_STATUS_FILTERS
          ).map((f) => (
            <button
              key={f}
              onClick={() =>
                viewMode === 'upcoming'
                  ? setActiveStatusFilter(f as ActiveStatusFilter)
                  : setPastStatusFilter(f as PastStatusFilter)
              }
              className='px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-150'
              style={
                (viewMode === 'upcoming'
                  ? activeStatusFilter
                  : pastStatusFilter) === f
                  ? {
                      background: '#fff',
                      color: 'var(--of-heading)',
                      boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                    }
                  : { color: 'var(--of-muted)' }
              }
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div
          className='flex flex-wrap gap-1 p-1 rounded-lg w-fit'
          style={{ background: 'var(--of-border)' }}
        >
          {PRIORITY_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setPriorityFilter(f)}
              className='px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-150'
              style={
                priorityFilter === f
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
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className='h-36 rounded-xl border animate-pulse'
              style={{ background: 'var(--of-border)' }}
            />
          ))}
        </div>
      ) : displayedTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={viewMode === 'past' ? 'No past tasks' : 'No tasks found'}
          description={
            viewMode === 'past'
              ? 'Tasks move here automatically once their due date has passed.'
              : activeStatusFilter === 'all' && priorityFilter === 'all'
                ? isAdmin
                  ? "You haven't created any tasks yet."
                  : 'No tasks have been assigned to you yet.'
                : 'No tasks match your current filters.'
          }
          actionLabel={
            viewMode === 'upcoming' && isAdmin ? 'Create a task' : undefined
          }
          onAction={
            viewMode === 'upcoming' && isAdmin ? openCreateDialog : undefined
          }
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
          {displayedTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onEdit={isAdmin ? openEditDialog : undefined}
              onDelete={isAdmin ? openDeleteDialog : undefined}
              onToggle={isAdmin ? handleToggle : undefined}
            />
          ))}
        </div>
      )}

      {/* Dialogs — only rendered for admins */}
      {isAdmin && (
        <>
          <TaskDialog
            open={taskDialogOpen}
            onOpenChange={setTaskDialogOpen}
            task={selectedTask}
            onSuccess={handleSuccess}
          />
          <DeleteTaskDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            task={selectedTask}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  )
}
