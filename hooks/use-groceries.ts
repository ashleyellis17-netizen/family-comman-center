'use client';

import useSWR from 'swr';
import type { GrocerySnapshot } from '@/lib/grocery-types';

async function fetcher(url: string): Promise<GrocerySnapshot> {
  const res = await fetch(url, { cache: 'no-store' });
  if (res.status === 401) {
    window.location.assign('/sign-in');
    throw new Error('unauthenticated');
  }
  if (!res.ok) throw new Error('Could not load the grocery list');
  return res.json();
}

export function useGroceries(fallbackData?: GrocerySnapshot) {
  return useSWR<GrocerySnapshot>('/api/groceries', fetcher, {
    fallbackData,
    // Polling plus focus/reconnect revalidation keeps phones and the wall display in step.
    refreshInterval: 4000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 1000,
    keepPreviousData: true,
  });
}

export function newClientKey() {
  return crypto.randomUUID().replace(/-/g, '');
}
