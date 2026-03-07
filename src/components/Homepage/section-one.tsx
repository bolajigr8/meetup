'use client'

import Link from 'next/link'

export default function SectionOne() {
  return (
    <section className='relative min-h-screen flex flex-col justify-center overflow-hidden bg-white'>
      {/* Background decorations */}
      <div aria-hidden className='absolute inset-0 z-0 pointer-events-none'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage:
              'linear-gradient(rgba(37,99,235,0.045) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(37,99,235,0.045) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage:
              'radial-gradient(ellipse 75% 65% at 65% 35%, black 20%, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 75% 65% at 65% 35%, black 20%, transparent 75%)',
          }}
        />
        <div
          className='absolute rounded-full'
          style={{
            top: '-8%',
            right: '-4%',
            width: 680,
            height: 680,
            background:
              'radial-gradient(ellipse, rgba(37,99,235,0.11) 0%, transparent 68%)',
          }}
        />
        <div
          className='absolute rounded-full'
          style={{
            bottom: '-5%',
            left: '-8%',
            width: 480,
            height: 480,
            background:
              'radial-gradient(ellipse, rgba(245,158,11,0.08) 0%, transparent 68%)',
          }}
        />
      </div>

      {/* Hero grid: stacks on mobile, side-by-side on lg+ */}
      <div className='relative z-10 w-full max-w-295 mx-auto px-6 md:px-[6%] pt-25 pb-16 lg:pt-30 lg:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center'>
        {/* ── Left: copy ── */}
        <div>
          {/* Badge */}
          <div
            className='of-fade-up inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5'
            style={{
              background: 'var(--of-blue-light)',
              border: '1px solid var(--of-blue-mid)',
              color: 'var(--of-blue)',
            }}
          >
            <span
              className='of-pulse-dot w-1.5 h-1.5 rounded-full block shrink-0'
              style={{ background: 'var(--of-emerald)' }}
            />
            Built for West African organizations
          </div>

          {/* Headline */}
          <h1
            className='font-jakarta of-fade-up-1 font-extrabold leading-[1.08] tracking-[-1.5px] mb-5'
            style={{
              fontSize: 'clamp(34px, 5vw, 60px)',
              color: 'var(--of-heading)',
            }}
          >
            Schedule smarter.{' '}
            <span className='block sm:inline'>
              Never miss a{' '}
              <span
                className='relative inline-block'
                style={{ color: 'var(--of-blue)' }}
              >
                deadline
                <span
                  className='absolute bottom-0.5 left-0 right-0 h-1 rounded-sm'
                  style={{
                    background: 'var(--of-amber)',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    animation: 'of-underline-grow 0.5s 1s ease forwards',
                  }}
                />
              </span>{' '}
              again.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className='of-fade-up-2 text-base md:text-[17px] leading-[1.72] mb-8 max-w-115'
            style={{ color: 'var(--of-muted)' }}
          >
            MeetUp brings your meetings, tasks, and training programs into one
            place — with automated email reminders that run on{' '}
            <strong style={{ color: 'var(--of-body)', fontWeight: 600 }}>
              West Africa Time
            </strong>
            , so your team is always prepared.
          </p>

          {/* CTAs */}
          <div className='of-fade-up-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8'>
            <Link
              href='/register'
              className='inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-semibold text-white rounded-lg no-underline transition-all duration-250 hover:-translate-y-0.5'
              style={{
                background: 'var(--of-blue)',
                boxShadow: '0 4px 20px rgba(37,99,235,.28)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--of-blue-dark)'
                e.currentTarget.style.boxShadow =
                  '0 8px 28px rgba(37,99,235,.36)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--of-blue)'
                e.currentTarget.style.boxShadow =
                  '0 4px 20px rgba(37,99,235,.28)'
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
              Start for Free
            </Link>
            <Link
              href='#features'
              className='inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-semibold rounded-lg border-[1.5px] no-underline transition-all duration-250 hover:bg-(--of-blue-light) hover:border-(--of-blue) hover:text-(--of-blue)'
              style={{
                color: 'var(--of-heading)',
                borderColor: 'var(--of-border)',
                background: 'white',
              }}
            >
              <svg
                width='15'
                height='15'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
              >
                <circle cx='12' cy='12' r='10' />
                <polygon points='10 8 16 12 10 16 10 8' />
              </svg>
              See features
            </Link>
          </div>

          {/* Trust avatars */}
          <div className='of-fade-up-4 flex items-center gap-3'>
            <div className='flex'>
              {['AO', 'BK', 'CI', 'DM'].map((init, i) => (
                <span
                  key={init}
                  className='w-7 h-7 rounded-full border-2 border-white grid place-items-center text-[10px] font-bold'
                  style={{
                    background: 'var(--of-blue-mid)',
                    color: 'var(--of-blue-dark)',
                    marginLeft: i === 0 ? 0 : -8,
                  }}
                >
                  {init}
                </span>
              ))}
            </div>
            <p className='text-[12.5px]' style={{ color: 'var(--of-muted)' }}>
              <strong style={{ color: 'var(--of-body)' }}>
                Nigerian organizations
              </strong>{' '}
              rely on MeetUp
            </p>
          </div>
        </div>

        {/* ── Right: dashboard preview — hidden on mobile, shown lg+ ── */}
        <div className='of-fade-right relative hidden lg:block'>
          {/* Float: reminder sent */}
          <div
            className='of-float-2 absolute -top-4.5 -left-6 z-20 bg-white rounded-xl border flex items-center gap-2.5 px-3.5 py-2.5 min-w-50'
            style={{
              borderColor: 'var(--of-border)',
              boxShadow: '0 8px 28px rgba(15,23,42,.10)',
            }}
          >
            <div
              className='w-7.5 h-7.5 rounded-lg grid place-items-center shrink-0'
              style={{ background: '#D1FAE5' }}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#10B981'
                strokeWidth='2.5'
              >
                <polyline points='20 6 9 17 4 12' />
              </svg>
            </div>
            <div>
              <div
                className='font-semibold text-[11.5px]'
                style={{ color: 'var(--of-heading)' }}
              >
                Reminder Sent ✓
              </div>
              <div className='text-[10px]' style={{ color: 'var(--of-muted)' }}>
                Board Meeting — 2 days before
              </div>
            </div>
          </div>

          {/* Dashboard card */}
          <div
            className='bg-white rounded-2xl overflow-hidden border'
            style={{
              borderColor: 'var(--of-border)',
              boxShadow:
                '0 20px 56px rgba(15,23,42,.10), 0 4px 14px rgba(37,99,235,.06)',
            }}
          >
            {/* Browser chrome */}
            <div
              className='flex items-center gap-2.5 px-4.5 py-3'
              style={{ background: 'var(--of-blue)' }}
            >
              <div className='flex gap-1.25'>
                {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                  <span
                    key={c}
                    className='w-2.5 h-2.5 rounded-full'
                    style={{ background: c }}
                  />
                ))}
              </div>
              <div
                className='font-mono-of flex-1 rounded-[5px] px-2.5 py-0.5 text-[10.5px]'
                style={{
                  background: 'rgba(255,255,255,.14)',
                  color: 'rgba(255,255,255,.75)',
                }}
              >
                app.MeetUp.ng/dashboard/overview
              </div>
            </div>

            <div className='grid' style={{ gridTemplateColumns: '170px 1fr' }}>
              {/* Sidebar */}
              <div
                className='py-3.5'
                style={{
                  background: 'var(--of-surface)',
                  borderRight: '1px solid var(--of-border)',
                }}
              >
                {[
                  {
                    label: 'Overview',
                    icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
                    active: true,
                  },
                  { label: 'Meetings', icon: 'M23 7l-7 5 7 5V7zM1 5h15v14H1z' },
                  {
                    label: 'Tasks',
                    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
                  },
                  {
                    label: 'Calendar',
                    icon: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18',
                  },
                  {
                    label: 'Programs',
                    icon: 'M22 10v6M2 10l10-7 10 7M6 10v8h5v-4h2v4h5V10',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className='flex items-center gap-2 px-3.5 py-2 text-xs'
                    style={{
                      fontWeight: item.active ? 600 : 500,
                      color: item.active ? 'var(--of-blue)' : 'var(--of-muted)',
                      background: item.active
                        ? 'var(--of-blue-light)'
                        : 'transparent',
                      borderRight: item.active
                        ? '2px solid var(--of-blue)'
                        : '2px solid transparent',
                    }}
                  >
                    <svg
                      width='13'
                      height='13'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                    >
                      <path d={item.icon} />
                    </svg>
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main */}
              <div className='p-3.5'>
                <div className='grid grid-cols-2 gap-1.75 mb-2.75'>
                  {[
                    {
                      label: "Today's Meetings",
                      val: '4',
                      color: 'var(--of-blue)',
                    },
                    {
                      label: 'Pending Tasks',
                      val: '12',
                      color: 'var(--of-amber)',
                    },
                    { label: 'Programs', val: '2', color: 'var(--of-teal)' },
                    { label: 'Overdue', val: '3', color: 'var(--of-red)' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className='rounded-[9px] p-[9px_11px] border'
                      style={{
                        background: 'var(--of-surface)',
                        borderColor: 'var(--of-border)',
                      }}
                    >
                      <div
                        className='text-[9.5px] font-medium mb-0.5'
                        style={{ color: 'var(--of-muted)' }}
                      >
                        {s.label}
                      </div>
                      <div
                        className='font-jakarta text-xl font-bold'
                        style={{ color: s.color }}
                      >
                        {s.val}
                      </div>
                    </div>
                  ))}
                </div>
                <div className='flex flex-col gap-1.25'>
                  {[
                    {
                      dot: '#2563EB',
                      title: 'Board Strategy Meeting',
                      time: '09:00',
                      badge: 'Urgent',
                      bbg: '#FEF2F2',
                      bc: '#991B1B',
                    },
                    {
                      dot: '#7C3AED',
                      title: 'Q1 Report Submission',
                      time: '12:00',
                      badge: 'High',
                      bbg: '#FFFBEB',
                      bc: '#B45309',
                    },
                    {
                      dot: '#0D9488',
                      title: 'Leadership Training',
                      time: '14:30',
                      badge: 'Medium',
                      bbg: 'var(--of-blue-light)',
                      bc: 'var(--of-blue-dark)',
                    },
                  ].map((ev) => (
                    <div
                      key={ev.title}
                      className='flex items-center gap-1.75 px-2.25 py-1.5 rounded-[7px] text-[10.5px]'
                      style={{ background: 'var(--of-surface)' }}
                    >
                      <span
                        className='w-1.75 h-1.75 rounded-full shrink-0'
                        style={{ background: ev.dot }}
                      />
                      <span
                        className='font-semibold flex-1'
                        style={{ color: 'var(--of-heading)' }}
                      >
                        {ev.title}
                      </span>
                      <span
                        className='font-mono-of text-[9.5px]'
                        style={{ color: 'var(--of-muted)' }}
                      >
                        {ev.time}
                      </span>
                      <span
                        className='px-1.5 py-px rounded-full text-[8.5px] font-semibold'
                        style={{ background: ev.bbg, color: ev.bc }}
                      >
                        {ev.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Float: conflict detected */}
          <div
            className='of-float absolute -bottom-4.5 -right-6 z-20 bg-white rounded-xl border flex items-center gap-2.5 px-3.5 py-2.5 min-w-50'
            style={{
              borderColor: 'var(--of-border)',
              boxShadow: '0 8px 28px rgba(15,23,42,.10)',
            }}
          >
            <div
              className='w-7.5 h-7.5 rounded-lg grid place-items-center shrink-0'
              style={{ background: 'var(--of-blue-light)' }}
            >
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='var(--of-blue)'
                strokeWidth='2.5'
              >
                <path d='M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9' />
                <path d='M13.73 21a2 2 0 01-3.46 0' />
              </svg>
            </div>
            <div>
              <div
                className='font-semibold text-[11.5px]'
                style={{ color: 'var(--of-heading)' }}
              >
                Conflict Detected ⚠
              </div>
              <div className='text-[10px]' style={{ color: 'var(--of-muted)' }}>
                Two meetings overlap at 10:00 WAT
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile dashboard preview (simplified) — shown below md ── */}
        <div className='lg:hidden w-full'>
          <div
            className='rounded-2xl overflow-hidden border shadow-lg'
            style={{ borderColor: 'var(--of-border)' }}
          >
            <div
              className='flex items-center gap-2 px-4 py-2.5'
              style={{ background: 'var(--of-blue)' }}
            >
              <div className='flex gap-1'>
                {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
                  <span
                    key={c}
                    className='w-2 h-2 rounded-full'
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span
                className='font-mono-of text-[10px] flex-1 text-center'
                style={{ color: 'rgba(255,255,255,.75)' }}
              >
                app.MeetUp.ng/dashboard
              </span>
            </div>
            <div className='p-4' style={{ background: 'var(--of-surface)' }}>
              <div className='grid grid-cols-2 gap-2 mb-3'>
                {[
                  {
                    label: "Today's Meetings",
                    val: '4',
                    color: 'var(--of-blue)',
                  },
                  {
                    label: 'Pending Tasks',
                    val: '12',
                    color: 'var(--of-amber)',
                  },
                  { label: 'Programs', val: '2', color: 'var(--of-teal)' },
                  { label: 'Overdue', val: '3', color: 'var(--of-red)' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className='bg-white rounded-xl p-3 border'
                    style={{ borderColor: 'var(--of-border)' }}
                  >
                    <div
                      className='text-[10px] font-medium mb-0.5'
                      style={{ color: 'var(--of-muted)' }}
                    >
                      {s.label}
                    </div>
                    <div
                      className='font-jakarta text-2xl font-bold'
                      style={{ color: s.color }}
                    >
                      {s.val}
                    </div>
                  </div>
                ))}
              </div>
              <div className='flex flex-col gap-1.5'>
                {[
                  {
                    dot: '#2563EB',
                    title: 'Board Strategy Meeting',
                    time: '09:00',
                    badge: 'Urgent',
                  },
                  {
                    dot: '#7C3AED',
                    title: 'Q1 Report Submission',
                    time: '12:00',
                    badge: 'High',
                  },
                  {
                    dot: '#0D9488',
                    title: 'Leadership Training',
                    time: '14:30',
                    badge: 'Medium',
                  },
                ].map((ev) => (
                  <div
                    key={ev.title}
                    className='flex items-center gap-2 bg-white rounded-lg px-3 py-2 border text-xs'
                    style={{ borderColor: 'var(--of-border)' }}
                  >
                    <span
                      className='w-2 h-2 rounded-full shrink-0'
                      style={{ background: ev.dot }}
                    />
                    <span
                      className='font-medium flex-1 truncate'
                      style={{ color: 'var(--of-heading)' }}
                    >
                      {ev.title}
                    </span>
                    <span
                      className='font-mono-of text-[10px]'
                      style={{ color: 'var(--of-muted)' }}
                    >
                      {ev.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className='absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5'>
        <span
          className='text-[11px] font-medium tracking-[0.5px]'
          style={{ color: 'var(--of-muted)' }}
        >
          EXPLORE
        </span>
        <div
          className='w-px h-8'
          style={{
            background:
              'linear-gradient(to bottom, var(--of-muted), transparent)',
          }}
        />
      </div>
    </section>
  )
}
