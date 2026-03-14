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
  MeetingFormData,
  MEETING_FORM_INITIAL,
  FieldErrors,
  validateMeetingForm,
  validateParticipantEmail,
  hasErrors,
} from '@/validations/meeting'
import type { Meeting } from '@/components/meetings/MeetingCard'

interface MeetingFormProps {
  /** Pre-fill form for edit mode */
  initialData?: Meeting
  onSuccess: (data: MeetingFormData) => void
  onCancel: () => void
}

export default function MeetingForm({
  initialData,
  onSuccess,
  onCancel,
}: MeetingFormProps) {
  const [form, setForm] = useState<MeetingFormData>(() =>
    initialData
      ? {
          title: initialData.title,
          description: initialData.description ?? '',
          date: initialData.date,
          startTime: initialData.startTime,
          endTime: initialData.endTime,
          location: initialData.location ?? '',
          participants: [...initialData.participants],
          priority: initialData.priority,
        }
      : MEETING_FORM_INITIAL,
  )

  const [errors, setErrors] = useState<FieldErrors>({})
  const [participantInput, setParticipantInput] = useState('')
  const [participantError, setParticipantError] = useState('')
  const [loading, setLoading] = useState(false)
  const participantRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof MeetingFormData>(
    field: K,
    value: MeetingFormData[K],
  ) => {
    setForm((f) => ({ ...f, [field]: value }))
    // Clear field error on change
    if (errors[field]) {
      setErrors((e) => {
        const next = { ...e }
        delete next[field]
        return next
      })
    }
  }

  // ── Participant helpers ──────────────────────────────────────────────────────
  const addParticipant = () => {
    const email = participantInput.trim().toLowerCase()
    if (!email) return
    const err = validateParticipantEmail(email, form.participants)
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

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateMeetingForm(form)
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors)
      toast.error('Please fix the errors before submitting')
      return
    }

    setLoading(true)
    try {
      const url = initialData
        ? `/api/v1/meetings/${initialData.id}`
        : '/api/v1/meetings'

      const res = await fetch(url, {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        // Surface server-side field errors if present
        if (data.errors?.length) {
          const serverErrors: FieldErrors = {}
          for (const err of data.errors) {
            if (err.field && !serverErrors[err.field as keyof FieldErrors]) {
              serverErrors[err.field as keyof FieldErrors] = err.message
            }
          }
          setErrors(serverErrors)
        }
        throw new Error(data.message ?? 'Something went wrong')
      }

      toast.success(initialData ? 'Meeting updated' : 'Meeting scheduled', {
        description: (
          <span style={{ color: '#000000', fontSize: '0.8125rem' }}>
            {initialData
              ? `"${form.title}" has been saved with your changes.`
              : `"${form.title}" scheduled for ${form.date} at ${form.startTime} WAT.`}
          </span>
        ),
      })
      onSuccess(form)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong', {
        description: (
          <span style={{ color: '#000000', fontSize: '0.8125rem' }}>
            Please try again or contact support if the issue persists.
          </span>
        ),
      })
    } finally {
      setLoading(false)
    }
  }

  const isEdit = Boolean(initialData)

  return (
    <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-4'>
      {/* Title */}
      <FormField label='Meeting title' required error={errors.title}>
        <Input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder='e.g. Q3 Planning Session'
          aria-invalid={!!errors.title}
          className={
            errors.title ? 'border-red-400 focus-visible:ring-red-300' : ''
          }
        />
      </FormField>

      {/* Description */}
      <FormField label='Description' error={errors.description}>
        <Textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder='What is this meeting about?'
          rows={2}
          className={`resize-none ${errors.description ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
        />
      </FormField>

      {/* Date + times */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        <FormField label='Date' required error={errors.date}>
          <Input
            type='date'
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            aria-invalid={!!errors.date}
            className={
              errors.date ? 'border-red-400 focus-visible:ring-red-300' : ''
            }
          />
        </FormField>
        <FormField label='Start (WAT)' required error={errors.startTime}>
          <Input
            type='time'
            value={form.startTime}
            onChange={(e) => set('startTime', e.target.value)}
            aria-invalid={!!errors.startTime}
            className={
              errors.startTime
                ? 'border-red-400 focus-visible:ring-red-300'
                : ''
            }
          />
        </FormField>
        <FormField label='End (WAT)' required error={errors.endTime}>
          <Input
            type='time'
            value={form.endTime}
            onChange={(e) => set('endTime', e.target.value)}
            aria-invalid={!!errors.endTime}
            className={
              errors.endTime ? 'border-red-400 focus-visible:ring-red-300' : ''
            }
          />
        </FormField>
      </div>

      {/* Location + Priority */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <FormField label='Location' error={errors.location}>
          <Input
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder='Room, Zoom link, or address'
            className={
              errors.location ? 'border-red-400 focus-visible:ring-red-300' : ''
            }
          />
        </FormField>
        <FormField label='Priority'>
          <Select
            value={form.priority}
            onValueChange={(v) =>
              set('priority', v as MeetingFormData['priority'])
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

      {/* Participants */}
      <FormField
        label='Participant email'
        hint='Press Enter to add'
        error={errors.participants as string}
      >
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
            placeholder='colleague@company.com'
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

        {/* Inline error */}
        {participantError && (
          <p
            className='text-xs flex items-center gap-1 mt-1'
            style={{ color: '#dc2626' }}
          >
            <span aria-hidden>⚠</span> {participantError}
          </p>
        )}

        {/* Chips */}
        {form.participants.length > 0 && (
          <div className='flex flex-wrap gap-2 mt-2'>
            {form.participants.map((email) => (
              <span
                key={email}
                className='inline-flex items-center gap-1.5 text-xs font-medium pl-3 pr-2 py-1.5 rounded-full border'
                style={{
                  background: 'var(--of-blue-light)',
                  color: 'var(--of-blue)',
                  borderColor: 'transparent',
                }}
              >
                {email}
                <button
                  type='button'
                  onClick={() => removeParticipant(email)}
                  className='flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 transition-colors'
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
          style={{ background: 'var(--of-blue)' }}
          className='text-white hover:opacity-90 text-sm min-w-32 flex items-center gap-2'
        >
          {loading && <Loader2 size={14} className='animate-spin' />}
          {loading
            ? isEdit
              ? 'Saving...'
              : 'Creating...'
            : isEdit
              ? 'Save changes'
              : 'Create meeting'}
        </Button>
      </div>
    </form>
  )
}

// ─── Sub-component ─────────────────────────────────────────────────────────────
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
