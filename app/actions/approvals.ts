'use server'

import { and, asc, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { earnBackTasks, groundings, rewardRedemptions, wishlistRequests } from '@/lib/db/schema'
import { requireParent } from '@/lib/household'
import { run } from '@/lib/action'

/** Everything waiting on a parent decision, pulled from the real records rather than a separate queue. */
export async function listApprovals() {
  return run('approvals.list', async () => {
    const ctx = await requireParent()
    const [reviews, redemptions, wishes] = await Promise.all([
      db
        .select()
        .from(groundings)
        .where(and(eq(groundings.householdId, ctx.householdId), eq(groundings.status, 'review')))
        .orderBy(asc(groundings.endDate)),
      db
        .select()
        .from(rewardRedemptions)
        .where(and(eq(rewardRedemptions.householdId, ctx.householdId), eq(rewardRedemptions.status, 'pending')))
        .orderBy(asc(rewardRedemptions.createdAt)),
      db
        .select({
          id: wishlistRequests.id,
          name: wishlistRequests.name,
          quantity: wishlistRequests.quantity,
          reason: wishlistRequests.reason,
          requesterName: wishlistRequests.requesterName,
          createdAt: wishlistRequests.createdAt,
        })
        .from(wishlistRequests)
        .where(and(eq(wishlistRequests.householdId, ctx.householdId), eq(wishlistRequests.status, 'pending')))
        .orderBy(desc(wishlistRequests.createdAt)),
    ])
    const tasks = reviews.length
      ? await db.select().from(earnBackTasks).where(eq(earnBackTasks.householdId, ctx.householdId))
      : []
    return {
      reviews: reviews.map((g) => ({ ...g, tasks: tasks.filter((t) => t.groundingId === g.id) })),
      redemptions,
      wishes,
    }
  })
}
