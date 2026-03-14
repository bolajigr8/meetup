import { Suspense } from 'react'
import type { Metadata } from 'next'
import AuthCard from '@/components/auth/AuthCard'
import LinkAccountForm from '@/components/auth/LinkAccountForm'

export const metadata: Metadata = {
  title: 'Link Google account — MeetUp',
}

export default function LinkAccountPage() {
  return (
    <AuthCard
      title="Connect Google sign-in"
      subtitle="An account with this email already exists"
    >
      <Suspense>
        <LinkAccountForm />
      </Suspense>
    </AuthCard>
  )
}
