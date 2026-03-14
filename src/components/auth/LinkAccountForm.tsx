'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ErrorBanner, SubmitButton } from './LoginForm'

export default function LinkAccountForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pendingToken = searchParams.get('pendingToken') ?? ''

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!pendingToken) {
    return (
      <div className='flex flex-col items-center gap-3 text-center py-2'>
        <ErrorBanner message='Invalid or expired link request. Please try signing in with Google again.' />
        <Link
          href='/login'
          className='text-sm font-medium no-underline hover:underline'
          style={{ color: 'var(--of-blue)' }}
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/auth/link-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, pendingToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          setError('Incorrect password. Please try again.')
        } else if (data.error?.code === 'INVALID_PENDING_TOKEN') {
          setError(
            'This request has expired. Please try signing in with Google again.',
          )
        } else {
          setError(data.error?.message ?? 'Something went wrong')
        }
        setLoading(false)
        return
      }

      // Account linked — now sign in with credentials to establish session
      // (Google sign-in will also work from this point forward)
      await signIn('credentials', {
        email: data.email,
        password,
        redirect: false,
      })

      router.push('/overview')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
      {error && <ErrorBanner message={error} />}

      {/* Info box */}
      <div
        className='flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-sm'
        style={{
          background: 'var(--of-blue-light)',
          border: '1px solid var(--of-blue-mid)',
          color: 'var(--of-body)',
        }}
      >
        <svg
          className='shrink-0 mt-0.5'
          width='15'
          height='15'
          viewBox='0 0 24 24'
          fill='none'
          stroke='var(--of-blue)'
          strokeWidth='2'
        >
          <circle cx='12' cy='12' r='10' />
          <line x1='12' y1='8' x2='12' y2='12' />
          <line x1='12' y1='16' x2='12.01' y2='16' />
        </svg>
        <span>
          A MeetUp account already exists for this email. Enter your password to
          link Google sign-in to your account.
        </span>
      </div>

      <div className='flex flex-col gap-1.5'>
        <label
          className='text-sm font-medium'
          style={{ color: 'var(--of-heading)' }}
        >
          Your MeetUp password
        </label>
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='••••••••'
          autoComplete='current-password'
          required
          className='w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-150 placeholder:text-(--of-muted)'
          style={{
            borderColor: 'var(--of-border)',
            color: 'var(--of-heading)',
            background: 'white',
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = 'var(--of-blue)')
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = 'var(--of-border)')
          }
        />
      </div>

      <SubmitButton loading={loading} label='Link Google account' />

      <div className='flex flex-col items-center gap-1.5'>
        <Link
          href='/forgot-password'
          className='text-sm no-underline hover:underline'
          style={{ color: 'var(--of-muted)' }}
        >
          Forgot your password?
        </Link>
        <Link
          href='/login'
          className='text-sm no-underline hover:underline'
          style={{ color: 'var(--of-muted)' }}
        >
          Back to sign in
        </Link>
      </div>
    </form>
  )
}
