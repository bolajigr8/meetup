import { Calendar, Users, BookOpen, MoreHorizontal, Zap } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export interface Program {
  id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  participants: string[]
  scheduleType: 'standard' | 'intensive'
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
}

const scheduleStyles = {
  standard:  { bg: '#EDE9FE', text: '#4C1D95', icon: BookOpen },
  intensive: { bg: '#FEF3C7', text: '#78350F', icon: Zap },
}

const statusStyles: Record<Program['status'], { bg: string; text: string; dot: string }> = {
  upcoming:  { bg: 'var(--of-blue-light)', text: '#1d4ed8', dot: '#2563eb' },
  active:    { bg: '#D1FAE5',             text: '#065F46', dot: '#10b981' },
  completed: { bg: '#F1F5F9',             text: '#475569', dot: '#94a3b8' },
  cancelled: { bg: '#FEE2E2',             text: '#991B1B', dot: '#ef4444' },
}

interface ProgramCardProps {
  program: Program
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export default function ProgramCard({ program, onEdit, onDelete }: ProgramCardProps) {
  const sched = scheduleStyles[program.scheduleType]
  const SchedIcon = sched.icon
  const stat = statusStyles[program.status]

  return (
    <div
      className="bg-white rounded-xl border p-5 hover:shadow-sm transition-all duration-200 group"
      style={{ borderColor: 'var(--of-border)' }}
    >
      {/* Top accent bar */}
      <div
        className="h-1 w-12 rounded-full mb-4"
        style={{ background: program.scheduleType === 'intensive' ? 'var(--of-amber)' : 'var(--of-teal)' }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3
          className="font-jakarta text-sm font-semibold leading-snug"
          style={{ color: 'var(--of-heading)' }}
        >
          {program.title}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <MoreHorizontal size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={() => onEdit?.(program.id)}>Edit</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(program.id)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {program.description && (
        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--of-muted)' }}>
          {program.description}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: stat.bg, color: stat.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: stat.dot }} />
          {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
        </span>
        <span
          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: sched.bg, color: sched.text }}
        >
          <SchedIcon size={9} />
          {program.scheduleType.charAt(0).toUpperCase() + program.scheduleType.slice(1)}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <Calendar size={12} style={{ color: 'var(--of-muted)', flexShrink: 0 }} />
          <span className="text-xs font-mono-of" style={{ color: 'var(--of-body)' }}>
            {program.startDate} → {program.endDate}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={12} style={{ color: 'var(--of-muted)', flexShrink: 0 }} />
          <span className="text-xs" style={{ color: 'var(--of-body)' }}>
            {program.participants.length} participant{program.participants.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
