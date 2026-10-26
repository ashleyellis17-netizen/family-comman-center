'use server'

import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { rewardItems, rewardRedemptions } from '@/lib/db/schema'
import { requireHousehold, requireParent } from '@/lib/household'
import { run, requireText, cleanText, cleanInt, cleanKey, UserError } from '@/lib/action'
import { KID_IDS } from '@/lib/chores'
import { pointBalances } from '@/app/actions/chores'
import { blockingGrounding } from '@/lib/discipline'
import { todayInTimezone } from '@/lib/dates'

export async function listRewards() {
  return run('rewards.list', async () => {
    const ctx = await requireHousehold()
    const [items, redemptions, balances] = await Promise.all([
      db.select().from(rewardItems).where(eq(rewardItems.householdId, ctx.householdId)).orderBy(rewardItems.cost),
      db
        .select()
        .from(rewardRedemptions)
        .where(eq(rewardRedemptions.householdId, ctx.householdId))
        .orderBy(desc(rewardRedemptions.createdAt))
        .limit(30),
      pointBalances(ctx.householdId),
    ])
    return { canManage: ctx.role === 'parent', items, redemptions, balances }
  })
}

export async function createReward(input: { title: string; description?: string; cost: number }) {
  return run('rewards.create', async () => {
    const ctx = await requireParent()
    const title = requireText(input.title, 'Reward name', 80)
    const cost = cleanInt(input.cost, { min: 1, max: 100000 })
    if (cost === null) throw new UserError('Cost must be at least 1 point.')
    const [row] = await db
      .insert(rewardItems)
      .values({ householdId: ctx.householdId, title, description: cleanText(input.description, 200), cost })
      .returning({ id: rewardItems.id })
    return row
  })
}

export async function setRewardAvailable(id: number, available: boolean) {
  return run('rewards.available', async () => {
    const ctx = await requireParent()
    await db.update(rewardItems).set({ available }).where(and(eq(rewardItems.id, id), eq(rewardItems.householdId, ctx.householdId)))
    return { id, available }
  })
}

/**
 * Redeems a reward for one kid. Runs under a per-kid lock so two devices tapping at once
 * can't both spend the same points, and the client key makes retries record one redemption.
 */
export async function redeemReward(input: { rewardId: number; assignee: string; clientKey: string }) {
  return run('rewards.redeem', async () => {
    const ctx = await requireHousehold()
    const clientKey = cleanKey(input.clientKey)
    if (!KID_IDS.has(input.assignee)) throw new UserError('Pick who is redeeming.')

    const grounding = await blockingGrounding(ctx.householdId, todayInTimezone(ctx.timezone), input.assignee, 'rewards')
    if (grounding) throw new UserError(`Rewards are paused until ${grounding.endDate} (grounded).`)

    return db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`reward:${ctx.householdId}:${input.assignee}`}))`)

      const [existing] = await tx
        .select({ id: rewardRedemptions.id })
        .from(rewardRedemptions)
        .where(and(eq(rewardRedemptions.householdId, ctx.householdId), eq(rewardRedemptions.clientKey, clientKey)))
      if (existing) return { id: existing.id, duplicate: true }

      const [reward] = await tx
        .select()
        .from(rewardItems)
        .where(and(eq(rewardItems.id, input.rewardId), eq(rewardItems.householdId, ctx.householdId)))
      if (!reward || !reward.available) throw new UserError('That reward is not available right now.')

      const balance = (await pointBalances(ctx.householdId))[input.assignee] ?? 0
      if (balance < reward.cost) throw new UserError(`Not enough points yet: ${reward.cost - balance} more needed.`)

      const [row] = await tx
        .insert(rewardRedemptions)
        .values({
          householdId: ctx.householdId,
          rewardId: reward.id,
          rewardTitle: reward.title,
          assignee: input.assignee,
          cost: reward.cost,
          clientKey,
          requestedByUserId: ctx.userId,
        })
        .returning({ id: rewardRedemptions.id })
      return { id: row.id, duplicate: false }
    })
  })
}

/** Parents mark a redemption fulfilled, or cancel it to refund the points. Only pending ones can change. */
export async function decideRedemption(id: number, status: 'fulfilled' | 'cancelled') {
  return run('rewards.decide', async () => {
    const ctx = await requireParent()
    if (status !== 'fulfilled' && status !== 'cancelled') throw new UserError('Invalid status.')
    const result = await db
      .update(rewardRedemptions)
      .set({ status, decidedByUserId: ctx.userId, decidedAt: new Date() })
      .where(and(eq(rewardRedemptions.id, id), eq(rewardRedemptions.householdId, ctx.householdId), eq(rewardRedemptions.status, 'pending')))
      .returning({ id: rewardRedemptions.id })
    if (!result.length) throw new UserError('That redemption was already handled.')
    return { id, status }
  })
}
