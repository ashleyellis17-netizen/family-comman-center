'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Archive, CalendarPlus, Heart, Pencil, Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { act, useActionData } from '@/lib/client-actions'
import { formatQuantity } from '@/lib/food'
import { deleteRecipe, getRecipe, rateRecipe, setRecipeFlags } from '@/app/actions/recipes'
import { addMeal } from '@/app/actions/meals'
import type { MealSlot } from '@/lib/db/schema'
import { RecipeForm } from './recipe-form'

export function RecipeDetail({ id }: { id: number }) {
  const router = useRouter()
  const { data, error, mutate } = useActionData(`recipe-${id}`, () => getRecipe(id), { refreshInterval: 60000 })
  const [editing, setEditing] = useState(false)
  const [planning, setPlanning] = useState(false)
  const [scale, setScale] = useState(1)

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="text-destructive">{error.message}</p>
        <Link href="/recipes" className="underline">Back to recipes</Link>
      </div>
    )
  }
  if (!data) return <p className="text-muted-foreground">Loading recipe…</p>

  const { recipe: r, ratings, me, canDelete, canEdit } = data
  const mine = ratings.find((x) => x.userId === me)
  const total = r.prepMinutes == null && r.cookMinutes == null ? null : (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0)

  async function flag(flags: Parameters<typeof setRecipeFlags>[1]) {
    if (await act(setRecipeFlags(id, flags))) mutate()
  }

  return (
    <article className="flex flex-col gap-6 max-w-3xl">
      <Link href="/recipes" className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" aria-hidden /> Recipes
      </Link>

      {r.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- remote recipe images
        <img src={r.imageUrl} alt={r.title} className="h-56 w-full rounded-2xl object-cover" />
      )}

      <header className="flex flex-col gap-2">
        <h1 className="cozyla-heading text-foreground text-balance">{r.title}</h1>
        <p className="text-sm text-muted-foreground">
          {[
            total != null ? `${total} min` : null,
            r.servings ? `Serves ${r.servings}` : null,
            r.cuisine,
            r.avgRating != null ? `${r.avgRating} stars from ${r.ratingCount}` : 'Not rated yet',
            r.timesCooked ? `Made ${r.timesCooked}× · last ${r.lastCooked}` : 'Never made',
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {r.sourceName && (
          <p className="text-sm text-muted-foreground">
            From {r.sourceUrl ? <a href={r.sourceUrl} target="_blank" rel="noreferrer" className="underline">{r.sourceName}</a> : r.sourceName}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={() => setPlanning(true)} className="rounded-xl"><CalendarPlus className="w-4 h-4" aria-hidden /> Plan it</Button>
          {canEdit && (
            <>
              <Button variant={r.favorite ? 'default' : 'outline'} className="rounded-xl" aria-pressed={r.favorite} onClick={() => flag({ favorite: !r.favorite })}>
                <Heart className="w-4 h-4" aria-hidden /> {r.favorite ? 'Favorite' : 'Add to favorites'}
              </Button>
              <Button variant="outline" className="rounded-xl" aria-pressed={r.wantToTry} onClick={() => flag({ wantToTry: !r.wantToTry })}>
                {r.wantToTry ? 'Remove from Want to try' : 'Want to try'}
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setEditing(true)}><Pencil className="w-4 h-4" aria-hidden /> Edit</Button>
            </>
          )}
          {canDelete && (
            <>
              <Button variant="ghost" className="rounded-xl" onClick={() => flag({ archived: !r.archived })}>
                <Archive className="w-4 h-4" aria-hidden /> {r.archived ? 'Unarchive' : 'Archive'}
              </Button>
              <Button
                variant="ghost"
                className="rounded-xl text-destructive"
                onClick={async () => {
                  if (!confirm(`Delete "${r.title}" and its ratings? Archive instead if you might want it later.`)) return
                  if (await act(deleteRecipe(id), 'Recipe deleted')) router.push('/recipes')
                }}
              >
                <Trash2 className="w-4 h-4" aria-hidden /> Delete
              </Button>
            </>
          )}
        </div>
      </header>

      <section aria-labelledby="ing-h" className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 id="ing-h" className="font-bold text-foreground">Ingredients</h2>
          <div className="flex items-center gap-1" role="group" aria-label="Scale recipe">
            {[0.5, 1, 2].map((s) => (
              <Button key={s} size="sm" variant={scale === s ? 'default' : 'outline'} onClick={() => setScale(s)} aria-pressed={scale === s}>
                {s === 0.5 ? '½×' : `${s}×`}
              </Button>
            ))}
          </div>
        </div>
        <ul className="flex flex-col gap-1">
          {r.ingredients.map((i, idx) => (
            <li key={idx} className="text-foreground">
              <span className="font-semibold text-primary">{formatQuantity(i.quantity != null ? i.quantity * scale : null, i.unit)}</span> {i.name}
              {i.note && <span className="text-muted-foreground"> — {i.note}</span>}
            </li>
          ))}
          {r.ingredients.length === 0 && <li className="text-muted-foreground">No ingredients listed.</li>}
        </ul>
      </section>

      {r.instructions && (
        <section aria-labelledby="steps-h" className="flex flex-col gap-2">
          <h2 id="steps-h" className="font-bold text-foreground">Instructions</h2>
          <ol className="flex flex-col gap-3 list-decimal pl-5 leading-relaxed text-foreground">
            {r.instructions.split(/\n+/).filter((s) => s.trim()).map((s, i) => <li key={i}>{s.replace(/^\s*(step\s*)?\d+[.)]\s*/i, '')}</li>)}
          </ol>
        </section>
      )}

      <section aria-labelledby="rate-h" className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-4">
        <h2 id="rate-h" className="font-bold text-foreground">Ratings</h2>
        {canEdit && <RateForm recipeId={id} current={mine?.stars ?? 0} note={mine?.note ?? ''} onSaved={() => mutate()} />}
        <ul className="flex flex-col gap-1 text-sm">
          {ratings.map((x) => (
            <li key={x.id} className="text-foreground">
              <span className="font-semibold">{x.raterName}</span> · {'★'.repeat(x.stars)}{'☆'.repeat(5 - x.stars)}
              {x.note && <span className="text-muted-foreground"> — {x.note}</span>}
            </li>
          ))}
          {ratings.length === 0 && <li className="text-muted-foreground">No ratings yet.</li>}
        </ul>
      </section>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit recipe</DialogTitle></DialogHeader>
          <RecipeForm initial={r} recipeId={id} onSaved={() => { setEditing(false); mutate() }} onCancel={() => setEditing(false)} />
        </DialogContent>
      </Dialog>
      <PlanDialog open={planning} onClose={() => setPlanning(false)} recipeId={id} servings={r.servings} />
    </article>
  )
}

