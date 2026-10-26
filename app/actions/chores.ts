'use server'

import { and, eq, gte, lte, ne, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { choreCompletions, chores, rewardRedemptions, type ChoreRecurrence } from '@/lib/db/schema'
import { requireHousehold, requireParent } from '@/lib/household'
import { run, requireText, cleanText, cleanDate, cleanInt, UserError } from '@/lib/action'
import { addDays, todayInTimezone } from '@/lib/dates'
import { KID_IDS, occursOn } from '@/lib/chores'

/** Points earned from completed chores minus points spent on rewards that were not cancelled. */
export async function pointBalances(householdId: number): Promise<Record<string, number>> {
  const [earned, spent] = await Promise.all([
    db
      .select({ assignee: choreCompletions.assignee, total: sql<number>`coalesce(sum(${choreCompletions.points}),0)::int` })
      .from(choreCompletions)
      .where(eq(choreCompletions.householdId, householdId))
      .groupBy(choreCompletions.assignee),
    db
      .select({ assignee: rewardRedemptions.assignee, total: sql<number>`coalesce(sum(${rewardRedemptions.cost}),0)::int` })
      .from(rewardRedemptions)
      .where(and(eq(rewardRedemptions.householdId, householdId), ne(rewardRedemptions.status, 'cancelled')))
      .groupBy(rewardRedemptions.assignee),
  ])
  const balances: Record<string, number> = {}
  for (const id of KID_IDS) balances[id] = 0
  for (const row of earned) balances[row.assignee] = (balances[row.assignee] ?? 0) + row.total
  for (const row of spent) balances[row.assignee] = (balances[row.assignee] ?? 0) - row.total
  return balances
}

export type ChoreOccurrence = {
  choreId: number
  date: string
  title: string
  description: string | null
  assignee: string
  points: number
  recurrence: ChoreRecurrence
  weekday: number | null
  done: boolean
}

/** Occurrences for today and the next 6 days, plus unfinished one-off chores that are overdue. */
export async function listChoreWeek() {
  return run('chores.week', async () => {
    const ctx = await requireHousehold()
    const today = todayInTimezone(ctx.timezone)
    const end = addDays(today, 6)
    const lookback = addDays(today, -30)

    const [templates, completions, balances] = await Promise.all([
      db.select().from(chores).where(and(eq(chores.householdId, ctx.householdId), eq(chores.archived, false))),
      db
        .select({ choreId: choreCompletions.choreId, date: choreCompletions.date })
        .from(choreCompletions)
        .where(and(eq(choreCompletions.householdId, ctx.householdId), gte(choreCompletions.date, lookback), lte(choreCompletions.date, end))),
      pointBalances(ctx.householdId),
    ])
    const doneSet = new Set(completions.map((c) => `${c.choreId}:${c.date}`))

    const occurrences: ChoreOccurrence[] = []
    const push = (c: (typeof templates)[number], date: string) =>
      occurrences.push({
        choreId: c.id,
        date,
        title: c.title,
        description: c.description,
        assignee: c.assignee,
        points: c.points,
        recurrence: c.recurrence,
        weekday: c.weekday,
        done: doneSet.has(`${c.id}:${date}`),
      })

    for (const c of templates) {
      if (c.recurrence === 'once' && c.dueDate && c.dueDate < today && c.dueDate >= lookback && !doneSet.has(`${c.id}:${c.dueDate}`)) {
        push(c, c.dueDate)
      }
      for (let i = 0; i <= 6; i++) {
        const date = addDays(today, i)
        if (occursOn(c, date)) push(c, date)
      }
    }
    occurrences.sort((a, b) => a.date.localeCompare(b.date) || Number(a.done) - Number(b.done) || a.title.localeCompare(b.title))

    return {
      today,
      canManage: ctx.role === 'parent',
      occurrences,
      templates: templates.map((t) => ({ id: t.id, title: t.title, assignee: t.assignee, points: t.points, recurrence: t.recurrence, weekday: t.weekday, dueDate: t.dueDate })),
      balances,
    }
  })
}

export async function createChore(input: {
  title: string
  description?: string
  assignee: string
  points: number
  recurrence: ChoreRecurrence
  weekday?: number | null
  dueDate?: string | null
}) {
  return run('chores.create', async () => {
    const ctx = await requireParent()
    const title = requireText(input.title, 'Chore name', 80)
    if (!KID_IDS.has(input.assignee)) throw new UserError('Pick who the chore is for.')
    const points = cleanInt(input.points, { min: 0, max: 1000 }) ?? 0
    const recurrence: ChoreRecurrence = ['once', 'daily', 'weekly'].includes(input.recurrence) ? input.recurrence : 'once'
    const weekday = recurrence === 'weekly' ? cleanInt(input.weekday, { min: 0, max: 6 }) : null
    if (recurrence === 'weekly' && weekday === null) throw new UserError('Pick a day of the week.')
    const dueDate = recurrence === 'once' ? cleanDate(input.dueDate) ?? todayInTimezone(ctx.timezone) : null

    const [row] = await db
      .insert(chores)
      .values({
        householdId: ctx.householdId,
        title,
        description: cleanText(input.description, 200),
        assignee: input.assignee,
        points,
        recurrence,
        weekday,
        dueDate,
        createdByUserId: ctx.userId,
      })
      .returning({ id: chores.id })
    return row
  })
}

/** Archiving keeps completion history (and the points already earned) intact. */
export async function archiveChore(id: number) {
  return run('chores.archive', async () => {
    const ctx = await requireParent()
    const result = await db
      .update(chores)
      .set({ archived: true })
      .where(and(eq(chores.id, id), eq(chores.householdId, ctx.householdId)))
      .returning({ id: chores.id })
    if (!result.length) throw new UserError('That chore no longer exists.')
    return { id }
  })
}

export async function restoreChore(id: number) {
  return run('chores.restore', async () => {
    const ctx = await requireParent()
    await db.update(chores).set({ archived: false }).where(and(eq(chores.id, id), eq(chores.householdId, ctx.householdId)))
    return { id }
  })
}

/** Idempotent: setting done twice records one completion; undoing twice is also harmless. */
export async function setChoreDone(input: { choreId: number; date: string; done: boolean }) {
  return run('chores.done', async () => {
    const ctx = await requireHousehold()
    const date = cleanDate(input.date)
    if (!date) throw new UserError('Invalid date.')
    if (date > todayInTimezone(ctx.timezone)) throw new UserError('Future chores can be checked off on their day.')

    const [chore] = await db
      .select()
      .from(chores)
      .where(and(eq(chores.id, input.choreId), eq(chores.householdId, ctx.householdId)))
    if (!chore) throw new UserError('That chore no longer exists.')
    if (!occursOn(chore, date)) throw new UserError('That chore is not scheduled for this day.')

    if (input.done) {
      await db
        .insert(choreCompletions)
        .values({ householdId: ctx.householdId, choreId: chore.id, date, assignee: chore.assignee, points: chore.points, completedByUserId: ctx.userId })
        .onConflictDoNothing()
    } else {
      // A child can't spend points and then un-check the chore to get them back below zero unnoticed: balances simply drop.
      await db
        .delete(choreCompletions)
        .where(and(eq(choreCompletions.householdId, ctx.householdId), eq(choreCompletions.choreId, chore.id), eq(choreCompletions.date, date)))
    }
    return { choreId: chore.id, date, done: input.done }
  })
}
