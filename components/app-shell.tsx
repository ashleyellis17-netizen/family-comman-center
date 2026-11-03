import { getActor } from '@/lib/household';
import { Navigation } from '@/components/navigation';
import { SampleDataNotice } from '@/components/sample-data-notice';

export async function AppShell({ children }: { children: React.ReactNode }) {
  const actor = await getActor();

  // Sign-in, sign-up, onboarding, and display pairing render without the app chrome.
  if (!actor) return <main className="min-h-screen">{children}</main>;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Navigation
        actor={{ kind: actor.kind, role: actor.role, name: actor.name, householdName: actor.householdName }}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <SampleDataNotice />
          {children}
        </main>
      </div>
    </div>
  );
}
