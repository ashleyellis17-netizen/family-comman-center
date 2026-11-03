'use server';

import { and, eq, gte, inArray, isNull, lte, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { groceryItems, mealPlanEntries, pantryItems, recipeRatings, recipes } from '@/lib/db/schema';
import { AuthError, actorRef, requireActor, requireParent, type Actor } from '@/lib/household';
import { guessCategory, normalizeName, parseIngredientText } from '@/lib/ingredients';
import { addDaysToDateString, dateInTz } from '@/lib/time';
import { GROCERY_CATEGORIES, type MutationResult } from '@/lib/grocery-types';
import { MEAL_SLOTS, PANTRY_STATUSES, type Ingredient, type ShoppingResult } from '@/lib/food-types';

const id = z.number().int().positive();
const batchKey = z.string().min(8).max(40).regex(/^[A-Za-z0-9_-]+$/);
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));
const optionalInt = (max: number) =>
  z
    .union([z.number(), z.string()])
    .optional()
    .nullable()
    .transform((v) => (v === '' || v == null ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 0 && v <= max), 'Must be a whole number');

function fail(error: unknown, scope: string): { ok: false; error: string } {
  if (error instanceof AuthError) {
    return {
      ok: false,
      error: error.code === 'forbidden' ? 'Only a parent can do that.' : 'Your session ended. Please sign in again.',
    };
  }
  console.error(`[food] ${scope} failed`, error);
  return { ok: false, error: 'Something went wrong. Your change was not saved.' };
}

async function ownedRecipe(actor: Actor, recipeId: number) {
  const [row] = await db
    .select({ id: recipes.id, title: recipes.title, ingredients: recipes.ingredients })
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.householdId, actor.householdId), eq(recipes.archived, false)));
  return row ?? null;
}

// ----- Recipes -----

