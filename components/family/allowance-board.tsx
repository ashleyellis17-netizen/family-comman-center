'use client'

import { useState } from 'react'
import { Lock } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ChildAvatar } from '@/components/child-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { act, newKey, useActionData } from '@/lib/client-actions'
import { FAMILY_KIDS } from '@/lib/chores'
import type { ChildId } from '@/lib/types'
import { addAllowanceEntry, listAllowance, payWeeklyAllowance, setAllowanceRate } from '@/app/actions/allowance'
import { kidStyle } from '@/components/chores/kid-styles'

const money = (cents: number) => `${cents < 0 ? '-' : ''}$${(Math.abs(cents) / 100).toFixed(2)}`
const KIND_LABEL: Record<string, string> = { allowance: 'Allowance', bonus: 'Bonus', spend: 'Spent', deduction: 'Deduction' }

export function AllowanceBoard() {
  const { data, error, mutate } = useActionData('allowance', listAllowance)
  const [busy, setBusy] = useState<string | null>(null)
  const [entryFor, setEntryFor] = useState<string | null>(null)

  if (error) return <p className="text-destructive">{error.message}</p>

  async function pay(assignee: string) {
    if (busy) return
    setBusy(assignee)
    await act(payWeeklyAllowance(assignee, newKey('pay')), 'Allowance paid')
    setBusy(null)
    mutate()
  }

  async function saveRate(assignee: string, value: string) {
    await act(setAllowanceRate(assignee, Number(value)), 'Weekly amount saved')
    mutate()
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader title="Allowance" description={`Money is tracked here; nothing is moved between bank accounts. Week of ${data?.weekOf ?? '…'}.`} />

      <section aria-label="Balances" className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {FAMILY_KIDS.map((k) => {
          const s = kidStyle(k.id)
          const rate = data?.rates[k.id] ?? 0
          const paid = data?.paidThisWeek.includes(k.id)
          const blocked = data?.blocked[k.id]
          return (
            <div key={k.id} className={cn('flex flex-col gap-4 rounded-2xl border bg-card p-4', s.ring)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChildAvatar childId={k.id as ChildId} name={k.name} size="sm" />
                  <span className="font-semibold text-foreground">{k.name}</span>
                </div>
                <span className={cn('text-2xl font-bold tabular-nums', s.text)}>{data ? money(data.balances[k.id] ?? 0) : '—'}</span>
              </div>

              {data?.canManage && (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      saveRate(k.id, String(new FormData(e.currentTarget).get('rate') ?? '0'))
                    }}
                    className="flex items-end gap-2"
                  >
                    <div className="flex flex-1 flex-col gap-1.5">
                      <Label htmlFor={`rate-${k.id}`} className="text-xs text-muted-foreground">Weekly amount ($)</Label>
                      <Input key={rate} id={`rate-${k.id}`} name="rate" type="number" step="0.01" min={0} max={1000} defaultValue={(rate / 100).toFixed(2)} className="h-10" />
                    </div>
                    <Button type="submit" variant="outline" className="h-10">Save</Button>
                  </form>

                  {blocked ? (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-destructive">
                      <Lock className="size-4" aria-hidden="true" /> Paused until {blocked.endDate}
                    </p>
                  ) : (
                    <Button onClick={() => pay(k.id)} disabled={!!busy || paid || rate <= 0} className={cn('h-11', !paid && rate > 0 && s.solid)}>
                      {paid ? 'Paid this week' : busy === k.id ? 'Paying…' : `Pay ${money(rate)}`}
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setEntryFor(entryFor === k.id ? null : k.id)} className="h-10">
                    Bonus or spending
                  </Button>
                  {entryFor === k.id && <EntryForm assignee={k.id} onDone={() => { setEntryFor(null); mutate() }} />}
                </>
              )}
            </div>
          )
        })}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">History</h2>
        {!data ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : data.entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">No allowance activity yet.</div>
        ) : (
          <ul className="flex flex-col divide-y rounded-2xl border bg-card">
            {data.entries.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="min-w-0">
                  <span className={cn('font-medium', kidStyle(e.assignee).text)}>{FAMILY_KIDS.find((k) => k.id === e.assignee)?.name}</span>
                  <span className="text-muted-foreground"> · {KIND_LABEL[e.kind]}{e.note && e.kind !== 'allowance' ? ` · ${e.note}` : ''}</span>
                </span>
                <span className={cn('shrink-0 font-semibold tabular-nums', e.amountCents >= 0 ? 'text-success' : 'text-destructive')}>
                  {e.amountCents >= 0 ? '+' : ''}{money(e.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function EntryForm({ assignee, onDone }: { assignee: string; onDone: () => void }) {
  const [kind, setKind] = useState<'bonus' | 'spend' | 'deduction'>('spend')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [key, setKey] = useState(() => newKey('allow'))
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    const ok = await act(addAllowanceEntry({ clientKey: key, assignee, kind, amount: Number(amount), note }), 'Saved')
    setSaving(false)
    if (ok) {
      setKey(newKey('allow'))
      onDone()
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-xl border bg-background p-3">
      <div className="flex gap-1" role="group" aria-label="Type">
        {(['spend', 'bonus', 'deduction'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            aria-pressed={kind === k}
            className={cn('h-9 flex-1 rounded-lg text-sm font-medium', kind === k ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted')}
          >
            {KIND_LABEL[k]}
          </button>
        ))}
      </div>
      <Label htmlFor={`amt-${assignee}`} className="sr-only">Amount</Label>
      <Input id={`amt-${assignee}`} type="number" step="0.01" min={0.01} placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} required className="h-10" />
      <Label htmlFor={`note-${assignee}`} className="sr-only">Note</Label>
      <Input id={`note-${assignee}`} placeholder="What for? (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} className="h-10" />
      <Button type="submit" disabled={saving} className="h-10">{saving ? 'Saving…' : 'Save'}</Button>
    </form>
  )
}
