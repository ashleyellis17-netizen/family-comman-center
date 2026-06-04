'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { pantryItems as initialItems } from '@/lib/mock-data';
import type { PantryItem } from '@/lib/types';
import { Package, AlertTriangle, Check, X } from 'lucide-react';

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>(initialItems);

  const toggleHave = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, haveIt: !i.haveIt } : i)));
  const toggleLow = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, lowStock: !i.lowStock } : i)));

  const lowCount = items.filter((i) => i.lowStock || !i.haveIt).length;
  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Pantry & Staples"
        description={`${lowCount} item${lowCount === 1 ? '' : 's'} low or out of stock`}
        icon={Package}
        iconClassName="from-alex to-alex-light text-white"
      />

      <div className="space-y-6">
        {categories.map((cat) => (
          <section key={cat} className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border/50 bg-muted/30">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wide">{cat}</h2>
            </div>
            <ul className="divide-y divide-border/40">
              {items.filter((i) => i.category === cat).map((i) => (
                <li key={i.id} className="p-4 flex items-center gap-3">
                  <button
                    onClick={() => toggleHave(i.id)}
                    aria-label={i.haveIt ? 'Mark as out' : 'Mark as in stock'}
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors',
                      i.haveIt ? 'bg-success border-success text-success-foreground' : 'bg-destructive/10 border-destructive text-destructive'
                    )}
                  >
                    {i.haveIt ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{i.item}</p>
                    <p className="text-xs text-muted-foreground">{i.quantity}</p>
                  </div>
                  <button
                    onClick={() => toggleLow(i.id)}
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors touch-target',
                      i.lowStock ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <AlertTriangle className="w-3 h-3" /> {i.lowStock ? 'Low' : 'OK'}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
