'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Copy, Monitor, RefreshCw, ShieldAlert, Trash2 } from 'lucide-react';
import {
  approveDisplayPairing,
  createInvite,
  revokeDisplay,
  rotateCalendarToken,
  signOutAllDevices,
  updateHousehold,
  updateMemberRole,
  type ActionResult,
} from '@/app/actions/account';
import { US_TIMEZONES } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Member = { id: number; userId: string; displayName: string; role: 'parent' | 'member' };
type Display = { id: number; name: string; lastSeenAt: string };

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card p-5 md:p-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function HouseholdSettings({
  household,
  currentUserId,
  members,
  displays,
  feedUrl,
}: {
  household: { name: string; timezone: string };
  currentUserId: string;
  members: Member[];
  displays: Display[];
  feedUrl: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(household.name);
  const [timezone, setTimezone] = useState(household.timezone);
  const [invite, setInvite] = useState<{ code: string; role: string; expiresAt: string } | null>(null);
  const [pairCode, setPairCode] = useState('');
  const [deviceName, setDeviceName] = useState('Kitchen display');
  const [url, setUrl] = useState(feedUrl);

  function run<T>(action: () => Promise<ActionResult<T>>, success: string, after?: (data: T | undefined) => void) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(success);
      after?.(result.data);
      router.refresh();
    });
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(
      () => toast.success('Copied'),
      () => toast.error('Could not copy'),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Section title="Household" description="Dates on Today and the calendar use this timezone.">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => updateHousehold({ name, timezone }), 'Household updated');
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="household-name">Name</Label>
            <Input id="household-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="household-tz">Timezone</Label>
            <select
              id="household-tz"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {US_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace('America/', '').replace('Pacific/', '').replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Button type="submit" disabled={pending}>
              Save
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Members" description="Parents can approve wishlist requests and manage settings. Members can use shared lists.">
        <ul className="flex flex-col divide-y divide-border/60">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">
                  {m.displayName}
                  {m.userId === currentUserId && <span className="ml-2 text-xs font-medium text-muted-foreground">(you)</span>}
                </p>
                <p className="text-xs text-muted-foreground">{m.role === 'parent' ? 'Parent' : 'Member'}</p>
              </div>
              {m.userId !== currentUserId && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => updateMemberRole(m.id, m.role === 'parent' ? 'member' : 'parent'), 'Role updated')}
                >
                  Make {m.role === 'parent' ? 'member' : 'parent'}
                </Button>
              )}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={pending} onClick={() => run(() => createInvite('parent'), 'Invite created', (d) => d && setInvite({ ...d, role: 'parent' }))}>
            Invite a parent
          </Button>
          <Button variant="outline" disabled={pending} onClick={() => run(() => createInvite('member'), 'Invite created', (d) => d && setInvite({ ...d, role: 'member' }))}>
            Invite a member
          </Button>
        </div>
        {invite && (
          <div className="flex flex-col gap-2 rounded-2xl bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              Share this {invite.role} invite code. They create an account, then enter it on the onboarding screen. Expires{' '}
              {new Date(invite.expiresAt).toLocaleString()}.
            </p>
            <div className="flex items-center gap-2">
              <code className="font-mono text-2xl font-bold tracking-widest text-foreground">{invite.code}</code>
              <Button variant="ghost" size="icon" onClick={() => copy(invite.code)} aria-label="Copy invite code">
                <Copy className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </Section>

      <Section
        title="Shared displays"
        description="On the Cozyla, open this app. It shows a pairing code. Enter it here to keep that display signed in until you revoke it."
      >
        <form
          className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => approveDisplayPairing({ code: pairCode, deviceName }), 'Display paired', () => setPairCode(''));
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="pair-code">Pairing code</Label>
            <Input
              id="pair-code"
              value={pairCode}
              onChange={(e) => setPairCode(e.target.value.toUpperCase())}
              placeholder="ABCD-1234"
              autoComplete="off"
              className="font-mono uppercase tracking-widest"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="device-name">Display name</Label>
            <Input id="device-name" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} required maxLength={60} />
          </div>
          <Button type="submit" disabled={pending}>
            Pair display
          </Button>
        </form>
        {displays.length === 0 ? (
          <p className="text-sm text-muted-foreground">No displays paired yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60">
            {displays.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Monitor className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">Last active {new Date(d.lastSeenAt).toLocaleString()}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => revokeDisplay(d.id), 'Display revoked')}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Calendar subscription" description="Subscribe from Google or Apple Calendar. Anyone with this link can read events, so rotate it if it leaks.">
        {url ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Input readOnly value={url} className="font-mono text-xs" aria-label="Calendar feed URL" />
              <Button variant="ghost" size="icon" onClick={() => copy(url)} aria-label="Copy feed URL">
                <Copy className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() =>
                  run(rotateCalendarToken, 'Feed link rotated', (d) => {
                    if (d) setUrl(url.replace(/token=[^&]+/, `token=${d.token}`));
                  })
                }
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Rotate link
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Calendar link unavailable.</p>
        )}
      </Section>

      <Section title="Security" description="Signs out every phone and computer in the household and unpairs every shared display.">
        <div>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => {
              if (!window.confirm('Sign out every device in the household, including this one?')) return;
              startTransition(async () => {
                const result = await signOutAllDevices();
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                router.push('/sign-in');
                router.refresh();
              });
            }}
          >
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            Sign out all devices
          </Button>
        </div>
      </Section>
    </div>
  );
}
