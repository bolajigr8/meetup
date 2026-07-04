'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'gablink-install-dismissed'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      // Respect a prior dismissal for this session so it doesn't nag on every page load
      if (sessionStorage.getItem(DISMISS_KEY)) return
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // If the app is already installed (running standalone), never show this
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) setVisible(false)

    window.addEventListener('appinstalled', () => {
      setVisible(false)
      setDeferredPrompt(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }, [deferredPrompt])

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className='fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-sm bg-white rounded-2xl border shadow-lg px-4 py-3.5 flex items-center gap-3'
      style={{ borderColor: 'var(--of-border, #e5e7eb)' }}
    >
      <div
        className='w-10 h-10 rounded-xl grid place-items-center shrink-0'
        style={{ background: '#1a56db' }}
      >
        <Download size={18} className='text-white' />
      </div>
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-semibold' style={{ color: '#111928' }}>
          Install Gablink
        </p>
        <p className='text-xs mt-0.5' style={{ color: '#6b7280' }}>
          Add it to your home screen for reminders and quick access.
        </p>
      </div>
      <Button
        size='sm'
        onClick={handleInstall}
        style={{ background: '#1a56db' }}
        className='text-white hover:opacity-90 h-8 text-xs shrink-0'
      >
        Install
      </Button>
      <button
        onClick={handleDismiss}
        className='shrink-0 p-1 rounded-md hover:bg-slate-100 transition-colors'
        aria-label='Dismiss'
      >
        <X size={15} style={{ color: '#9ca3af' }} />
      </button>
    </div>
  )
}
