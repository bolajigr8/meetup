// src/components/settings/Profileform.tsx
'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileData {
  name: string
  email: string
}

interface FieldErrors {
  name?: string
}

export default function ProfileForm() {
  const [form, setForm] = useState<ProfileData>({ name: '', email: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch('/api/v1/settings')
      .then((r) => r.json())
      .then((data) =>
        setForm({ name: data.name ?? '', email: data.email ?? '' }),
      )
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setFetching(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: FieldErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters'
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        // Only send name — email is display-only and not editable
        body: JSON.stringify({ name: form.name.trim() }),
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
        throw new Error(data.error?.message ?? 'Failed to update profile')
      }
      toast.success('Profile updated', {
        description: (
          <span style={{ color: '#000000', fontSize: '0.8125rem' }}>
            Your name has been saved.
          </span>
        ),
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className='flex flex-col gap-4 max-w-md'>
        {[1, 2].map((i) => (
          <div key={i} className='flex flex-col gap-1.5'>
            <div
              className='h-4 w-20 rounded animate-pulse'
              style={{ background: 'var(--of-border)' }}
            />
            <div
              className='h-10 rounded-lg animate-pulse'
              style={{ background: 'var(--of-border)' }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className='flex flex-col gap-4 max-w-md'
    >
      {/* Name — editable */}
      <div className='flex flex-col gap-1.5'>
        <Label
          className='text-sm font-medium'
          style={{ color: 'var(--of-heading)' }}
        >
          Full name <span className='ml-0.5 text-red-500'>*</span>
        </Label>
        <Input
          value={form.name}
          onChange={(e) => {
            setForm((f) => ({ ...f, name: e.target.value }))
            if (errors.name) setErrors({})
          }}
          placeholder='Your full name'
          className={errors.name ? 'border-red-400' : ''}
        />
        {errors.name && (
          <p
            className='text-xs flex items-center gap-1'
            style={{ color: '#dc2626' }}
          >
            <span>⚠</span> {errors.name}
          </p>
        )}
      </div>

      {/* Email — read-only display only */}
      <div className='flex flex-col gap-1.5'>
        <Label
          className='text-sm font-medium'
          style={{ color: 'var(--of-heading)' }}
        >
          Email address
        </Label>
        <Input
          type='email'
          value={form.email}
          readOnly
          className='cursor-default'
          style={{
            background: 'var(--of-surface)',
            color: 'var(--of-muted)',
          }}
        />
        <p className='text-xs' style={{ color: 'var(--of-muted)' }}>
          Your email address cannot be changed. Contact support if you need
          help.
        </p>
      </div>

      <div className='pt-1'>
        <Button
          type='submit'
          disabled={loading}
          style={{ background: 'var(--of-blue)' }}
          className='text-white hover:opacity-90 min-w-32 flex items-center gap-2 justify-center'
        >
          {loading && <Loader2 size={14} className='animate-spin' />}
          {loading ? 'Saving...' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
