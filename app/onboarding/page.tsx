import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-form';
import { OnboardingForm } from '@/components/auth/onboarding-form';
import { getActor, getSessionUser } from '@/lib/household';

export const metadata = { title: 'Join your household | Theveny Family Command Center' };

export default async function OnboardingPage() {
  const user = await getSessionUser();
  if (!user) redirect('/sign-in');
  if (await getActor()) redirect('/');
  return (
    <AuthShell title="Join your household" subtitle="Ask a parent for an invite code from Household Settings.">
      <OnboardingForm defaultName={user.name} />
    </AuthShell>
  );
}
