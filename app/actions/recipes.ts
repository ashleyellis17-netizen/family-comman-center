'use server'

import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { recipeRatings, recipes, type Ingredient } from '@/lib/db/schema'
import { requireHousehold, requireParent } from '@/lib/household'
import { run, requireText, cleanText, cleanInt, cleanNumber, UserError } from '@/lib/action'
import { importRecipeUrl, searchMealDb, type RecipeDraft } from '@/lib/recipe-sources'
import { UnsafeUrlError } from '@/lib/safe-fetch'
import { normalizeUnit } from '@/lib/food'

export type RecipeSummary = Awaited<ReturnType<typeof loadRecipes>>[number]

export async function loadRecipes(householdId: number) {
  const rows = await db.execute<{
    id: number
    avgRating: string | null
    ratingCount: number
    lastCooked: string | null
    timesCooked: number
  }>(sql`
    select r.id,
      (select round(avg(stars)::numeric, 1) from recipe_ratings rr where rr."recipeId" = r.id) as "avgRating",
      (select count(*)::int from recipe_ratings rr where rr."recipeId" = r.id) as "ratingCount",
      (select max(m."date") from meal_plan_entries m where m."recipeId" = r.id and m."cookedAt" is not null and m."householdId" = r."householdId") as "lastCooked",
      (select count(*)::int from meal_plan_entries m where m."recipeId" = r.id and m."cookedAt" is not null and m."householdId" = r."householdId") as "timesCooked"
    from recipes r where r."householdId" = ${householdId}
  `)
  const stats = new Map(rows.rows.map((r) => [r.id, r]))
  const list = await db.select().from(recipes).where(eq(recipes.householdId, householdId)).orderBy(desc(recipes.updatedAt))
  return list.map((r) => {
    const s = stats.get(r.id)
    return {
      ...r,
      avgRating: s?.avgRating ? Number(s.avgRating) : null,
      ratingCount: s?.ratingCount ?? 0,
      lastCooked: s?.lastCooked ?? null,
      timesCooked: s?.timesCooked ?? 0,
    }
  })
}

export async function listRecipes() {
  return run('recipes.list', async () => {
    const ctx = await requireHousehold()
    return loadRecipes(ctx.householdId)
  })
}

export async function getRecipe(id: number) {
  return run('recipes.get', async () => {
    const ctx = await requireHousehold()
    const all = await loadRecipes(ctx.householdId)
    const recipe = all.find((r) => r.id === id)
    if (!recipe) throw new UserError('Recipe not found.', 'NOT_FOUND')
    const ratings = await db
      .select({ id: recipeRatings.id, userId: recipeRatings.userId, raterName: recipeRatings.raterName, stars: recipeRatings.stars, note: recipeRatings.note, updatedAt: recipeRatings.updatedAt })
      .from(recipeRatings)
      .where(and(eq(recipeRatings.recipeId, id), eq(recipeRatings.householdId, ctx.householdId)))
      .orderBy(desc(recipeRatings.updatedAt))
    return { recipe, ratings, me: ctx.userId, canDelete: ctx.role === 'parent', canEdit: ctx.role !== 'display' }
  })
}

export type RecipeInput = {
  title: string
  sourceUrl?: string | null
  sourceName?: string | null
  externalId?: string | null
  imageUrl?: string | null
  servings?: number | string | null
  prepMinutes?: number | string | null
  cookMinutes?: number | string | null
  ingredients: { name: string; quantity?: number | string | null; unit?: string | null; note?: string | null }[]
  instructions?: string | null
  tags?: string[]
  cuisine?: string | null
  mainIngredient?: string | null
  kidFriendly?: boolean
  budgetFriendly?: boolean
  wantToTry?: boolean
  favorite?: boolean
}

