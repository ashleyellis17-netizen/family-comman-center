'use server'

import { and, asc, between, eq, inArray, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { events, foodPreferences, groceryItems, mealPlanEntries, pantryItems, type MealKind, type MealSlot } from '@/lib/db/schema'
import { requireHousehold } from '@/lib/household'
import { run, cleanText, cleanInt, cleanDate, cleanKey, UserError } from '@/lib/action'
import { addDays, startOfWeek, todayInTimezone, weekDates } from '@/lib/dates'
import { formatQuantity, namesMatch, normalizeUnit } from '@/lib/food'
import { suggestMeals, type SuggestionMode } from '@/lib/suggestions'
import { loadRecipes } from '@/app/actions/recipes'
import { addGroceriesForHousehold } from '@/app/actions/groceries'

const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack']
const KINDS: MealKind[] = ['recipe', 'custom', 'leftovers', 'eating_out', 'flexible']

export async function getWeekPlan(weekStart?: string) {
  return run('meals.week', async () => {
    const ctx = await requireHousehold()
    const today = todayInTimezone(ctx.timezone)
    const start = startOfWeek(cleanDate(weekStart) ?? today)
    const days = weekDates(start)
    const end = days[6]

    const [entries, recipeList, weekEvents, pantry, preferences] = await Promise.all([
      db.select().from(mealPlanEntries).where(and(eq(mealPlanEntries.householdId, ctx.householdId), between(mealPlanEntries.date, start, end))).orderBy(asc(mealPlanEntries.date), asc(mealPlanEntries.createdAt)),
      loadRecipes(ctx.householdId),
      db.select({ date: events.date, time: events.time, title: events.title }).from(events).where(and(eq(events.householdId, ctx.householdId), between(events.date, start, end))),
      db.select().from(pantryItems).where(eq(pantryItems.householdId, ctx.householdId)),
      db.select().from(foodPreferences).where(eq(foodPreferences.householdId, ctx.householdId)),
    ])

    // A day with 2+ events, or any event at/after 4 PM, is treated as a busy evening.
    const busy: Record<string, string[]> = {}
    for (const e of weekEvents) {
      const pm = /PM/i.test(e.time ?? '') && Number((e.time ?? '').split(':')[0]) % 12 >= 4
      const count = weekEvents.filter((x) => x.date === e.date).length
      if (pm || count >= 2) (busy[e.date] ??= []).push(e.title)
    }

    const quick = suggestMeals({ recipes: recipeList, pantry, preferences, today, plannedRecipeIds: entries.map((e) => e.recipeId ?? 0), mode: 'quick', limit: 3 })
    const recipeMap = Object.fromEntries(recipeList.map((r) => [r.id, { id: r.id, title: r.title, prepMinutes: r.prepMinutes, cookMinutes: r.cookMinutes, imageUrl: r.imageUrl, sourceUrl: r.sourceUrl, servings: r.servings, archived: r.archived }]))
    return { start, days, today, entries, recipes: recipeMap, busy, quick, prevWeek: addDays(start, -7), nextWeek: addDays(start, 7) }
  })
}

export async function getSuggestions(mode: SuggestionMode) {
  return run('meals.suggest', async () => {
    const ctx = await requireHousehold()
    const today = todayInTimezone(ctx.timezone)
    const [recipeList, pantry, preferences, upcoming] = await Promise.all([
      loadRecipes(ctx.householdId),
      db.select().from(pantryItems).where(eq(pantryItems.householdId, ctx.householdId)),
      db.select().from(foodPreferences).where(eq(foodPreferences.householdId, ctx.householdId)),
      db.select({ recipeId: mealPlanEntries.recipeId }).from(mealPlanEntries).where(and(eq(mealPlanEntries.householdId, ctx.householdId), between(mealPlanEntries.date, today, addDays(today, 7)))),
    ])
    return suggestMeals({ recipes: recipeList, pantry, preferences, today, plannedRecipeIds: upcoming.map((u) => u.recipeId ?? 0), mode, limit: 6 })
  })
}

export type MealInput = { date: string; slot: MealSlot; kind: MealKind; recipeId?: number | null; title?: string | null; servings?: number | string | null; notes?: string | null }

async function validateMeal(householdId: number, input: MealInput) {
  const date = cleanDate(input.date)
  if (!date) throw new UserError('Choose a date.')
  if (!SLOTS.includes(input.slot)) throw new UserError('Choose a meal slot.')
  if (!KINDS.includes(input.kind)) throw new UserError('Choose a meal type.')
  let title = cleanText(input.title, 120)
  let recipeId: number | null = null
  if (input.kind === 'recipe') {
    const list = await loadRecipes(householdId)
    const r = list.find((x) => x.id === Number(input.recipeId))
    if (!r) throw new UserError('Choose a saved recipe.')
    recipeId = r.id
    title = r.title
  }
  if (input.kind === 'leftovers' && input.recipeId) recipeId = Number(input.recipeId)
  if (!title) title = { custom: '', leftovers: 'Leftovers', eating_out: 'Eating out', flexible: 'Flexible night', recipe: '' }[input.kind] || null
  if (!title) throw new UserError('Give the meal a name.')
  return { date, slot: input.slot, kind: input.kind, recipeId, title, servings: cleanInt(input.servings, { min: 1, max: 50 }), notes: cleanText(input.notes, 300) }
}

export async function addMeal(input: MealInput) {
  return run('meals.add', async () => {
    const ctx = await requireHousehold()
    const row = await validateMeal(ctx.householdId, input)
    const [created] = await db.insert(mealPlanEntries).values({ ...row, householdId: ctx.householdId, createdBy: ctx.displayName }).returning()
    return created
  })
}

export async function updateMeal(id: number, input: MealInput) {
  return run('meals.update', async () => {
    const ctx = await requireHousehold()
    const row = await validateMeal(ctx.householdId, input)
    const [u] = await db
      .update(mealPlanEntries)
      .set({ ...row, updatedAt: new Date() })
      .where(and(eq(mealPlanEntries.id, id), eq(mealPlanEntries.householdId, ctx.householdId)))
      .returning()
    if (!u) throw new UserError('That meal was removed on another device.')
    return u
  })
}

export async function removeMeal(id: number) {
  return run('meals.remove', async () => {
    const ctx = await requireHousehold()
    const [row] = await db.delete(mealPlanEntries).where(and(eq(mealPlanEntries.id, id), eq(mealPlanEntries.householdId, ctx.householdId))).returning()
    if (!row) throw new UserError('That meal was already removed.')
    return row
  })
}

export async function restoreMeal(row: MealInput & { cookedAt?: Date | string | null }) {
  return run('meals.restore', async () => {
    const ctx = await requireHousehold()
    const valid = await validateMeal(ctx.householdId, row)
    const [created] = await db
      .insert(mealPlanEntries)
      .values({ ...valid, householdId: ctx.householdId, createdBy: ctx.displayName, cookedAt: row.cookedAt ? new Date(row.cookedAt) : null })
      .returning()
    return created
  })
}

export async function setMealCooked(id: number, cooked: boolean) {
  return run('meals.cooked', async () => {
    const ctx = await requireHousehold()
    const [u] = await db
      .update(mealPlanEntries)
      .set({ cookedAt: cooked ? new Date() : null, updatedAt: new Date() })
      .where(and(eq(mealPlanEntries.id, id), eq(mealPlanEntries.householdId, ctx.householdId)))
      .returning()
    if (!u) throw new UserError('That meal no longer exists.')
    return u
  })
}

/** Copy a week: returns a preview unless `confirmIds` is given. Skips slots that already hold the same meal. */
export async function copyWeek(input: { fromStart: string; toStart: string; confirmIds?: number[] }) {
  return run('meals.copyWeek', async () => {
    const ctx = await requireHousehold()
    const from = cleanDate(input.fromStart)
    const to = cleanDate(input.toStart)
    if (!from || !to) throw new UserError('Choose valid weeks.')
    const source = await db.select().from(mealPlanEntries).where(and(eq(mealPlanEntries.householdId, ctx.householdId), between(mealPlanEntries.date, from, addDays(from, 6))))
    const target = await db.select().from(mealPlanEntries).where(and(eq(mealPlanEntries.householdId, ctx.householdId), between(mealPlanEntries.date, to, addDays(to, 6))))
    const offset = Math.round((Date.parse(to) - Date.parse(from)) / 86400000)
    const candidates = source
      .filter((s) => s.kind !== 'leftovers')
      .map((s) => ({ sourceId: s.id, date: addDays(s.date, offset), slot: s.slot, kind: s.kind, recipeId: s.recipeId, title: s.title, servings: s.servings, notes: s.notes }))
      .filter((c) => !target.some((t) => t.date === c.date && t.slot === c.slot && t.title === c.title))
    if (!input.confirmIds) return { preview: candidates, copied: 0 }
    const chosen = candidates.filter((c) => input.confirmIds!.includes(c.sourceId))
    if (chosen.length) {
      await db.insert(mealPlanEntries).values(chosen.map(({ sourceId: _s, ...c }) => ({ ...c, householdId: ctx.householdId, createdBy: ctx.displayName })))
    }
    return { preview: [], copied: chosen.length }
  })
}

export type IngredientReviewLine = {
  key: string
  name: string
  quantity: number | null
  unit: string | null
  display: string
  forMeals: string[]
  pantry: { status: 'in_stock' | 'low' | 'out'; name: string } | null
  onList: string | null
  suggested: boolean
}

/** Gather ingredients for the chosen meals and compare them to pantry and the open grocery list. Read-only. */
export async function reviewIngredients(entryIds: number[]) {
  return run('meals.reviewIngredients', async () => {
    const ctx = await requireHousehold()
    if (!entryIds.length) return []
    const entries = await db.select().from(mealPlanEntries).where(and(eq(mealPlanEntries.householdId, ctx.householdId), inArray(mealPlanEntries.id, entryIds.slice(0, 50))))
    const recipeList = await loadRecipes(ctx.householdId)
    const pantry = await db.select().from(pantryItems).where(eq(pantryItems.householdId, ctx.householdId))
    const open = await db
      .select({ name: groceryItems.name, quantity: groceryItems.quantity, unit: groceryItems.unit })
      .from(groceryItems)
      .where(and(eq(groceryItems.householdId, ctx.householdId), eq(groceryItems.checked, false), isNull(groceryItems.deletedAt)))

    const lines = new Map<string, IngredientReviewLine>()
    for (const entry of entries) {
      const recipe = recipeList.find((r) => r.id === entry.recipeId)
      if (!recipe || entry.kind !== 'recipe') continue
      const scale = entry.servings && recipe.servings ? entry.servings / recipe.servings : 1
      for (const ing of recipe.ingredients) {
        const unit = normalizeUnit(ing.unit)
        // Only same-name + same-unit quantities are combined; anything else stays a separate line.
        const key = `${ing.name.toLowerCase()}|${unit ?? ''}`
        const qty = ing.quantity != null ? Math.round(ing.quantity * scale * 100) / 100 : null
        const existing = lines.get(key)
        if (existing) {
          existing.quantity = existing.quantity != null && qty != null ? Math.round((existing.quantity + qty) * 100) / 100 : existing.quantity ?? qty
          if (!existing.forMeals.includes(entry.title)) existing.forMeals.push(entry.title)
          existing.display = formatQuantity(existing.quantity, existing.unit)
          continue
        }
        const p = pantry.find((x) => namesMatch(x.name, ing.name))
        const o = open.find((x) => namesMatch(x.name, ing.name))
        lines.set(key, {
          key,
          name: ing.name,
          quantity: qty,
          unit,
          display: formatQuantity(qty, unit) || ing.note || '',
          forMeals: [entry.title],
          pantry: p ? { status: p.status, name: p.name } : null,
          onList: o ? `${o.quantity ? `${Number(o.quantity)}${o.unit ? ` ${o.unit}` : ''} ` : ''}${o.name}`.trim() : null,
          suggested: !o && (!p || p.status !== 'in_stock'),
        })
      }
    }
    return [...lines.values()].sort((a, b) => Number(b.suggested) - Number(a.suggested) || a.name.localeCompare(b.name))
  })
}

/** Adds exactly the lines the person chose. The batch key makes retries and double-taps safe. */
export async function addReviewedIngredients(input: { batchKey: string; lines: { key: string; name: string; quantity: number | null; unit: string | null; forMeals: string[] }[] }) {
  return run('meals.addIngredients', async () => {
    const ctx = await requireHousehold()
    const batch = cleanKey(input.batchKey)
    if (!input.lines.length) throw new UserError('Choose at least one ingredient.')
    const result = await addGroceriesForHousehold(
      ctx.householdId,
      ctx.displayName,
      input.lines.slice(0, 80).map((l) => ({
        clientKey: `${batch}:${l.key.replace(/[^\w.-]/g, '_').slice(0, 60)}`,
        name: l.name,
        quantity: l.quantity,
        unit: l.unit,
        notes: `For ${l.forMeals.slice(0, 3).join(', ')}`,
        source: 'recipe' as const,
      })),
    )
    return { added: result.added.map((a) => a.name), alreadySubmitted: result.alreadySubmitted, similar: result.similar }
  })
}
