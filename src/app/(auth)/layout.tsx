import Footer from '@/components/General/footer'
import Navbar from '@/components/General/navbar'

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
      <Navbar />

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

      <main className='relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12'>
        {children}
      </main>

      <Footer />
    </div>
  )
}
