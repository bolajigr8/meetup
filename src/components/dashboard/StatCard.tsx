import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: 'blue' | 'amber' | 'emerald' | 'red' | 'purple' | 'teal'
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  sub?: string
}

const colorMap = {
  blue: { bg: 'var(--of-blue-light)', icon: 'var(--of-blue)', dot: '#2563eb' },
  amber: { bg: '#FEF3C7', icon: 'var(--of-amber)', dot: '#f59e0b' },
  emerald: { bg: '#D1FAE5', icon: 'var(--of-emerald)', dot: '#10b981' },
  red: { bg: '#FEE2E2', icon: 'var(--of-red)', dot: '#ef4444' },
  purple: { bg: '#EDE9FE', icon: 'var(--of-purple)', dot: '#7c3aed' },
  teal: { bg: '#CCFBF1', icon: 'var(--of-teal)', dot: '#0d9488' },
}

const trendColor = {
  up: '#10b981',
  down: '#ef4444',
  neutral: '#64748b',
}

const trendSymbol = {
  up: '↑',
  down: '↓',
  neutral: '→',
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  sub,
}: StatCardProps) {
  const c = colorMap[color]
  return (
    <div
      className='bg-white rounded-xl border p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow duration-200'
      style={{ borderColor: 'var(--of-border)' }}
    >
      <div className='flex items-start justify-between'>
        <div
          className='w-10 h-10 rounded-xl grid place-items-center shrink-0'
          style={{ background: c.bg }}
        >
          <Icon size={18} style={{ color: c.icon }} strokeWidth={2} />
        </div>
        {trend && (
          <span
            className='text-xs font-semibold px-2 py-0.5 rounded-full'
            style={{
              color: trendColor[trend.direction],
              background:
                trend.direction === 'up'
                  ? '#D1FAE5'
                  : trend.direction === 'down'
                    ? '#FEE2E2'
                    : '#F1F5F9',
            }}
          >
            {trendSymbol[trend.direction]} {trend.value}
          </span>
        )}
      </div>

      <div>
        <div
          className='font-jakarta text-2xl font-bold tracking-tight'
          style={{ color: 'var(--of-heading)' }}
        >
          {value}
        </div>
        <p className='text-sm mt-0.5' style={{ color: 'var(--of-muted)' }}>
          {label}
        </p>
        {sub && (
          <p
            className='text-xs mt-1 font-mono-of'
            style={{ color: 'var(--of-muted)' }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}
