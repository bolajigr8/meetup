'use client'

import { useState } from 'react'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface FieldErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const INITIAL: FormData = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export default function PasswordForm() {
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  const set = (field: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field])
      setErrors((e) => {
        const n = { ...e }
        delete n[field]
        return n
      })
  }

  const validate = (): FieldErrors => {
    const errs: FieldErrors = {}
    if (!form.currentPassword)
      errs.currentPassword = 'Current password is required'
    if (!form.newPassword) errs.newPassword = 'New password is required'
    else if (form.newPassword.length < 8)
      errs.newPassword = 'Password must be at least 8 characters'
    if (!form.confirmPassword)
      errs.confirmPassword = 'Please confirm your password'
    else if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/settings/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error?.details?.length) {
          const serverErrors: FieldErrors = {}
          for (const err of data.error.details) {
            if (err.field)
              serverErrors[err.field as keyof FieldErrors] = err.message
          }
          setErrors(serverErrors)
        }
        throw new Error(data.error?.message ?? 'Failed to update password')
      }
      toast.success('Password updated', {
        description: (
          <span style={{ color: '#000000', fontSize: '0.8125rem' }}>
            Your new password is active.
          </span>
        ),
      })
      setForm(INITIAL)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className='flex flex-col gap-4 max-w-md'
    >
      <PasswordField
        label='Current password'
        value={form.currentPassword}
        show={show.current}
        onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
        onChange={(v) => set('currentPassword', v)}
        error={errors.currentPassword}
        placeholder='Your current password'
      />
      <PasswordField
        label='New password'
        hint='At least 8 characters'
        value={form.newPassword}
        show={show.new}
        onToggle={() => setShow((s) => ({ ...s, new: !s.new }))}
        onChange={(v) => set('newPassword', v)}
        error={errors.newPassword}
        placeholder='New password'
      />
      <PasswordField
        label='Confirm new password'
        value={form.confirmPassword}
        show={show.confirm}
        onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
        onChange={(v) => set('confirmPassword', v)}
        error={errors.confirmPassword}
        placeholder='Repeat new password'
      />

      <div className='pt-1'>
        <Button
          type='submit'
          disabled={loading}
          style={{ background: 'var(--of-blue)' }}
          className='text-white hover:opacity-90 min-w-36 flex items-center gap-2 justify-center'
        >
          {loading && <Loader2 size={14} className='animate-spin' />}
          {loading ? 'Updating...' : 'Update password'}
        </Button>
      </div>
    </form>
  )
}

function PasswordField({
  label,
  hint,
  value,
  show,
  onToggle,
  onChange,
  error,
  placeholder,
}: {
  label: string
  hint?: string
  value: string
  show: boolean
  onToggle: () => void
  onChange: (v: string) => void
  error?: string
  placeholder?: string
}) {
  return (
    <div className='flex flex-col gap-1.5'>
      <Label
        className='text-sm font-medium'
        style={{ color: 'var(--of-heading)' }}
      >
        {label}
        {hint && (
          <span
            className='ml-1.5 text-xs font-normal'
            style={{ color: 'var(--of-muted)' }}
          >
            — {hint}
          </span>
        )}
      </Label>
      <div className='relative'>
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${error ? 'border-red-400' : ''}`}
        />
        <button
          type='button'
          onClick={onToggle}
          className='absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity'
          style={{ color: 'var(--of-muted)' }}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && (
        <p
          className='text-xs flex items-center gap-1'
          style={{ color: '#dc2626' }}
        >
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  )
}
