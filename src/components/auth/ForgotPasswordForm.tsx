'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ErrorBanner, Field, SubmitButton } from './LoginForm'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Always show success — API never reveals if email exists
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className='flex flex-col items-center gap-4 text-center py-2'>
        <div
          className='w-12 h-12 rounded-full grid place-items-center'
          style={{ background: 'var(--of-blue-light)' }}
        >
          <svg
            width='22'
            height='22'
            viewBox='0 0 24 24'
            fill='none'
            stroke='var(--of-blue)'
            strokeWidth='2'
          >
            <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
            <polyline points='22,6 12,13 2,6' />
          </svg>
        </div>
        <div>
          <p
            className='font-semibold text-base mb-1'
            style={{ color: 'var(--of-heading)' }}
          >
            Check your inbox
          </p>
          <p
            className='text-sm leading-[1.6]'
            style={{ color: 'var(--of-muted)' }}
          >
            If <strong>{email}</strong> is registered, you&apos;ll receive a
            reset link shortly. Check your spam folder if you don&apos;t see it.
          </p>
        </div>
        <Link
          href='/login'
          className='text-sm font-medium no-underline hover:underline mt-2'
          style={{ color: 'var(--of-blue)' }}
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      {error && <ErrorBanner message={error} />}

      <Field
        label='Email address'
        type='email'
        value={email}
        onChange={setEmail}
        placeholder='you@example.com'
        autoComplete='email'
      />

      <SubmitButton loading={loading} label='Send reset link' />

      <Link
        href='/login'
        className='text-center text-sm font-medium no-underline hover:underline'
        style={{ color: 'var(--of-muted)' }}
      >
        Back to sign in
      </Link>
    </form>
  )
}
