'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/state-views';
import { wishlistItems as initialItems } from '@/lib/mock-data';
import type { WishlistItem } from '@/lib/types';
import { Heart, Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(initialItems);

  const approve = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, approved: true } : i)));
  const deny = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, approved: false } : i)));
  const addToList = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, addedToList: true } : i)));

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Grocery Wishlist"
        description="Family requests for the next shopping trip"
        icon={Heart}
        iconClassName="from-jaxon to-jaxon-light text-white"
      />

      {items.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border/50 shadow-sm">
          <EmptyState title="No requests yet" description="Family members can add their wishes here." icon={Heart} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((i) => (
            <div key={i.id} className="rounded-3xl bg-card border border-border/50 shadow-sm p-5 flex flex-col">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground">{i.item}</h3>
                  <p className="text-xs text-muted-foreground">Requested by {i.requestedBy} · {i.category}</p>
                </div>
                <StatusBadge status={i.addedToList ? 'On List' : i.approved ? 'Approved' : 'Pending'} />
              </div>
              {i.reason && <p className="text-sm text-muted-foreground italic mb-4">&ldquo;{i.reason}&rdquo;</p>}
              <div className="mt-auto flex gap-2">
                {i.addedToList ? (
                  <span className="text-sm font-semibold text-success flex items-center gap-1">
                    <Check className="w-4 h-4" /> Added to list
                  </span>
                ) : i.approved ? (
                  <Button size="sm" className="rounded-xl gap-1 flex-1" onClick={() => addToList(i.id)}>
                    <Plus className="w-4 h-4" /> Add to list
                  </Button>
                ) : (
                  <>
                    <Button size="sm" className="rounded-xl gap-1 flex-1" onClick={() => approve(i.id)}>
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-xl gap-1 flex-1" onClick={() => deny(i.id)}>
                      <X className="w-4 h-4" /> Not now
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
