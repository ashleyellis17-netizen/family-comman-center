'use client'

import { useState } from 'react'
import { Check, Clock, Gift, Plus, Star, X } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ChildAvatar } from '@/components/child-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { act, newKey, useActionData } from '@/lib/client-actions'
import { FAMILY_KIDS } from '@/lib/chores'
import type { ChildId } from '@/lib/types'
import { createReward, decideRedemption, listRewards, redeemReward, setRewardAvailable } from '@/app/actions/rewards'
import { kidStyle } from './kid-styles'

export function RewardsBoard() {
  const { data, error, isLoading, mutate } = useActionData('rewards', listRewards)
  const [pending, setPending] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function redeem(rewardId: number, assignee: string, title: string) {
    const key = `${rewardId}:${assignee}`
    if (pending) return
    setPending(key)
    const name = FAMILY_KIDS.find((k) => k.id === assignee)?.name
    await act(redeemReward({ rewardId, assignee, clientKey: newKey('redeem') }), `${name} redeemed ${title}`)
    setPending(null)
    mutate()
  }

  async function decide(id: number, status: 'fulfilled' | 'cancelled') {
    await act(decideRedemption(id, status), status === 'fulfilled' ? 'Marked as given' : 'Cancelled and points refunded')
    mutate()
  }

  async function toggleAvailable(id: number, available: boolean) {
    await act(setRewardAvailable(id, available))
    mutate()
  }

  if (error) return <p className="text-destructive">{error.message}</p>

  const items = (data?.items ?? []).filter((r) => r.available || data?.canManage)

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader title="Rewards" description="Points come from finished chores. Parents hand out the reward and mark it given." />
        {data?.canManage && (
          <Button onClick={() => setShowForm((s) => !s)} size="lg" className="h-12 rounded-xl">
            <Plus className="size-5" aria-hidden="true" />
            New reward
          </Button>
        )}
      </div>

      <section aria-label="Point balances" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {FAMILY_KIDS.map((k) => {
          const s = kidStyle(k.id)
          return (
            <div key={k.id} className={cn('flex items-center gap-3 rounded-2xl border bg-card p-4', s.ring)}>
              <ChildAvatar childId={k.id as ChildId} name={k.name} size="md" />
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{k.name}</span>
                <span className="flex items-center gap-1 text-2xl font-bold text-foreground">
                  <Star className={cn('size-5', s.text)} aria-hidden="true" />
                  {data?.balances[k.id] ?? 0}
                  <span className="text-sm font-normal text-muted-foreground">pts</span>
                </span>
              </div>
            </div>
          )
        })}
      </section>

      {showForm && data?.canManage && <NewRewardForm onDone={() => { setShowForm(false); mutate() }} />}

      <section aria-labelledby="rewards-heading" className="flex flex-col gap-3">
        <h2 id="rewards-heading" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Gift className="size-5" aria-hidden="true" />
          Rewards
        </h2>
        {isLoading && !data ? (
          <p className="text-muted-foreground">Loading rewards…</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
            <p className="font-medium text-foreground">No rewards yet</p>
            <p className="mt-1 text-sm text-muted-foreground">{data?.canManage ? 'Add something worth saving up for.' : 'A parent can add rewards.'}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {items.map((r) => (
              <li key={r.id} className={cn('flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4', !r.available && 'opacity-60')}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-foreground">{r.title}</span>
                    {r.description && <span className="text-sm text-muted-foreground">{r.description}</span>}
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-warning/20 px-3 py-1 text-sm font-bold text-foreground">
                    <Star className="size-4" aria-hidden="true" />
                    {r.cost}
                  </span>
                </div>
                {r.available && (
                  <div className="flex flex-wrap gap-2">
                    {FAMILY_KIDS.map((k) => {
                      const balance = data?.balances[k.id] ?? 0
                      const short = r.cost - balance
                      const busy = pending === `${r.id}:${k.id}`
                      return (
                        <Button
                          key={k.id}
                          size="sm"
                          disabled={short > 0 || !!pending}
                          onClick={() => redeem(r.id, k.id, r.title)}
                          className={cn('h-10 rounded-xl', short <= 0 && kidStyle(k.id).solid)}
                          variant={short > 0 ? 'secondary' : 'default'}
                        >
                          {busy ? 'Saving…' : short > 0 ? `${k.name} (${short} more)` : `Redeem for ${k.name}`}
                        </Button>
                      )
                    })}
                  </div>
                )}
                {data?.canManage && (
                  <Button variant="ghost" size="sm" className="self-start" onClick={() => toggleAvailable(r.id, !r.available)}>
                    {r.available ? 'Hide reward' : 'Make available'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="history-heading" className="overflow-hidden rounded-2xl border border-border/50 bg-card">
        <h2 id="history-heading" className="border-b border-border/50 px-4 py-3 font-semibold text-foreground">Recent redemptions</h2>
        {(data?.redemptions ?? []).length === 0 ? (
          <p className="p-6 text-center text-muted-foreground">Nothing redeemed yet.</p>
        ) : (
          <ul className="divide-y divide-border/50">
            {data!.redemptions.map((r) => {
              const name = FAMILY_KIDS.find((k) => k.id === r.assignee)?.name ?? r.assignee
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-3 p-3">
                  <ChildAvatar childId={r.assignee as ChildId} name={name} size="sm" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className={cn('font-medium text-foreground', r.status === 'cancelled' && 'line-through text-muted-foreground')}>{r.rewardTitle}</span>
                    <span className="text-sm text-muted-foreground">
                      {name} · {r.cost} pts · {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {r.status === 'pending' && data?.canManage ? (
                    <div className="flex gap-2">
                      <Button size="sm" className="rounded-xl" onClick={() => decide(r.id, 'fulfilled')}>
                        <Check className="size-4" aria-hidden="true" />
                        Given
                      </Button>
                      <Button size="sm" variant="secondary" className="rounded-xl" onClick={() => decide(r.id, 'cancelled')}>
                        <X className="size-4" aria-hidden="true" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                        r.status === 'fulfilled' ? 'bg-success/15 text-success' : r.status === 'pending' ? 'bg-warning/20 text-foreground' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {r.status === 'pending' && <Clock className="size-3" aria-hidden="true" />}
                      {r.status === 'fulfilled' ? 'Given' : r.status === 'pending' ? 'Waiting' : 'Cancelled'}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function NewRewardForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cost, setCost] = useState('50')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await act(createReward({ title, description, cost: Number(cost) }), 'Reward added')
    setSaving(false)
    if (res) onDone()
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 rounded-2xl border border-border/50 bg-card p-4 md:grid-cols-3">
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="reward-title">Reward</Label>
        <Input id="reward-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Pick Friday movie" className="h-11" required maxLength={80} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="reward-cost">Cost (points)</Label>
        <Input id="reward-cost" type="number" min={1} value={cost} onChange={(e) => setCost(e.target.value)} className="h-11" />
      </div>
      <div className="flex flex-col gap-2 md:col-span-3">
        <Label htmlFor="reward-desc">Details (optional)</Label>
        <Input id="reward-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="h-11" maxLength={200} />
      </div>
      <div className="flex justify-end md:col-span-3">
        <Button type="submit" size="lg" className="h-11 rounded-xl" disabled={saving || !title.trim()}>
          {saving ? 'Saving…' : 'Add reward'}
        </Button>
      </div>
    </form>
  )
}
