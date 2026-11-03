'use client';

import { useState } from 'react';
import { Loader2, Package, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deletePantryItem, restockPantry, savePantryItem, setPantryStatus } from '@/app/actions/food';
import { PANTRY_STATUSES, PANTRY_STATUS_LABELS, type FoodSnapshot, type PantryEntry, type PantryStatus } from '@/lib/food-types';
import { GROCERY_CATEGORIES } from '@/lib/grocery-types';
import { addDaysToDateString } from '@/lib/time';
import { newBatchKey, useFood } from '@/hooks/use-food';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceButton } from '@/components/food/voice-button';
import { shoppingToast } from '@/components/food/recipe-library';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<PantryStatus, string> = {
  in_stock: 'bg-success text-success-foreground',
  low: 'bg-warning text-warning-foreground',
  out: 'bg-destructive text-destructive-foreground',
};

export function PantryManager({ initial }: { initial: FoodSnapshot }) {
  const { data, mutate } = useFood(initial);
  const snapshot = data ?? initial;
  const [name, setName] = useState('');
  const [status, setStatus] = useState<PantryStatus>('in_stock');
  const [category, setCategory] = useState('Pantry');
  const [saving, setSaving] = useState(false);
  const [restocking, setRestocking] = useState(false);

  const needs = snapshot.pantry.filter((p) => p.status !== 'in_stock');
  const soon = addDaysToDateString(snapshot.today, 3);

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSaving(true);
    const result = await savePantryItem({
      name,
      quantity: fd.get('quantity'),
      unit: fd.get('unit'),
      status,
      category,
      expiresOn: fd.get('expiresOn'),
      isStaple: fd.get('isStaple') === 'on',
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setName('');
    form.reset();
    mutate();
  }

  function patch(itemId: number, next: Partial<PantryEntry> | null) {
    mutate(
      (cur) =>
        cur
          ? { ...cur, pantry: next === null ? cur.pantry.filter((p) => p.id !== itemId) : cur.pantry.map((p) => (p.id === itemId ? { ...p, ...next } : p)) }
          : cur,
      { revalidate: false }
    );
  }

  async function onRestock(itemId?: number) {
    setRestocking(true);
    const result = await restockPantry(newBatchKey(), itemId);
    setRestocking(false);
    if (!result.ok) toast.error(result.error);
    else shoppingToast(result.data!);
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={onAdd} className="flex flex-col gap-3 rounded-3xl border border-border/50 bg-card p-4 shadow-sm">
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add an item, like rice or olive oil" aria-label="Item name" maxLength={80} required className="h-12 rounded-xl" />
          <VoiceButton label="Say a pantry item" onResult={setName} className="h-12 w-12" />
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Input name="quantity" inputMode="decimal" placeholder="Qty" aria-label="Quantity" className="h-11 w-20 rounded-xl" />
          <Input name="unit" placeholder="Unit" aria-label="Unit" maxLength={20} className="h-11 w-24 rounded-xl" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category" className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground">
            {GROCERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value as PantryStatus)} aria-label="Status" className="h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground">
            {PANTRY_STATUSES.map((s) => <option key={s} value={s}>{PANTRY_STATUS_LABELS[s]}</option>)}
          </select>
          <label className="flex flex-col text-xs font-medium text-muted-foreground">
            Use by
            <Input name="expiresOn" type="date" className="h-11 rounded-xl" />
          </label>
          <label className="flex h-11 items-center gap-2 px-1 text-sm font-medium text-foreground">
            <input type="checkbox" name="isStaple" className="h-5 w-5 accent-primary" /> Always keep
          </label>
          <Button type="submit" disabled={saving || !name.trim()} className="ml-auto h-11 rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />} Add
          </Button>
        </div>
      </form>

      {needs.length > 0 && (
        <div className="flex flex-col gap-3 rounded-3xl border border-warning/40 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-foreground">
            {needs.length} item{needs.length > 1 ? 's' : ''} running low or out: {needs.map((n) => n.name).join(', ')}
          </p>
          <Button onClick={() => onRestock()} disabled={restocking} className="h-11 shrink-0 rounded-xl">
            <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Add all to grocery list
          </Button>
        </div>
      )}

      {snapshot.pantry.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <Package className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">The pantry is empty</h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Track what you have at home. Anything marked in stock is skipped when you send recipe ingredients to the grocery list.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
          {[...snapshot.pantry]
            .sort((a, b) => PANTRY_STATUSES.indexOf(b.status) - PANTRY_STATUSES.indexOf(a.status) || a.name.localeCompare(b.name))
            .map((item) => {
              const expiring = item.expiresOn !== null && item.expiresOn <= soon;
              return (
                <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {item.name}
                      {item.quantity && <span className="ml-2 text-sm font-normal text-muted-foreground">{[item.quantity, item.unit].filter(Boolean).join(' ')}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.category}
                      {item.isStaple && ' · always keep'}
                      {item.expiresOn && (
                        <span className={cn(expiring && 'font-bold text-destructive')}>
                          {' · '}
                          {item.expiresOn < snapshot.today ? 'past use-by ' : 'use by '}
                          {new Date(`${item.expiresOn}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-xl border border-border/60 p-1" role="radiogroup" aria-label={`Stock level for ${item.name}`}>
                      {PANTRY_STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          role="radio"
                          aria-checked={item.status === s}
                          onClick={async () => {
                            if (item.status === s) return;
                            patch(item.id, { status: s });
                            const r = await setPantryStatus(item.id, s);
                            if (!r.ok) toast.error(r.error);
                            mutate();
                          }}
                          className={cn('h-9 rounded-lg px-3 text-xs font-bold transition-colors', item.status === s ? STATUS_STYLES[s] : 'text-muted-foreground hover:bg-accent')}
                        >
                          {PANTRY_STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                    {item.status !== 'in_stock' && (
                      <Button size="icon" variant="outline" className="h-10 w-10 rounded-xl" disabled={restocking} onClick={() => onRestock(item.id)} aria-label={`Add ${item.name} to the grocery list`}>
                        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${item.name} from the pantry`}
                      onClick={async () => {
                        patch(item.id, null);
                        const r = await deletePantryItem(item.id);
                        if (!r.ok) toast.error(r.error);
                        mutate();
                      }}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}
