'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface DataPoint {
  period: string
  completed: number
  total: number
}

interface Props {
  data: DataPoint[]
}

export default function TaskCompletionChart({ data }: Props) {
  if (!data.length) return <EmptyChart />

  return (
    <ResponsiveContainer width='100%' height={220}>
      <BarChart data={data} barGap={4} barCategoryGap='32%'>
        <CartesianGrid
          strokeDasharray='3 3'
          stroke='#F1F5F9'
          vertical={false}
        />
        <XAxis
          dataKey='period'
          tick={{
            fontSize: 11,
            fill: '#94a3b8',
            fontFamily: 'var(--font-mono)',
          }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            fontSize: 12,
          }}
          cursor={{ fill: '#F8FAFC' }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
          iconType='circle'
          iconSize={8}
        />
        <Bar
          dataKey='total'
          name='Total'
          fill='#E2E8F0'
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey='completed'
          name='Completed'
          fill='#10b981'
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

function EmptyChart() {
  return (
    <div className='h-55 flex items-center justify-center'>
      <p className='text-sm' style={{ color: 'var(--of-muted)' }}>
        No task data for this period.
      </p>
    </div>
  )
}
