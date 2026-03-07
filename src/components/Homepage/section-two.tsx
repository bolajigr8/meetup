'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

const features = [
  {
    color: '#2563EB',
    bg: '#EFF6FF',
    icon: 'M23 7l-7 5 7 5V7zM1 5h15v14H1z',
    title: 'Meeting Management',
    desc: 'Schedule meetings with conflict detection, participant management, and priority levels. Get notified ±30 min before clashes happen.',
  },
  {
    color: '#7C3AED',
    bg: '#F5F3FF',
    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
    title: 'Task Tracking',
    desc: 'Kanban board with due-date reminders, priority labels, assignees, and category tags. Overdue tasks highlighted automatically.',
  },
  {
    color: '#0D9488',
    bg: '#F0FDFA',
    icon: 'M22 10v6M2 10l10-7 10 7M6 10v8h5v-4h2v4h5V10',
    title: 'Training Programs',
    desc: 'Manage multi-day programs with standard (14-day) or intensive (3-day) reminder schedules that adapt as the start date approaches.',
  },
  {
    color: '#F59E0B',
    bg: '#FFFBEB',
    icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
    title: 'Automated Reminders',
    desc: 'Cron engine runs every 15 minutes. Sends via SendGrid with idempotency — unique keys prevent any duplicate emails, ever.',
  },
  {
    color: '#2563EB',
    bg: '#EFF6FF',
    icon: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
    title: 'Unified Calendar',
    desc: 'Month, week, day, and agenda views. Color-coded by type and priority. Conflict days highlighted red with direct links to resolve.',
  },
  {
    color: '#10B981',
    bg: '#D1FAE5',
    icon: 'M18 20v-10M12 20V4M6 20v-6',
    title: 'Analytics Dashboard',
    desc: 'Recharts-powered insights: meeting counts, task completion rates, priority distributions, and a 3-month activity heatmap.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Create your account',
    desc: 'Sign up via Google or email. Profile auto-configured for West Africa Time (UTC+1).',
  },
  {
    num: '02',
    title: 'Add your activities',
    desc: 'Create meetings, tasks, and programs. Invite participants — no MeetUp account needed to receive reminders.',
  },
  {
    num: '03',
    title: 'Configure reminders',
    desc: 'Choose intervals: 2 days, 1 day, 2 hours. Programs get standard or intensive auto-schedules.',
  },
  {
    num: '04',
    title: 'Stay on track',
    desc: 'The engine handles the rest — emails sent, conflicts flagged, calendar always current.',
  },
]

