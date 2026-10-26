'use server'

import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/lib/db'
import { foodPreferences, pantryItems, type PantryStatus } from '@/lib/db/schema'
import { requireHousehold } from '@/lib/household'
import { run, requireText, cleanText, cleanNumber, cleanDate, UserError } from '@/lib/action'
import { GROCERY_CATEGORIES, guessCategory, namesMatch, normalizeUnit } from '@/lib/food'

const STATUSES: PantryStatus[] = ['in_stock', 'low', 'out']

export async function listPantry() {
  return run('pantry.list', async () => {
    const ctx = await requireHousehold()
    return db.select().from(pantryItems).where(eq(pantryItems.householdId, ctx.householdId)).orderBy(asc(pantryItems.category), asc(pantryItems.name))
  })
}

export type PantryInput = {
  name: string
  quantity?: number | string | null
  unit?: string | null
  status?: PantryStatus
  category?: string | null
  expiresOn?: string | null
  isStaple?: boolean
}

function toRow(input: PantryInput) {
  const name = requireText(input.name, 'Item name', 120)
  return {
    name,
    quantity: cleanNumber(input.quantity)?.toString() ?? null,
    unit: normalizeUnit(cleanText(input.unit, 30)),
    status: STATUSES.includes(input.status as PantryStatus) ? (input.status as PantryStatus) : 'in_stock',
    category: typeof input.category === 'string' && (GROCERY_CATEGORIES as readonly string[]).includes(input.category) ? input.category : guessCategory(name),
    expiresOn: cleanDate(input.expiresOn),
    isStaple: !!input.isStaple,
  }
}

export async function savePantryItem(input: PantryInput, id?: number) {
  return run('pantry.save', async () => {
    const ctx = await requireHousehold()
    const row = toRow(input)
    if (id) {
      const [u] = await db
        .update(pantryItems)
        .set({ ...row, updatedBy: ctx.displayName, updatedAt: new Date() })
        .where(and(eq(pantryItems.id, id), eq(pantryItems.householdId, ctx.householdId)))
        .returning()
      if (!u) throw new UserError('That pantry item no longer exists.')
      return u
    }
    const existing = await db.select().from(pantryItems).where(eq(pantryItems.householdId, ctx.householdId))
    const dup = existing.find((e) => namesMatch(e.name, row.name) && (e.unit ?? null) === (row.unit ?? null))
    if (dup) throw new UserError(`"${dup.name}" is already in the pantry. Edit that item instead.`, 'DUPLICATE')
    const [created] = await db.insert(pantryItems).values({ ...row, householdId: ctx.householdId, updatedBy: ctx.displayName }).returning()
    return created
  })
}

export async function setPantryStatus(updates: { id: number; status: PantryStatus }[]) {
  return run('pantry.status', async () => {
    const ctx = await requireHousehold()
    for (const u of updates.slice(0, 80)) {
      if (!STATUSES.includes(u.status)) continue
      await db
        .update(pantryItems)
        .set({ status: u.status, updatedBy: ctx.displayName, updatedAt: new Date() })
        .where(and(eq(pantryItems.id, u.id), eq(pantryItems.householdId, ctx.householdId)))
    }
    return true
  })
}

export async function deletePantryItems(ids: number[]) {
  return run('pantry.delete', async () => {
    const ctx = await requireHousehold()
    if (!ids.length) return []
    return db.delete(pantryItems).where(and(inArray(pantryItems.id, ids.slice(0, 100)), eq(pantryItems.householdId, ctx.householdId))).returning()
  })
}

export async function restorePantryItems(rows: PantryInput[]) {
  return run('pantry.restore', async () => {
    const ctx = await requireHousehold()
    if (!rows.length) return true
    await db.insert(pantryItems).values(rows.slice(0, 100).map((r) => ({ ...toRow(r), householdId: ctx.householdId, updatedBy: ctx.displayName })))
    return true
  })
}

// --- Family food preferences ---------------------------------------------

export async function listPreferences() {
  return run('prefs.list', async () => {
    const ctx = await requireHousehold()
    return db.select().from(foodPreferences).where(eq(foodPreferences.householdId, ctx.householdId)).orderBy(asc(foodPreferences.person), asc(foodPreferences.kind))
  })
}

export async function addPreference(input: { person: string; kind: 'dislike' | 'restriction' | 'like'; value: string }) {
  return run('prefs.add', async () => {
    const ctx = await requireHousehold()
    if (ctx.role === 'display') throw new UserError('Preferences are set from a family member or parent account.')
    if (!['dislike', 'restriction', 'like'].includes(input.kind)) throw new UserError('Unknown preference type.')
    const [row] = await db
      .insert(foodPreferences)
      .values({ householdId: ctx.householdId, person: requireText(input.person, 'Person', 40), kind: input.kind, value: requireText(input.value, 'Food or restriction', 80), createdBy: ctx.displayName })
      .returning()
    return row
  })
}

export async function deletePreference(id: number) {
  return run('prefs.delete', async () => {
    const ctx = await requireHousehold()
    if (ctx.role === 'display') throw new UserError('Preferences are set from a family member or parent account.')
    await db.delete(foodPreferences).where(and(eq(foodPreferences.id, id), eq(foodPreferences.householdId, ctx.householdId)))
    return true
  })
}
