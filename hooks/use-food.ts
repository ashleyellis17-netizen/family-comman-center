'use client';

import useSWR from 'swr';
import type { FoodSnapshot } from '@/lib/food-types';

async function fetcher(url: string): Promise<FoodSnapshot> {
  const res = await fetch(url, { cache: 'no-store' });
  if (res.status === 401) {
    window.location.assign('/sign-in');
    throw new Error('unauthenticated');
  }
  if (!res.ok) throw new Error('Could not load meals');
  return res.json();
}

export function useFood(initial: FoodSnapshot, week?: string) {
  const weekKey = week ?? initial.weekStart;
  return useSWR<FoodSnapshot>(`/api/food?week=${weekKey}`, fetcher, {
    fallbackData: weekKey === initial.weekStart ? initial : undefined,
    refreshInterval: 8000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    keepPreviousData: true,
  });
}

export function newBatchKey() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 24);
}
