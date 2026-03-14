'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { CheckSquare, Pencil } from 'lucide-react'
import TaskForm from './TaskForm'
import type { Task } from './TaskCard'
import type { TaskFormData } from '@/validations/task'

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  onSuccess?: (data: TaskFormData) => void
}

export default function TaskDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
}: TaskDialogProps) {
  const isEdit = Boolean(task)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='w-full max-w-[95vw] sm:max-w-xl max-h-[92dvh] overflow-y-auto p-0 gap-0 rounded-2xl border'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <DialogHeader
          className='px-6 pt-6 pb-4 border-b'
          style={{ borderColor: 'var(--of-border)' }}
        >
          <div className='flex items-center gap-3'>
            <div
              className='flex items-center justify-center w-9 h-9 rounded-xl'
              style={{ background: '#FEF9C3' }}
            >
              {isEdit ? (
                <Pencil size={16} style={{ color: 'var(--of-amber)' }} />
              ) : (
                <CheckSquare size={18} style={{ color: 'var(--of-amber)' }} />
              )}
            </div>
            <div>
              <DialogTitle
                className='text-base font-semibold leading-tight'
                style={{ color: 'var(--of-heading)' }}
              >
                {isEdit ? 'Edit task' : 'Create a task'}
              </DialogTitle>
              <DialogDescription
                className='text-xs mt-0.5'
                style={{ color: 'var(--of-muted)' }}
              >
                {isEdit
                  ? 'Update the details below and save your changes.'
                  : 'Due dates are tracked in West Africa Time (WAT, UTC+1)'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className='px-6 py-5'>
          <TaskForm
            initialData={task}
            onSuccess={(data) => {
              onOpenChange(false)
              onSuccess?.(data)
            }}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
