'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ErrorBanner, Field, SubmitButton } from './LoginForm'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-2">
        <ErrorBanner message="Invalid or missing reset token. Please request a new reset link." />
        <Link
          href="/forgot-password"
          className="text-sm font-medium no-underline hover:underline"
          style={{ color: 'var(--of-blue)' }}
        >
          Request new link
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...form }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message ?? 'Something went wrong')
        setLoading(false)
        return
      }

      router.push('/login?reset=success')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <ErrorBanner message={error} />}

      <Field
        label="New password"
        type="password"
        value={form.password}
        onChange={(v) => setForm((f) => ({ ...f, password: v }))}
        placeholder="At least 8 characters"
        autoComplete="new-password"
      />
      <Field
        label="Confirm new password"
        type="password"
        value={form.confirmPassword}
        onChange={(v) => setForm((f) => ({ ...f, confirmPassword: v }))}
        placeholder="••••••••"
        autoComplete="new-password"
      />

      <SubmitButton loading={loading} label="Update password" />
    </form>
  )
}
