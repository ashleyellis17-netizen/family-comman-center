'use server'

import { and, asc, desc, eq, inArray, isNull, ne, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { earnBackTasks, groundings, type EarnBackTaskRow } from '@/lib/db/schema'
import { requireHousehold, requireParent } from '@/lib/household'
import { run, requireText, cleanDate, UserError } from '@/lib/action'
import { todayInTimezone } from '@/lib/dates'
import { KID_IDS } from '@/lib/chores'

export async function listGroundings() {
  return run('grounding.list', async () => {
    const ctx = await requireHousehold()
    const today = todayInTimezone(ctx.timezone)
    const [open, recent] = await Promise.all([
      db
        .select()
        .from(groundings)
        .where(and(eq(groundings.householdId, ctx.householdId), ne(groundings.status, 'resolved')))
        .orderBy(asc(groundings.endDate)),
      db
        .select()
        .from(groundings)
        .where(and(eq(groundings.householdId, ctx.householdId), eq(groundings.status, 'resolved')))
        .orderBy(desc(groundings.resolvedAt))
        .limit(10),
    ])
    const ids = [...open, ...recent].map((g) => g.id)
    const tasks: EarnBackTaskRow[] = ids.length
      ? await db
          .select()
          .from(earnBackTasks)
          .where(and(eq(earnBackTasks.householdId, ctx.householdId), inArray(earnBackTasks.groundingId, ids)))
          .orderBy(asc(earnBackTasks.position), asc(earnBackTasks.id))
      : []
    const withTasks = <T extends { id: number }>(g: T) => ({ ...g, tasks: tasks.filter((t) => t.groundingId === g.id) })
    return {
      today,
      canManage: ctx.role === 'parent',
      canCheck: ctx.role !== 'display',
      open: open.map(withTasks),
      recent: recent.map(withTasks),
    }
  })
}

export async function createGrounding(input: {
  assignee: string
  reason: string
  startDate: string
  endDate: string
  blocksAllowance: boolean
  blocksElectronics: boolean
  blocksRewards: boolean
  earnBackTasks: string[]
}) {
  return run('grounding.create', async () => {
    const ctx = await requireParent()
    if (!KID_IDS.has(input.assignee)) throw new UserError('Pick who is grounded.')
    const reason = requireText(input.reason, 'Reason', 300)
    const startDate = cleanDate(input.startDate)
    const endDate = cleanDate(input.endDate)
    if (!startDate || !endDate) throw new UserError('Pick a start and end date.')
    if (endDate < startDate) throw new UserError('The end date must be on or after the start date.')
    const tasks = (input.earnBackTasks ?? [])
      .map((t) => (typeof t === 'string' ? t.replace(/\s+/g, ' ').trim().slice(0, 120) : ''))
      .filter(Boolean)
      .slice(0, 12)

    return db.transaction(async (tx) => {
      const [row] = await tx
        .insert(groundings)
        .values({
          householdId: ctx.householdId,
          assignee: input.assignee,
          reason,
          startDate,
          endDate,
          blocksAllowance: !!input.blocksAllowance,
          blocksElectronics: !!input.blocksElectronics,
          blocksRewards: !!input.blocksRewards,
          earnBackEnabled: tasks.length > 0,
          createdByUserId: ctx.userId,
        })
        .returning({ id: groundings.id })
      if (tasks.length) {
        await tx.insert(earnBackTasks).values(
          tasks.map((title, position) => ({ householdId: ctx.householdId, groundingId: row.id, title, position })),
        )
      }
      return row
    })
  })
}

/**
 * Checks an earn-back task on or off. When every task is done the grounding moves to "review"
 * so a parent can approve it; unchecking one moves it back to "active".
 */
export async function setEarnBackTaskDone(taskId: number, done: boolean) {
  return run('grounding.task', async () => {
    const ctx = await requireHousehold()
    if (ctx.role === 'display') throw new UserError('Check earn-back tasks from a signed-in phone or tablet.')

    return db.transaction(async (tx) => {
      const [task] = await tx
        .select()
        .from(earnBackTasks)
        .where(and(eq(earnBackTasks.id, taskId), eq(earnBackTasks.householdId, ctx.householdId)))
      if (!task) throw new UserError('That task no longer exists.')
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${`grounding:${task.groundingId}`}))`)

      const [g] = await tx
        .select({ status: groundings.status })
        .from(groundings)
        .where(and(eq(groundings.id, task.groundingId), eq(groundings.householdId, ctx.householdId)))
      if (!g || g.status === 'resolved') throw new UserError('This grounding is already over.')

      await tx
        .update(earnBackTasks)
        .set(done ? { doneAt: new Date(), doneByUserId: ctx.userId } : { doneAt: null, doneByUserId: null })
        .where(eq(earnBackTasks.id, task.id))

      const [{ remaining }] = await tx
        .select({ remaining: sql<number>`count(*)::int` })
        .from(earnBackTasks)
        .where(and(eq(earnBackTasks.groundingId, task.groundingId), isNull(earnBackTasks.doneAt)))
      const status = remaining === 0 ? 'review' : 'active'
      await tx.update(groundings).set({ status }).where(eq(groundings.id, task.groundingId))
      return { status }
    })
  })
}

export async function addEarnBackTask(groundingId: number, title: string) {
  return run('grounding.addTask', async () => {
    const ctx = await requireParent()
    const clean = requireText(title, 'Task', 120)
    return db.transaction(async (tx) => {
      const [g] = await tx
        .select()
        .from(groundings)
        .where(and(eq(groundings.id, groundingId), eq(groundings.householdId, ctx.householdId)))
      if (!g || g.status === 'resolved') throw new UserError('This grounding is already over.')
      const [row] = await tx
        .insert(earnBackTasks)
        .values({ householdId: ctx.householdId, groundingId, title: clean, position: 99 })
        .returning({ id: earnBackTasks.id })
      await tx.update(groundings).set({ earnBackEnabled: true, status: 'active' }).where(eq(groundings.id, groundingId))
      return row
    })
  })
}

/** "earned_back" approves a finished earn-back plan; "override" ends the grounding early. */
export async function resolveGrounding(id: number, resolution: 'earned_back' | 'override') {
  return run('grounding.resolve', async () => {
    const ctx = await requireParent()
    if (resolution !== 'earned_back' && resolution !== 'override') throw new UserError('Invalid choice.')
    const result = await db
      .update(groundings)
      .set({ status: 'resolved', resolution, resolvedAt: new Date(), resolvedByUserId: ctx.userId })
      .where(
        and(
          eq(groundings.id, id),
          eq(groundings.householdId, ctx.householdId),
          resolution === 'earned_back' ? eq(groundings.status, 'review') : ne(groundings.status, 'resolved'),
        ),
      )
      .returning({ id: groundings.id })
    if (!result.length) {
      throw new UserError(
        resolution === 'earned_back' ? 'Earn back can be approved once every task is done.' : 'This grounding was already ended.',
      )
    }
    return { id }
  })
}

/** Parent sends a finished plan back (for example, a task was not really done). */
export async function reopenEarnBackTask(taskId: number) {
  return setEarnBackTaskDone(taskId, false)
}
