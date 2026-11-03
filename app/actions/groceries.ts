'use server';

import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { groceryItems, wishlistRequests } from '@/lib/db/schema';
import { AuthError, actorRef, requireActor, requireParent } from '@/lib/household';
import { toGroceryItem, toWishlistItem } from '@/lib/groceries';
import { GROCERY_CATEGORIES, type GroceryItem, type MutationResult, type WishlistItem } from '@/lib/grocery-types';

const clientKey = z.string().min(8).max(64).regex(/^[A-Za-z0-9_-]+$/);
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const groceryFields = z.object({
  name: z.string().trim().min(1).max(80),
  quantity: z
    .union([z.string(), z.number()])
    .optional()
    .nullable()
    .transform((v) => (v === '' || v == null ? null : String(v)))
    .refine((v) => v === null || (/^\d{1,4}(\.\d{1,2})?$/.test(v) && Number(v) > 0), 'Quantity must be a positive number'),
  unit: optionalText(20),
  category: z.enum(GROCERY_CATEGORIES).default('Other'),
  store: optionalText(40),
  notes: optionalText(200),
  neededBy: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable()
    .transform((v) => v ?? null),
});

function handleError(error: unknown): { ok: false; error: string } {
  if (error instanceof AuthError) {
    return {
      ok: false,
      error: error.code === 'forbidden' ? 'Only a parent can do that.' : 'Your session ended. Please sign in again.',
    };
  }
  console.error('[groceries] action failed', error);
  return { ok: false, error: 'Something went wrong. Your change was not saved.' };
}

export async function addGroceryItem(input: { clientKey: string } & Record<string, unknown>): Promise<MutationResult<GroceryItem>> {
  try {
    const actor = await requireActor();
    const key = clientKey.safeParse(input.clientKey);
    const fields = groceryFields.safeParse(input);
    if (!key.success || !fields.success) return { ok: false, error: 'Check the item name and quantity.' };

    // Idempotent on (householdId, clientKey): a retried request returns the same row.
    const inserted = await db
      .insert(groceryItems)
      .values({
        ...fields.data,
        householdId: actor.householdId,
        clientKey: key.data,
        requestedBy: actor.name,
        addedBy: actorRef(actor),
        updatedBy: actorRef(actor),
      })
      .onConflictDoNothing()
      .returning();
    const row =
      inserted[0] ??
      (
        await db
          .select()
          .from(groceryItems)
          .where(and(eq(groceryItems.householdId, actor.householdId), eq(groceryItems.clientKey, key.data)))
      )[0];
    return { ok: true, data: toGroceryItem(row) };
  } catch (error) {
    return handleError(error);
  }
}

