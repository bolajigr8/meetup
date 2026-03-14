import {
  Calendar,
  User,
  Tag,
  MoreHorizontal,
  CheckCircle2,
  Circle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export interface Task {
  id: string
  title: string
  description?: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  status: 'todo' | 'in_progress' | 'completed' | 'overdue'
  category?: string
  assignedTo?: string
}

const priorityStyles: Record<Task['priority'], { bg: string; text: string }> = {
  high: { bg: '#FEE2E2', text: '#991B1B' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  low: { bg: '#F0FDF4', text: '#166534' },
}

const statusStyles: Record<Task['status'], { label: string; color: string }> = {
  todo: { label: 'To do', color: '#94a3b8' },
  in_progress: { label: 'In progress', color: 'var(--of-blue)' },
  completed: { label: 'Completed', color: 'var(--of-emerald)' },
  overdue: { label: 'Overdue', color: 'var(--of-red)' },
}

interface TaskCardProps {
  task: Task
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onToggle?: (id: string) => void
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggle,
}: TaskCardProps) {
  const pStyle = priorityStyles[task.priority]
  const sStyle = statusStyles[task.status]
  const done = task.status === 'completed'

  return (
    <div
      className={`bg-white rounded-xl border p-4 hover:shadow-sm transition-all duration-200 group ${done ? 'opacity-60' : ''}`}
      style={{ borderColor: 'var(--of-border)' }}
    >
      <div className='flex items-start gap-3'>
        {/* Checkbox */}
        <button
          onClick={() => onToggle?.(task.id)}
          className='mt-0.5 shrink-0 transition-colors hover:opacity-70'
          style={{ color: done ? 'var(--of-emerald)' : '#cbd5e1' }}
        >
          {done ? (
            <CheckCircle2 size={18} fill='var(--of-emerald)' color='white' />
          ) : (
            <Circle size={18} />
          )}
        </button>

        {/* Content */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <h3
              className={`text-sm font-semibold leading-snug ${done ? 'line-through' : ''}`}
              style={{
                color: 'var(--of-heading)',
                fontFamily: 'var(--font-jakarta)',
              }}
            >
              {task.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'
                >
                  <MoreHorizontal size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-32'>
                <DropdownMenuItem onClick={() => onEdit?.(task.id)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete?.(task.id)}
                  className='text-red-600 focus:text-red-600 focus:bg-red-50'
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {task.description && (
            <p
              className='text-xs mt-1 line-clamp-2'
              style={{ color: 'var(--of-muted)' }}
            >
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className='flex flex-wrap items-center gap-2.5 mt-2.5'>
            <div className='flex items-center gap-1'>
              <Calendar size={11} style={{ color: 'var(--of-muted)' }} />
              <span
                className='text-[11px] font-mono-of'
                style={{
                  color:
                    task.status === 'overdue'
                      ? 'var(--of-red)'
                      : 'var(--of-body)',
                  fontWeight: task.status === 'overdue' ? '600' : '400',
                }}
              >
                {task.dueDate}
              </span>
            </div>

            {task.assignedTo && (
              <div className='flex items-center gap-1'>
                <User size={11} style={{ color: 'var(--of-muted)' }} />
                <span
                  className='text-[11px] truncate max-w-30'
                  style={{ color: 'var(--of-body)' }}
                >
                  {task.assignedTo}
                </span>
              </div>
            )}

            {task.category && (
              <div className='flex items-center gap-1'>
                <Tag size={11} style={{ color: 'var(--of-muted)' }} />
                <span
                  className='text-[11px]'
                  style={{ color: 'var(--of-body)' }}
                >
                  {task.category}
                </span>
              </div>
            )}

            <span
              className='text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ml-auto'
              style={{ background: pStyle.bg, color: pStyle.text }}
            >
              {task.priority}
            </span>
          </div>

          {/* Status */}
          <div className='mt-2'>
            <span
              className='text-[10px] font-semibold'
              style={{ color: sStyle.color }}
            >
              ● {sStyle.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
