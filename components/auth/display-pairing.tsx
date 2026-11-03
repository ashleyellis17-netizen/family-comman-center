'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PairingStatus =
  | { status: 'none' | 'expired' | 'paired' }
  | { status: 'pending'; code: string; expiresAt: string };

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then((r) => r.json() as Promise<PairingStatus>);

export function DisplayPairing() {
  const router = useRouter();
  const { data, mutate } = useSWR('/api/display/pairing', fetcher, { refreshInterval: 3000 });
  const { trigger, isMutating, error } = useSWRMutation('/api/display/pairing', async (url: string) => {
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Could not create a code');
    return res.json();
  });
  const requested = useRef(false);

  useEffect(() => {
    if (!data) return;
    if (data.status === 'paired') {
      router.replace('/');
      router.refresh();
    } else if (data.status === 'none' && !requested.current) {
      requested.current = true;
      trigger().then(() => mutate());
    }
  }, [data, mutate, router, trigger]);

  if (data?.status === 'pending') {
    return (
      <div className="flex flex-col items-center gap-4" aria-live="polite">
        <p className="font-mono text-5xl font-extrabold tracking-[0.3em] text-foreground" aria-label={`Pairing code ${data.code.split('').join(' ')}`}>
          {data.code}
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          Waiting for a parent to approve
        </p>
        <p className="text-sm text-muted-foreground">
          Code expires at {new Date(data.expiresAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </p>
      </div>
    );
  }

  if (data?.status === 'expired' || error) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground">{error ? 'We could not create a code.' : 'This code expired.'}</p>
        <Button size="lg" className="h-12 rounded-xl" disabled={isMutating} onClick={() => trigger().then(() => mutate())}>
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Get a new code
        </Button>
      </div>
    );
  }

  return (
    <p className="flex items-center justify-center gap-2 text-muted-foreground" role="status">
      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      Preparing a code
    </p>
  );
}