export async function setGroceryChecked(id: number, checked: boolean): Promise<MutationResult<GroceryItem>> {
  try {
    const actor = await requireActor();
    // Setting an explicit target state (not toggling) makes concurrent taps converge.
    const [row] = await db
      .update(groceryItems)
      .set({
        checked,
        checkedAt: checked ? sql`now()` : null,
        checkedBy: checked ? actor.name : null,
        updatedBy: actorRef(actor),
        updatedAt: sql`now()`,
        version: sql`${groceryItems.version} + 1`,
      })
      .where(and(eq(groceryItems.id, id), eq(groceryItems.householdId, actor.householdId), isNull(groceryItems.deletedAt)))
      .returning();
    if (!row) return { ok: false, error: 'That item was removed by someone else.' };
    return { ok: true, data: toGroceryItem(row) };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateGroceryItem(
  id: number,
  expectedVersion: number,
  patch: Record<string, unknown>
): Promise<MutationResult<GroceryItem>> {
  try {
    const actor = await requireActor();
    const fields = groceryFields.safeParse(patch);
    if (!fields.success) return { ok: false, error: 'Check the item name and quantity.' };
    const [row] = await db
      .update(groceryItems)
      .set({
        ...fields.data,
        updatedBy: actorRef(actor),
        updatedAt: sql`now()`,
        version: sql`${groceryItems.version} + 1`,
      })
      .where(
        and(
          eq(groceryItems.id, id),
          eq(groceryItems.householdId, actor.householdId),
          eq(groceryItems.version, expectedVersion),
          isNull(groceryItems.deletedAt)
        )
      )
      .returning();
    if (row) return { ok: true, data: toGroceryItem(row) };

    const [current] = await db
      .select()
      .from(groceryItems)
      .where(and(eq(groceryItems.id, id), eq(groceryItems.householdId, actor.householdId), isNull(groceryItems.deletedAt)));
    if (!current) return { ok: false, error: 'That item was removed by someone else.' };
    return {
      ok: false,
      error: 'Someone else just changed this item. We loaded their version — review it and save again.',
      conflict: toGroceryItem(current),
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function removeGroceryItems(ids: number[]): Promise<MutationResult> {
  try {
    const actor = await requireActor();
    const parsed = z.array(z.number().int().positive()).min(1).max(200).safeParse(ids);
    if (!parsed.success) return { ok: false, error: 'Nothing to remove.' };
    await db
      .update(groceryItems)
      .set({ deletedAt: sql`now()`, updatedBy: actorRef(actor), updatedAt: sql`now()`, version: sql`${groceryItems.version} + 1` })
      .where(and(inArray(groceryItems.id, parsed.data), eq(groceryItems.householdId, actor.householdId), isNull(groceryItems.deletedAt)));
    return { ok: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function restoreGroceryItems(ids: number[]): Promise<MutationResult> {
  try {
    const actor = await requireActor();
    const parsed = z.array(z.number().int().positive()).min(1).max(200).safeParse(ids);
    if (!parsed.success) return { ok: false, error: 'Nothing to restore.' };
    await db
      .update(groceryItems)
      .set({ deletedAt: null, updatedBy: actorRef(actor), updatedAt: sql`now()`, version: sql`${groceryItems.version} + 1` })
      .where(and(inArray(groceryItems.id, parsed.data), eq(groceryItems.householdId, actor.householdId)));
    return { ok: true };
  } catch (error) {
    return handleError(error);
  }
}

// ---- Wishlist ----

export async function submitWishlistRequest(input: {
  clientKey: string;
  name: string;
  quantity?: string | null;
  reason?: string | null;
}): Promise<MutationResult<WishlistItem>> {
  try {
    const actor = await requireActor();
    const parsed = z
      .object({ clientKey, name: z.string().trim().min(1).max(80), quantity: optionalText(20), reason: optionalText(200) })
      .safeParse(input);
    if (!parsed.success) return { ok: false, error: 'Tell us what you would like.' };
    const inserted = await db
      .insert(wishlistRequests)
      .values({
        ...parsed.data,
        householdId: actor.householdId,
        requesterName: actor.name,
        requesterUserId: actorRef(actor),
      })
      .onConflictDoNothing()
      .returning();
    const row =
      inserted[0] ??
      (
        await db
          .select()
          .from(wishlistRequests)
          .where(and(eq(wishlistRequests.householdId, actor.householdId), eq(wishlistRequests.clientKey, parsed.data.clientKey)))
      )[0];
    return { ok: true, data: toWishlistItem(row, actor) };
  } catch (error) {
    return handleError(error);
  }
}

export async function decideWishlistRequest(
  id: number,
  decision: 'approved' | 'declined' | 'deferred',
  note?: string
): Promise<MutationResult<WishlistItem>> {
  try {
    const parent = await requireParent();
    const decisionNote = optionalText(200).parse(note);
    if (!['approved', 'declined', 'deferred'].includes(decision)) return { ok: false, error: 'Unknown decision.' };

    const result = await db.transaction(async (tx) => {
      // Only an undecided request can be decided, so double-taps and two
      // parents approving at once produce exactly one grocery item.
      const [request] = await tx
        .update(wishlistRequests)
        .set({ status: decision, decisionNote, decidedBy: parent.name, decidedAt: sql`now()` })
        .where(
          and(
            eq(wishlistRequests.id, id),
            eq(wishlistRequests.householdId, parent.householdId),
            inArray(wishlistRequests.status, ['pending', 'deferred']),
            isNull(wishlistRequests.groceryItemId)
          )
        )
        .returning();
      if (!request) return null;
      if (decision !== 'approved') return request;

      const transferKey = `wishlist-${request.id}`;
      const [created] = await tx
        .insert(groceryItems)
        .values({
          householdId: parent.householdId,
          clientKey: transferKey,
          name: request.name,
          quantity: request.quantity && /^\d{1,4}(\.\d{1,2})?$/.test(request.quantity) ? request.quantity : null,
          notes: [request.quantity && !/^\d/.test(request.quantity) ? request.quantity : null, request.reason]
            .filter(Boolean)
            .join(' — ') || null,
          requestedBy: request.requesterName,
          source: 'wishlist',
          addedBy: parent.userId,
          updatedBy: parent.userId,
        })
        .onConflictDoNothing()
        .returning({ id: groceryItems.id });
      const groceryId =
        created?.id ??
        (
          await tx
            .select({ id: groceryItems.id })
            .from(groceryItems)
            .where(and(eq(groceryItems.householdId, parent.householdId), eq(groceryItems.clientKey, transferKey)))
        )[0]?.id;
      const [linked] = await tx
        .update(wishlistRequests)
        .set({ groceryItemId: groceryId })
        .where(eq(wishlistRequests.id, request.id))
        .returning();
      return linked;
    });

    if (!result) {
      const [current] = await db
        .select()
        .from(wishlistRequests)
        .where(and(eq(wishlistRequests.id, id), eq(wishlistRequests.householdId, parent.householdId)));
      if (!current) return { ok: false, error: 'That request no longer exists.' };
      return { ok: true, data: toWishlistItem(current, parent) };
    }
    return { ok: true, data: toWishlistItem(result, parent) };
  } catch (error) {
    return handleError(error);
  }
}

export async function withdrawWishlistRequest(id: number): Promise<MutationResult> {
  try {
    const actor = await requireActor();
    await db
      .delete(wishlistRequests)
      .where(
        and(
          eq(wishlistRequests.id, id),
          eq(wishlistRequests.householdId, actor.householdId),
          eq(wishlistRequests.requesterUserId, actorRef(actor)),
          eq(wishlistRequests.status, 'pending')
        )
      );
    return { ok: true };
  } catch (error) {
    return handleError(error);
  }
}
