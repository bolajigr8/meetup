'use client'

import { useState, KeyboardEvent, useRef } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'
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
  ProgramFormData,
  PROGRAM_FORM_INITIAL,
  ProgramFieldErrors,
  validateProgramForm,
  validateProgramParticipantEmail,
  hasProgramErrors,
} from '@/validations/program'
import type { Program } from '@/components/programs/ProgramCard'

interface ProgramFormProps {
  initialData?: Program
  onSuccess: (data: ProgramFormData) => void
  onCancel: () => void
}

export default function ProgramForm({
  initialData,
  onSuccess,
  onCancel,
}: ProgramFormProps) {
  const [form, setForm] = useState<ProgramFormData>(() =>
    initialData
      ? {
          title: initialData.title,
          description: initialData.description ?? '',
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          scheduleType: initialData.scheduleType,
          participants: [...initialData.participants],
        }
      : PROGRAM_FORM_INITIAL,
  )

  const [errors, setErrors] = useState<ProgramFieldErrors>({})
  const [participantInput, setParticipantInput] = useState('')
  const [participantError, setParticipantError] = useState('')
  const [loading, setLoading] = useState(false)
  const participantRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ProgramFormData>(
    field: K,
    value: ProgramFormData[K],
  ) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field])
      setErrors((e) => {
        const n = { ...e }
        delete n[field]
        return n
      })
  }

  const addParticipant = () => {
    const email = participantInput.trim().toLowerCase()
    if (!email) return
    const err = validateProgramParticipantEmail(email, form.participants)
    if (err) {
      setParticipantError(err)
      return
    }
    set('participants', [...form.participants, email])
    setParticipantInput('')
    setParticipantError('')
    participantRef.current?.focus()
  }

  const removeParticipant = (email: string) =>
    set(
      'participants',
      form.participants.filter((p) => p !== email),
    )

  const handleParticipantKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addParticipant()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateProgramForm(form)
    if (hasProgramErrors(validationErrors)) {
      setErrors(validationErrors)
      toast.error('Please fix the errors before submitting')
      return
    }

    setLoading(true)
    try {
      const url = initialData
        ? `/api/v1/programs/${initialData.id}`
        : '/api/v1/programs'
      const res = await fetch(url, {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.details?.length) {
          const serverErrors: ProgramFieldErrors = {}
          for (const err of data.error.details) {
            if (
              err.field &&
              !serverErrors[err.field as keyof ProgramFieldErrors]
            ) {
              serverErrors[err.field as keyof ProgramFieldErrors] = err.message
            }
          }
          setErrors(serverErrors)
        }
        throw new Error(data.error?.message ?? 'Something went wrong')
      }

      toast.success(initialData ? 'Program updated' : 'Program created', {
        description: (
          <span style={{ color: '#000000', fontSize: '0.8125rem' }}>
            {initialData
              ? `"${form.title}" has been saved with your changes.`
              : `"${form.title}" has been created successfully.`}
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
      <FormField label='Program title' required error={errors.title}>
        <Input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder='e.g. Leadership Bootcamp 2025'
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
          placeholder='What will participants learn or do?'
          rows={2}
          className={`resize-none ${errors.description ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
        />
      </FormField>

      {/* Dates */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <FormField label='Start date' required error={errors.startDate}>
          <Input
            type='date'
            value={form.startDate}
            onChange={(e) => set('startDate', e.target.value)}
            aria-invalid={!!errors.startDate}
            className={
              errors.startDate
                ? 'border-red-400 focus-visible:ring-red-300'
                : ''
            }
          />
        </FormField>
        <FormField label='End date' required error={errors.endDate}>
          <Input
            type='date'
            value={form.endDate}
            onChange={(e) => set('endDate', e.target.value)}
            aria-invalid={!!errors.endDate}
            className={
              errors.endDate ? 'border-red-400 focus-visible:ring-red-300' : ''
            }
          />
        </FormField>
      </div>

      {/* Schedule type */}
      <FormField label='Schedule type'>
        <Select
          value={form.scheduleType}
          onValueChange={(v) =>
            set('scheduleType', v as ProgramFormData['scheduleType'])
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='standard'>
              📅 Standard — reminders at 14, 7, 3, 1 day before
            </SelectItem>
            <SelectItem value='intensive'>
              ⚡ Intensive — reminders at 3, 1 day and 2 hours before
            </SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {/* Participants */}
      <FormField label='Participant email' hint='Press Enter to add'>
        <div className='flex gap-2'>
          <Input
            ref={participantRef}
            type='email'
            value={participantInput}
            onChange={(e) => {
              setParticipantInput(e.target.value)
              setParticipantError('')
            }}
            onKeyDown={handleParticipantKey}
            placeholder='participant@company.com'
            className={
              participantError
                ? 'border-red-400 focus-visible:ring-red-300'
                : ''
            }
            autoComplete='off'
          />
          <Button
            type='button'
            variant='outline'
            onClick={addParticipant}
            className='shrink-0 gap-1.5 text-sm px-3'
            style={{
              borderColor: 'var(--of-border)',
              color: 'var(--of-heading)',
            }}
          >
            <UserPlus size={14} />
            Add
          </Button>
        </div>
        {participantError && (
          <p
            className='text-xs flex items-center gap-1 mt-1'
            style={{ color: '#dc2626' }}
          >
            <span aria-hidden>⚠</span> {participantError}
          </p>
        )}
        {form.participants.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-2'>
            {form.participants.map((email) => (
              <span
                key={email}
                className='inline-flex items-center gap-1.5 text-xs font-medium pl-3 pr-2 py-1.5 rounded-full'
                style={{
                  background: '#CCFBF1',
                  color: 'var(--of-teal)',
                  border: '1px solid transparent',
                }}
              >
                {email}
                <button
                  type='button'
                  onClick={() => removeParticipant(email)}
                  className='flex items-center justify-center w-4 h-4 rounded-full hover:bg-teal-200 transition-colors'
                  aria-label={`Remove ${email}`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
      </FormField>

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
          style={{ background: 'var(--of-teal)' }}
          className='text-white hover:opacity-90 text-sm min-w-36 flex items-center gap-2 justify-center'
        >
          {loading && <Loader2 size={14} className='animate-spin' />}
          {loading
            ? isEdit
              ? 'Saving...'
              : 'Creating...'
            : isEdit
              ? 'Save changes'
              : 'Create program'}
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
