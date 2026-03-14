import { Suspense } from 'react'
import type { Metadata } from 'next'
import AuthCard from '@/components/auth/AuthCard'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Set new password — MeetUp',
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Set new password"
      subtitle="Choose a strong password for your account"
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
