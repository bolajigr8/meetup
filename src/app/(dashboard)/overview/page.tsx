import { Suspense } from 'react'
import OverviewClient from '@/components/dashboard/OverviewClient'

export const metadata = { title: 'Overview — Gablink' }

function OverviewLoading() {
  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className='h-28 rounded-xl border animate-pulse'
          style={{ background: 'var(--of-border)' }}
        />
      ))}
    </div>
  )
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<OverviewLoading />}>
      <OverviewClient />
    </Suspense>
  )
}
