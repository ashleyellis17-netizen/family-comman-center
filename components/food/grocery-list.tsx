'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Check, Copy, Pencil, Plus, RotateCcw, ShoppingBasket, Store, Tags, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { act, newKey, useActionData } from '@/lib/client-actions'
import { formatQuantity, GROCERY_CATEGORIES, parseItemPhrase, splitItemList } from '@/lib/food'
import type { GroceryRow } from '@/lib/db/schema'
import {
  addGroceries,
  clearCheckedGroceries,
  listGroceries,
  removeGroceries,
  restoreGroceries,
  setGroceryChecked,
  updateGrocery,
  type AddResult,
  type GroceryInput,
} from '@/app/actions/groceries'
import { VoiceCapture } from './voice-capture'
import { ItemReviewDialog, type ReviewItem } from './item-review-dialog'

type GroupBy = 'category' | 'store'

function reportAdd(result: AddResult | null, onUndo?: () => void) {
  if (!result) return
  if (result.added.length) {
    toast.success(`Added ${result.added.length} item${result.added.length === 1 ? '' : 's'}`, onUndo ? { action: { label: 'Undo', onClick: onUndo } } : undefined)
  }
  if (result.alreadySubmitted.length) toast.info(`Already saved: ${result.alreadySubmitted.join(', ')}`)
  for (const s of result.similar) toast.warning(`Possible duplicate: "${s.name}" — list already has ${s.existing}.`)
}

