// src/components/settings/UserManagement.tsx
'use client'

import { useState, useEffect } from 'react'
import { Shield, ShieldOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

interface UserRow {
  id: string
  name: string
  email: string
  image?: string | null
  isAdmin?: boolean
  isSuperAdmin?: boolean
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function UserManagement() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch('/api/v1/users').then((r) => r.json()),
        // Fetch full user list with roles via a separate admin endpoint
        fetch('/api/v1/users/roles').then((r) => r.json()),
      ])
      if (rolesRes.data) {
        setUsers(rolesRes.data)
      } else if (usersRes.data) {
        setUsers(usersRes.data)
      }
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    setUpdating(userId)
    try {
      const res = await fetch(`/api/v1/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentIsAdmin }),
      })
      const data = await res.json()
      if (!res.ok)
        throw new Error(data.error?.message ?? 'Failed to update role')
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, isAdmin: !currentIsAdmin } : u,
        ),
      )
      toast.success(data.message)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className='flex flex-col gap-3'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='h-16 rounded-xl animate-pulse'
            style={{ background: 'var(--of-border)' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-3 max-w-lg'>
      <p className='text-xs' style={{ color: 'var(--of-muted)' }}>
        {users.length} registered user{users.length !== 1 ? 's' : ''}
      </p>
      <div
        className='rounded-xl border overflow-hidden divide-y'
        style={{ borderColor: 'var(--of-border)' }}
      >
        {users.map((u) => {
          const isSelf = u.id === session?.user?.id
          const isSuper = u.isSuperAdmin
          return (
            <div key={u.id} className='flex items-center gap-3 px-4 py-3'>
              <span
                className='w-9 h-9 rounded-full grid place-items-center text-xs font-bold text-white shrink-0'
                style={{ background: 'var(--of-blue)' }}
              >
                {getInitials(u.name)}
              </span>
              <div className='flex-1 min-w-0'>
                <p
                  className='text-sm font-medium truncate'
                  style={{ color: 'var(--of-heading)' }}
                >
                  {u.name}
                  {isSelf && (
                    <span
                      className='ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full'
                      style={{
                        background: 'var(--of-blue-light)',
                        color: 'var(--of-blue)',
                      }}
                    >
                      You
                    </span>
                  )}
                  {isSuper && (
                    <span
                      className='ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full'
                      style={{ background: '#EDE9FE', color: '#4C1D95' }}
                    >
                      Super Admin
                    </span>
                  )}
                </p>
                <p
                  className='text-xs truncate'
                  style={{ color: 'var(--of-muted)' }}
                >
                  {u.email}
                </p>
              </div>
              <div className='flex items-center gap-2 shrink-0'>
                {u.isAdmin && !isSuper && (
                  <span
                    className='text-[10px] font-semibold px-2 py-0.5 rounded-full'
                    style={{ background: '#D1FAE5', color: '#065F46' }}
                  >
                    Admin
                  </span>
                )}
                {!isSelf && !isSuper && (
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => toggleAdmin(u.id, u.isAdmin ?? false)}
                    disabled={updating === u.id}
                    className='h-8 text-xs flex items-center gap-1.5'
                    style={{
                      borderColor: u.isAdmin ? '#FCA5A5' : 'var(--of-border)',
                      color: u.isAdmin ? '#dc2626' : 'var(--of-body)',
                    }}
                  >
                    {updating === u.id ? (
                      <Loader2 size={12} className='animate-spin' />
                    ) : u.isAdmin ? (
                      <ShieldOff size={12} />
                    ) : (
                      <Shield size={12} />
                    )}
                    {u.isAdmin ? 'Demote' : 'Make Admin'}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
