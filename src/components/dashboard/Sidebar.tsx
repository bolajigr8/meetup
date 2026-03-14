'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  Calendar,
  Bell,
  BarChart2,
  Settings,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview', href: '/overview', icon: LayoutDashboard },
  { label: 'Meetings', href: '/meetings', icon: CalendarDays },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Programs', href: '/programs', icon: GraduationCap },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
]

const bottomItems = [{ label: 'Settings', href: '/settings', icon: Settings }]

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/overview' ? pathname === href : pathname.startsWith(href)

  return (
    <aside
      className='hidden lg:flex flex-col w-57.5 shrink-0 h-screen sticky top-0 border-r'
      style={{ borderColor: 'var(--of-border)', background: '#fff' }}
    >
      {/* Logo */}
      <div
        className='flex items-center gap-2.5 px-5 h-16 border-b shrink-0'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <div
          className='w-8 h-8 rounded-[9px] grid place-items-center shrink-0'
          style={{ background: 'var(--of-blue)' }}
        >
          <Zap size={14} color='white' fill='white' />
        </div>
        <span
          className='font-jakarta text-[17px] font-bold tracking-[-0.3px]'
          style={{ color: 'var(--of-heading)' }}
        >
          Meet<span style={{ color: 'var(--of-blue)' }}>Up</span>
        </span>
      </div>

      {/* Main nav */}
      <nav className='flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5'>
        <p
          className='px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest'
          style={{ color: 'var(--of-muted)' }}
        >
          Main
        </p>
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active ? 'text-white' : 'hover:bg-slate-50',
              )}
              style={
                active
                  ? { background: 'var(--of-blue)', color: 'white' }
                  : { color: 'var(--of-body)' }
              }
            >
              <Icon
                size={16}
                strokeWidth={active ? 2.5 : 2}
                style={{
                  color: active ? 'white' : 'var(--of-muted)',
                  flexShrink: 0,
                }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div
        className='px-3 pb-4 border-t pt-3'
        style={{ borderColor: 'var(--of-border)' }}
      >
        {bottomItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active ? 'text-white' : 'hover:bg-slate-50',
              )}
              style={
                active
                  ? { background: 'var(--of-blue)', color: 'white' }
                  : { color: 'var(--of-body)' }
              }
            >
              <Icon
                size={16}
                strokeWidth={2}
                style={{
                  color: active ? 'white' : 'var(--of-muted)',
                  flexShrink: 0,
                }}
              />
              {label}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
