import { redirect } from 'next/navigation'
import { getHouseholdContext, getSessionUser } from '@/lib/household'
import { OnboardingForm } from '@/components/auth/onboarding-form'

export const metadata = { title: 'Set up your household' }

export default async function OnboardingPage() {
  const user = await getSessionUser()
  if (!user) redirect('/sign-in')
  if (await getHouseholdContext()) redirect('/today')
  return <OnboardingForm defaultName={user.name ?? ''} />
}
