import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  children?: ReactNode
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div
        className="w-14 h-14 rounded-2xl grid place-items-center mb-4"
        style={{ background: 'var(--of-blue-light)' }}
      >
        <Icon size={24} style={{ color: 'var(--of-blue)' }} strokeWidth={1.5} />
      </div>
      <h3
        className="font-jakarta text-base font-semibold mb-1.5"
        style={{ color: 'var(--of-heading)' }}
      >
        {title}
      </h3>
      <p
        className="text-sm max-w-xs leading-relaxed mb-5"
        style={{ color: 'var(--of-muted)' }}
      >
        {description}
      </p>
      {children}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
