import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/household'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata = { title: 'Sign in' }

export default async function SignInPage() {
  if (await getSessionUser()) redirect('/today')
  return (
    <Suspense>
      <AuthForm mode="sign-in" />
    </Suspense>
  )
}
