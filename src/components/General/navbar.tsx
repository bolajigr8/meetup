'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Reminders', href: '#reminders' },
]

// Clamp a value between min and max
const clamp = (v: number, min: number, max: number): number =>
  Math.min(Math.max(v, min), max)

// Linear interpolation
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export default function Navbar() {
  // scrollProgress: 0 = top, 1 = fully scrolled
  const [scrollProgress, setScrollProgress] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const rafRef = useRef<number | null>(null)
  const progressRef = useRef<number>(0)

  useEffect(() => {
    // Scroll distance over which the transition completes (px)
    const SCROLL_RANGE = 80

    const onScroll = () => {
      // Cancel any pending frame so we don't stack them
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      rafRef.current = requestAnimationFrame(() => {
        const raw = clamp(window.scrollY / SCROLL_RANGE, 0, 1)
        // Only update state if meaningfully different (avoids excess re-renders)
        if (Math.abs(raw - progressRef.current) > 0.005) {
          progressRef.current = raw
          setScrollProgress(raw)
        }
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Derived styles that interpolate with scroll progress
  // Apply an ease-out curve so the early part of the scroll feels snappier
  const eased =
    scrollProgress < 0.5
      ? 2 * scrollProgress * scrollProgress
      : 1 - Math.pow(-2 * scrollProgress + 2, 2) / 2

  const bgOpacity = lerp(0, 0.92, eased)
  const blurPx = lerp(0, 14, eased)
  const shadowAlpha = lerp(0, 0.06, eased)
  const borderAlpha = lerp(0, 1, eased)
  const navHeight = lerp(72, 60, eased) // shrinks slightly as you scroll

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: `${navHeight}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 6%',
          // Smooth cubic transition for everything EXCEPT the scroll-driven values
          // (those update via JS already — we just need a very short CSS transition
          //  to smooth the gaps between rAF frames)
          transition: 'height 0.15s cubic-bezier(0.4,0,0.2,1)',
          backgroundColor: `rgba(255,255,255,${bgOpacity})`,
          backdropFilter: blurPx > 0.5 ? `blur(${blurPx}px)` : 'none',
          WebkitBackdropFilter: blurPx > 0.5 ? `blur(${blurPx}px)` : 'none',
          borderBottom: `1px solid rgba(226,232,240,${borderAlpha})`,
          boxShadow: `0 1px 24px rgba(0,0,0,${shadowAlpha}), 0 1px 4px rgba(0,0,0,${shadowAlpha * 0.5})`,
        }}
      >
        {/* Logo */}
        <Link
          href='/'
          className='flex items-center gap-2.5 no-underline shrink-0'
        >
          <div
            className='w-8.5 h-8.5 rounded-[9px] grid place-items-center shrink-0'
            style={{ background: 'var(--of-blue)' }}
          >
            <svg
              width='18'
              height='18'
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
            className='font-jakarta text-[19px] font-bold tracking-[-0.3px]'
            style={{ color: 'var(--of-heading)' }}
          >
            Meet<span style={{ color: 'var(--of-blue)' }}>Up</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className='hidden md:flex items-center gap-7'>
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className='text-sm font-medium no-underline transition-colors duration-200 hover:text-(--of-blue)'
              style={{ color: 'var(--of-muted)' }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className='flex items-center gap-2.5'>
          <Link
            href='/login'
            className='hidden md:inline-flex items-center px-4 py-1.75 text-sm font-medium rounded-lg border no-underline transition-all duration-200 hover:border-(--of-blue) hover:text-(--of-blue)'
            style={{
              color: 'var(--of-body)',
              borderColor: 'var(--of-border)',
              background: 'white',
            }}
          >
            Sign In
          </Link>
          <Link
            href='/register'
            className='hidden md:inline-flex items-center gap-1.5 px-4.5 py-1.75 text-sm font-semibold text-white rounded-lg no-underline transition-all duration-200 hover:-translate-y-px'
            style={{
              background: 'var(--of-blue)',
              boxShadow: '0 2px 10px rgba(37,99,235,.25)',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'var(--of-blue-dark)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'var(--of-blue)')
            }
          >
            Get Started
            <svg
              width='13'
              height='13'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
            >
              <path d='M5 12h14M12 5l7 7-7 7' />
            </svg>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label='Toggle menu'
            className='flex md:hidden flex-col gap-1 bg-transparent border-0 cursor-pointer p-1'
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className='block w-5 h-0.5 rounded-sm transition-all duration-250'
                style={{
                  background: 'var(--of-heading)',
                  transform:
                    mobileOpen && i === 0
                      ? 'rotate(45deg) translate(4px,4px)'
                      : mobileOpen && i === 2
                        ? 'rotate(-45deg) translate(4px,-4px)'
                        : 'none',
                  opacity: mobileOpen && i === 1 ? 0 : 1,
                }}
              />
            ))}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div
        className={[
          'fixed left-0 right-0 z-40 bg-white border-b md:hidden',
          'transition-all duration-300 overflow-hidden',
          mobileOpen ? 'max-h-screen shadow-xl' : 'max-h-0',
        ].join(' ')}
        style={{
          top: `${navHeight}px`,
          borderColor: 'var(--of-border)',
          transition: `top 0.15s cubic-bezier(0.4,0,0.2,1), max-height 0.3s ease`,
        }}
      >
        <div className='px-6 py-3 flex flex-col'>
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className='block py-3 px-3 text-[15px] font-medium no-underline rounded-lg transition-colors duration-150 hover:bg-(--of-surface)'
              style={{ color: 'var(--of-body)' }}
            >
              {l.label}
            </Link>
          ))}
          <div
            className='h-px my-2'
            style={{ background: 'var(--of-border)' }}
          />
          <Link
            href='/login'
            onClick={() => setMobileOpen(false)}
            className='block py-3 px-3 text-[15px] font-medium no-underline'
            style={{ color: 'var(--of-muted)' }}
          >
            Sign In
          </Link>
          <Link
            href='/register'
            onClick={() => setMobileOpen(false)}
            className='block py-3 px-3 mt-1 mb-2 text-[15px] font-semibold text-white text-center no-underline rounded-lg'
            style={{ background: 'var(--of-blue)' }}
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </>
  )
}
