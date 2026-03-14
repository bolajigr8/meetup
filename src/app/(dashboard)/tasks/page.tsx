'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PageHeader from '@/components/shared/PageHeader'
import EmptyState from '@/components/shared/EmptyState'
import TaskCard, { Task } from '@/components/tasks/TaskCard'
import TaskDialog from '@/components/tasks/TaskDialog'
import DeleteTaskDialog from '@/components/tasks/DeleteTaskDialog'
import type { TaskFormData } from '@/validations/task'

const STATUS_FILTERS = [
  'all',
  'todo',
  'in_progress',
  'completed',
  'overdue',
] as const
const PRIORITY_FILTERS = ['all', 'high', 'medium', 'low'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]
type PriorityFilter = (typeof PRIORITY_FILTERS)[number]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | undefined>()

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (priorityFilter !== 'all') params.set('priority', priorityFilter)
      const qs = params.toString() ? `?${params.toString()}` : ''

      const res = await fetch(`/api/v1/tasks${qs}`)
      const json = await res.json()
      if (!res.ok)
        throw new Error(json.error?.message ?? 'Failed to load tasks')
      setTasks(json.data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const openCreateDialog = () => {
    setSelectedTask(undefined)
    setTaskDialogOpen(true)
  }
  const openEditDialog = (id: string) => {
    const t = tasks.find((t) => t.id === id)
    if (!t) return
    setSelectedTask(t)
    setTaskDialogOpen(true)
  }
  const openDeleteDialog = (id: string) => {
    const t = tasks.find((t) => t.id === id)
    if (!t) return
    setSelectedTask(t)
    setDeleteDialogOpen(true)
  }

  const handleSuccess = (_data: TaskFormData) => {
    fetchTasks()
    setSelectedTask(undefined)
  }

  // Toggle completed ↔ todo
  const handleToggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const newStatus = task.status === 'completed' ? 'todo' : 'completed'

    // Optimistic update
    setTasks((prev) =>
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
        {
          description: `"${task.title}" has been marked as ${newStatus === 'completed' ? 'done' : 'to do'}.`,
        },
      )
    } catch (err) {
      fetchTasks() // rollback
      toast.error(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const handleDeleteConfirm = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    setTasks((prev) => prev.filter((t) => t.id !== id)) // optimistic remove
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
          : 'Task deleted.',
      })
    } catch (err) {
      fetchTasks() // rollback
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete task',
        {
          description: 'The task was restored. Please try again.',
        },
      )
    }
  }

  const overdueCount = tasks.filter((t) => t.status === 'overdue').length

  return (
    <div>
      <PageHeader
        title='Tasks'
        subtitle={`${tasks.length} total${overdueCount > 0 ? ` · ${overdueCount} overdue` : ''}`}
        action={
          <Button
            onClick={openCreateDialog}
            style={{ background: 'var(--of-amber)' }}
            className='text-white hover:opacity-90'
          >
            <Plus size={15} className='mr-1.5' />
            New task
          </Button>
        }
      />

      {/* Filters */}
      <div className='flex flex-wrap gap-3 mb-6'>
        <div
          className='flex flex-wrap gap-1 p-1 rounded-lg w-fit'
          style={{ background: 'var(--of-border)' }}
        >
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className='px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-150'
              style={
                statusFilter === f
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
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title='No tasks found'
          description={
            statusFilter === 'all' && priorityFilter === 'all'
              ? "You haven't created any tasks yet."
              : 'No tasks match your current filters.'
          }
          actionLabel='Create a task'
          onAction={openCreateDialog}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'>
          {tasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

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
    </div>
  )
}
