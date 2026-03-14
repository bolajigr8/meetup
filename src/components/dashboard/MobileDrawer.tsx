'use client'

import { useState } from 'react'
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
  Menu,
  Zap,
  X,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview', href: '/overview', icon: LayoutDashboard },
  { label: 'Meetings', href: '/meetings', icon: CalendarDays },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Programs', href: '/programs', icon: GraduationCap },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function MobileDrawer() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/overview' ? pathname === href : pathname.startsWith(href)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='lg:hidden h-9 w-9'>
          <Menu size={20} style={{ color: 'var(--of-heading)' }} />
        </Button>
      </SheetTrigger>

      <SheetContent
        side='left'
        showCloseButton={false}
        className='w-65 p-0 border-r'
        style={{ borderColor: 'var(--of-border)' }}
      >
        {/* Header */}
        <div
          className='flex items-center justify-between px-5 h-16 border-b shrink-0'
          style={{ borderColor: 'var(--of-border)' }}
        >
          <div className='flex items-center gap-2.5'>
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
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8'
            onClick={() => setOpen(false)}
          >
            <X size={16} style={{ color: 'var(--of-muted)' }} />
          </Button>
        </div>

        {/* Nav */}
        <nav className='px-3 py-4 flex flex-col gap-0.5'>
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                  active ? '' : 'hover:bg-slate-50',
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
      </SheetContent>
    </Sheet>
  )
}