function RateForm({ recipeId, current, note, onSaved }: { recipeId: number; current: number; note: string; onSaved: () => void }) {
  const [stars, setStars] = useState(current)
  const [text, setText] = useState(note)
  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={async (e) => {
        e.preventDefault()
        if (await act(rateRecipe({ recipeId, stars, note: text }), 'Rating saved')) onSaved()
      }}
    >
      <div role="radiogroup" aria-label="Your rating" className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setStars(n)} className="p-1">
            <Star className={cn('w-7 h-7', n <= stars ? 'fill-primary text-primary' : 'text-muted-foreground')} aria-hidden />
          </button>
        ))}
      </div>
      <Label htmlFor="rate-note" className="sr-only">Note</Label>
      <Input id="rate-note" value={text} onChange={(e) => setText(e.target.value)} placeholder="Less salt next time" className="h-10 flex-1 min-w-40" />
      <Button type="submit" size="sm" disabled={!stars}>Save rating</Button>
    </form>
  )
}

function PlanDialog({ open, onClose, recipeId, servings }: { open: boolean; onClose: () => void; recipeId: number; servings: number | null }) {
  const [saving, setSaving] = useState(false)
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add to meal plan</DialogTitle></DialogHeader>
        <form
          className="grid grid-cols-2 gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            setSaving(true)
            const ok = await act(addMeal({ date: String(f.get('date')), slot: f.get('slot') as MealSlot, kind: 'recipe', recipeId, servings: String(f.get('servings') || '') || null }), 'Added to the meal plan')
            setSaving(false)
            if (ok) onClose()
          }}
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="plan-date">Date</Label>
            <Input id="plan-date" name="date" type="date" required className="h-11" />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="plan-slot">Meal</Label>
            <select id="plan-slot" name="slot" defaultValue="dinner" className="h-11 rounded-md border border-input bg-background px-3">
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="plan-servings">Servings</Label>
            <Input id="plan-servings" name="servings" defaultValue={servings ?? ''} inputMode="numeric" className="h-11" />
          </div>
          <DialogFooter className="col-span-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
