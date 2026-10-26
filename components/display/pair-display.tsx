'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { Monitor, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Start = { code: string; expiresAt: string }
type Status = { status: 'pending' | 'paired' | 'expired' | 'error' }

async function startPairing(): Promise<Start> {
  const res = await fetch('/api/display/pair', { method: 'POST', credentials: 'include' })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? 'Could not start pairing.')
  return body
}

async function pairingStatus(): Promise<Status> {
  const res = await fetch('/api/display/pair', { credentials: 'include', cache: 'no-store' })
  return res.json()
}

function useSecondsLeft(expiresAt?: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return expiresAt ? Math.max(0, Math.round((new Date(expiresAt).getTime() - now) / 1000)) : 0
}

export function PairDisplay() {
  const start = useSWR('display-pair-start', startPairing, { revalidateOnFocus: false, revalidateOnReconnect: false, shouldRetryOnError: false })
  const status = useSWR(start.data ? ['display-pair-status', start.data.code] : null, pairingStatus, {
    refreshInterval: 3000,
    onSuccess: (s) => {
      if (s.status === 'paired') window.location.replace('/today')
      if (s.status === 'expired') start.mutate()
    },
  })
  const secondsLeft = useSecondsLeft(start.data?.expiresAt)
  const code = start.data?.code
  const paired = status.data?.status === 'paired'

  return (
    <main className="min-h-dvh flex items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-xl flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Monitor className="h-6 w-6" aria-hidden />
          <span className="text-lg font-semibold">Pair this display</span>
        </div>

        {start.error ? (
          <div className="flex flex-col items-center gap-4" role="alert">
            <p className="text-lg text-destructive">{start.error.message}</p>
            <Button size="lg" className="rounded-xl" onClick={() => start.mutate()}>
              <RefreshCw className="h-4 w-4" aria-hidden /> Try again
            </Button>
          </div>
        ) : (
          <>
            <p
              className="font-mono text-6xl font-bold tracking-[0.25em] text-foreground sm:text-8xl"
              aria-live="polite"
              aria-label={code ? `Pairing code ${code.split('').join(' ')}` : 'Getting a code'}
            >
              {code ? `${code.slice(0, 3)} ${code.slice(3)}` : '··· ···'}
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-pretty text-xl leading-relaxed text-foreground">
                On a parent&apos;s phone, open <span className="font-bold">Settings → Shared displays</span> and enter this code.
              </p>
              <p className="text-sm text-muted-foreground" role="status">
                {paired
                  ? 'Paired — opening Today…'
                  : code
                    ? `Waiting for approval · new code in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
                    : 'Getting a code…'}
              </p>
            </div>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
              Once paired, this screen stays connected without an account. Private items and settings are never shown here, and a parent can unpair it anytime.
            </p>
          </>
        )}
      </div>
    </main>
  )
}