export function GroceryList({ displayName }: { displayName: string }) {
  const { data, error, isLoading, mutate } = useActionData('groceries', listGroceries)
  const [text, setText] = useState('')
  const [groupBy, setGroupBy] = useState<GroupBy>('category')
  const [shopping, setShopping] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [editing, setEditing] = useState<GroceryRow | null>(null)
  const [pending, setPending] = useState<Set<number>>(new Set())

  const items = data?.items ?? []
  const open = items.filter((i) => !i.checked)
  const done = items.filter((i) => i.checked)

  const groups = useMemo(() => {
    const map = new Map<string, GroceryRow[]>()
    for (const item of open) {
      const key = groupBy === 'store' ? item.store || 'Any store' : item.category
      map.set(key, [...(map.get(key) ?? []), item])
    }
    const order = groupBy === 'category' ? (GROCERY_CATEGORIES as readonly string[]) : []
    return [...map.entries()].sort(([a], [b]) => (order.indexOf(a) - order.indexOf(b)) || a.localeCompare(b))
  }, [open, groupBy])

  async function save(inputs: GroceryInput[]) {
    const result = await act(addGroceries(inputs))
    if (result) {
      const ids = result.added.map((a) => a.id)
      reportAdd(result, ids.length ? () => undo(ids) : undefined)
      mutate()
    }
    return result
  }

  async function undo(ids: number[]) {
    if (await act(removeGroceries(ids), 'Removed')) mutate()
  }

  async function quickAdd(e: React.FormEvent) {
    e.preventDefault()
    const parts = splitItemList(text)
    if (!parts.length) return
    const batch = newKey('add')
    const inputs = parts.map((p, i) => {
      const parsed = parseItemPhrase(p)
      return { clientKey: `${batch}-${i}`, name: parsed.name, quantity: parsed.quantity, unit: parsed.unit, source: 'manual' as const }
    })
    if (await save(inputs)) setText('')
  }

  async function confirmVoice(lines: ReviewItem[]) {
    const batch = newKey('voice')
    const result = await save(lines.map((l, i) => ({ clientKey: `${batch}-${i}`, name: l.name, quantity: l.quantity || null, unit: l.unit || null, source: 'voice' as const })))
    if (result) setTranscript(null)
  }

  async function toggle(item: GroceryRow) {
    if (pending.has(item.id)) return
    const next = !item.checked
    setPending((p) => new Set(p).add(item.id))
    mutate(
      (d) => d && { ...d, items: d.items.map((i) => (i.id === item.id ? { ...i, checked: next, checkedAt: next ? new Date() : null } : i)) },
      { revalidate: false },
    )
    const ok = await act(setGroceryChecked(item.id, next))
    setPending((p) => {
      const n = new Set(p)
      n.delete(item.id)
      return n
    })
    if (ok && next) {
      toast(`Got ${item.name}`, { action: { label: 'Undo', onClick: async () => { await act(setGroceryChecked(item.id, false)); mutate() } } })
    }
    mutate()
  }

  async function remove(item: GroceryRow) {
    const ids = await act(removeGroceries([item.id]))
    if (!ids) return
    mutate()
    toast(`Removed ${item.name}`, { action: { label: 'Undo', onClick: async () => { await act(restoreGroceries(ids)); mutate() } } })
  }

  async function clearChecked() {
    const ids = await act(clearCheckedGroceries())
    if (!ids) return
    mutate()
    toast(`Cleared ${ids.length} checked item${ids.length === 1 ? '' : 's'}`, {
      action: { label: 'Undo', onClick: async () => { await act(restoreGroceries(ids)); mutate() } },
    })
  }

  async function copyList() {
    const lines = groups.flatMap(([g, list]) => [`${g}:`, ...list.map((i) => `- ${[formatQuantity(i.quantity, i.unit), i.name].filter(Boolean).join(' ')}`)])
    try {
      await navigator.clipboard.writeText(lines.join('\n'))
      toast.success('List copied — paste it into a text message.')
    } catch {
      toast.error('Could not copy. Your browser blocked clipboard access.')
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Grocery List"
        description={`${open.length} to buy${done.length ? ` · ${done.length} checked recently` : ''}`}
      />

      {!shopping && (
        <section aria-label="Add items" className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-4">
          <form onSubmit={quickAdd} className="flex gap-2">
            <Label htmlFor="quick-add" className="sr-only">Add items</Label>
            <Input
              id="quick-add"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="2 gal milk, eggs and bananas"
              className="h-12 text-base"
              autoComplete="off"
            />
            <Button type="submit" size="lg" className="h-12 rounded-xl" disabled={!text.trim()}>
              <Plus className="w-5 h-5" aria-hidden />
              Add
            </Button>
          </form>
          <VoiceCapture onTranscript={setTranscript} label="Say items" />
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2" role="group" aria-label="Group items by">
          <Button variant={groupBy === 'category' ? 'default' : 'outline'} size="sm" className="rounded-xl" onClick={() => setGroupBy('category')}>
            <Tags className="w-4 h-4" aria-hidden /> Aisle
          </Button>
          <Button variant={groupBy === 'store' ? 'default' : 'outline'} size="sm" className="rounded-xl" onClick={() => setGroupBy('store')}>
            <Store className="w-4 h-4" aria-hidden /> Store
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id="shopping-mode" checked={shopping} onCheckedChange={setShopping} />
            <Label htmlFor="shopping-mode" className="font-semibold">Shopping mode</Label>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={copyList} disabled={!open.length}>
            <Copy className="w-4 h-4" aria-hidden /> Copy
          </Button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 text-destructive p-3 text-sm font-medium">
          {error.message} Showing the last loaded list.
        </p>
      )}
      {isLoading && !data && <p className="text-muted-foreground">Loading list…</p>}

      {data && open.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <ShoppingBasket className="w-8 h-8 mx-auto mb-2" aria-hidden />
          Nothing on the list. Add items above or pick from “Buy again”.
        </div>
      )}

      {groups.map(([group, list]) => (
        <section key={group} aria-label={group} className="flex flex-col gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{group}</h2>
          <ul className="flex flex-col gap-2">
            {list.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-xl bg-card border border-border/50 p-2">
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  aria-label={`Mark ${item.name} as bought`}
                  className={cn('flex flex-1 items-center gap-3 text-left min-h-12 rounded-lg px-2', shopping && 'min-h-16')}
                >
                  <span className="flex w-7 h-7 shrink-0 items-center justify-center rounded-full border-2 border-primary" aria-hidden />
                  <span className="flex flex-col">
                    <span className={cn('font-semibold text-foreground', shopping && 'text-xl')}>
                      {formatQuantity(item.quantity, item.unit) && <span className="text-primary mr-1">{formatQuantity(item.quantity, item.unit)}</span>}
                      {item.name}
                    </span>
                    {!shopping && (
                      <span className="text-xs text-muted-foreground">
                        {[item.requestedBy && item.requestedBy !== displayName ? `for ${item.requestedBy}` : null, item.store, item.neededBy ? `by ${item.neededBy}` : null, item.notes]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    )}
                  </span>
                </button>
                {!shopping && (
                  <div className="flex">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${item.name}`} onClick={() => setEditing(item)}>
                      <Pencil className="w-4 h-4" aria-hidden />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${item.name}`} onClick={() => remove(item)}>
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      {done.length > 0 && (
        <section aria-label="Checked items" className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">In the cart</h2>
            <Button variant="ghost" size="sm" onClick={clearChecked}>Clear checked</Button>
          </div>
          <ul className="flex flex-col gap-1">
            {done.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => toggle(item)} aria-label={`Put ${item.name} back on the list`} className="flex w-full items-center gap-3 min-h-11 rounded-lg px-3 text-left text-muted-foreground">
                  <span className="flex w-6 h-6 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden>
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="line-through">{item.name}</span>
                  {item.checkedBy && <span className="text-xs">· {item.checkedBy}</span>}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!shopping && data && data.buyAgain.length > 0 && (
        <section aria-label="Buy again" className="flex flex-col gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Buy again</h2>
          <div className="flex flex-wrap gap-2">
            {data.buyAgain.map((b) => (
              <Button
                key={b.name}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => save([{ clientKey: newKey('again'), name: b.name, unit: b.unit, category: b.category, store: b.store, isStaple: b.isStaple, source: b.isStaple ? 'staple' : 'manual' }])}
              >
                <RotateCcw className="w-3 h-3" aria-hidden /> {b.name}
              </Button>
            ))}
          </div>
        </section>
      )}

      <ItemReviewDialog transcript={transcript} onClose={() => setTranscript(null)} onConfirm={confirmVoice} />
      <EditGroceryDialog item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); mutate() }} />
    </div>
  )
}

function EditGroceryDialog({ item, onClose, onSaved }: { item: GroceryRow | null; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false)
  if (!item) return null
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {item.name}</DialogTitle>
        </DialogHeader>
        <form
          className="grid grid-cols-2 gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            setSaving(true)
            const ok = await act(
              updateGrocery({
                id: item.id,
                version: item.version,
                name: String(f.get('name')),
                quantity: String(f.get('quantity') || '') || null,
                unit: String(f.get('unit') || '') || null,
                category: String(f.get('category')),
                store: String(f.get('store') || '') || null,
                notes: String(f.get('notes') || '') || null,
                requestedBy: String(f.get('requestedBy') || '') || null,
                neededBy: String(f.get('neededBy') || '') || null,
                isStaple: f.get('isStaple') === 'on',
              }),
              'Saved',
            )
            setSaving(false)
            if (ok) onSaved()
          }}
        >
          <Field label="Item" name="name" defaultValue={item.name} className="col-span-2" required />
          <Field label="Quantity" name="quantity" defaultValue={item.quantity ? String(Number(item.quantity)) : ''} inputMode="decimal" />
          <Field label="Unit" name="unit" defaultValue={item.unit ?? ''} />
          <div className="flex flex-col gap-1">
            <Label htmlFor="g-category">Aisle</Label>
            <select id="g-category" name="category" defaultValue={item.category} className="h-11 rounded-md border border-input bg-background px-3">
              {GROCERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <Field label="Store" name="store" defaultValue={item.store ?? ''} />
          <Field label="Requested by" name="requestedBy" defaultValue={item.requestedBy ?? ''} />
          <Field label="Needed by" name="neededBy" type="date" defaultValue={item.neededBy ?? ''} />
          <Field label="Notes" name="notes" defaultValue={item.notes ?? ''} className="col-span-2" />
          <label className="col-span-2 flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" name="isStaple" defaultChecked={item.isStaple} className="w-4 h-4" /> Household staple (always suggest in “Buy again”)
          </label>
          <DialogFooter className="col-span-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, name, className, ...props }: { label: string; name: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Label htmlFor={`g-${name}`}>{label}</Label>
      <Input id={`g-${name}`} name={name} className="h-11" {...props} />
    </div>
  )
}
