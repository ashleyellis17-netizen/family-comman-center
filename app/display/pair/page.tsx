import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-form';
import { DisplayPairing } from '@/components/auth/display-pairing';
import { getActor } from '@/lib/household';

export const metadata = { title: 'Pair family display | Theveny Family Command Center' };

export default async function DisplayPairPage() {
  if (await getActor()) redirect('/');
  return (
    <AuthShell
      title="Pair this family display"
      subtitle="On a parent's phone, open Household Settings, choose Pair a display, and enter the code below."
    >
      <DisplayPairing />
    </AuthShell>
  );
}
