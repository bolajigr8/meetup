import { Suspense } from 'react'
import ProgramsClient from './client'

function ProgramsLoading() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className='h-48 rounded-xl border animate-pulse'
          style={{ background: 'var(--of-border)' }}
        />
      ))}
    </div>
  )
}

export default function ProgramsPage() {
  return (
    <Suspense fallback={<ProgramsLoading />}>
      <ProgramsClient />
    </Suspense>
  )
}
