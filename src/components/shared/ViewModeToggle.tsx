// src/components/shared/ViewModeToggle.tsx
'use client'

import { History, CalendarClock } from 'lucide-react'

interface ViewModeToggleProps {
  mode: 'upcoming' | 'past'
  onChange: (mode: 'upcoming' | 'past') => void
  pastCount?: number
}

export default function ViewModeToggle({
  mode,
  onChange,
  pastCount,
}: ViewModeToggleProps) {
  return (
    <div
      className='flex gap-1 p-1 rounded-lg w-fit'
      style={{ background: 'var(--of-border)' }}
    >
      <button
        onClick={() => onChange('upcoming')}
        className='flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150'
        style={
          mode === 'upcoming'
            ? {
                background: '#fff',
                color: 'var(--of-heading)',
                boxShadow: '0 1px 3px rgba(0,0,0,.08)',
              }
            : { color: 'var(--of-muted)' }
        }
      >
        <CalendarClock size={13} />
        Active
      </button>
      <button
        onClick={() => onChange('past')}
        className='flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150'
        style={
          mode === 'past'
            ? {
                background: '#fff',
                color: 'var(--of-heading)',
                boxShadow: '0 1px 3px rgba(0,0,0,.08)',
              }
            : { color: 'var(--of-muted)' }
        }
      >
        <History size={13} />
        Past{typeof pastCount === 'number' ? ` (${pastCount})` : ''}
      </button>
    </div>
  )
}
