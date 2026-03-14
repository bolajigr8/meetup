import Link from 'next/link'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className='w-full max-w-105 mt-12 mx-auto'>
      {/* Logo */}
      {/* <div className='flex justify-center mb-8'>
        <Link href='/' className='inline-flex items-center gap-2 no-underline'>
          <div
            className='w-9 h-9 rounded-[10px] grid place-items-center'
            style={{ background: 'var(--of-blue)' }}
          >
            <svg
              width='19'
              height='19'
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
              <circle cx='8' cy='15' r='0.5' fill='white' />
              <circle cx='12' cy='15' r='0.5' fill='white' />
              <circle cx='16' cy='15' r='0.5' fill='white' />
            </svg>
          </div>
          <span
            className='font-jakarta text-xl font-bold tracking-[-0.3px]'
            style={{ color: 'var(--of-heading)' }}
          >
            Meet<span style={{ color: 'var(--of-blue)' }}>Up</span>
          </span>
        </Link>
      </div> */}

      {/* Card */}
      <div
        className='bg-white rounded-2xl border p-8 shadow-sm'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <div className='mb-6'>
          <h1
            className='font-jakarta text-2xl font-bold tracking-[-0.4px] mb-1.5'
            style={{ color: 'var(--of-heading)' }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className='text-sm leading-[1.6]'
              style={{ color: 'var(--of-muted)' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {children}
      </div>
    </div>
  )
}
