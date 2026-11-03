import 'server-only';
import { and, asc, desc, eq, gt, inArray, isNull, or, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { groceryItems, wishlistRequests, type GroceryRow, type WishlistRow } from '@/lib/db/schema';
import { actorRef, type Actor } from '@/lib/household';
import type { GroceryItem, GrocerySnapshot, WishlistItem } from '@/lib/grocery-types';

export function toGroceryItem(r: GroceryRow): GroceryItem {
  return {
    id: r.id,
    clientKey: r.clientKey,
    name: r.name,
    quantity: r.quantity,
    unit: r.unit,
    category: r.category,
    store: r.store,
    notes: r.notes,
    requestedBy: r.requestedBy,
    neededBy: r.neededBy,
    source: r.source,
    checked: r.checked,
    checkedBy: r.checkedBy,
    version: r.version,
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function toWishlistItem(r: WishlistRow, actor: Actor): WishlistItem {
  return {
    id: r.id,
    clientKey: r.clientKey,
    name: r.name,
    quantity: r.quantity,
    reason: r.reason,
    requesterName: r.requesterName,
    status: (['pending', 'approved', 'declined', 'deferred'] as const).find((s) => s === r.status) ?? 'pending',
    decisionNote: r.decisionNote,
    decidedAt: r.decidedAt?.toISOString() ?? null,
    groceryItemId: r.groceryItemId,
    createdAt: r.createdAt.toISOString(),
    mine: r.requesterUserId === actorRef(actor),
  };
}

export async function getGrocerySnapshot(actor: Actor): Promise<GrocerySnapshot> {
  const [items, wishlist] = await Promise.all([
    db
      .select()
      .from(groceryItems)
      .where(
        and(
          eq(groceryItems.householdId, actor.householdId),
          isNull(groceryItems.deletedAt),
          // Keep checked items visible for a day so the shopper can see progress and undo.
          or(eq(groceryItems.checked, false), gt(groceryItems.checkedAt, sql`now() - interval '1 day'`))
        )
      )
      .orderBy(asc(groceryItems.checked), asc(groceryItems.category), asc(groceryItems.createdAt)),
    db
      .select()
      .from(wishlistRequests)
      .where(
        and(
          eq(wishlistRequests.householdId, actor.householdId),
          or(
            inArray(wishlistRequests.status, ['pending', 'deferred']),
            gt(wishlistRequests.decidedAt, sql`now() - interval '14 days'`)
          )
        )
      )
      .orderBy(desc(wishlistRequests.createdAt))
      .limit(100),
  ]);
  return {
    items: items.map(toGroceryItem),
    wishlist: wishlist.map((w) => toWishlistItem(w, actor)),
    viewer: { name: actor.name, canDecide: actor.kind === 'user' && actor.role === 'parent' },
    serverTime: new Date().toISOString(),
  };
}

export async function getGroceryCounts(householdId: number) {
  const [row] = await db
    .select({
      toBuy: sql<number>`count(*) filter (where ${groceryItems.checked} = false)`.mapWith(Number),
      neededToday: sql<number>`count(*) filter (where ${groceryItems.checked} = false and ${groceryItems.neededBy} is not null)`.mapWith(Number),
    })
    .from(groceryItems)
    .where(and(eq(groceryItems.householdId, householdId), isNull(groceryItems.deletedAt)));
  const [wish] = await db
    .select({ pending: sql<number>`count(*)`.mapWith(Number) })
    .from(wishlistRequests)
    .where(and(eq(wishlistRequests.householdId, householdId), eq(wishlistRequests.status, 'pending')));
  return { toBuy: row?.toBuy ?? 0, neededSoon: row?.neededToday ?? 0, wishlistPending: wish?.pending ?? 0 };
}
