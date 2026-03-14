import { MapPin, Users, Clock, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export interface Meeting {
  id: string
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  location?: string
  participants: string[]
  priority: 'low' | 'medium' | 'high'
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

const priorityStyles: Record<
  Meeting['priority'],
  { bg: string; text: string }
> = {
  high: { bg: '#FEE2E2', text: '#991B1B' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  low: { bg: '#F0FDF4', text: '#166534' },
}

const statusStyles: Record<
  Meeting['status'],
  { bg: string; text: string; dot: string }
> = {
  upcoming: { bg: 'var(--of-blue-light)', text: '#1d4ed8', dot: '#2563eb' },
  ongoing: { bg: '#D1FAE5', text: '#065F46', dot: '#10b981' },
  completed: { bg: '#F1F5F9', text: '#475569', dot: '#94a3b8' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B', dot: '#ef4444' },
}

interface MeetingCardProps {
  meeting: Meeting
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function MeetingCard({
  meeting,
  onEdit,
  onDelete,
}: MeetingCardProps) {
  const pStyle = priorityStyles[meeting.priority]
  const sStyle = statusStyles[meeting.status]

  return (
    <div
      className='bg-white rounded-xl border p-5 hover:shadow-sm transition-all duration-200 group'
      style={{ borderColor: 'var(--of-border)' }}
    >
      {/* Header row */}
      <div className='flex items-start justify-between gap-3 mb-3'>
        <div className='flex-1 min-w-0'>
          <h3
            className='font-jakarta text-sm font-semibold leading-snug wrap-break-word'
            style={{ color: 'var(--of-heading)' }}
          >
            {meeting.title}
          </h3>
          {meeting.description && (
            <p
              className='text-xs mt-1 wrap-break-word overflow-wrap-anywhere leading-relaxed'
              style={{ color: 'var(--of-muted)', wordBreak: 'break-word' }}
            >
              {meeting.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'
            >
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-36'>
            <DropdownMenuItem onClick={() => onEdit?.(meeting.id)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(meeting.id)}
              className='text-red-600 focus:text-red-600 focus:bg-red-50'
            >
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Badges */}
      <div className='flex flex-wrap gap-1.5 mb-3'>
        <span
          className='inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full'
          style={{ background: sStyle.bg, color: sStyle.text }}
        >
          <span
            className='w-1.5 h-1.5 rounded-full'
            style={{ background: sStyle.dot }}
          />
          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
        </span>
        <span
          className='inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize'
          style={{ background: pStyle.bg, color: pStyle.text }}
        >
          {meeting.priority} priority
        </span>
      </div>

      {/* Meta */}
      <div className='flex flex-col gap-1.5'>
        <div className='flex items-center gap-1.5'>
          <Clock
            size={12}
            style={{ color: 'var(--of-muted)', flexShrink: 0 }}
          />
          <span
            className='text-xs font-mono-of break-all'
            style={{ color: 'var(--of-body)' }}
          >
            {meeting.date} · {meeting.startTime} – {meeting.endTime} WAT
          </span>
        </div>
        {meeting.location && (
          <div className='flex items-center gap-1.5'>
            <MapPin
              size={12}
              style={{ color: 'var(--of-muted)', flexShrink: 0 }}
            />
            <span
              className='text-xs wrap-break-word min-w-0'
              style={{ color: 'var(--of-body)' }}
            >
              {meeting.location}
            </span>
          </div>
        )}
        <div className='flex items-center gap-1.5'>
          <Users
            size={12}
            style={{ color: 'var(--of-muted)', flexShrink: 0 }}
          />
          <span className='text-xs' style={{ color: 'var(--of-body)' }}>
            {meeting.participants.length} participant
            {meeting.participants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