const recipeFields = z.object({
  title: z.string().trim().min(1).max(120),
  ingredientsText: z.string().max(4000).default(''),
  instructions: optionalText(6000),
  servings: optionalInt(100),
  prepMinutes: optionalInt(1440),
  cookMinutes: optionalInt(1440),
  cuisine: optionalText(40),
  mainIngredient: optionalText(40),
  sourceUrl: optionalText(500).refine((v) => v === null || /^https?:\/\//i.test(v), 'Link must start with http'),
  kidFriendly: z.boolean().default(false),
  budgetFriendly: z.boolean().default(false),
  wantToTry: z.boolean().default(false),
});

export async function saveRecipe(input: { id?: number } & Record<string, unknown>): Promise<MutationResult<{ id: number }>> {
  try {
    const actor = await requireActor();
    const parsed = recipeFields.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the recipe details.' };
    const { ingredientsText, ...fields } = parsed.data;
    const values = { ...fields, ingredients: parseIngredientText(ingredientsText), updatedBy: actorRef(actor), updatedAt: new Date() };

    if (input.id !== undefined) {
      const recipeId = id.parse(input.id);
      const updated = await db
        .update(recipes)
        .set(values)
        .where(and(eq(recipes.id, recipeId), eq(recipes.householdId, actor.householdId)))
        .returning({ id: recipes.id });
      if (!updated[0]) return { ok: false, error: 'That recipe no longer exists.' };
      return { ok: true, data: updated[0] };
    }

    const [created] = await db
      .insert(recipes)
      .values({ ...values, householdId: actor.householdId, createdBy: actorRef(actor) })
      .returning({ id: recipes.id });
    return { ok: true, data: created };
  } catch (error) {
    return fail(error, 'saveRecipe');
  }
}

export async function setRecipeFavorite(recipeId: number, favorite: boolean): Promise<MutationResult> {
  try {
    const actor = await requireActor();
    const updated = await db
      .update(recipes)
      .set({ favorite: Boolean(favorite), updatedBy: actorRef(actor), updatedAt: new Date() })
      .where(and(eq(recipes.id, id.parse(recipeId)), eq(recipes.householdId, actor.householdId)))
      .returning({ id: recipes.id });
    return updated[0] ? { ok: true } : { ok: false, error: 'That recipe no longer exists.' };
  } catch (error) {
    return fail(error, 'setRecipeFavorite');
  }
}

/** One rating per person (or paired screen) per recipe. `stars = 0` clears it. */
export async function rateRecipe(recipeId: number, stars: number): Promise<MutationResult> {
  try {
    const actor = await requireActor();
    const value = z.number().int().min(0).max(5).parse(stars);
    const recipe = await ownedRecipe(actor, id.parse(recipeId));
    if (!recipe) return { ok: false, error: 'That recipe no longer exists.' };
    const me = actorRef(actor);

    if (value === 0) {
      await db
        .delete(recipeRatings)
        .where(and(eq(recipeRatings.recipeId, recipe.id), eq(recipeRatings.userId, me), eq(recipeRatings.householdId, actor.householdId)));
      return { ok: true };
    }

    await db
      .insert(recipeRatings)
      .values({ householdId: actor.householdId, recipeId: recipe.id, userId: me, raterName: actor.name, stars: value })
      .onConflictDoUpdate({
        target: [recipeRatings.recipeId, recipeRatings.userId],
        set: { stars: value, raterName: actor.name, updatedAt: new Date() },
      });
    return { ok: true };
  } catch (error) {
    return fail(error, 'rateRecipe');
  }
}

/** Archive keeps history (past plans, ratings) but hides the recipe. Parent only. */
export async function archiveRecipe(recipeId: number): Promise<MutationResult> {
  try {
    const actor = await requireParent();
    const updated = await db
      .update(recipes)
      .set({ archived: true, updatedBy: actorRef(actor), updatedAt: new Date() })
      .where(and(eq(recipes.id, id.parse(recipeId)), eq(recipes.householdId, actor.householdId)))
      .returning({ id: recipes.id });
    return updated[0] ? { ok: true } : { ok: false, error: 'That recipe no longer exists.' };
  } catch (error) {
    return fail(error, 'archiveRecipe');
  }
}

// ----- Meal plan -----

const mealFields = z.object({
  date: dateStr,
  slot: z.enum(MEAL_SLOTS),
  recipeId: id.optional().nullable(),
  title: optionalText(120),
  servings: optionalInt(100),
  notes: optionalText(300),
});

export async function planMeal(input: Record<string, unknown>): Promise<MutationResult<{ id: number }>> {
  try {
    const actor = await requireActor();
    const parsed = mealFields.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Pick a day, a meal, and a recipe or name.' };
    const { recipeId, title, ...rest } = parsed.data;

    let finalTitle = title;
    if (recipeId) {
      const recipe = await ownedRecipe(actor, recipeId);
      if (!recipe) return { ok: false, error: 'That recipe no longer exists.' };
      finalTitle = recipe.title;
    }
    if (!finalTitle) return { ok: false, error: 'Pick a recipe or type a meal name.' };

    const [row] = await db
      .insert(mealPlanEntries)
      .values({
        ...rest,
        householdId: actor.householdId,
        kind: recipeId ? 'recipe' : 'custom',
        recipeId: recipeId ?? null,
        title: finalTitle,
        createdBy: actorRef(actor),
      })
      .returning({ id: mealPlanEntries.id });
    return { ok: true, data: row };
  } catch (error) {
    return fail(error, 'planMeal');
  }
}

export async function setMealCooked(entryId: number, cooked: boolean): Promise<MutationResult> {
  try {
    const actor = await requireActor();
    const updated = await db
      .update(mealPlanEntries)
      .set({ cookedAt: cooked ? new Date() : null, updatedAt: new Date() })
      .where(and(eq(mealPlanEntries.id, id.parse(entryId)), eq(mealPlanEntries.householdId, actor.householdId)))
      .returning({ id: mealPlanEntries.id });
    return updated[0] ? { ok: true } : { ok: false, error: 'That meal is no longer planned.' };
  } catch (error) {
    return fail(error, 'setMealCooked');
  }
}

export async function removeMeal(entryId: number): Promise<MutationResult> {
  try {
    const actor = await requireActor();
    await db
      .delete(mealPlanEntries)
      .where(and(eq(mealPlanEntries.id, id.parse(entryId)), eq(mealPlanEntries.householdId, actor.householdId)));
    return { ok: true };
  } catch (error) {
    return fail(error, 'removeMeal');
  }
}

// ----- Ingredient shopping -----

/**
 * Adds ingredients to the shared grocery list, skipping anything already on the
 * open list or marked in stock in the pantry. Item keys derive from `batch`, so
 * a retried request inserts nothing twice.
 */
async function addIngredientsToList(actor: Actor, batch: string, ingredients: Ingredient[], source: 'recipe' | 'staple'): Promise<ShoppingResult> {
  const [openItems, stocked] = await Promise.all([
    db
      .select({ name: groceryItems.name })
      .from(groceryItems)
      .where(and(eq(groceryItems.householdId, actor.householdId), eq(groceryItems.checked, false), isNull(groceryItems.deletedAt))),
    db
      .select({ name: pantryItems.name })
      .from(pantryItems)
      .where(and(eq(pantryItems.householdId, actor.householdId), eq(pantryItems.status, 'in_stock'))),
  ]);
  const onList = new Set(openItems.map((i) => normalizeName(i.name)));
  const inPantry = new Set(stocked.map((i) => normalizeName(i.name)));

  const merged = new Map<string, Ingredient>();
  for (const ing of ingredients) {
    const key = normalizeName(ing.name);
    if (!key) continue;
    const existing = merged.get(key);
    if (existing && existing.quantity && ing.quantity && existing.unit === ing.unit) {
      existing.quantity = String(Math.round((Number(existing.quantity) + Number(ing.quantity)) * 100) / 100);
    } else if (!existing) {
      merged.set(key, { ...ing });
    }
  }

  const added: string[] = [];
  const skipped: string[] = [];
  const rows: (typeof groceryItems.$inferInsert)[] = [];
  let index = 0;
  for (const [key, ing] of merged) {
    index++;
    if (onList.has(key) || inPantry.has(key)) {
      skipped.push(ing.name);
      continue;
    }
    const qty = ing.quantity && /^\d{1,4}(\.\d{1,2})?$/.test(ing.quantity) && Number(ing.quantity) > 0 ? ing.quantity : null;
    rows.push({
      householdId: actor.householdId,
      clientKey: `${batch}-${index}`,
      name: ing.name.slice(0, 80),
      quantity: qty,
      unit: qty ? ing.unit : null,
      category: guessCategory(ing.name),
      source,
      requestedBy: actor.name,
      addedBy: actorRef(actor),
      updatedBy: actorRef(actor),
    });
    added.push(ing.name);
  }
  if (rows.length) await db.insert(groceryItems).values(rows).onConflictDoNothing();
  return { added, skipped };
}

export async function shopForRecipe(recipeId: number, batch: string): Promise<MutationResult<ShoppingResult>> {
  try {
    const actor = await requireActor();
    const recipe = await ownedRecipe(actor, id.parse(recipeId));
    if (!recipe) return { ok: false, error: 'That recipe no longer exists.' };
    if (!recipe.ingredients.length) return { ok: false, error: 'This recipe has no ingredients yet. Edit it to add some.' };
    return { ok: true, data: await addIngredientsToList(actor, batchKey.parse(batch), recipe.ingredients, 'recipe') };
  } catch (error) {
    return fail(error, 'shopForRecipe');
  }
}

/** Ingredients for every not-yet-cooked recipe meal from today through the end of the week. */
export async function shopForWeek(weekStart: string, batch: string): Promise<MutationResult<ShoppingResult & { meals: number }>> {
  try {
    const actor = await requireActor();
    const start = dateStr.parse(weekStart);
    const today = dateInTz(actor.timezone);
    const from = start > today ? start : today;
    const to = addDaysToDateString(start, 6);

    const entries = await db
      .select({ recipeId: mealPlanEntries.recipeId })
      .from(mealPlanEntries)
      .where(
        and(
          eq(mealPlanEntries.householdId, actor.householdId),
          gte(mealPlanEntries.date, from),
          lte(mealPlanEntries.date, to),
          isNull(mealPlanEntries.cookedAt),
          sql`${mealPlanEntries.recipeId} is not null`
        )
      );
    const ids = entries.map((e) => e.recipeId!).filter(Boolean);
    if (!ids.length) return { ok: false, error: 'No upcoming recipe meals this week to shop for.' };

    const recipeRows = await db
      .select({ id: recipes.id, ingredients: recipes.ingredients })
      .from(recipes)
      .where(and(eq(recipes.householdId, actor.householdId), inArray(recipes.id, [...new Set(ids)])));
    const byId = new Map(recipeRows.map((r) => [r.id, r.ingredients]));
    // A recipe planned twice contributes its ingredients twice.
    const ingredients = ids.flatMap((rid) => byId.get(rid) ?? []);
    if (!ingredients.length) return { ok: false, error: 'The planned recipes have no ingredients listed yet.' };

    const result = await addIngredientsToList(actor, batchKey.parse(batch), ingredients, 'recipe');
    return { ok: true, data: { ...result, meals: ids.length } };
  } catch (error) {
    return fail(error, 'shopForWeek');
  }
}

// ----- Pantry -----

const pantryFields = z.object({
  name: z.string().trim().min(1).max(80),
  quantity: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => (v === '' || v == null ? null : String(v)))
    .refine((v) => v === null || (/^\d{1,4}(\.\d{1,2})?$/.test(v) && Number(v) >= 0), 'Quantity must be a number'),
  unit: optionalText(20),
  status: z.enum(PANTRY_STATUSES).default('in_stock'),
  category: z.enum(GROCERY_CATEGORIES).default('Pantry'),
  expiresOn: dateStr.optional().nullable().or(z.literal('')).transform((v) => (v ? v : null)),
  isStaple: z.boolean().default(false),
});

