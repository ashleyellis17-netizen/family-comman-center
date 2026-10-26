'use client'

import useSWR, { type SWRConfiguration } from 'swr'
import { toast } from 'sonner'

type Result<T> = { ok: true; data: T } | { ok: false; error: string; code?: string }

export class ActionError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
  }
}

/** Shared data that other devices can change: polls every 15s and refreshes when the tab regains focus. */
export function useActionData<T>(key: string | null, fetcher: () => Promise<Result<T>>, options?: SWRConfiguration<T>) {
  return useSWR<T>(
    key,
    async () => {
      const result = await fetcher()
      if (!result.ok) throw new ActionError(result.error, result.code)
      return result.data
    },
    { refreshInterval: 15000, revalidateOnFocus: true, keepPreviousData: true, ...options },
  )
}

/** Runs a server action and reports failures clearly instead of pretending the change was saved. */
export async function act<T>(promise: Promise<Result<T>>, success?: string): Promise<T | null> {
  try {
    const result = await promise
    if (!result.ok) {
      toast.error(result.error)
      return null
    }
    if (success) toast.success(success)
    return result.data
  } catch {
    toast.error('Connection lost. Your change was not saved — check your connection and try again.')
    return null
  }
}

export function newKey(prefix = 'k') {
  return `${prefix}-${crypto.randomUUID()}`
}
