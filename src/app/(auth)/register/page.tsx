import { Suspense } from 'react'
import type { Metadata } from 'next'
import AuthCard from '@/components/auth/AuthCard'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create account — MeetUp',
}

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Start scheduling smarter with MeetUp"
    >
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthCard>
  )
}
