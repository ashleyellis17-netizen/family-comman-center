import { redirect } from 'next/navigation';
import { AuthForm, AuthShell } from '@/components/auth/auth-form';
import { getSessionUser } from '@/lib/household';
import { DemoButton } from '@/components/auth/demo-button';
import { isDemoEnabled } from '@/lib/demo';

export const metadata = { title: 'Sign in | Theveny Family Command Center' };

export default async function SignInPage() {
  if (await getSessionUser()) redirect('/');
  return (
    <AuthShell title="Welcome home" subtitle="Sign in once on each phone. You will stay signed in until you choose to log out.">
      <div className="flex flex-col gap-6">
        <AuthForm mode="sign-in" />
        {isDemoEnabled() && (
          <>
            <div className="flex items-center gap-3 text-sm text-muted-foreground" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            <DemoButton />
          </>
        )}
      </div>
    </AuthShell>
  );
}
