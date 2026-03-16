'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TaskFormData,
  TASK_FORM_INITIAL,
  TASK_CATEGORIES,
  TaskFieldErrors,
  validateTaskForm,
  hasTaskErrors,
} from '@/validations/task'
import type { Task } from '@/components/tasks/TaskCard'

interface TaskFormProps {
  initialData?: Task
  onSuccess: (data: TaskFormData) => void
  onCancel: () => void
}

export default function TaskForm({
  initialData,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const [form, setForm] = useState<TaskFormData>(() =>
    initialData
      ? {
          title: initialData.title,
          description: initialData.description ?? '',
          dueDate: initialData.dueDate,
          priority: initialData.priority,
          category: initialData.category ?? 'General',
          assignedTo: initialData.assignedTo ?? '',
        }
      : TASK_FORM_INITIAL,
  )

  const [errors, setErrors] = useState<TaskFieldErrors>({})
  const [loading, setLoading] = useState(false)

  const set = <K extends keyof TaskFormData>(
    field: K,
    value: TaskFormData[K],
  ) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field])
      setErrors((e) => {
        const n = { ...e }
        delete n[field]
        return n
      })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateTaskForm(form)
    if (hasTaskErrors(validationErrors)) {
      setErrors(validationErrors)
      toast.error('Please fix the errors before submitting')
      return
    }

    setLoading(true)
    try {
      const url = initialData
        ? `/api/v1/tasks/${initialData.id}`
        : '/api/v1/tasks'
      const res = await fetch(url, {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          assignedTo: form.assignedTo || undefined,
          category: form.category || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.details?.length) {
          const serverErrors: TaskFieldErrors = {}
          for (const err of data.error.details) {
            if (
              err.field &&
              !serverErrors[err.field as keyof TaskFieldErrors]
            ) {
              serverErrors[err.field as keyof TaskFieldErrors] = err.message
            }
          }
          setErrors(serverErrors)
        }
        throw new Error(data.error?.message ?? 'Something went wrong')
      }

      toast.success(initialData ? 'Task updated' : 'Task created', {
        description: (
          <span style={{ color: '#000000', fontSize: '0.8125rem' }}>
            {initialData
              ? `"${form.title}" has been saved with your changes.`
              : `"${form.title}" has been added to your tasks.`}
          </span>
        ),
      })
      onSuccess(form)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong', {
        description:
          'Please try again or contact support if the issue persists.',
      })
    } finally {
      setLoading(false)
    }
  }

  const isEdit = Boolean(initialData)

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-4'>
      {/* Title */}
      <FormField label='Task title' required error={errors.title}>
        <Input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder='e.g. Review the Q4 budget proposal'
          aria-invalid={!!errors.title}
          className={
            errors.title ? 'border-red-400 focus-visible:ring-red-300' : ''
          }
        />
      </FormField>

      {/* Description */}
      <FormField label='Description' error={errors.description as string}>
        <Textarea
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder='Add more context about this task...'
          rows={2}
          className={`resize-none ${errors.description ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
        />
      </FormField>

      {/* Due date + priority */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <FormField label='Due date (WAT)' required error={errors.dueDate}>
          <Input
            type='date'
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
            aria-invalid={!!errors.dueDate}
            className={
              errors.dueDate ? 'border-red-400 focus-visible:ring-red-300' : ''
            }
          />
        </FormField>
        <FormField label='Priority'>
          <Select
            value={form.priority}
            onValueChange={(v) =>
              set('priority', v as TaskFormData['priority'])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='low'>🟢 Low</SelectItem>
              <SelectItem value='medium'>🟡 Medium</SelectItem>
              <SelectItem value='high'>🔴 High</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* Category + Assign to */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <FormField label='Category'>
          <Select
            value={form.category ?? 'General'}
            onValueChange={(v) => set('category', v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TASK_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label='Assign to' error={errors.assignedTo}>
          <Input
            type='email'
            value={form.assignedTo ?? ''}
            onChange={(e) => set('assignedTo', e.target.value)}
            placeholder='colleague@company.com'
            aria-invalid={!!errors.assignedTo}
            className={
              errors.assignedTo
                ? 'border-red-400 focus-visible:ring-red-300'
                : ''
            }
          />
        </FormField>
      </div>

      {/* Actions */}
      <div
        className='flex items-center justify-end gap-2 pt-2 border-t'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <Button
          type='button'
          variant='ghost'
          onClick={onCancel}
          disabled={loading}
          className='text-sm'
        >
          Cancel
        </Button>
        <Button
          type='submit'
          disabled={loading}
          style={{ background: 'var(--of-amber)' }}
          className='text-white hover:opacity-90 text-sm min-w-32 flex items-center gap-2 justify-center'
        >
          {loading && <Loader2 size={14} className='animate-spin' />}
          {loading
            ? isEdit
              ? 'Saving...'
              : 'Creating...'
            : isEdit
              ? 'Save changes'
              : 'Create task'}
        </Button>
      </div>
    </form>
  )
}

function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <Label
        className='text-sm font-medium'
        style={{ color: 'var(--of-heading)' }}
      >
        {label}
        {required && <span className='ml-0.5 text-red-500'>*</span>}
        {hint && (
          <span
            className='ml-1.5 text-xs font-normal'
            style={{ color: 'var(--of-muted)' }}
          >
            — {hint}
          </span>
        )}
      </Label>
      {children}
      {error && (
        <p
          className='text-xs flex items-center gap-1'
          style={{ color: '#dc2626' }}
        >
          <span aria-hidden>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
