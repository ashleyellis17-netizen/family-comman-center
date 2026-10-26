import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/household'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata = { title: 'Create account' }

export default async function SignUpPage() {
  if (await getSessionUser()) redirect('/today')
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  )
}
