'use client'

import { SessionProvider } from 'next-auth/react'
import ServiceWorkerRegister from '@/components/shared/ServiceWorkerRegister'
import InstallPrompt from '@/components/shared/InstallPrompt'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ServiceWorkerRegister />
      {children}
      <InstallPrompt />
    </SessionProvider>
  )
}
