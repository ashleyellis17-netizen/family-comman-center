'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/state-views';
import { groceryItems as initialItems } from '@/lib/mock-data';
import type { GroceryItem } from '@/lib/types';
import { ShoppingCart, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function formatShort(date?: string) {
  if (!date) return null;
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function GroceryListPage() {
  const [items, setItems] = useState<GroceryItem[]>(initialItems);
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('todo');
  const [newItem, setNewItem] = useState('');

  const togglePurchased = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, purchased: !i.purchased } : i)));

  const addItem = () => {
    const item = newItem.trim();
    if (!item) return;
    setItems((prev) => [
      { id: `g-${Date.now()}`, item, category: 'Other', quantity: '1', addedBy: 'Parent', priority: 'Medium', purchased: false },
      ...prev,
    ]);
    setNewItem('');
  };

  const visible = items.filter((i) => (filter === 'all' ? true : filter === 'todo' ? !i.purchased : i.purchased));
  const categories = Array.from(new Set(visible.map((i) => i.category)));

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Grocery List"
        description={`${items.filter((i) => !i.purchased).length} items left to buy`}
        icon={ShoppingCart}
        iconClassName="from-alex to-alex-light text-white"
      />

      {/* Add item */}
      <div className="flex gap-2 mb-5">
        <Input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add an item..." onKeyDown={(e) => e.key === 'Enter' && addItem()} />
        <Button onClick={addItem} className="rounded-xl gap-1"><Plus className="w-4 h-4" /> Add</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['todo', 'all', 'done'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-5 py-2.5 rounded-2xl text-sm font-bold transition-all touch-target capitalize',
              filter === f ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:bg-accent'
            )}
          >
            {f === 'todo' ? 'To Buy' : f === 'done' ? 'Purchased' : 'All'}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border/50 shadow-sm">
          <EmptyState title="Nothing here" description="Add items to your grocery list above." icon={ShoppingCart} />
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => (
            <section key={cat} className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-border/50 bg-muted/30">
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wide">{cat}</h2>
              </div>
              <ul className="divide-y divide-border/40">
                {visible.filter((i) => i.category === cat).map((i) => (
                  <li key={i.id} className="p-4 flex items-center gap-3">
                    <button
                      onClick={() => togglePurchased(i.id)}
                      aria-label={i.purchased ? 'Mark not purchased' : 'Mark purchased'}
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors',
                        i.purchased ? 'bg-success border-success text-success-foreground' : 'border-border bg-card'
                      )}
                    >
                      {i.purchased && <Check className="w-4 h-4" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-semibold', i.purchased ? 'line-through text-muted-foreground' : 'text-foreground')}>
                        {i.item} <span className="text-sm font-normal text-muted-foreground">· {i.quantity}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Added by {i.addedBy}
                        {formatShort(i.neededBy) ? ` · Need by ${formatShort(i.neededBy)}` : ''}
                        {i.notes ? ` · ${i.notes}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={i.priority} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
