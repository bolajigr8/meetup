'use client'

import Link from 'next/link'

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Reminder Engine', href: '#reminders' },
      { label: 'Calendar', href: '#' },
      { label: 'Analytics', href: '#' },
      { label: 'PWA', href: '#' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Meetings', href: '#' },
      { label: 'Tasks', href: '#' },
      { label: 'Programs', href: '#' },
      { label: 'Notifications', href: '#' },
      { label: 'Settings', href: '#' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign In', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'Google OAuth', href: '/register?method=google' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer
      className='px-6 md:px-[6%] pt-12 pb-8'
      style={{ background: 'var(--of-heading)' }}
    >
      <div className='max-w-275 mx-auto'>
        {/* Top grid: stacks on mobile, 4-col on lg */}
        <div
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 lg:gap-12 pb-10 border-b'
          style={{ borderColor: 'rgba(255,255,255,.08)' }}
        >
          {/* Brand column */}
          <div>
            <Link
              href='/'
              className='inline-flex items-center gap-2 no-underline mb-3.5'
            >
              <div
                className='w-8 h-8 rounded-lg grid place-items-center'
                style={{ background: 'var(--of-blue)' }}
              >
                <svg
                  width='17'
                  height='17'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='white'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                >
                  <rect x='3' y='4' width='18' height='18' rx='2' />
                  <line x1='16' y1='2' x2='16' y2='6' />
                  <line x1='8' y1='2' x2='8' y2='6' />
                  <line x1='3' y1='10' x2='21' y2='10' />
                </svg>
              </div>
              <span className='font-jakarta text-[19px] font-bold text-white'>
                Org<span style={{ color: 'var(--of-blue)' }}>Flow</span>
              </span>
            </Link>

            <p
              className='text-[13px] leading-[1.72] max-w-65 mb-4'
              style={{ color: 'rgba(255,255,255,.38)' }}
            >
              Organizational Activity &amp; Scheduling Platform built for West
              African organizations. Meetings, tasks, and programs — all in one
              place, all on time.
            </p>

            <div
              className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full'
              style={{
                background: 'rgba(37,99,235,.18)',
                border: '1px solid rgba(37,99,235,.35)',
              }}
            >
              <svg
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='var(--of-blue-mid)'
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='10' />
                <polyline points='12 6 12 12 16 14' />
              </svg>
              <span
                className='font-mono-of text-[11px] font-semibold'
                style={{ color: 'var(--of-blue-mid)' }}
              >
                West Africa Time · UTC+1
              </span>
            </div>
          </div>

          {/* Link columns — shown as 1 col each on sm, own col on lg */}
          {columns.map((col) => (
            <div key={col.title}>
              <div
                className='text-[11px] font-bold uppercase tracking-[1px] mb-4'
                style={{ color: 'rgba(255,255,255,.35)' }}
              >
                {col.title}
              </div>
              <div className='flex flex-col gap-2.5'>
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    className='text-[13.5px] no-underline transition-colors duration-200 hover:text-white'
                    style={{ color: 'rgba(255,255,255,.55)' }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className='pt-6 flex flex-col sm:flex-row items-center justify-between gap-3'>
          <span
            className='text-[12.5px] text-center sm:text-left'
            style={{ color: 'rgba(255,255,255,.28)' }}
          >
            © 2026 MeetUp ·{' '}
            <span style={{ color: 'rgba(255,255,255,.42)' }}>
              Built with Next.js · MongoDB · Vercel
            </span>
          </span>
          <div className='flex gap-2'>
            {['WAT UTC+1', 'PWA Ready', 'v1.0.0'].map((b) => (
              <span
                key={b}
                className='font-mono-of px-2.5 py-1 rounded-full text-[10.5px] font-semibold'
                style={{
                  border: '1px solid rgba(255,255,255,.10)',
                  color: 'rgba(255,255,255,.35)',
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
