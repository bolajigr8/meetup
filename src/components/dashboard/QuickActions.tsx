// src/components/dashboard/QuickActions.tsx
'use client'

import { useState } from 'react'
import { CalendarDays, CheckSquare, GraduationCap, Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'
import MeetingDialog from '@/components/meetings/MeetingDialog'
import TaskDialog from '@/components/tasks/TaskDialog'
import ProgramDialog from '@/components/programs/ProgramDialog'

export default function QuickActions() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin || session?.user?.isSuperAdmin || false

  const [meetingOpen, setMeetingOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const [programOpen, setProgramOpen] = useState(false)

  if (!isAdmin) {
    return (
      <div
        className='bg-white rounded-xl border p-5'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <h3
          className='font-jakarta text-sm font-semibold mb-3'
          style={{ color: 'var(--of-heading)' }}
        >
          Your workspace
        </h3>
        <p
          className='text-xs leading-relaxed'
          style={{ color: 'var(--of-muted)' }}
        >
          Meetings, tasks, and programs assigned to you appear across your
          dashboard. Contact your admin to schedule or update items.
        </p>
      </div>
    )
  }

  return (
    <>
      <div
        className='bg-white rounded-xl border p-5'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <h3
          className='font-jakarta text-sm font-semibold mb-4'
          style={{ color: 'var(--of-heading)' }}
        >
          Quick actions
        </h3>
        <div className='flex flex-col gap-2'>
          <QuickActionButton
            label='New meeting'
            color='var(--of-blue)'
            bg='var(--of-blue-light)'
            icon={CalendarDays}
            onClick={() => setMeetingOpen(true)}
          />
          <QuickActionButton
            label='New task'
            color='var(--of-amber)'
            bg='#FEF3C7'
            icon={CheckSquare}
            onClick={() => setTaskOpen(true)}
          />
          <QuickActionButton
            label='New program'
            color='var(--of-teal)'
            bg='#CCFBF1'
            icon={GraduationCap}
            onClick={() => setProgramOpen(true)}
          />
        </div>
      </div>

      <MeetingDialog open={meetingOpen} onOpenChange={setMeetingOpen} />
      <TaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
      <ProgramDialog open={programOpen} onOpenChange={setProgramOpen} />
    </>
  )
}

function QuickActionButton({
  label,
  color,
  bg,
  icon: Icon,
  onClick,
}: {
  label: string
  color: string
  bg: string
  icon: React.ElementType
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className='flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:opacity-80 transition-all duration-150 w-full text-left'
      style={{ background: bg }}
    >
      <Icon size={15} style={{ color }} strokeWidth={2} />
      <span className='text-sm font-medium' style={{ color }}>
        {label}
      </span>
      <Plus size={13} className='ml-auto' style={{ color }} />
    </button>
  )
}
