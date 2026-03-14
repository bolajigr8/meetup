// page: /settings

'use client'

import { useState } from 'react'
import { User, Lock, Bell } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import ProfileForm from '@/components/settings/Profileform'
import NotificationPrefsForm from '@/components/notification/Notificationprefsform'
import PasswordForm from '@/components/settings/Passwordform'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
] as const

type TabId = (typeof TABS)[number]['id']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile')

  return (
    <div>
      <PageHeader
        title='Settings'
        subtitle='Manage your account and notification preferences.'
      />

      <div className='flex flex-col sm:flex-row gap-6 items-start'>
        {/* Sidebar tabs */}
        <nav
          className='w-full sm:w-48 shrink-0 bg-white rounded-xl border overflow-hidden'
          style={{ borderColor: 'var(--of-border)' }}
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className='flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors text-left border-b last:border-0 hover:bg-slate-50'
                style={{
                  borderColor: 'var(--of-border)',
                  color: active ? 'var(--of-blue)' : 'var(--of-body)',
                  background: active ? 'var(--of-blue-light)' : undefined,
                }}
              >
                <Icon
                  size={15}
                  strokeWidth={active ? 2.5 : 2}
                  style={{
                    color: active ? 'var(--of-blue)' : 'var(--of-muted)',
                  }}
                />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Content panel */}
        <div
          className='flex-1 bg-white rounded-xl border p-6'
          style={{ borderColor: 'var(--of-border)' }}
        >
          {activeTab === 'profile' && (
            <Section
              title='Profile'
              description='Update your name and email address.'
            >
              <ProfileForm />
            </Section>
          )}
          {activeTab === 'password' && (
            <Section
              title='Change password'
              description='Use a strong password you do not use elsewhere.'
            >
              <PasswordForm />
            </Section>
          )}
          {activeTab === 'notifications' && (
            <Section
              title='Notification preferences'
              description='Choose which email reminders you want to receive.'
            >
              <NotificationPrefsForm />
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div
        className='mb-5 pb-4 border-b'
        style={{ borderColor: 'var(--of-border)' }}
      >
        <h2
          className='font-jakarta text-base font-semibold'
          style={{ color: 'var(--of-heading)' }}
        >
          {title}
        </h2>
        <p className='text-sm mt-0.5' style={{ color: 'var(--of-muted)' }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}
