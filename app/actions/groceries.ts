'use server'

import { and, desc, eq, gt, inArray, isNull, isNotNull, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { groceryItems, type GroceryRow } from '@/lib/db/schema'
import { requireHousehold } from '@/lib/household'
import { run, requireText, cleanText, cleanNumber, cleanDate, cleanKey, UserError } from '@/lib/action'
import { GROCERY_CATEGORIES, guessCategory, namesMatch, normalizeUnit } from '@/lib/food'

export type GroceryInput = {
  clientKey: string
  name: string
  quantity?: number | string | null
  unit?: string | null
  category?: string | null
  store?: string | null
  notes?: string | null
  requestedBy?: string | null
  neededBy?: string | null
  isStaple?: boolean
  source?: 'manual' | 'voice' | 'wishlist' | 'recipe' | 'staple'
}

export type AddResult = {
  added: GroceryRow[]
  alreadySubmitted: string[]
  similar: { name: string; existing: string }[]
}

function category(value: unknown, name: string) {
  return typeof value === 'string' && (GROCERY_CATEGORIES as readonly string[]).includes(value) ? value : guessCategory(name)
}

export async function listGroceries() {
  return run('groceries.list', async () => {
    const ctx = await requireHousehold()
    const since = new Date(Date.now() - 2 * 86400000)
    const items = await db
      .select()
      .from(groceryItems)
      .where(
        and(
          eq(groceryItems.householdId, ctx.householdId),
          isNull(groceryItems.deletedAt),
          or(eq(groceryItems.checked, false), gt(groceryItems.checkedAt, since)),
        ),
      )
      .orderBy(groceryItems.checked, desc(groceryItems.createdAt))

    // "Buy again": distinct names purchased in the last 60 days, plus marked staples.
    const recent = await db.execute<{ name: string; unit: string | null; category: string; store: string | null; isStaple: boolean; lastBought: Date }>(sql`
      select distinct on (lower("name")) "name", "unit", "category", "store", "isStaple", "checkedAt" as "lastBought"
      from grocery_items
      where "householdId" = ${ctx.householdId} and (("checked" = true and "checkedAt" > now() - interval '60 days') or "isStaple" = true)
      order by lower("name"), "checkedAt" desc nulls last
    `)
    const openNames = items.filter((i) => !i.checked).map((i) => i.name)
    const buyAgain = recent.rows
      .filter((r) => !openNames.some((n) => namesMatch(n, r.name)))
      .sort((a, b) => Number(b.isStaple) - Number(a.isStaple) || a.name.localeCompare(b.name))
      .slice(0, 24)
    return { items, buyAgain }
  })
}

/** Idempotent: retrying with the same clientKey never creates a second row. */
export async function addGroceries(inputs: GroceryInput[]) {
  return run('groceries.add', async () => {
    const ctx = await requireHousehold()
    if (!Array.isArray(inputs) || inputs.length === 0) throw new UserError('Add at least one item.')
    if (inputs.length > 60) throw new UserError('Too many items at once.')
    return addGroceriesForHousehold(ctx.householdId, ctx.displayName, inputs)
  })
}

export async function addGroceriesForHousehold(householdId: number, actor: string, inputs: GroceryInput[]): Promise<AddResult> {
  const rows = inputs.map((input) => {
    const name = requireText(input.name, 'Item name', 120)
    return {
      householdId,
      clientKey: cleanKey(input.clientKey),
      name,
      quantity: cleanNumber(input.quantity)?.toString() ?? null,
      unit: normalizeUnit(cleanText(input.unit, 30)),
      category: category(input.category, name),
      store: cleanText(input.store, 60),
      notes: cleanText(input.notes, 300),
      requestedBy: cleanText(input.requestedBy, 40) ?? actor,
      neededBy: cleanDate(input.neededBy),
      isStaple: !!input.isStaple,
      source: input.source ?? 'manual',
      addedBy: actor,
      updatedBy: actor,
    }
  })

  const existingOpen = await db
    .select({ name: groceryItems.name, quantity: groceryItems.quantity, unit: groceryItems.unit, clientKey: groceryItems.clientKey })
    .from(groceryItems)
    .where(and(eq(groceryItems.householdId, householdId), eq(groceryItems.checked, false), isNull(groceryItems.deletedAt)))

  const added = await db.insert(groceryItems).values(rows).onConflictDoNothing().returning()
  const addedKeys = new Set(added.map((a) => a.clientKey))
  const alreadySubmitted = rows.filter((r) => !addedKeys.has(r.clientKey)).map((r) => r.name)

  // Report possible duplicates; never merge rows, so different units/products stay intact.
  const similar: AddResult['similar'] = []
  for (const item of added) {
    const match = existingOpen.find((e) => e.clientKey !== item.clientKey && namesMatch(e.name, item.name))
    if (match) {
      const q = match.quantity ? `${Number(match.quantity)}${match.unit ? ` ${match.unit}` : ''} ` : ''
      similar.push({ name: item.name, existing: `${q}${match.name}`.trim() })
    }
  }
  return { added, alreadySubmitted, similar }
}

export async function updateGrocery(input: {
  id: number
  version: number
  name: string
  quantity?: number | string | null
  unit?: string | null
  category?: string | null
  store?: string | null
  notes?: string | null
  requestedBy?: string | null
  neededBy?: string | null
  isStaple?: boolean
}) {
  return run('groceries.update', async () => {
    const ctx = await requireHousehold()
    const name = requireText(input.name, 'Item name', 120)
    const [updated] = await db
      .update(groceryItems)
      .set({
        name,
        quantity: cleanNumber(input.quantity)?.toString() ?? null,
        unit: normalizeUnit(cleanText(input.unit, 30)),
        category: category(input.category, name),
        store: cleanText(input.store, 60),
        notes: cleanText(input.notes, 300),
        requestedBy: cleanText(input.requestedBy, 40),
        neededBy: cleanDate(input.neededBy),
        isStaple: !!input.isStaple,
        updatedBy: ctx.displayName,
        updatedAt: new Date(),
        version: sql`${groceryItems.version} + 1`,
      })
      .where(and(eq(groceryItems.id, input.id), eq(groceryItems.householdId, ctx.householdId), eq(groceryItems.version, input.version)))
      .returning()
    if (!updated) {
      throw new UserError('Someone else changed this item while you were editing. The latest version has been loaded — please review and save again.', 'CONFLICT')
    }
    return updated
  })
}

/** Checking only touches check fields, so it never overwrites a concurrent edit to the item details. */
export async function setGroceryChecked(id: number, checked: boolean) {
  return run('groceries.check', async () => {
    const ctx = await requireHousehold()
    const [row] = await db
      .update(groceryItems)
      .set({ checked, checkedAt: checked ? new Date() : null, checkedBy: checked ? ctx.displayName : null, updatedAt: new Date() })
      .where(and(eq(groceryItems.id, id), eq(groceryItems.householdId, ctx.householdId)))
      .returning({ id: groceryItems.id })
    if (!row) throw new UserError('That item no longer exists.')
    return true
  })
}

export async function removeGroceries(ids: number[]) {
  return run('groceries.remove', async () => {
    const ctx = await requireHousehold()
    if (!ids.length) return []
    const rows = await db
      .update(groceryItems)
      .set({ deletedAt: new Date(), updatedBy: ctx.displayName })
      .where(and(inArray(groceryItems.id, ids.slice(0, 200)), eq(groceryItems.householdId, ctx.householdId), isNull(groceryItems.deletedAt)))
      .returning({ id: groceryItems.id })
    return rows.map((r) => r.id)
  })
}

export async function clearCheckedGroceries() {
  return run('groceries.clearChecked', async () => {
    const ctx = await requireHousehold()
    const rows = await db
      .update(groceryItems)
      .set({ deletedAt: new Date(), updatedBy: ctx.displayName })
      .where(and(eq(groceryItems.householdId, ctx.householdId), eq(groceryItems.checked, true), isNull(groceryItems.deletedAt)))
      .returning({ id: groceryItems.id })
    return rows.map((r) => r.id)
  })
}

export async function restoreGroceries(ids: number[]) {
  return run('groceries.restore', async () => {
    const ctx = await requireHousehold()
    if (!ids.length) return true
    await db
      .update(groceryItems)
      .set({ deletedAt: null, updatedBy: ctx.displayName })
      .where(and(inArray(groceryItems.id, ids.slice(0, 200)), eq(groceryItems.householdId, ctx.householdId), isNotNull(groceryItems.deletedAt)))
    return true
  })
}
