'use server'

import { and, desc, eq, gt, inArray, isNull, or } from 'drizzle-orm'
import { db } from '@/lib/db'
import { groceryItems, wishlistRequests, type WishlistStatus } from '@/lib/db/schema'
import { requireHousehold, requireParent } from '@/lib/household'
import { run, requireText, cleanText, cleanKey, UserError } from '@/lib/action'
import { guessCategory, parseItemPhrase, normalizeUnit } from '@/lib/food'

export async function listWishlist() {
  return run('wishlist.list', async () => {
    const ctx = await requireHousehold()
    const since = new Date(Date.now() - 14 * 86400000)
    const rows = await db
      .select()
      .from(wishlistRequests)
      .where(
        and(
          eq(wishlistRequests.householdId, ctx.householdId),
          or(inArray(wishlistRequests.status, ['pending', 'deferred']), gt(wishlistRequests.decidedAt, since)),
        ),
      )
      .orderBy(desc(wishlistRequests.createdAt))
    return { requests: rows, canDecide: ctx.role === 'parent', me: ctx.userId }
  })
}

export async function submitWishlist(inputs: { clientKey: string; name: string; quantity?: string | null; reason?: string | null }[]) {
  return run('wishlist.submit', async () => {
    const ctx = await requireHousehold()
    if (!inputs.length || inputs.length > 30) throw new UserError('Add between 1 and 30 requests.')
    const rows = inputs.map((i) => ({
      householdId: ctx.householdId,
      clientKey: cleanKey(i.clientKey),
      name: requireText(i.name, 'Request', 120),
      quantity: cleanText(i.quantity, 40),
      reason: cleanText(i.reason, 300),
      requesterName: ctx.displayName,
      requesterUserId: ctx.userId,
    }))
    const added = await db.insert(wishlistRequests).values(rows).onConflictDoNothing().returning()
    return { added: added.length }
  })
}

export async function decideWishlist(input: { id: number; status: Exclude<WishlistStatus, 'pending'>; note?: string | null }) {
  return run('wishlist.decide', async () => {
    const ctx = await requireParent()
    if (!['approved', 'declined', 'deferred'].includes(input.status)) throw new UserError('Unknown decision.')
    const note = cleanText(input.note, 200)

    return db.transaction(async (tx) => {
      // Only a pending or deferred request with no grocery item can change; this blocks double transfers.
      const [request] = await tx
        .update(wishlistRequests)
        .set({ status: input.status, decisionNote: note, decidedBy: ctx.displayName, decidedAt: new Date() })
        .where(
          and(
            eq(wishlistRequests.id, input.id),
            eq(wishlistRequests.householdId, ctx.householdId),
            inArray(wishlistRequests.status, ['pending', 'deferred']),
            isNull(wishlistRequests.groceryItemId),
          ),
        )
        .returning()
      if (!request) throw new UserError('This request was already handled.', 'ALREADY_DECIDED')

      if (input.status !== 'approved') return { status: input.status, groceryItemId: null }

      const parsed = request.quantity ? parseItemPhrase(`${request.quantity} ${request.name}`) : null
      const [item] = await tx
        .insert(groceryItems)
        .values({
          householdId: ctx.householdId,
          clientKey: `wishlist:${request.id}`,
          name: request.name,
          quantity: parsed?.quantity != null && parsed.name.toLowerCase() === request.name.toLowerCase() ? String(parsed.quantity) : null,
          unit: parsed?.name.toLowerCase() === request.name.toLowerCase() ? normalizeUnit(parsed?.unit) : null,
          notes: [request.quantity && !(parsed?.quantity != null) ? `Qty: ${request.quantity}` : null, request.reason].filter(Boolean).join(' · ') || null,
          category: guessCategory(request.name),
          requestedBy: request.requesterName,
          source: 'wishlist',
          addedBy: ctx.displayName,
          updatedBy: ctx.displayName,
        })
        .onConflictDoNothing()
        .returning()
      const groceryItemId = item?.id ?? null
      await tx.update(wishlistRequests).set({ groceryItemId: groceryItemId ?? -1 }).where(eq(wishlistRequests.id, request.id))
      return { status: input.status, groceryItemId }
    })
  })
}

export async function withdrawWishlist(id: number) {
  return run('wishlist.withdraw', async () => {
    const ctx = await requireHousehold()
    const rows = await db
      .delete(wishlistRequests)
      .where(
        and(
          eq(wishlistRequests.id, id),
          eq(wishlistRequests.householdId, ctx.householdId),
          eq(wishlistRequests.status, 'pending'),
          ctx.role === 'parent' ? undefined : eq(wishlistRequests.requesterUserId, ctx.userId),
        ),
      )
      .returning({ id: wishlistRequests.id })
    if (!rows.length) throw new UserError('Only pending requests you made can be withdrawn.')
    return true
  })
}
