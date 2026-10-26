'use client'

import Link from 'next/link'
import { Check, Gift, RotateCcw, ShoppingBasket, X } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { act, useActionData } from '@/lib/client-actions'
import { FAMILY_KIDS } from '@/lib/chores'
import { listApprovals } from '@/app/actions/approvals'
import { resolveGrounding } from '@/app/actions/grounding'
import { decideRedemption } from '@/app/actions/rewards'
import { kidStyle } from '@/components/chores/kid-styles'

const kidName = (id: string) => FAMILY_KIDS.find((k) => k.id === id)?.name ?? id

function Section({ title, icon: Icon, count, children }: { title: string; icon: typeof Gift; count: number; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 font-semibold text-foreground">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        {title}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{count}</span>
      </h2>
      {count === 0 ? <p className="rounded-2xl border border-dashed bg-card p-4 text-sm text-muted-foreground">Nothing waiting.</p> : children}
    </section>
  )
}

export function ApprovalQueue() {
  const { data, error, mutate } = useActionData('approvals', listApprovals)

  if (error) return <p className="text-destructive">{error.message}</p>
  if (!data) return <p className="text-muted-foreground">Loading…</p>

  const total = data.reviews.length + data.redemptions.length + data.wishes.length

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeader
        title="Parent Approval Queue"
        description={total === 0 ? 'All caught up.' : `${total} ${total === 1 ? 'thing needs' : 'things need'} a decision.`}
      />

      <Section title="Earn back requests" icon={RotateCcw} count={data.reviews.length}>
        <ul className="flex flex-col gap-3">
          {data.reviews.map((g) => (
            <li key={g.id} className={cn('flex flex-col gap-3 rounded-2xl border bg-card p-4', kidStyle(g.assignee).ring)}>
              <p className="text-foreground">
                <span className="font-semibold">{kidName(g.assignee)}</span> finished all {g.tasks.length} tasks for “{g.reason}”.
              </p>
              <ul className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                {g.tasks.map((t) => (
                  <li key={t.id} className="flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-success">
                    <Check className="size-3.5" aria-hidden="true" /> {t.title}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button className="h-11" onClick={async () => { await act(resolveGrounding(g.id, 'earned_back'), 'Grounding ended'); mutate() }}>
                  Approve
                </Button>
                <Button asChild variant="outline" className="h-11">
                  <Link href="/earn-back">Review tasks</Link>
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Rewards to hand out" icon={Gift} count={data.redemptions.length}>
        <ul className="flex flex-col divide-y rounded-2xl border bg-card">
          {data.redemptions.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span className="text-foreground">
                <span className={cn('font-semibold', kidStyle(r.assignee).text)}>{kidName(r.assignee)}</span> · {r.rewardTitle}
                <span className="text-muted-foreground"> ({r.cost} pts)</span>
              </span>
              <div className="flex gap-2">
                <Button className="h-10" onClick={async () => { await act(decideRedemption(r.id, 'fulfilled'), 'Marked as given'); mutate() }}>
                  <Check className="size-4" aria-hidden="true" /> Given
                </Button>
                <Button variant="outline" className="h-10" onClick={async () => { await act(decideRedemption(r.id, 'cancelled'), 'Cancelled and points refunded'); mutate() }}>
                  <X className="size-4" aria-hidden="true" /> Cancel
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Grocery wishlist" icon={ShoppingBasket} count={data.wishes.length}>
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4">
          <ul className="flex flex-col gap-1 text-sm">
            {data.wishes.slice(0, 6).map((w) => (
              <li key={w.id} className="text-foreground">
                {w.name}
                {w.quantity ? ` (${w.quantity})` : ''} <span className="text-muted-foreground">· {w.requesterName}</span>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="h-11 self-start">
            <Link href="/grocery-wishlist">Review wishlist</Link>
          </Button>
        </div>
      </Section>
    </div>
  )
}
