'use client'

import { useState } from 'react'
import { Check, Clock, Send, X } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { act, newKey, useActionData } from '@/lib/client-actions'
import { decideWishlist, listWishlist, submitWishlist, withdrawWishlist } from '@/app/actions/wishlist'
import type { WishlistStatus } from '@/lib/db/schema'
import { VoiceCapture } from './voice-capture'
import { ItemReviewDialog, type ReviewItem } from './item-review-dialog'

const STATUS_LABEL: Record<WishlistStatus, string> = { pending: 'Waiting for a parent', approved: 'Added to grocery list', declined: 'Not this time', deferred: 'Maybe later' }

export function Wishlist() {
  const { data, error, mutate } = useActionData('wishlist', listWishlist)
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [transcript, setTranscript] = useState<string | null>(null)
  const [busy, setBusy] = useState<number | null>(null)
  const [submitKey, setSubmitKey] = useState(() => newKey('wish'))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    // The key only changes after a confirmed save, so a retry after a network error can't create a duplicate.
    if (await act(submitWishlist([{ clientKey: submitKey, name, reason }]), 'Request sent')) {
      setName('')
      setReason('')
      setSubmitKey(newKey('wish'))
      mutate()
    }
  }

  async function submitVoice(items: ReviewItem[]) {
    const batch = newKey('wishv')
    const ok = await act(
      submitWishlist(items.map((i, idx) => ({ clientKey: `${batch}-${idx}`, name: i.name, quantity: [i.quantity, i.unit].filter(Boolean).join(' ') || null }))),
      'Requests sent',
    )
    if (ok) {
      setTranscript(null)
      mutate()
    }
  }

  async function decide(id: number, status: 'approved' | 'declined' | 'deferred') {
    setBusy(id)
    await act(decideWishlist({ id, status }), status === 'approved' ? 'Approved and added to the grocery list' : undefined)
    setBusy(null)
    mutate()
  }

  const requests = data?.requests ?? []
  const waiting = requests.filter((r) => r.status === 'pending' || r.status === 'deferred')
  const decided = requests.filter((r) => r.status === 'approved' || r.status === 'declined')

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader title="Grocery Wishlist" description="Ask for something — a parent approves it onto the grocery list." />

      <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="wish-name">What would you like?</Label>
          <Input id="wish-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Strawberry yogurt" className="h-12 text-base" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="wish-reason">Why? (optional)</Label>
          <Input id="wish-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For school lunches" className="h-11" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="lg" className="h-12 rounded-xl" disabled={!name.trim()}>
            <Send className="w-4 h-4" aria-hidden /> Send request
          </Button>
          <VoiceCapture onTranscript={setTranscript} label="Say it" />
        </div>
      </form>

      {error && <p role="alert" className="rounded-xl bg-destructive/10 text-destructive p-3 text-sm">{error.message}</p>}

      <section aria-label="Waiting" className="flex flex-col gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Waiting ({waiting.length})</h2>
        {data && waiting.length === 0 && <p className="text-muted-foreground text-sm">No open requests.</p>}
        <ul className="flex flex-col gap-2">
          {waiting.map((r) => (
            <li key={r.id} className="flex flex-col gap-3 rounded-xl bg-card border border-border/50 p-3 md:flex-row md:items-center">
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {r.quantity && <span className="text-primary mr-1">{r.quantity}</span>}
                  {r.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.requesterName} · {STATUS_LABEL[r.status]}
                  {r.reason ? ` · “${r.reason}”` : ''}
                </p>
              </div>
              {data?.canDecide ? (
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-xl" disabled={busy === r.id} onClick={() => decide(r.id, 'approved')}>
                    <Check className="w-4 h-4" aria-hidden /> Approve
                  </Button>
                  {r.status !== 'deferred' && (
                    <Button size="sm" variant="outline" className="rounded-xl" disabled={busy === r.id} onClick={() => decide(r.id, 'deferred')}>
                      <Clock className="w-4 h-4" aria-hidden /> Later
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="rounded-xl" disabled={busy === r.id} onClick={() => decide(r.id, 'declined')}>
                    <X className="w-4 h-4" aria-hidden /> Decline
                  </Button>
                </div>
              ) : (
                r.requesterUserId === data?.me && (
                  <Button size="sm" variant="ghost" onClick={async () => { await act(withdrawWishlist(r.id), 'Request withdrawn'); mutate() }}>
                    Withdraw
                  </Button>
                )
              )}
            </li>
          ))}
        </ul>
      </section>

      {decided.length > 0 && (
        <section aria-label="Recently decided" className="flex flex-col gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recently decided</h2>
          <ul className="flex flex-col gap-1">
            {decided.map((r) => (
              <li key={r.id} className="flex justify-between gap-3 rounded-lg px-3 py-2 text-sm">
                <span className="text-foreground">{r.name} <span className="text-muted-foreground">· {r.requesterName}</span></span>
                <span className={r.status === 'approved' ? 'text-primary font-semibold' : 'text-muted-foreground'}>
                  {STATUS_LABEL[r.status]}{r.decidedBy ? ` by ${r.decidedBy}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ItemReviewDialog transcript={transcript} onClose={() => setTranscript(null)} onConfirm={submitVoice} title="Review your requests" confirmLabel="Send requests" />
    </div>
  )
}
