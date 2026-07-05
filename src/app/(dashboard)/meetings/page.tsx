import { Suspense } from 'react'
import MeetingsClient from './client'

function MeetingsLoading() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='h-44 rounded-xl border animate-pulse'
          style={{ background: 'var(--of-border)' }}
        />
      ))}
    </div>
  )
}

export default function MeetingsPage() {
  return (
    <Suspense fallback={<MeetingsLoading />}>
      <MeetingsClient />
    </Suspense>
  )
}
