'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { act } from '@/lib/client-actions'
import { saveRecipe, type RecipeInput } from '@/app/actions/recipes'

type IngLine = { name: string; quantity: string; unit: string; note: string }

export type RecipeFormValue = Omit<RecipeInput, 'ingredients'> & {
  ingredients: { name: string; quantity?: number | string | null; unit?: string | null; note?: string | null }[]
}

/** Shared create/edit/review form. Imported or online recipes land here so the cook can fix them before saving. */
export function RecipeForm({ initial, recipeId, onSaved, onCancel, submitLabel = 'Save recipe' }: {
  initial?: Partial<RecipeFormValue>
  recipeId?: number
  onSaved: (id: number, existed: boolean) => void
  onCancel?: () => void
  submitLabel?: string
}) {
  const [ings, setIngs] = useState<IngLine[]>(() =>
    (initial?.ingredients?.length ? initial.ingredients : [{ name: '' }]).map((i) => ({
      name: i.name ?? '',
      quantity: i.quantity != null ? String(i.quantity) : '',
      unit: i.unit ?? '',
      note: i.note ?? '',
    })),
  )
  const [saving, setSaving] = useState(false)
  const set = (idx: number, patch: Partial<IngLine>) => setIngs((p) => p.map((l, i) => (i === idx ? { ...l, ...patch } : l)))

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const str = (k: string) => String(f.get(k) ?? '').trim() || null
    setSaving(true)
    const res = await act(
      saveRecipe(
        {
          title: String(f.get('title') ?? ''),
          sourceUrl: initial?.sourceUrl ?? null,
          sourceName: initial?.sourceName ?? null,
          externalId: initial?.externalId ?? null,
          imageUrl: initial?.imageUrl ?? null,
          servings: str('servings'),
          prepMinutes: str('prepMinutes'),
          cookMinutes: str('cookMinutes'),
          cuisine: str('cuisine'),
          mainIngredient: str('mainIngredient'),
          instructions: str('instructions'),
          tags: (str('tags') ?? '').split(',').map((t) => t.trim()).filter(Boolean),
          kidFriendly: f.get('kidFriendly') === 'on',
          budgetFriendly: f.get('budgetFriendly') === 'on',
          wantToTry: f.get('wantToTry') === 'on',
          favorite: f.get('favorite') === 'on',
          ingredients: ings.filter((i) => i.name.trim()).map((i) => ({ name: i.name, quantity: i.quantity || null, unit: i.unit || null, note: i.note || null })),
        },
        recipeId,
      ),
    )
    setSaving(false)
    if (res) onSaved(res.id, res.existed)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {initial?.sourceName && (
        <p className="text-sm text-muted-foreground">
          Source: {initial.sourceUrl ? <a href={initial.sourceUrl} target="_blank" rel="noreferrer" className="underline">{initial.sourceName}</a> : initial.sourceName}
        </p>
      )}
      <div className="flex flex-col gap-1">
        <Label htmlFor="r-title">Title</Label>
        <Input id="r-title" name="title" defaultValue={initial?.title ?? ''} required className="h-11" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <NumField label="Servings" name="servings" value={initial?.servings} />
        <NumField label="Prep (min)" name="prepMinutes" value={initial?.prepMinutes} />
        <NumField label="Cook (min)" name="cookMinutes" value={initial?.cookMinutes} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="r-cuisine">Cuisine</Label>
          <Input id="r-cuisine" name="cuisine" defaultValue={initial?.cuisine ?? ''} className="h-11" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="r-main">Main ingredient</Label>
          <Input id="r-main" name="mainIngredient" defaultValue={initial?.mainIngredient ?? ''} className="h-11" />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold mb-1">Ingredients</legend>
        {ings.map((l, i) => (
          <div key={i} className="flex gap-2">
            <Input aria-label={`Ingredient ${i + 1} quantity`} value={l.quantity} onChange={(e) => set(i, { quantity: e.target.value })} placeholder="1" className="w-16 h-10" inputMode="decimal" />
            <Input aria-label={`Ingredient ${i + 1} unit`} value={l.unit} onChange={(e) => set(i, { unit: e.target.value })} placeholder="cup" className="w-20 h-10" />
            <Input aria-label={`Ingredient ${i + 1} name`} value={l.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="flour" className="flex-1 h-10" />
            <Input aria-label={`Ingredient ${i + 1} note`} value={l.note} onChange={(e) => set(i, { note: e.target.value })} placeholder="note" className="w-28 h-10 hidden sm:block" />
            <Button type="button" variant="ghost" size="icon" aria-label={`Remove ingredient ${i + 1}`} onClick={() => setIngs((p) => p.filter((_, x) => x !== i))}>
              <Trash2 className="w-4 h-4" aria-hidden />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setIngs((p) => [...p, { name: '', quantity: '', unit: '', note: '' }])}>
          <Plus className="w-4 h-4" aria-hidden /> Ingredient
        </Button>
      </fieldset>

      <div className="flex flex-col gap-1">
        <Label htmlFor="r-steps">Instructions</Label>
        <Textarea id="r-steps" name="instructions" defaultValue={initial?.instructions ?? ''} rows={8} />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="r-tags">Tags (comma separated)</Label>
        <Input id="r-tags" name="tags" defaultValue={(initial?.tags ?? []).join(', ')} className="h-11" placeholder="weeknight, freezer-friendly" />
      </div>
      <div className="flex flex-wrap gap-4 text-sm font-medium">
        <Check name="kidFriendly" label="Kid-friendly" checked={initial?.kidFriendly} />
        <Check name="budgetFriendly" label="Budget-friendly" checked={initial?.budgetFriendly} />
        <Check name="wantToTry" label="Want to try" checked={initial?.wantToTry ?? !recipeId} />
        <Check name="favorite" label="Favorite" checked={initial?.favorite} />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : submitLabel}</Button>
      </div>
    </form>
  )
}

function NumField({ label, name, value }: { label: string; name: string; value?: number | string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={`r-${name}`}>{label}</Label>
      <Input id={`r-${name}`} name={name} defaultValue={value != null ? String(value) : ''} inputMode="numeric" className="h-11" />
    </div>
  )
}

function Check({ name, label, checked }: { name: string; label: string; checked?: boolean }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} defaultChecked={!!checked} className="w-4 h-4" /> {label}
    </label>
  )
}
