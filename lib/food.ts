import 'server-only';
import { and, asc, eq, gte, isNotNull, lte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { mealPlanEntries, pantryItems, recipeRatings, recipes, type RecipeRow } from '@/lib/db/schema';
import { actorRef, type Actor } from '@/lib/household';
import { addDaysToDateString, dateInTz } from '@/lib/time';
import { MEAL_SLOTS, PANTRY_STATUSES, type FoodSnapshot, type MealSlot, type PantryStatus, type Recipe } from '@/lib/food-types';

/** Monday of the week containing `date` (YYYY-MM-DD). */
export function weekStartFor(date: string): string {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDaysToDateString(date, day === 0 ? -6 : 1 - day);
}

export function isDateString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`));
}

function toRecipe(
  r: RecipeRow,
  ratings: { avg: number | null; count: number; mine: number | null },
  history: { lastPlanned: string | null; timesCooked: number }
): Recipe {
  return {
    id: r.id,
    title: r.title,
    servings: r.servings,
    prepMinutes: r.prepMinutes,
    cookMinutes: r.cookMinutes,
    ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
    instructions: r.instructions,
    cuisine: r.cuisine,
    mainIngredient: r.mainIngredient,
    sourceUrl: r.sourceUrl,
    kidFriendly: r.kidFriendly,
    budgetFriendly: r.budgetFriendly,
    wantToTry: r.wantToTry,
    favorite: r.favorite,
    avgRating: ratings.avg,
    ratingCount: ratings.count,
    myRating: ratings.mine,
    lastPlanned: history.lastPlanned,
    timesCooked: history.timesCooked,
  };
}

export async function getFoodSnapshot(actor: Actor, requestedWeek?: string): Promise<FoodSnapshot> {
  const householdId = actor.householdId;
  const today = dateInTz(actor.timezone);
  const weekStart = weekStartFor(requestedWeek && isDateString(requestedWeek) ? requestedWeek : today);
  const weekEnd = addDaysToDateString(weekStart, 6);
  const me = actorRef(actor);

  const [recipeRows, ratingRows, historyRows, mealRows, pantryRows] = await Promise.all([
    db
      .select()
      .from(recipes)
      .where(and(eq(recipes.householdId, householdId), eq(recipes.archived, false)))
      .orderBy(asc(recipes.title)),
    db
      .select({
        recipeId: recipeRatings.recipeId,
        avg: sql<string>`avg(${recipeRatings.stars})`,
        count: sql<number>`count(*)::int`,
        mine: sql<number | null>`max(case when ${recipeRatings.userId} = ${me} then ${recipeRatings.stars} end)`,
      })
      .from(recipeRatings)
      .where(eq(recipeRatings.householdId, householdId))
      .groupBy(recipeRatings.recipeId),
    db
      .select({
        recipeId: mealPlanEntries.recipeId,
        lastPlanned: sql<string | null>`max(case when ${mealPlanEntries.date} <= ${today} then ${mealPlanEntries.date} end)`,
        timesCooked: sql<number>`count(${mealPlanEntries.cookedAt})::int`,
      })
      .from(mealPlanEntries)
      .where(and(eq(mealPlanEntries.householdId, householdId), isNotNull(mealPlanEntries.recipeId)))
      .groupBy(mealPlanEntries.recipeId),
    db
      .select()
      .from(mealPlanEntries)
      .where(
        and(
          eq(mealPlanEntries.householdId, householdId),
          gte(mealPlanEntries.date, weekStart),
          lte(mealPlanEntries.date, weekEnd)
        )
      )
      .orderBy(asc(mealPlanEntries.date), asc(mealPlanEntries.createdAt)),
    db.select().from(pantryItems).where(eq(pantryItems.householdId, householdId)).orderBy(asc(pantryItems.name)),
  ]);

  const ratingMap = new Map(ratingRows.map((r) => [r.recipeId, r]));
  const historyMap = new Map(historyRows.map((h) => [h.recipeId, h]));
  const recipeIds = new Set(recipeRows.map((r) => r.id));

  return {
    today,
    weekStart,
    viewer: { name: actor.name, canManage: actor.kind === 'user' && actor.role === 'parent' },
    recipes: recipeRows.map((r) => {
      const rating = ratingMap.get(r.id);
      const history = historyMap.get(r.id);
      return toRecipe(
        r,
        {
          avg: rating ? Math.round(Number(rating.avg) * 10) / 10 : null,
          count: rating?.count ?? 0,
          mine: rating?.mine ?? null,
        },
        { lastPlanned: history?.lastPlanned ?? null, timesCooked: history?.timesCooked ?? 0 }
      );
    }),
    meals: mealRows.map((m) => ({
      id: m.id,
      date: m.date,
      slot: (MEAL_SLOTS as readonly string[]).includes(m.slot) ? (m.slot as MealSlot) : 'dinner',
      // A recipe that was archived keeps its planned entry, shown by title only.
      kind: m.recipeId && recipeIds.has(m.recipeId) ? 'recipe' : 'custom',
      recipeId: m.recipeId && recipeIds.has(m.recipeId) ? m.recipeId : null,
      title: m.title,
      servings: m.servings,
      notes: m.notes,
      cooked: m.cookedAt !== null,
    })),
    pantry: pantryRows.map((p) => ({
      id: p.id,
      name: p.name,
      quantity: p.quantity ? String(Number(p.quantity)) : null,
      unit: p.unit,
      status: (PANTRY_STATUSES as readonly string[]).includes(p.status) ? (p.status as PantryStatus) : 'in_stock',
      category: p.category,
      expiresOn: p.expiresOn,
      isStaple: p.isStaple,
    })),
  };
}