export default function SectionTwo() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const elements = ref.current?.querySelectorAll('.of-reveal')
    if (!elements) return

    // ── FIX: threshold:0 + no negative rootMargin so elements trigger
    //         as soon as even 1px enters the viewport.
    //         We also immediately reveal anything already in view on mount.
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(
          (e) => e.isIntersecting && e.target.classList.add('of-visible'),
        ),
      { threshold: 0, rootMargin: '0px 0px 0px 0px' },
    )

    elements.forEach((el) => io.observe(el))

    // Fallback: reveal elements already visible when the component mounts
    // (e.g. if the user navigated directly to #features)
    const fallback = setTimeout(() => {
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add('of-visible')
        }
      })
    }, 100)

    return () => {
      io.disconnect()
      clearTimeout(fallback)
    }
  }, [])

  return (
    <div ref={ref}>
      {/* ── Feature strip ── */}
      {/* id="features" is on the section below — this strip is just decorative */}
      <div
        className='border-t border-b py-4 px-6 md:px-[6%]'
        style={{
          background: 'var(--of-surface)',
          borderColor: 'var(--of-border)',
        }}
      >
        <div className='max-w-275 mx-auto flex flex-wrap gap-x-6 gap-y-3 items-center justify-center'>
          {[
            { icon: 'M20 6L9 17l-5-5', label: 'Conflict Detection' },
            {
              icon: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
              label: 'Automated Reminders',
            },
            {
              icon: 'M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2',
              label: 'WAT Timezone',
            },
            {
              icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
              label: 'Offline PWA',
            },
            { icon: 'M2 3h20v14H2zM8 21h8M12 17v4', label: 'Mobile Ready' },
            { icon: 'M18 20v-10M12 20V4M6 20v-6', label: 'Analytics' },
          ].map((item) => (
            <div
              key={item.label}
              className='flex items-center gap-1.5 text-[12.5px] font-medium whitespace-nowrap'
              style={{ color: 'var(--of-muted)' }}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='var(--of-blue)'
                strokeWidth='2'
              >
                <path d={item.icon} />
              </svg>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature cards ──
           id="features" ← matches Navbar link href="#features"  -->
      */}
      <section
        id='features'
        className='py-16 md:py-22 px-6 md:px-[6%] bg-white'
      >
        <div className='max-w-275 mx-auto'>
          {/* Header */}
          <div className='of-reveal mb-10 md:mb-14'>
            <span
              className='inline-flex items-center gap-1.5 text-[11.5px] font-bold tracking-[1.4px] uppercase mb-2.5'
              style={{ color: 'var(--of-blue)' }}
            >
              <span
                className='block w-4.5 h-0.5'
                style={{ background: 'var(--of-blue)' }}
              />
              Core Features
            </span>
            <h2
              className='font-jakarta font-extrabold tracking-[-0.7px] leading-[1.15] mb-3'
              style={{
                fontSize: 'clamp(24px, 3.5vw, 40px)',
                color: 'var(--of-heading)',
              }}
            >
              Everything your organization
              <br className='hidden sm:block' /> needs in one platform
            </h2>
            <p
              className='text-[15px] md:text-[15.5px] leading-[1.7] max-w-130'
              style={{ color: 'var(--of-muted)' }}
            >
              From scheduling to tracking to training, MeetUp centralizes every
              organizational activity with smart automation baked in.
            </p>
          </div>

          {/* Cards grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`of-reveal of-d${Math.min(i + 1, 6)} group relative overflow-hidden rounded-2xl border p-5 md:p-6 bg-white cursor-default transition-all duration-300 hover:-translate-y-1`}
                style={{ borderColor: 'var(--of-border)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 14px 40px rgba(37,99,235,.09)'
                  e.currentTarget.style.borderColor = 'transparent'
                  ;(
                    e.currentTarget.querySelector('.top-bar') as HTMLElement
                  ).style.transform = 'scaleX(1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = 'var(--of-border)'
                  ;(
                    e.currentTarget.querySelector('.top-bar') as HTMLElement
                  ).style.transform = 'scaleX(0)'
                }}
              >
                <div
                  className='top-bar absolute top-0 left-0 right-0 h-0.75 transition-transform duration-300'
                  style={{
                    background: f.color,
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                  }}
                />
                <div
                  className='w-11 h-11 rounded-[11px] grid place-items-center mb-4'
                  style={{ background: f.bg }}
                >
                  <svg
                    width='22'
                    height='22'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke={f.color}
                    strokeWidth='2'
                  >
                    <path d={f.icon} />
                  </svg>
                </div>
                <div
                  className='font-jakarta text-[15px] font-bold mb-1.5'
                  style={{ color: 'var(--of-heading)' }}
                >
                  {f.title}
                </div>
                <p
                  className='text-[13px] leading-[1.65]'
                  style={{ color: 'var(--of-muted)' }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* WAT callout */}
          <div
            className='of-reveal mt-8 md:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 rounded-xl p-4 md:p-[14px_22px]'
            style={{
              background: 'var(--of-blue-light)',
              border: '1px solid var(--of-blue-mid)',
            }}
          >
            <div
              className='w-9.5 h-9.5 rounded-[9px] grid place-items-center shrink-0'
              style={{ background: 'var(--of-blue)' }}
            >
              <svg
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='white'
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='10' />
                <polyline points='12 6 12 12 16 14' />
              </svg>
            </div>
            <div className='flex-1'>
              <div
                className='font-bold text-[13.5px] mb-0.5'
                style={{ color: 'var(--of-heading)' }}
              >
                Designed for West Africa — Everything runs on WAT
              </div>
              <div
                className='text-[12.5px]'
                style={{ color: 'var(--of-muted)' }}
              >
                All dates and times in West Africa Time (Africa/Lagos, UTC+1).
                Stored as UTC, converted at display.
              </div>
            </div>
            <span
              className='font-mono-of text-[11.5px] font-semibold text-white px-3 py-1.5 rounded-lg shrink-0'
              style={{ background: 'var(--of-blue)' }}
            >
              UTC+1 · WAT
            </span>
          </div>
        </div>
      </section>

      {/* ── How it works ──
           id="how-it-works" ← matches Navbar link href="#how-it-works"
      */}
      <section
        id='how-it-works'
        className='relative overflow-hidden py-16 md:py-22 px-6 md:px-[6%]'
        style={{ background: 'var(--of-heading)' }}
      >
        <div
          aria-hidden
          className='absolute top-[-40%] right-[-8%] w-125 h-125 rounded-full pointer-events-none'
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,.04) 0%, transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className='absolute bottom-[-30%] left-[-5%] w-100 h-100 rounded-full pointer-events-none'
          style={{
            background:
              'radial-gradient(circle, rgba(245,158,11,.09) 0%, transparent 70%)',
          }}
        />

        <div className='relative z-10 max-w-275 mx-auto'>
          <div className='of-reveal text-center max-w-130 mx-auto mb-12 md:mb-14'>
            <span
              className='inline-flex items-center gap-1.5 text-[11.5px] font-bold tracking-[1.4px] uppercase mb-2.5'
              style={{ color: 'var(--of-amber)' }}
            >
              <span
                className='block w-4.5 h-0.5'
                style={{ background: 'var(--of-amber)' }}
              />
              How It Works
            </span>
            <h2
              className='font-jakarta font-extrabold tracking-[-0.7px] leading-[1.15] mb-3 text-white'
              style={{ fontSize: 'clamp(24px, 3.5vw, 40px)' }}
            >
              Up and running in minutes
            </h2>
            <p
              className='text-[15px] md:text-[15.5px] leading-[1.7]'
              style={{ color: 'rgba(255,255,255,.58)' }}
            >
              Four simple steps from sign-up to a fully automated scheduling
              system for your organization.
            </p>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6 relative'>
            <div
              className='hidden lg:block absolute top-6.75 z-0'
              style={{
                left: 'calc(12.5% + 26px)',
                right: 'calc(12.5% + 26px)',
                height: 1,
                background:
                  'linear-gradient(90deg, var(--of-blue-mid), var(--of-amber), var(--of-blue-mid))',
              }}
            />

            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`of-reveal of-d${i + 1} relative z-10 text-center`}
              >
                <div
                  className='w-13.5 h-13.5 rounded-full grid place-items-center mx-auto mb-4 cursor-default transition-all duration-250'
                  style={{
                    background: 'rgba(255,255,255,.07)',
                    border: '1.5px solid rgba(255,255,255,.18)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--of-blue)'
                    e.currentTarget.style.borderColor = 'var(--of-blue)'
                    e.currentTarget.style.transform = 'scale(1.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,.07)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,.18)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  <span className='font-jakarta text-base font-extrabold text-white'>
                    {s.num}
                  </span>
                </div>
                <div className='font-jakarta text-sm font-bold text-white mb-2'>
                  {s.title}
                </div>
                <p
                  className='text-[12.5px] leading-[1.6]'
                  style={{ color: 'rgba(255,255,255,.52)' }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Reminders ──
           id="reminders" ← matches Navbar link href="#reminders"
      */}
      <section
        id='reminders'
        className='py-16 md:py-22 px-6 md:px-[6%] border-t'
        style={{
          background: 'var(--of-blue-light)',
          borderColor: 'var(--of-blue-mid)',
        }}
      >
        <div className='max-w-165 mx-auto text-center'>
          <div
            className='of-reveal inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full text-xs font-semibold mb-5'
            style={{
              border: '1px solid var(--of-blue-mid)',
              color: 'var(--of-blue)',
            }}
          >
            <span
              className='of-pulse-dot w-1.5 h-1.5 rounded-full shrink-0'
              style={{ background: 'var(--of-emerald)' }}
            />
            Free to get started
          </div>

          <h2
            className='font-jakarta of-reveal font-extrabold tracking-[-0.8px] leading-[1.12] mb-4'
            style={{
              fontSize: 'clamp(26px, 4vw, 44px)',
              color: 'var(--of-heading)',
            }}
          >
            Ready to bring order to
            <br className='hidden sm:block' /> your organization?
          </h2>

          <p
            className='of-reveal text-[15px] md:text-base leading-[1.72] mb-9'
            style={{ color: 'var(--of-muted)' }}
          >
            Join organizations across Nigeria using OrgFlow to stay on schedule,
            never miss a deadline, and keep every team member informed —
            automatically.
          </p>

          <div className='of-reveal flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-4'>
            <Link
              href='/register'
              className='inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-semibold text-white rounded-lg no-underline transition-all duration-250 hover:-translate-y-0.5'
              style={{
                background: 'var(--of-blue)',
                boxShadow: '0 4px 18px rgba(37,99,235,.28)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--of-blue-dark)'
                e.currentTarget.style.boxShadow =
                  '0 8px 28px rgba(37,99,235,.36)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--of-blue)'
                e.currentTarget.style.boxShadow =
                  '0 4px 18px rgba(37,99,235,.28)'
              }}
            >
              <svg
                width='15'
                height='15'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
              >
                <path d='M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4' />
                <polyline points='10 17 15 12 10 7' />
                <line x1='15' y1='12' x2='3' y2='12' />
              </svg>
              Get Started — It&apos;s Free
            </Link>

            <Link
              href='/register?method=google'
              className='inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-semibold rounded-lg border-[1.5px] no-underline transition-all duration-250 hover:border-(--of-blue) hover:text-(--of-blue)'
              style={{
                color: 'var(--of-heading)',
                background: 'white',
                borderColor: 'var(--of-border)',
              }}
            >
              <svg
                width='15'
                height='15'
                viewBox='0 0 24 24'
                fill='currentColor'
              >
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
              </svg>
              Continue with Google
            </Link>
          </div>

          <p
            className='of-reveal text-[12.5px]'
            style={{ color: 'var(--of-muted)' }}
          >
            No credit card required · All times shown in WAT · Works offline
          </p>
        </div>
      </section>
    </div>
  )
}
