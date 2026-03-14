import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div className='flex items-start justify-between gap-4 mb-6'>
      <div>
        <h1
          className='font-jakarta text-2xl font-bold tracking-tight'
          style={{ color: 'var(--of-heading)' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className='mt-1 text-sm' style={{ color: 'var(--of-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className='shrink-0'>{action}</div>}
    </div>
  )
}
