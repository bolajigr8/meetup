import { Suspense } from 'react'
import type { Metadata } from 'next'
import AuthCard from '@/components/auth/AuthCard'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Reset password — MeetUp',
}

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
