// src/components/shared/AssignedUsers.tsx
'use client'

export interface AssignedUser {
  id: string
  name: string
  email: string
  image?: string | null
}

interface AssignedUsersProps {
  users: AssignedUser[]
  max?: number
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

/**
 * Avatar-stack showing which registered users a meeting/task/program
 * has been assigned to. Renders nothing if there's no one assigned
 * (e.g. it only has external email participants).
 */
export default function AssignedUsers({ users, max = 3 }: AssignedUsersProps) {
  if (!users || users.length === 0) return null

  const visible = users.slice(0, max)
  const overflow = users.length - visible.length

  return (
    <div className='flex items-center gap-1.5 min-w-0'>
      <div className='flex -space-x-2 shrink-0'>
        {visible.map((u) =>
          u.image ? (
            <img
              key={u.id}
              src={u.image}
              alt={u.name}
              title={`${u.name} (${u.email})`}
              className='w-6 h-6 rounded-full border-2 border-white object-cover shrink-0'
            />
          ) : (
            <div
              key={u.id}
              title={`${u.name} (${u.email})`}
              className='w-6 h-6 rounded-full border-2 border-white grid place-items-center text-[9px] font-bold text-white shrink-0'
              style={{ background: 'var(--of-blue)' }}
            >
              {getInitials(u.name)}
            </div>
          ),
        )}
        {overflow > 0 && (
          <div
            title={`${overflow} more`}
            className='w-6 h-6 rounded-full border-2 border-white grid place-items-center text-[9px] font-bold shrink-0'
            style={{ background: 'var(--of-border)', color: 'var(--of-muted)' }}
          >
            +{overflow}
          </div>
        )}
      </div>
      <span className='text-xs truncate' style={{ color: 'var(--of-body)' }}>
        {users.length === 1 ? users[0].name : `${users.length} assigned`}
      </span>
    </div>
  )
}
