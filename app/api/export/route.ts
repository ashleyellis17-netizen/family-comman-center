import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  events,
  foodPreferences,
  groceryItems,
  householdMembers,
  householdReminders,
  households,
  mealPlanEntries,
  pantryItems,
  recipeRatings,
  recipes,
  wishlistRequests,
} from '@/lib/db/schema'
import { AuthError, requireParent } from '@/lib/household'

export const dynamic = 'force-dynamic'

export async function GET() {
  let ctx
  try {
    ctx = await requireParent()
  } catch (e) {
    const status = e instanceof AuthError && e.code === 'FORBIDDEN' ? 403 : 401
    return Response.json({ error: 'Only a signed-in parent can export household data.' }, { status })
  }
  const id = ctx.householdId
  const [household] = await db.select({ name: households.name, timezone: households.timezone, createdAt: households.createdAt }).from(households).where(eq(households.id, id))
  const [members, groceries, wishlist, recipeRows, ratings, meals, pantry, preferences, reminders, eventRows] = await Promise.all([
    db.select({ displayName: householdMembers.displayName, role: householdMembers.role, joined: householdMembers.createdAt }).from(householdMembers).where(eq(householdMembers.householdId, id)),
    db.select().from(groceryItems).where(eq(groceryItems.householdId, id)),
    db.select().from(wishlistRequests).where(eq(wishlistRequests.householdId, id)),
    db.select().from(recipes).where(eq(recipes.householdId, id)),
    db.select().from(recipeRatings).where(eq(recipeRatings.householdId, id)),
    db.select().from(mealPlanEntries).where(eq(mealPlanEntries.householdId, id)),
    db.select().from(pantryItems).where(eq(pantryItems.householdId, id)),
    db.select().from(foodPreferences).where(eq(foodPreferences.householdId, id)),
    db.select().from(householdReminders).where(eq(householdReminders.householdId, id)),
    db.select().from(events).where(eq(events.householdId, id)),
  ])
  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), household, members, groceries, wishlist, recipes: recipeRows, ratings, meals, pantry, preferences, reminders, events: eventRows },
    null,
    2,
  )
  const date = new Date().toISOString().slice(0, 10)
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="household-export-${date}.json"`,
      'Cache-Control': 'no-store',
    },
  })
}
