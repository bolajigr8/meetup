// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className='min-h-screen flex flex-col'
      style={{ background: 'var(--of-surface)' }}
    >
      {/* Subtle grid background */}
      <div
        aria-hidden
        className='fixed inset-0 pointer-events-none z-0'
        style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 80%)',
        }}
      />

      {/* Minimal header with just the logo */}
      <header className='relative z-10 flex items-center justify-between px-6 py-5'>
        <a href='/' className='inline-flex items-center gap-2.5 no-underline'>
          <div
            className='w-8 h-8 rounded-[9px] grid place-items-center shrink-0'
            style={{ background: 'var(--of-blue)' }}
          >
            <svg
              width='15'
              height='15'
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
          <span
            className='font-jakarta text-[17px] font-bold tracking-[-0.3px]'
            style={{ color: 'var(--of-heading)' }}
          >
            Meet<span style={{ color: 'var(--of-blue)' }}>Up</span>
          </span>
        </a>

        <a
          href='/'
          className='text-sm font-medium no-underline hover:underline'
          style={{ color: 'var(--of-muted)' }}
        >
          ← Back to home
        </a>
      </header>

      <main className='relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-12'>
        {children}
      </main>

      <footer className='relative z-10 py-4 text-center'>
        <p className='text-xs' style={{ color: 'var(--of-muted)' }}>
          © {new Date().getFullYear()} MeetUp · All times in WAT (UTC+1)
        </p>
      </footer>
    </div>
  )
}
