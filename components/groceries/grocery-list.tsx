'use client';

import { useMemo, useRef, useState } from 'react';
import { Check, Loader2, Pencil, Plus, RotateCcw, Trash2, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { addGroceryItem, removeGroceryItems, restoreGroceryItems, setGroceryChecked, updateGroceryItem } from '@/app/actions/groceries';
import { GROCERY_CATEGORIES, type GroceryItem, type GrocerySnapshot } from '@/lib/grocery-types';
import { newClientKey, useGroceries } from '@/hooks/use-groceries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

function formatQty(item: Pick<GroceryItem, 'quantity' | 'unit'>) {
  if (!item.quantity && !item.unit) return null;
  const q = item.quantity ? String(Number(item.quantity)) : '';
  return [q, item.unit].filter(Boolean).join(' ');
}

export function GroceryList({ initial }: { initial: GrocerySnapshot }) {
  const { data, error, mutate, isValidating } = useGroceries(initial);
  const snapshot = data ?? initial;
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Other');
  const [quantity, setQuantity] = useState('');
  const [editing, setEditing] = useState<GroceryItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toBuy = snapshot.items.filter((i) => !i.checked);
  const done = snapshot.items.filter((i) => i.checked);
  const grouped = useMemo(() => {
    const map = new Map<string, GroceryItem[]>();
    for (const item of toBuy) map.set(item.category, [...(map.get(item.category) ?? []), item]);
    return GROCERY_CATEGORIES.filter((c) => map.has(c)).map((c) => [c, map.get(c)!] as const);
  }, [toBuy]);

  function patchLocal(fn: (items: GroceryItem[]) => GroceryItem[]) {
    mutate((current) => (current ? { ...current, items: fn(current.items) } : current), { revalidate: false });
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const clientKey = newClientKey();
    const optimistic: GroceryItem = {
      id: -Date.now(),
      clientKey,
      name: trimmed,
      quantity: quantity || null,
      unit: null,
      category,
      store: null,
      notes: null,
      requestedBy: snapshot.viewer.name,
      neededBy: null,
      source: 'manual',
      checked: false,
      checkedBy: null,
      version: 1,
      updatedAt: new Date().toISOString(),
      pending: true,
    };
    patchLocal((items) => [...items, optimistic]);
    setName('');
    setQuantity('');
    inputRef.current?.focus();

    const result = await addGroceryItem({ clientKey, name: trimmed, quantity: quantity || null, category });
    if (!result.ok) {
      patchLocal((items) => items.filter((i) => i.clientKey !== clientKey));
      toast.error(result.error, {
        action: { label: 'Retry', onClick: () => addGroceryItem({ clientKey, name: trimmed, quantity: quantity || null, category }).then(() => mutate()) },
      });
      return;
    }
    patchLocal((items) => items.map((i) => (i.clientKey === clientKey ? result.data! : i)));
    mutate();
  }

  async function onToggle(item: GroceryItem) {
    if (item.pending) return;
    const target = !item.checked;
    patchLocal((items) => items.map((i) => (i.id === item.id ? { ...i, checked: target, checkedBy: target ? snapshot.viewer.name : null } : i)));
    const result = await setGroceryChecked(item.id, target);
    if (!result.ok) {
      toast.error(result.error);
    }
    mutate();
  }

  async function onRemove(ids: number[], label: string) {
    if (ids.length === 0) return;
    const removed = snapshot.items.filter((i) => ids.includes(i.id));
    patchLocal((items) => items.filter((i) => !ids.includes(i.id)));
    const result = await removeGroceryItems(ids);
    if (!result.ok) {
      toast.error(result.error);
      mutate();
      return;
    }
    toast(label, {
      action: {
        label: 'Undo',
        onClick: async () => {
          patchLocal((items) => [...items, ...removed]);
          const restored = await restoreGroceryItems(ids);
          if (!restored.ok) toast.error(restored.error);
          mutate();
        },
      },
    });
    mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground" aria-live="polite">
        {error ? (
          <span className="flex items-center gap-2 font-semibold text-destructive">
            <WifiOff className="w-4 h-4" aria-hidden="true" />
            Offline — showing the last synced list
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full', isValidating ? 'bg-warning' : 'bg-success')} aria-hidden="true" />
            Live — updates across every device
          </span>
        )}
        <span>
          {toBuy.length} to buy · {done.length} in the cart
        </span>
      </div>

      <form onSubmit={onAdd} className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-4 shadow-sm md:flex-row md:items-end">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="grocery-name">Add an item</Label>
          <Input
            ref={inputRef}
            id="grocery-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Milk, bananas, paper towels…"
            maxLength={80}
            autoComplete="off"
            className="h-12 text-base"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex w-24 flex-col gap-2">
            <Label htmlFor="grocery-qty">Qty</Label>
            <Input
              id="grocery-qty"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/[^\d.]/g, ''))}
              inputMode="decimal"
              className="h-12 text-base"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2 md:w-44">
            <Label htmlFor="grocery-category">Aisle</Label>
            <select
              id="grocery-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 rounded-md border border-input bg-background px-3 text-base"
            >
              {GROCERY_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <Button type="submit" size="lg" className="h-12 rounded-xl font-bold" disabled={!name.trim()}>
          <Plus className="w-5 h-5" aria-hidden="true" />
          Add
        </Button>
      </form>

      {toBuy.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
          <p className="text-lg font-bold text-foreground">The list is empty</p>
          <p className="text-muted-foreground">Add anything the house needs. Everyone sees it right away.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {grouped.map(([cat, items]) => (
            <section key={cat} aria-labelledby={`cat-${cat}`} className="rounded-2xl bg-card border border-border/50 p-4 shadow-sm">
              <h2 id={`cat-${cat}`} className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                {cat}
              </h2>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <GroceryRow key={item.clientKey} item={item} onToggle={onToggle} onEdit={setEditing} onRemove={onRemove} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {done.length > 0 && (
        <section aria-labelledby="in-cart" className="rounded-2xl bg-muted/50 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="in-cart" className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              In the cart
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(done.map((i) => i.id), `Cleared ${done.length} item${done.length === 1 ? '' : 's'}`)}
            >
              Clear checked
            </Button>
          </div>
          <ul className="flex flex-col gap-2">
            {done.map((item) => (
              <GroceryRow key={item.clientKey} item={item} onToggle={onToggle} onEdit={setEditing} onRemove={onRemove} />
            ))}
          </ul>
        </section>
      )}

      <EditGroceryDialog
        item={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          mutate();
        }}
        onConflict={(latest) => {
          setEditing(latest);
          mutate();
        }}
      />
    </div>
  );
}

function GroceryRow({
  item,
  onToggle,
  onEdit,
  onRemove,
}: {
  item: GroceryItem;
  onToggle: (item: GroceryItem) => void;
  onEdit: (item: GroceryItem) => void;
  onRemove: (ids: number[], label: string) => void;
}) {
  const qty = formatQty(item);
  return (
    <li className={cn('flex items-center gap-3 rounded-xl px-2 py-2', item.pending && 'opacity-60')}>
      <button
        type="button"
        onClick={() => onToggle(item)}
        aria-pressed={item.checked}
        aria-label={`${item.checked ? 'Uncheck' : 'Check off'} ${item.name}`}
        disabled={item.pending}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-colors',
          item.checked ? 'border-success bg-success text-success-foreground' : 'border-border bg-background hover:border-primary'
        )}
      >
        {item.pending ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : item.checked && <Check className="w-5 h-5" aria-hidden="true" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn('font-semibold text-foreground', item.checked && 'text-muted-foreground line-through')}>
          {item.name}
          {qty && <span className="ml-2 font-normal text-muted-foreground">× {qty}</span>}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {[
            item.checked && item.checkedBy ? `Got by ${item.checkedBy}` : item.requestedBy ? `Added by ${item.requestedBy}` : null,
            item.source === 'wishlist' ? 'from wishlist' : null,
            item.notes,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      {!item.pending && (
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}>
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onRemove([item.id], `Removed ${item.name}`)} aria-label={`Remove ${item.name}`}>
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </li>
  );
}

function EditGroceryDialog({
  item,
  onClose,
  onSaved,
  onConflict,
}: {
  item: GroceryItem | null;
  onClose: () => void;
  onSaved: () => void;
  onConflict: (latest: GroceryItem) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!item) return;
    const form = new FormData(e.currentTarget);
    setSaving(true);
    setMessage(null);
    const result = await updateGroceryItem(item.id, item.version, {
      name: form.get('name'),
      quantity: form.get('quantity'),
      unit: form.get('unit'),
      category: form.get('category'),
      store: form.get('store'),
      notes: form.get('notes'),
    });
    setSaving(false);
    if (result.ok) return onSaved();
    setMessage(result.error);
    if (result.conflict) onConflict(result.conflict);
  }

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit item</DialogTitle>
        </DialogHeader>
        {item && (
          <form key={`${item.id}-${item.version}`} onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name">Item</Label>
              <Input id="edit-name" name="name" defaultValue={item.name} required maxLength={80} className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-qty">Quantity</Label>
                <Input id="edit-qty" name="quantity" defaultValue={item.quantity ? String(Number(item.quantity)) : ''} inputMode="decimal" className="h-11" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input id="edit-unit" name="unit" defaultValue={item.unit ?? ''} placeholder="lb, box, gal" maxLength={20} className="h-11" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-category">Aisle</Label>
                <select id="edit-category" name="category" defaultValue={item.category} className="h-11 rounded-md border border-input bg-background px-3">
                  {GROCERY_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-store">Store</Label>
                <Input id="edit-store" name="store" defaultValue={item.store ?? ''} maxLength={40} className="h-11" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input id="edit-notes" name="notes" defaultValue={item.notes ?? ''} maxLength={200} className="h-11" />
            </div>
            {message && (
              <p role="alert" className="flex items-start gap-2 rounded-xl bg-warning/15 px-3 py-2 text-sm font-semibold text-foreground">
                <RotateCcw className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
                {message}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
