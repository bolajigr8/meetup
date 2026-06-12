// src/components/shared/UserSelect.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, ChevronsUpDown, X, Loader2 } from 'lucide-react'

export interface UserOption {
  id: string
  name: string
  email: string
  image?: string | null
}

interface UserSelectProps {
  value: string[]
  onChange: (ids: string[]) => void
  label?: string
  error?: string
}

export default function UserSelect({
  value,
  onChange,
  label = 'Assign to users',
  error,
}: UserSelectProps) {
  const [users, setUsers] = useState<UserOption[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/v1/users')
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setUsers(json.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = users.filter((u) => value.includes(u.id))
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  const remove = (id: string) => onChange(value.filter((v) => v !== id))

  function getInitials(name: string) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className='flex flex-col gap-1.5' ref={containerRef}>
      <label
        className='text-sm font-medium'
        style={{ color: 'var(--of-heading)' }}
      >
        {label}
      </label>

      {/* Trigger */}
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        className='flex items-center justify-between w-full px-3 py-2.5 rounded-lg border text-sm text-left transition-all duration-150'
        style={{
          borderColor: error
            ? '#ef4444'
            : open
              ? 'var(--of-blue)'
              : 'var(--of-border)',
          color: selected.length ? 'var(--of-heading)' : 'var(--of-muted)',
          background: 'white',
        }}
      >
        <span className='truncate'>
          {loading
            ? 'Loading users...'
            : selected.length === 0
              ? 'Select users...'
              : `${selected.length} user${selected.length !== 1 ? 's' : ''} selected`}
        </span>
        {loading ? (
          <Loader2
            size={14}
            className='animate-spin shrink-0'
            style={{ color: 'var(--of-muted)' }}
          />
        ) : (
          <ChevronsUpDown
            size={14}
            className='shrink-0'
            style={{ color: 'var(--of-muted)' }}
          />
        )}
      </button>

      {/* Chips */}
      {selected.length > 0 && (
        <div className='flex flex-wrap gap-1.5 mt-1'>
          {selected.map((u) => (
            <span
              key={u.id}
              className='inline-flex items-center gap-1.5 text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full'
              style={{
                background: 'var(--of-blue-light)',
                color: 'var(--of-blue)',
              }}
            >
              <span
                className='w-4 h-4 rounded-full grid place-items-center text-[9px] font-bold text-white shrink-0'
                style={{ background: 'var(--of-blue)' }}
              >
                {getInitials(u.name)}
              </span>
              {u.name}
              <button
                type='button'
                onClick={() => remove(u.id)}
                className='flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-blue-200 transition-colors'
                aria-label={`Remove ${u.name}`}
              >
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {open && !loading && (
        <div
          className='absolute z-50 mt-1 w-full bg-white rounded-xl border shadow-lg overflow-hidden'
          style={{
            borderColor: 'var(--of-border)',
            boxShadow: '0 8px 24px rgba(0,0,0,.10)',
            maxWidth: '100%',
          }}
        >
          {/* Search */}
          <div
            className='px-3 py-2 border-b'
            style={{ borderColor: 'var(--of-border)' }}
          >
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search by name or email...'
              className='w-full text-sm outline-none bg-transparent'
              style={{ color: 'var(--of-heading)' }}
            />
          </div>

          {/* List */}
          <div className='max-h-52 overflow-y-auto'>
            {filtered.length === 0 ? (
              <div
                className='px-4 py-3 text-sm text-center'
                style={{ color: 'var(--of-muted)' }}
              >
                No users found
              </div>
            ) : (
              filtered.map((u) => {
                const checked = value.includes(u.id)
                return (
                  <button
                    key={u.id}
                    type='button'
                    onClick={() => toggle(u.id)}
                    className='flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors'
                  >
                    <span
                      className='w-7 h-7 rounded-full grid place-items-center text-xs font-bold text-white shrink-0'
                      style={{ background: 'var(--of-blue)' }}
                    >
                      {getInitials(u.name)}
                    </span>
                    <div className='flex-1 min-w-0'>
                      <p
                        className='text-sm font-medium truncate'
                        style={{ color: 'var(--of-heading)' }}
                      >
                        {u.name}
                      </p>
                      <p
                        className='text-xs truncate'
                        style={{ color: 'var(--of-muted)' }}
                      >
                        {u.email}
                      </p>
                    </div>
                    {checked && (
                      <Check
                        size={14}
                        style={{ color: 'var(--of-blue)', flexShrink: 0 }}
                      />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

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
