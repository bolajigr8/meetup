// page: /notifications

'use client'

import { Bell } from 'lucide-react'
import PageHeader from '@/components/shared/PageHeader'
import NotificationList from '@/components/notification/Notificationlist'

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader
        title='Notifications'
        subtitle='Meeting reminders, task alerts, and program updates.'
        action={
          <div
            className='flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium'
            style={{
              background: 'var(--of-blue-light)',
              color: 'var(--of-blue)',
            }}
          >
            <Bell size={13} />
            Auto-generated from your workspace
          </div>
        }
      />
      <NotificationList />
    </div>
  )
}
