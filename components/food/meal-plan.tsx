'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { CheckCircle2, ChevronLeft, ChevronRight, Copy, Plus, ShoppingCart, Trash2, Zap } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { act, useActionData } from '@/lib/client-actions'
import { formatDate } from '@/lib/dates'
import { addMeal, copyWeek, getWeekPlan, removeMeal, restoreMeal, setMealCooked } from '@/app/actions/meals'
import type { MealEntryRow, MealKind, MealSlot } from '@/lib/db/schema'
import { IngredientReview } from './ingredient-review'

const SLOTS: { value: MealSlot; label: string }[] = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snack' },
]
const KIND_LABEL: Record<MealKind, string> = { recipe: 'Saved recipe', custom: 'Something else', leftovers: 'Leftovers', eating_out: 'Eating out', flexible: 'Flexible / fend for yourself' }

export function MealPlan() {
  const [week, setWeek] = useState<string | undefined>()
  const { data, error, mutate } = useActionData(`week-${week ?? 'now'}`, () => getWeekPlan(week))
  const [adding, setAdding] = useState<{ date: string; slot: MealSlot } | null>(null)
  const [review, setReview] = useState<number[] | null>(null)
  const [copyPreview, setCopyPreview] = useState<{ sourceId: number; date: string; slot: MealSlot; title: string }[] | null>(null)
  const closeReview = useCallback(() => setReview(null), [])

  async function remove(entry: MealEntryRow) {
    const row = await act(removeMeal(entry.id))
    if (!row) return
    mutate()
    toast(`Removed ${entry.title}`, {
      action: {
        label: 'Undo',
        onClick: async () => {
          await act(restoreMeal({ date: row.date, slot: row.slot as MealSlot, kind: row.kind as MealKind, recipeId: row.recipeId, title: row.title, servings: row.servings, notes: row.notes, cookedAt: row.cookedAt }))
          mutate()
        },
      },
    })
  }

  async function cooked(entry: MealEntryRow) {
    const done = !entry.cookedAt
    if (!(await act(setMealCooked(entry.id, done)))) return
    mutate()
    if (done && entry.recipeId) {
      toast.success(`Marked ${entry.title} as made`, {
        action: { label: 'Rate it', onClick: () => (window.location.href = `/recipes/${entry.recipeId}`) },
      })
    }
  }

  async function startCopy() {
    if (!data) return
    const res = await act(copyWeek({ fromStart: data.prevWeek, toStart: data.start }))
    if (res) setCopyPreview(res.preview as never)
  }

  async function confirmCopy() {
    if (!data || !copyPreview) return
    const res = await act(copyWeek({ fromStart: data.prevWeek, toStart: data.start, confirmIds: copyPreview.map((c) => c.sourceId) }))
    setCopyPreview(null)
    if (res) {
      toast.success(`Copied ${res.copied} meal${res.copied === 1 ? '' : 's'} from last week`)
      mutate()
    }
  }

  const recipeEntries = (data?.entries ?? []).filter((e) => e.kind === 'recipe' && !e.cookedAt).map((e) => e.id)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Weekly Meal Plan" description="Plan the week, then pick the ingredients you actually need." />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Previous week" onClick={() => setWeek(data?.prevWeek)} disabled={!data}><ChevronLeft className="w-4 h-4" aria-hidden /></Button>
        <p className="min-w-48 text-center font-bold text-foreground" aria-live="polite">
          {data ? `${formatDate(data.days[0], { month: 'short', day: 'numeric' })} – ${formatDate(data.days[6], { month: 'short', day: 'numeric' })}` : 'Loading…'}
        </p>
        <Button variant="outline" size="icon" aria-label="Next week" onClick={() => setWeek(data?.nextWeek)} disabled={!data}><ChevronRight className="w-4 h-4" aria-hidden /></Button>
        <Button variant="ghost" size="sm" onClick={() => setWeek(undefined)}>This week</Button>
        <div className="flex flex-wrap gap-2 md:ml-auto">
          <Button variant="outline" className="rounded-xl" onClick={startCopy} disabled={!data}><Copy className="w-4 h-4" aria-hidden /> Copy last week</Button>
          <Button className="rounded-xl" onClick={() => setReview(recipeEntries)} disabled={!recipeEntries.length}><ShoppingCart className="w-4 h-4" aria-hidden /> Groceries for this week</Button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl bg-destructive/10 text-destructive p-3 text-sm">{error.message}</p>}

      {data && data.quick.length > 0 && Object.keys(data.busy).length > 0 && (
        <aside className="rounded-2xl border border-primary/30 bg-primary/5 p-4" aria-label="Quick meal ideas for busy evenings">
          <p className="flex items-center gap-2 font-bold text-foreground"><Zap className="w-4 h-4 text-primary" aria-hidden /> Busy evenings this week — quick ideas</p>
          <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {data.quick.map((s) => <li key={s.recipeId}><Link href={`/recipes/${s.recipeId}`} className="underline">{s.title}</Link> <span className="text-muted-foreground">({s.reasons[0]})</span></li>)}
          </ul>
        </aside>
      )}

      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {data?.days.map((day) => {
          const entries = data.entries.filter((e) => e.date === day)
          const isToday = day === data.today
          return (
            <li key={day} className={cn('flex flex-col gap-2 rounded-2xl bg-card border p-3', isToday ? 'border-primary' : 'border-border/50')}>
              <div className="flex items-baseline justify-between">
                <h2 className="font-bold text-foreground">{formatDate(day)}{isToday && <span className="ml-2 text-xs text-primary">TODAY</span>}</h2>
                {data.busy[day] && <span className="text-xs font-semibold text-muted-foreground" title={data.busy[day].join(', ')}>Busy evening</span>}
              </div>
              {SLOTS.map((slot) => {
                const items = entries.filter((e) => e.slot === slot.value)
                if (!items.length && slot.value !== 'dinner') return null
                return (
                  <div key={slot.value} className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{slot.label}</p>
                    {items.map((e) => (
                      <div key={e.id} className="flex items-center gap-1 rounded-lg bg-muted/60 px-2 py-1">
                        <div className="flex-1 min-w-0">
                          {e.recipeId && e.kind === 'recipe' ? (
                            <Link href={`/recipes/${e.recipeId}`} className={cn('block truncate font-semibold text-foreground hover:underline', e.cookedAt && 'line-through text-muted-foreground')}>{e.title}</Link>
                          ) : (
                            <p className={cn('truncate font-semibold text-foreground', e.cookedAt && 'line-through text-muted-foreground')}>{e.title}</p>
                          )}
                          {e.notes && <p className="truncate text-xs text-muted-foreground">{e.notes}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="w-8 h-8" aria-label={e.cookedAt ? `Mark ${e.title} not made` : `Mark ${e.title} made`} aria-pressed={!!e.cookedAt} onClick={() => cooked(e)}>
                          <CheckCircle2 className={cn('w-4 h-4', e.cookedAt && 'text-primary')} aria-hidden />
                        </Button>
                        {e.kind === 'recipe' && !e.cookedAt && (
                          <Button variant="ghost" size="icon" className="w-8 h-8" aria-label={`Ingredients for ${e.title}`} onClick={() => setReview([e.id])}>
                            <ShoppingCart className="w-4 h-4" aria-hidden />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="w-8 h-8" aria-label={`Remove ${e.title}`} onClick={() => remove(e)}>
                          <Trash2 className="w-4 h-4" aria-hidden />
                        </Button>
                      </div>
                    ))}
                  </div>
                )
              })}
              <Button variant="ghost" size="sm" className="justify-start" onClick={() => setAdding({ date: day, slot: 'dinner' })}>
                <Plus className="w-4 h-4" aria-hidden /> Add meal
              </Button>
            </li>
          )
        })}
      </ol>

      {data && <AddMealDialog target={adding} recipes={Object.values(data.recipes).filter((r) => !r.archived)} onClose={() => setAdding(null)} onSaved={() => { setAdding(null); mutate() }} />}
      <IngredientReview entryIds={review} onClose={closeReview} />

      <Dialog open={copyPreview !== null} onOpenChange={(o) => !o && setCopyPreview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy last week</DialogTitle>
            <DialogDescription>Leftovers aren&apos;t copied, and meals already in the same slot are skipped.</DialogDescription>
          </DialogHeader>
          {copyPreview?.length === 0 ? (
            <p className="text-muted-foreground">Nothing new to copy.</p>
          ) : (
            <ul className="flex flex-col gap-1 text-sm">
              {copyPreview?.map((c) => <li key={c.sourceId}><span className="font-semibold">{formatDate(c.date)}</span> · {c.slot} · {c.title}</li>)}
            </ul>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCopyPreview(null)}>Cancel</Button>
            <Button onClick={confirmCopy} disabled={!copyPreview?.length}>Copy {copyPreview?.length ?? 0} meals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AddMealDialog({ target, recipes, onClose, onSaved }: {
  target: { date: string; slot: MealSlot } | null
  recipes: { id: number; title: string }[]
  onClose: () => void
  onSaved: () => void
}) {
  const [kind, setKind] = useState<MealKind>('recipe')
  const [saving, setSaving] = useState(false)
  return (
    <Dialog open={target !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add meal {target ? `· ${formatDate(target.date)}` : ''}</DialogTitle>
        </DialogHeader>
        {target && (
          <form
            className="flex flex-col gap-3"
            onSubmit={async (e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              setSaving(true)
              const ok = await act(addMeal({
                date: target.date,
                slot: f.get('slot') as MealSlot,
                kind,
                recipeId: kind === 'recipe' ? Number(f.get('recipeId')) : null,
                title: String(f.get('title') ?? '') || null,
                servings: String(f.get('servings') ?? '') || null,
                notes: String(f.get('notes') ?? '') || null,
              }))
              setSaving(false)
              if (ok) onSaved()
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="m-slot">Meal</Label>
                <select id="m-slot" name="slot" defaultValue={target.slot} className="h-11 rounded-md border border-input bg-background px-3">
                  {SLOTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="m-kind">Type</Label>
                <select id="m-kind" value={kind} onChange={(e) => setKind(e.target.value as MealKind)} className="h-11 rounded-md border border-input bg-background px-3">
                  {Object.entries(KIND_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            {kind === 'recipe' ? (
              recipes.length ? (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="m-recipe">Recipe</Label>
                  <select id="m-recipe" name="recipeId" required className="h-11 rounded-md border border-input bg-background px-3">
                    {recipes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                  </select>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No saved recipes yet. <Link href="/recipes" className="underline">Add one</Link> or choose another type.</p>
              )
            ) : (
              <div className="flex flex-col gap-1">
                <Label htmlFor="m-title">Name {kind !== 'custom' && '(optional)'}</Label>
                <Input id="m-title" name="title" required={kind === 'custom'} placeholder={kind === 'eating_out' ? 'Pizza night at Gino’s' : 'Tacos'} className="h-11" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label htmlFor="m-servings">Servings</Label>
                <Input id="m-servings" name="servings" inputMode="numeric" className="h-11" />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="m-notes">Notes</Label>
                <Input id="m-notes" name="notes" className="h-11" placeholder="Jaxon has practice" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={saving || (kind === 'recipe' && !recipes.length)}>Add</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
