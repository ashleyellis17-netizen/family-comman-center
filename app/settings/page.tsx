import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { displayDevices, householdMembers } from '@/lib/db/schema';
import { requireParentPage } from '@/lib/household';
import { getOrCreateCalendarToken } from '@/app/actions/account';
import { PageHeader } from '@/components/page-header';
import { HouseholdSettings } from '@/components/settings/household-settings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const parent = await requireParentPage();
  const [members, displays, tokenResult, h] = await Promise.all([
    db
      .select({ id: householdMembers.id, userId: householdMembers.userId, displayName: householdMembers.displayName, role: householdMembers.role })
      .from(householdMembers)
      .where(eq(householdMembers.householdId, parent.householdId))
      .orderBy(asc(householdMembers.createdAt)),
    db
      .select({ id: displayDevices.id, name: displayDevices.name, lastSeenAt: displayDevices.lastSeenAt })
      .from(displayDevices)
      .where(and(eq(displayDevices.householdId, parent.householdId), isNull(displayDevices.revokedAt)))
      .orderBy(desc(displayDevices.lastSeenAt)),
    getOrCreateCalendarToken(),
    headers(),
  ]);

  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const feedUrl = tokenResult.ok && tokenResult.data ? `${proto}://${host}/api/calendar?token=${tokenResult.data.token}` : null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="Household Settings" description="Members, shared displays, and sign-in security" />
      <HouseholdSettings
        household={{ name: parent.householdName, timezone: parent.timezone }}
        currentUserId={parent.userId}
        members={members.map((m) => ({ ...m, role: m.role === 'parent' ? 'parent' : 'member' }))}
        displays={displays.map((d) => ({ id: d.id, name: d.name, lastSeenAt: d.lastSeenAt.toISOString() }))}
        feedUrl={feedUrl}
      />
    </div>
  );
}
