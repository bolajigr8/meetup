'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
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
import UserSelect from '@/components/shared/UserSelect'

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
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin || session?.user?.isSuperAdmin || false

  const [form, setForm] = useState<TaskFormData>(() =>
    initialData
      ? {
          title: initialData.title,
          description: initialData.description ?? '',
          dueDate: initialData.dueDate,
          priority: initialData.priority,
          category: initialData.category ?? 'General',
          assignedToEmail: initialData.assignedToEmail ?? '',
          assignedTo:
            (initialData as any).assignedTo?.map((u: any) =>
              typeof u === 'string' ? u : (u.id ?? u._id?.toString() ?? ''),
            ) ?? [],
        }
      : { ...TASK_FORM_INITIAL },
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

    if (!isAdmin) {
      toast.error('You do not have permission to perform this action')
      return
    }

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
          assignedToEmail: form.assignedToEmail || undefined,
          category: form.category || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.details?.length) {
          const serverErrors: TaskFieldErrors = {}
          for (const err of data.error.details) {
            if (err.field && !serverErrors[err.field as keyof TaskFieldErrors])
              serverErrors[err.field as keyof TaskFieldErrors] = err.message
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
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const isEdit = Boolean(initialData)

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-4'>
      <FormField label='Task title' required error={errors.title}>
        <Input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder='e.g. Review the Q4 budget proposal'
          readOnly={!isAdmin}
          className={errors.title ? 'border-red-400' : ''}
        />
      </FormField>

      <FormField label='Description' error={errors.description}>
        <Textarea
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          placeholder='Add more context about this task...'
          rows={2}
          readOnly={!isAdmin}
          className={`resize-none ${errors.description ? 'border-red-400' : ''}`}
        />
      </FormField>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <FormField label='Due date (WAT)' required error={errors.dueDate}>
          <Input
            type='date'
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
            readOnly={!isAdmin}
            className={errors.dueDate ? 'border-red-400' : ''}
          />
        </FormField>
        <FormField label='Priority'>
          {isAdmin ? (
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
          ) : (
            <Input value={form.priority} readOnly className='capitalize' />
          )}
        </FormField>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <FormField label='Category'>
          {isAdmin ? (
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
          ) : (
            <Input value={form.category ?? 'General'} readOnly />
          )}
        </FormField>
        <FormField
          label='External assignee email'
          error={errors.assignedToEmail}
        >
          <Input
            type='email'
            value={form.assignedToEmail ?? ''}
            onChange={(e) => set('assignedToEmail', e.target.value)}
            placeholder='colleague@company.com'
            readOnly={!isAdmin}
            className={errors.assignedToEmail ? 'border-red-400' : ''}
          />
        </FormField>
      </div>

      {isAdmin && (
        <div className='relative'>
          <UserSelect
            value={form.assignedTo ?? []}
            onChange={(ids: string[]) => set('assignedTo', ids)}
            label='Assign to users (dashboard visibility)'
          />
        </div>
      )}

      {isAdmin && (
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
      )}
      {!isAdmin && (
        <div
          className='flex justify-end pt-2 border-t'
          style={{ borderColor: 'var(--of-border)' }}
        >
          <Button
            type='button'
            variant='ghost'
            onClick={onCancel}
            className='text-sm'
          >
            Close
          </Button>
        </div>
      )}
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
