'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import GoogleButton from './GoogleButton'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/overview'

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <GoogleButton label="Sign in with Google" />

      <Divider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <ErrorBanner message={error} />}

        <Field
          label="Email address"
          type="email"
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <div>
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={(v) => setForm((f) => ({ ...f, password: v }))}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div className="mt-1.5 text-right">
            <Link
              href="/forgot-password"
              className="text-xs font-medium no-underline hover:underline"
              style={{ color: 'var(--of-blue)' }}
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <SubmitButton loading={loading} label="Sign in" />
      </form>

      <p className="text-center text-sm" style={{ color: 'var(--of-muted)' }}>
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium no-underline hover:underline"
          style={{ color: 'var(--of-blue)' }}
        >
          Create one
        </Link>
      </p>
    </div>
  )
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: 'var(--of-border)' }} />
      <span className="text-xs font-medium" style={{ color: 'var(--of-muted)' }}>
        or
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--of-border)' }} />
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg text-sm"
      style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}
    >
      <svg
        className="flex-shrink-0 mt-0.5"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {message}
    </div>
  )
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--of-heading)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-150 placeholder:text-[var(--of-muted)]"
        style={{
          borderColor: 'var(--of-border)',
          color: 'var(--of-heading)',
          background: 'white',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--of-blue)')}
        onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--of-border)')}
      />
    </div>
  )
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-px"
      style={{
        background: 'var(--of-blue)',
        boxShadow: '0 2px 10px rgba(37,99,235,.25)',
      }}
      onMouseEnter={(e) =>
        !loading && (e.currentTarget.style.background = 'var(--of-blue-dark)')
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = 'var(--of-blue)')
      }
    >
      {loading && (
        <svg
          className="animate-spin"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 00-9-9" />
        </svg>
      )}
      {loading ? 'Signing in...' : label}
    </button>
  )
}

export { Divider, ErrorBanner, Field, SubmitButton }
