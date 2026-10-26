'use server'

import { and, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { allowanceEntries, allowanceRates, type AllowanceKind } from '@/lib/db/schema'
import { requireHousehold, requireParent } from '@/lib/household'
import { run, cleanText, cleanNumber, cleanKey, UserError } from '@/lib/action'
import { startOfWeek, todayInTimezone } from '@/lib/dates'
import { KID_IDS } from '@/lib/chores'
import { blockingGrounding, groundingsInEffect } from '@/lib/discipline'

async function balances(householdId: number) {
  const rows = await db
    .select({ assignee: allowanceEntries.assignee, total: sql<number>`coalesce(sum(${allowanceEntries.amountCents}),0)::int` })
    .from(allowanceEntries)
    .where(eq(allowanceEntries.householdId, householdId))
    .groupBy(allowanceEntries.assignee)
  const out: Record<string, number> = {}
  for (const id of KID_IDS) out[id] = 0
  for (const r of rows) out[r.assignee] = r.total
  return out
}

function toCents(dollars: unknown) {
  const n = cleanNumber(dollars, { min: 0.01, max: 10000 })
  if (n === null) throw new UserError('Enter an amount between $0.01 and $10,000.')
  return Math.round(n * 100)
}

export async function listAllowance() {
  return run('allowance.list', async () => {
    const ctx = await requireHousehold()
    const today = todayInTimezone(ctx.timezone)
    const weekOf = startOfWeek(today)
    const [rates, totals, entries, active] = await Promise.all([
      db.select().from(allowanceRates).where(eq(allowanceRates.householdId, ctx.householdId)),
      balances(ctx.householdId),
      db
        .select()
        .from(allowanceEntries)
        .where(eq(allowanceEntries.householdId, ctx.householdId))
        .orderBy(desc(allowanceEntries.createdAt))
        .limit(60),
      groundingsInEffect(ctx.householdId, today),
    ])
    const paidThisWeek = entries.filter((e) => e.kind === 'allowance' && e.weekOf === weekOf).map((e) => e.assignee)
    const blocked = Object.fromEntries(
      active.filter((g) => g.blocksAllowance).map((g) => [g.assignee, { reason: g.reason, endDate: g.endDate }]),
    )
    return {
      canManage: ctx.role === 'parent',
      weekOf,
      rates: Object.fromEntries(rates.map((r) => [r.assignee, r.weeklyCents])) as Record<string, number>,
      balances: totals,
      entries,
      paidThisWeek,
      blocked: blocked as Record<string, { reason: string; endDate: string }>,
    }
  })
}

export async function setAllowanceRate(assignee: string, dollars: number) {
  return run('allowance.rate', async () => {
    const ctx = await requireParent()
    if (!KID_IDS.has(assignee)) throw new UserError('Pick a kid.')
    const n = cleanNumber(dollars, { min: 0, max: 1000 })
    if (n === null) throw new UserError('Weekly allowance must be between $0 and $1,000.')
    const weeklyCents = Math.round(n * 100)
    await db
      .insert(allowanceRates)
      .values({ householdId: ctx.householdId, assignee, weeklyCents })
      .onConflictDoUpdate({ target: [allowanceRates.householdId, allowanceRates.assignee], set: { weeklyCents } })
    return { assignee, weeklyCents }
  })
}

/** Pays this week's allowance once. Blocked while a grounding that pauses allowance is in effect. */
export async function payWeeklyAllowance(assignee: string, clientKey: string) {
  return run('allowance.pay', async () => {
    const ctx = await requireParent()
    const key = cleanKey(clientKey)
    if (!KID_IDS.has(assignee)) throw new UserError('Pick a kid.')
    const today = todayInTimezone(ctx.timezone)
    const weekOf = startOfWeek(today)

    const grounding = await blockingGrounding(ctx.householdId, today, assignee, 'allowance')
    if (grounding) throw new UserError(`Allowance is paused until ${grounding.endDate} (grounded).`)

    const [rate] = await db
      .select()
      .from(allowanceRates)
      .where(and(eq(allowanceRates.householdId, ctx.householdId), eq(allowanceRates.assignee, assignee)))
    if (!rate || rate.weeklyCents <= 0) throw new UserError('Set a weekly amount first.')

    const [row] = await db
      .insert(allowanceEntries)
      .values({
        householdId: ctx.householdId,
        assignee,
        kind: 'allowance',
        amountCents: rate.weeklyCents,
        note: 'Weekly allowance',
        weekOf,
        clientKey: key,
        createdByUserId: ctx.userId,
      })
      .onConflictDoNothing()
      .returning({ id: allowanceEntries.id })
    if (!row) throw new UserError('This week’s allowance was already paid.')
    return { id: row.id }
  })
}

/** Bonuses add money; spending and deductions take it away and can't push the balance below zero. */
export async function addAllowanceEntry(input: { clientKey: string; assignee: string; kind: Exclude<AllowanceKind, 'allowance'>; amount: number; note?: string }) {
  return run('allowance.entry', async () => {
    const ctx = await requireParent()
    const clientKey = cleanKey(input.clientKey)
    if (!KID_IDS.has(input.assignee)) throw new UserError('Pick a kid.')
    if (!['bonus', 'spend', 'deduction'].includes(input.kind)) throw new UserError('Pick a type.')
    const cents = toCents(input.amount)
    const signed = input.kind === 'bonus' ? cents : -cents
    const note = cleanText(input.note, 120)

    return db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`allowance:${ctx.householdId}:${input.assignee}`}))`)
      if (signed < 0) {
        const [{ total }] = await tx
          .select({ total: sql<number>`coalesce(sum(${allowanceEntries.amountCents}),0)::int` })
          .from(allowanceEntries)
          .where(and(eq(allowanceEntries.householdId, ctx.householdId), eq(allowanceEntries.assignee, input.assignee)))
        if (total + signed < 0) throw new UserError(`Only $${(total / 100).toFixed(2)} available.`)
      }
      const [row] = await tx
        .insert(allowanceEntries)
        .values({ householdId: ctx.householdId, assignee: input.assignee, kind: input.kind, amountCents: signed, note, clientKey, createdByUserId: ctx.userId })
        .onConflictDoNothing()
        .returning({ id: allowanceEntries.id })
      return { id: row?.id ?? null }
    })
  })
}
