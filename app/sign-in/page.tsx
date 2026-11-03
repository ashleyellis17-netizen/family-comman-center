import { redirect } from 'next/navigation';
import { AuthForm, AuthShell } from '@/components/auth/auth-form';
import { getSessionUser } from '@/lib/household';

export const metadata = { title: 'Sign in | Theveny Family Command Center' };

export default async function SignInPage() {
  if (await getSessionUser()) redirect('/');
  return (
    <AuthShell title="Welcome home" subtitle="Sign in once on each phone. You will stay signed in until you choose to log out.">
      <AuthForm mode="sign-in" />
    </AuthShell>
  );
}