export async function savePantryItem(input: { id?: number } & Record<string, unknown>): Promise<MutationResult<{ id: number }>> {
  try {
    const actor = await requireActor();
    const parsed = pantryFields.safeParse(input);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the item details.' };
    const values = { ...parsed.data, updatedBy: actorRef(actor), updatedAt: new Date() };

    if (input.id !== undefined) {
      const updated = await db
        .update(pantryItems)
        .set(values)
        .where(and(eq(pantryItems.id, id.parse(input.id)), eq(pantryItems.householdId, actor.householdId)))
        .returning({ id: pantryItems.id });
      return updated[0] ? { ok: true, data: updated[0] } : { ok: false, error: 'That item no longer exists.' };
    }

    const [created] = await db
      .insert(pantryItems)
      .values({ ...values, householdId: actor.householdId })
      .returning({ id: pantryItems.id });
    return { ok: true, data: created };
  } catch (error) {
    return fail(error, 'savePantryItem');
  }
}

export async function setPantryStatus(itemId: number, status: string): Promise<MutationResult> {
  try {
    const actor = await requireActor();
    const value = z.enum(PANTRY_STATUSES).parse(status);
    const updated = await db
      .update(pantryItems)
      .set({ status: value, updatedBy: actorRef(actor), updatedAt: new Date() })
      .where(and(eq(pantryItems.id, id.parse(itemId)), eq(pantryItems.householdId, actor.householdId)))
      .returning({ id: pantryItems.id });
    return updated[0] ? { ok: true } : { ok: false, error: 'That item no longer exists.' };
  } catch (error) {
    return fail(error, 'setPantryStatus');
  }
}

export async function deletePantryItem(itemId: number): Promise<MutationResult> {
  try {
    const actor = await requireActor();
    await db.delete(pantryItems).where(and(eq(pantryItems.id, id.parse(itemId)), eq(pantryItems.householdId, actor.householdId)));
    return { ok: true };
  } catch (error) {
    return fail(error, 'deletePantryItem');
  }
}

/** Puts every low or out pantry item on the grocery list. */
export async function restockPantry(batch: string, itemId?: number): Promise<MutationResult<ShoppingResult>> {
  try {
    const actor = await requireActor();
    const rows = await db
      .select({ name: pantryItems.name })
      .from(pantryItems)
      .where(
        and(
          eq(pantryItems.householdId, actor.householdId),
          itemId !== undefined ? eq(pantryItems.id, id.parse(itemId)) : inArray(pantryItems.status, ['low', 'out'])
        )
      );
    if (!rows.length) return { ok: false, error: 'Nothing in the pantry is running low.' };
    const ingredients = rows.map((r) => ({ name: r.name, quantity: null, unit: null }));
    return { ok: true, data: await addIngredientsToList(actor, batchKey.parse(batch), ingredients, 'staple') };
  } catch (error) {
    return fail(error, 'restockPantry');
  }
}
