import { redirect } from 'next/navigation';
import { AuthForm, AuthShell } from '@/components/auth/auth-form';
import { getSessionUser } from '@/lib/household';

export const metadata = { title: 'Create account | Theveny Family Command Center' };

export default async function SignUpPage() {
  if (await getSessionUser()) redirect('/');
  return (
    <AuthShell title="Create your account" subtitle="After signing up, enter the invite code a parent shared with you.">
      <AuthForm mode="sign-up" />
    </AuthShell>
  );
}
