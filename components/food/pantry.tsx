'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { act, newKey, useActionData } from '@/lib/client-actions'
import { formatQuantity, parseItemPhrase } from '@/lib/food'
import type { PantryStatus } from '@/lib/db/schema'
import { addPreference, deletePantryItems, deletePreference, listPantry, listPreferences, restorePantryItems, savePantryItem, setPantryStatus } from '@/app/actions/pantry'
import { addGroceries } from '@/app/actions/groceries'

const STATUS: { value: PantryStatus; label: string }[] = [
  { value: 'in_stock', label: 'Have' },
  { value: 'low', label: 'Low' },
  { value: 'out', label: 'Out' },
]

export function Pantry({ canEditPreferences }: { canEditPreferences: boolean }) {
  const { data: items, mutate } = useActionData('pantry', listPantry)
  const { data: prefs, mutate: mutatePrefs } = useActionData('prefs', listPreferences, { refreshInterval: 60000 })
  const [text, setText] = useState('')
  const [staple, setStaple] = useState(false)

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const p = parseItemPhrase(text)
    if (!p.name) return
    if (await act(savePantryItem({ name: p.name, quantity: p.quantity, unit: p.unit, isStaple: staple }), 'Added to pantry')) {
      setText('')
      mutate()
    }
  }

  async function changeStatus(id: number, status: PantryStatus) {
    mutate((d) => d?.map((i) => (i.id === id ? { ...i, status } : i)), { revalidate: false })
    await act(setPantryStatus([{ id, status }]))
    mutate()
  }

  async function remove(id: number) {
    const item = items?.find((i) => i.id === id)
    if (!item || !(await act(deletePantryItems([id])))) return
    mutate()
    toast(`Removed ${item.name}`, {
      action: {
        label: 'Undo',
        onClick: async () => {
          await act(restorePantryItems([{ name: item.name, quantity: item.quantity, unit: item.unit, status: item.status, category: item.category, expiresOn: item.expiresOn, isStaple: item.isStaple }]))
          mutate()
        },
      },
    })
  }

  async function restockLow() {
    const low = (items ?? []).filter((i) => i.status !== 'in_stock')
    if (!low.length) return
    const batch = newKey('restock')
    const res = await act(addGroceries(low.map((i) => ({ clientKey: `${batch}-${i.id}`, name: i.name, unit: i.unit, category: i.category, isStaple: i.isStaple, source: 'staple' as const }))))
    if (res) {
      toast.success(`Added ${res.added.length} to the grocery list`)
      if (res.similar.length) toast.info(`Already on the list: ${res.similar.map((s) => s.existing).join(', ')}`)
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const lowCount = (items ?? []).filter((i) => i.status !== 'in_stock').length

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader title="Pantry & Staples" description="What you have at home. Meal suggestions and ingredient checks use this." />

      <form onSubmit={add} className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex gap-2">
          <Label htmlFor="pantry-add" className="sr-only">Add pantry item</Label>
          <Input id="pantry-add" value={text} onChange={(e) => setText(e.target.value)} placeholder="2 lb rice" className="h-12 text-base" />
          <Button type="submit" size="lg" className="h-12 rounded-xl" disabled={!text.trim()}>
            <Plus className="w-5 h-5" aria-hidden /> Add
          </Button>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={staple} onChange={(e) => setStaple(e.target.checked)} className="w-4 h-4" /> This is a staple we always keep stocked
        </label>
      </form>

      {lowCount > 0 && (
        <Button variant="outline" className="self-start rounded-xl" onClick={restockLow}>
          <ShoppingCart className="w-4 h-4" aria-hidden /> Add {lowCount} low/out item{lowCount === 1 ? '' : 's'} to grocery list
        </Button>
      )}

      <ul className="flex flex-col gap-2" aria-label="Pantry items">
        {items?.length === 0 && <li className="text-muted-foreground text-sm">Nothing tracked yet.</li>}
        {items?.map((item) => {
          const expired = item.expiresOn && item.expiresOn < today
          return (
            <li key={item.id} className="flex flex-col gap-2 rounded-xl bg-card border border-border/50 p-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {item.name}
                  {item.isStaple && <span className="ml-2 text-xs font-bold text-primary">STAPLE</span>}
                </p>
                <p className={cn('text-xs text-muted-foreground', expired && 'text-destructive font-semibold')}>
                  {[item.category, formatQuantity(item.quantity, item.unit), item.expiresOn ? `${expired ? 'Expired' : 'Use by'} ${item.expiresOn}` : null].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex items-center gap-1" role="radiogroup" aria-label={`${item.name} status`}>
                {STATUS.map((s) => (
                  <Button
                    key={s.value}
                    role="radio"
                    aria-checked={item.status === s.value}
                    size="sm"
                    variant={item.status === s.value ? 'default' : 'outline'}
                    className="rounded-xl min-w-14"
                    onClick={() => changeStatus(item.id, s.value)}
                  >
                    {s.label}
                  </Button>
                ))}
                <Button variant="ghost" size="icon" aria-label={`Remove ${item.name}`} onClick={() => remove(item.id)}>
                  <Trash2 className="w-4 h-4" aria-hidden />
                </Button>
              </div>
            </li>
          )
        })}
      </ul>

      <section aria-label="Food preferences" className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-4">
        <div>
          <h2 className="font-bold text-foreground">Likes, dislikes & restrictions</h2>
          <p className="text-sm text-muted-foreground">Suggestions avoid dislikes and flag recipes that conflict with restrictions.</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {prefs?.map((p) => (
            <li key={p.id} className={cn('flex items-center gap-1 rounded-full border px-3 py-1 text-sm', p.kind === 'restriction' ? 'border-destructive/40 text-destructive' : 'border-border text-foreground')}>
              <span className="font-semibold">{p.person}</span> {p.kind === 'like' ? 'likes' : p.kind === 'dislike' ? 'dislikes' : 'avoids'} {p.value}
              {canEditPreferences && (
                <button type="button" aria-label={`Remove preference ${p.value}`} className="ml-1" onClick={async () => { await act(deletePreference(p.id)); mutatePrefs() }}>
                  <X className="w-3 h-3" aria-hidden />
                </button>
              )}
            </li>
          ))}
          {prefs?.length === 0 && <li className="text-sm text-muted-foreground">None yet.</li>}
        </ul>
        {canEditPreferences && (
          <form
            className="flex flex-wrap gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget
              const f = new FormData(form)
              const ok = await act(addPreference({ person: String(f.get('person')), kind: f.get('kind') as 'like' | 'dislike' | 'restriction', value: String(f.get('value')) }))
              if (ok) {
                form.reset()
                mutatePrefs()
              }
            }}
          >
            <Input name="person" aria-label="Person" placeholder="Who" className="h-11 w-28" required />
            <select name="kind" aria-label="Preference type" className="h-11 rounded-md border border-input bg-background px-3" defaultValue="dislike">
              <option value="dislike">dislikes</option>
              <option value="like">likes</option>
              <option value="restriction">can&apos;t have</option>
            </select>
            <Input name="value" aria-label="Food" placeholder="mushrooms" className="h-11 flex-1 min-w-32" required />
            <Button type="submit" variant="outline" className="h-11 rounded-xl">Add</Button>
          </form>
        )}
      </section>
    </div>
  )
}