function cleanUrl(v: unknown) {
  const s = cleanText(v, 600)
  if (!s) return null
  try {
    const u = new URL(s)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}

function toRow(input: RecipeInput) {
  const ingredients: Ingredient[] = (input.ingredients ?? [])
    .slice(0, 80)
    .map((i) => ({
      name: cleanText(i.name, 120) ?? '',
      quantity: cleanNumber(i.quantity),
      unit: normalizeUnit(cleanText(i.unit, 30)),
      note: cleanText(i.note, 120),
    }))
    .filter((i) => i.name)
  return {
    title: requireText(input.title, 'Recipe title', 160),
    sourceUrl: cleanUrl(input.sourceUrl),
    sourceName: cleanText(input.sourceName, 120),
    externalId: cleanText(input.externalId, 80),
    imageUrl: cleanUrl(input.imageUrl),
    servings: cleanInt(input.servings, { min: 1, max: 100 }),
    prepMinutes: cleanInt(input.prepMinutes, { min: 0, max: 2000 }),
    cookMinutes: cleanInt(input.cookMinutes, { min: 0, max: 2000 }),
    ingredients,
    instructions: cleanText(input.instructions?.replace(/\r\n/g, '\n'), 20000)?.length ? input.instructions!.replace(/\r\n/g, '\n').trim().slice(0, 20000) : null,
    tags: (input.tags ?? []).map((t) => cleanText(t, 30)).filter((t): t is string => !!t).slice(0, 12),
    cuisine: cleanText(input.cuisine, 60),
    mainIngredient: cleanText(input.mainIngredient, 60),
    kidFriendly: !!input.kidFriendly,
    budgetFriendly: !!input.budgetFriendly,
    wantToTry: !!input.wantToTry,
    favorite: !!input.favorite,
  }
}

export async function saveRecipe(input: RecipeInput, id?: number) {
  return run('recipes.save', async () => {
    const ctx = await requireHousehold()
    if (ctx.role === 'display') throw new UserError('Recipes are edited from a family member or parent account.')
    const row = toRow(input)
    if (id) {
      const [updated] = await db
        .update(recipes)
        .set({ ...row, updatedBy: ctx.displayName, updatedAt: new Date() })
        .where(and(eq(recipes.id, id), eq(recipes.householdId, ctx.householdId)))
        .returning({ id: recipes.id })
      if (!updated) throw new UserError('Recipe not found.')
      return { id: updated.id, existed: false }
    }
    if (row.externalId) {
      const [existing] = await db
        .select({ id: recipes.id })
        .from(recipes)
        .where(and(eq(recipes.householdId, ctx.householdId), eq(recipes.externalId, row.externalId)))
      if (existing) return { id: existing.id, existed: true }
    }
    const [created] = await db
      .insert(recipes)
      .values({ ...row, householdId: ctx.householdId, createdBy: ctx.displayName, updatedBy: ctx.displayName })
      .returning({ id: recipes.id })
    return { id: created.id, existed: false }
  })
}

export async function setRecipeFlags(id: number, flags: { favorite?: boolean; wantToTry?: boolean; archived?: boolean }) {
  return run('recipes.flags', async () => {
    const ctx = await requireHousehold()
    if (flags.archived !== undefined && ctx.role !== 'parent') throw new UserError('Only a parent can archive recipes.')
    const set: Partial<typeof recipes.$inferInsert> = { updatedAt: new Date(), updatedBy: ctx.displayName }
    if (flags.favorite !== undefined) set.favorite = flags.favorite
    if (flags.wantToTry !== undefined) set.wantToTry = flags.wantToTry
    if (flags.archived !== undefined) set.archived = flags.archived
    await db.update(recipes).set(set).where(and(eq(recipes.id, id), eq(recipes.householdId, ctx.householdId)))
    return true
  })
}

export async function deleteRecipe(id: number) {
  return run('recipes.delete', async () => {
    const ctx = await requireParent()
    await db.delete(recipeRatings).where(and(eq(recipeRatings.recipeId, id), eq(recipeRatings.householdId, ctx.householdId)))
    const rows = await db.delete(recipes).where(and(eq(recipes.id, id), eq(recipes.householdId, ctx.householdId))).returning({ id: recipes.id })
    if (!rows.length) throw new UserError('Recipe not found.')
    return true
  })
}

export async function rateRecipe(input: { recipeId: number; stars: number; note?: string | null }) {
  return run('recipes.rate', async () => {
    const ctx = await requireHousehold()
    if (ctx.role === 'display') throw new UserError('Ratings are personal — sign in on your own device to rate.')
    const stars = cleanInt(input.stars, { min: 1, max: 5 })
    if (!stars) throw new UserError('Choose 1 to 5 stars.')
    const [recipe] = await db.select({ id: recipes.id }).from(recipes).where(and(eq(recipes.id, input.recipeId), eq(recipes.householdId, ctx.householdId)))
    if (!recipe) throw new UserError('Recipe not found.')
    await db
      .insert(recipeRatings)
      .values({ householdId: ctx.householdId, recipeId: recipe.id, userId: ctx.userId, raterName: ctx.displayName, stars, note: cleanText(input.note, 300) })
      .onConflictDoUpdate({
        target: [recipeRatings.recipeId, recipeRatings.userId],
        set: { stars, note: cleanText(input.note, 300), raterName: ctx.displayName, updatedAt: new Date() },
      })
    return true
  })
}

export async function searchOnlineRecipes(input: { query?: string; cuisine?: string; mainIngredient?: string }) {
  return run('recipes.search', async () => {
    await requireHousehold()
    const query = cleanText(input.query, 60) ?? undefined
    const cuisine = cleanText(input.cuisine, 40) ?? undefined
    const mainIngredient = cleanText(input.mainIngredient, 40) ?? undefined
    if (!query && !cuisine && !mainIngredient) throw new UserError('Type a dish or choose a cuisine or main ingredient.')
    try {
      return await searchMealDb({ query, cuisine, mainIngredient })
    } catch (e) {
      console.error('[recipes.search] provider failure', e instanceof Error ? e.message : '')
      throw new UserError('The online recipe service is not responding right now. Your saved recipes still work — try again in a minute.', 'PROVIDER_DOWN')
    }
  })
}

export async function importRecipeFromUrl(url: string): Promise<{ ok: true; data: RecipeDraft } | { ok: false; error: string; code?: string }> {
  return run('recipes.import', async () => {
    await requireHousehold()
    const target = requireText(url, 'Link', 600)
    try {
      return await importRecipeUrl(target)
    } catch (e) {
      if (e instanceof UnsafeUrlError) throw new UserError(e.message, 'UNSAFE_URL')
      const msg = e instanceof Error ? e.message : ''
      console.error('[recipes.import] failed', msg.slice(0, 120))
      throw new UserError(
        msg.startsWith('No recipe data') ? 'That page does not include readable recipe details. You can enter it manually instead.' : `The recipe could not be imported (${msg || 'unknown error'}). You can enter it manually instead.`,
        'IMPORT_FAILED',
      )
    }
  })
}
