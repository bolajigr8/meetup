import { Suspense } from 'react'
import type { Metadata } from 'next'
import AuthCard from '@/components/auth/AuthCard'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign in — GabLink',
}

export default function LoginPage() {
  return (
    <AuthCard title='Welcome back' subtitle='Sign in to your GabLink account'>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}
