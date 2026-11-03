'use client';

import { useState } from 'react';
import { Check, Clock, Loader2, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { decideWishlistRequest, submitWishlistRequest, withdrawWishlistRequest } from '@/app/actions/groceries';
import type { GrocerySnapshot, WishlistItem } from '@/lib/grocery-types';
import { newClientKey, useGroceries } from '@/hooks/use-groceries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

const STATUS_LABEL: Record<WishlistItem['status'], string> = {
  pending: 'Waiting for a parent',
  approved: 'Approved — on the grocery list',
  declined: 'Not this time',
  deferred: 'Maybe later',
};

export function Wishlist({ initial }: { initial: GrocerySnapshot }) {
  const { data, mutate } = useGroceries(initial);
  const snapshot = data ?? initial;
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [deciding, setDeciding] = useState<number | null>(null);
  const canDecide = snapshot.viewer.canDecide;

  const open = snapshot.wishlist.filter((w) => w.status === 'pending' || w.status === 'deferred');
  const decided = snapshot.wishlist.filter((w) => w.status === 'approved' || w.status === 'declined');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const clientKey = newClientKey();
    const optimistic: WishlistItem = {
      id: -Date.now(),
      clientKey,
      name: trimmed,
      quantity: null,
      reason: reason.trim() || null,
      requesterName: snapshot.viewer.name,
      status: 'pending',
      decisionNote: null,
      decidedAt: null,
      groceryItemId: null,
      createdAt: new Date().toISOString(),
      mine: true,
      pending: true,
    };
    mutate((c) => (c ? { ...c, wishlist: [optimistic, ...c.wishlist] } : c), { revalidate: false });
    setName('');
    setReason('');
    const result = await submitWishlistRequest({ clientKey, name: trimmed, reason: optimistic.reason });
    if (!result.ok) toast.error(result.error);
    else toast.success('Sent to Mom and Dad');
    mutate();
  }

  async function onDecide(item: WishlistItem, decision: 'approved' | 'declined' | 'deferred') {
    setDeciding(item.id);
    const result = await decideWishlistRequest(item.id, decision);
    setDeciding(null);
    if (!result.ok) toast.error(result.error);
    else if (result.data?.status !== decision) toast(`Already ${result.data?.status} by another parent`);
    else if (decision === 'approved') toast.success(`${item.name} added to the grocery list`);
    mutate();
  }

  async function onWithdraw(item: WishlistItem) {
    mutate((c) => (c ? { ...c, wishlist: c.wishlist.filter((w) => w.id !== item.id) } : c), { revalidate: false });
    const result = await withdrawWishlistRequest(item.id);
    if (!result.ok) toast.error(result.error);
    mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-4 shadow-sm md:flex-row md:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="wish-name">What would you like?</Label>
          <Input id="wish-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Goldfish crackers" className="h-12 text-base" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="wish-reason">Why? (optional)</Label>
          <Input id="wish-reason" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} placeholder="For school lunches" className="h-12 text-base" />
        </div>
        <Button type="submit" size="lg" className="h-12 rounded-xl font-bold" disabled={!name.trim()}>
          <Send className="w-4 h-4" aria-hidden="true" />
          Ask
        </Button>
      </form>

      <section aria-labelledby="wish-open" className="flex flex-col gap-3">
        <h2 id="wish-open" className="text-lg font-bold text-foreground">
          {canDecide ? 'Needs your decision' : 'Waiting for an answer'} ({open.length})
        </h2>
        {open.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-muted-foreground">No open requests.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {open.map((item) => (
              <li key={item.clientKey} className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-4 shadow-sm md:flex-row md:items-center">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[`From ${item.requesterName}`, item.reason, item.status === 'deferred' ? 'Marked maybe later' : null].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {canDecide && !item.pending ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onDecide(item, 'approved')} disabled={deciding === item.id}>
                      {deciding === item.id ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Check className="w-4 h-4" aria-hidden="true" />}
                      Approve
                    </Button>
                    {item.status !== 'deferred' && (
                      <Button size="sm" variant="secondary" onClick={() => onDecide(item, 'deferred')} disabled={deciding === item.id}>
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        Later
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => onDecide(item, 'declined')} disabled={deciding === item.id}>
                      <X className="w-4 h-4" aria-hidden="true" />
                      Decline
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.pending ? 'Sending…' : STATUS_LABEL[item.status]}</Badge>
                    {item.mine && item.status === 'pending' && !item.pending && (
                      <Button size="sm" variant="ghost" onClick={() => onWithdraw(item)}>
                        Withdraw
                      </Button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {decided.length > 0 && (
        <section aria-labelledby="wish-decided" className="flex flex-col gap-3">
          <h2 id="wish-decided" className="text-lg font-bold text-foreground">
            Recently decided
          </h2>
          <ul className="flex flex-col gap-2">
            {decided.map((item) => (
              <li key={item.clientKey} className="flex items-center justify-between gap-3 rounded-xl bg-muted/50 px-4 py-3">
                <span className="font-semibold text-foreground">
                  {item.name} <span className="font-normal text-muted-foreground">· {item.requesterName}</span>
                </span>
                <Badge variant={item.status === 'approved' ? 'default' : 'outline'}>{STATUS_LABEL[item.status]}</Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
