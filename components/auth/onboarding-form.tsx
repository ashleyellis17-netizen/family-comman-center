'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { createHousehold, joinHousehold } from '@/app/actions/account';
import { authClient } from '@/lib/auth-client';
import { US_TIMEZONES } from '@/lib/time';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<'join' | 'create'>('join');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const displayName = String(form.get('displayName') ?? '');
      const result =
        mode === 'join'
          ? await joinHousehold({ code: String(form.get('code') ?? ''), displayName })
          : await createHousehold({
              householdName: String(form.get('householdName') ?? ''),
              timezone: String(form.get('timezone') ?? ''),
              displayName,
            });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push('/');
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1" role="tablist" aria-label="Household setup">
        {(['join', 'create'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`h-11 rounded-xl font-bold transition-colors ${mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
          >
            {m === 'join' ? 'I have a code' : 'New household'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">What should the family call you?</Label>
        <Input id="displayName" name="displayName" defaultValue={defaultName} required className="h-12 text-base" />
      </div>

      {mode === 'join' ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="code">Invite code</Label>
          <Input
            id="code"
            name="code"
            required
            autoCapitalize="characters"
            autoComplete="off"
            className="h-12 text-base font-mono tracking-widest uppercase"
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="householdName">Household name</Label>
            <Input id="householdName" name="householdName" required className="h-12 text-base" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              name="timezone"
              defaultValue="America/New_York"
              className="h-12 rounded-md border border-input bg-background px-3 text-base"
            >
              {US_TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="h-12 text-base font-bold rounded-xl" disabled={pending}>
        {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {mode === 'join' ? 'Join household' : 'Create household'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={async () => {
          await authClient.signOut();
          router.push('/sign-in');
          router.refresh();
        }}
      >
        Use a different account
      </Button>
    </form>
  );
}
