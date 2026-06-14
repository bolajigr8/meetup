'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Divider, ErrorBanner, Field, SubmitButton } from './LoginForm'

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: Create the account
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error?.code === 'EMAIL_EXISTS_OAUTH') {
          setError(
            'This email is already registered with Google. Please sign in with Google.',
          )
        } else if (data.error?.code === 'EMAIL_EXISTS') {
          setError('An account with this email already exists. Please sign in.')
        } else {
          setError(data.error?.message ?? 'Something went wrong')
        }
        setLoading(false)
        return
      }

      // Step 2: Sign in with the new credentials
      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (signInResult?.error) {
        window.location.replace('/login?registered=true')
        return
      }

      // Step 3: Full page navigation — cookie is guaranteed to exist now
      window.location.replace('/overview')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <Divider />

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        {error && <ErrorBanner message={error} />}

        <Field
          label='Full name'
          type='text'
          value={form.name}
          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          placeholder='Adebayo Okafor'
          autoComplete='name'
        />
        <Field
          label='Email address'
          type='email'
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          placeholder='you@example.com'
          autoComplete='email'
        />
        <Field
          label='Password'
          type='password'
          value={form.password}
          onChange={(v) => setForm((f) => ({ ...f, password: v }))}
          placeholder='At least 8 characters'
          autoComplete='new-password'
        />

        <SubmitButton loading={loading} label='Create account' />
      </form>

      <p className='text-center text-sm' style={{ color: 'var(--of-muted)' }}>
        Already have an account?{' '}
        <Link
          href='/login'
          className='font-medium no-underline hover:underline'
          style={{ color: 'var(--of-blue)' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
