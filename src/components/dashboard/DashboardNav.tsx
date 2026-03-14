'use client'

import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, ChevronDown } from 'lucide-react'
import MobileDrawer from './MobileDrawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const pageTitles: Record<string, string> = {
  '/overview': 'Overview',
  '/meetings': 'Meetings',
  '/tasks': 'Tasks',
  '/programs': 'Programs',
  '/calendar': 'Calendar',
  '/notifications': 'Notifications',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

function getTitle(pathname: string) {
  const match = Object.entries(pageTitles).find(([key]) =>
    key === '/overview' ? pathname === key : pathname.startsWith(key),
  )
  return match?.[1] ?? 'Dashboard'
}

function getInitials(name?: string | null) {
  if (!name) return 'U'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export default function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user

  return (
    <header
      className='h-16 flex items-center justify-between py-7 px-4 lg:px-6 border-b bg-white sticky top-0 z-30'
      style={{ borderColor: 'var(--of-border)' }}
    >
      {/* Left: hamburger (mobile) + page title */}
      <div className='flex items-center gap-3'>
        <MobileDrawer />
        <h2
          className='font-jakarta text-[15px] font-semibold'
          style={{ color: 'var(--of-heading)' }}
        >
          {getTitle(pathname)}
        </h2>
      </div>

      {/* Right: user menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className='flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors outline-none'>
            <Avatar className='h-8 w-8'>
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name ?? 'User'}
              />
              <AvatarFallback
                className='text-xs font-semibold text-white'
                style={{ background: 'var(--of-blue)' }}
              >
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className='hidden sm:block text-sm font-medium max-w-30 truncate'
              style={{ color: 'var(--of-heading)' }}
            >
              {user?.name ?? 'Account'}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--of-muted)' }} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align='end' className='w-48'>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col'>
              <span
                className='text-sm font-semibold'
                style={{ color: 'var(--of-heading)' }}
              >
                {user?.name}
              </span>
              <span
                className='text-xs truncate'
                style={{ color: 'var(--of-muted)' }}
              >
                {user?.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem asChild>
            <a
              href='/settings'
              className='flex items-center gap-2 cursor-pointer'
            >
              <User size={14} />
              Profile settings
            </a>
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: '/login' })}
            className='flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'
          >
            <LogOut size={14} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
