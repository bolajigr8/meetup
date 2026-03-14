'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DataPoint {
  status: string
  count: number
}

interface Props {
  data: DataPoint[]
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: '#3b82f6',
  active: '#10b981',
  completed: '#94a3b8',
  cancelled: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function ProgramSummaryChart({ data }: Props) {
  const filtered = data.filter((d) => d.count > 0)
  if (!filtered.length) return <EmptyChart />

  const chartData = filtered.map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
    status: d.status,
  }))

  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className='relative'>
      <ResponsiveContainer width='100%' height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx='50%'
            cy='50%'
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey='value'
          >
            {chartData.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] ?? '#94a3b8'}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #E2E8F0',
              fontSize: 12,
            }}
            formatter={(value) => {
              const n = typeof value === 'number' ? value : 0
              return [`${n} program${n !== 1 ? 's' : ''}`, ''] as [
                string,
                string,
              ]
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType='circle'
            iconSize={8}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Centre total */}
      <div
        className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'
        style={{ top: '-10px' }}
      >
        <span
          className='font-jakarta text-2xl font-bold'
          style={{ color: 'var(--of-heading)' }}
        >
          {total}
        </span>
        <span className='text-xs' style={{ color: 'var(--of-muted)' }}>
          total
        </span>
      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className='h-55 flex items-center justify-center'>
      <p className='text-sm' style={{ color: 'var(--of-muted)' }}>
        No program data available.
      </p>
    </div>
  )
}
