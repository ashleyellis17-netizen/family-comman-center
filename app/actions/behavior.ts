'use server'

import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { behaviorNotes, type BehaviorKind } from '@/lib/db/schema'
import { requireHousehold, requireParent } from '@/lib/household'
import { run, requireText, cleanDate, cleanInt, cleanKey, UserError } from '@/lib/action'
import { todayInTimezone } from '@/lib/dates'
import { KID_IDS } from '@/lib/chores'

const KINDS: BehaviorKind[] = ['positive', 'concern', 'note']

export async function listBehavior() {
  return run('behavior.list', async () => {
    const ctx = await requireHousehold()
    const notes = await db
      .select()
      .from(behaviorNotes)
      .where(eq(behaviorNotes.householdId, ctx.householdId))
      .orderBy(desc(behaviorNotes.date), desc(behaviorNotes.createdAt))
      .limit(200)
    return { today: todayInTimezone(ctx.timezone), canManage: ctx.role === 'parent', notes }
  })
}

/** Points are signed: positive notes can add points, concerns can take them away. */
export async function addBehaviorNote(input: {
  clientKey: string
  assignee: string
  kind: BehaviorKind
  note: string
  points: number
  date?: string
}) {
  return run('behavior.add', async () => {
    const ctx = await requireParent()
    const clientKey = cleanKey(input.clientKey)
    if (!KID_IDS.has(input.assignee)) throw new UserError('Pick which kid this is about.')
    if (!KINDS.includes(input.kind)) throw new UserError('Pick a type.')
    const note = requireText(input.note, 'Note', 400)
    const magnitude = cleanInt(Math.abs(Number(input.points) || 0), { min: 0, max: 500 })
    if (magnitude === null) throw new UserError('Points must be between 0 and 500.')
    const points = input.kind === 'positive' ? magnitude : input.kind === 'concern' ? -magnitude : 0
    const date = cleanDate(input.date) ?? todayInTimezone(ctx.timezone)

    const [row] = await db
      .insert(behaviorNotes)
      .values({ householdId: ctx.householdId, clientKey, assignee: input.assignee, kind: input.kind, note, points, date, createdByUserId: ctx.userId })
      .onConflictDoNothing()
      .returning({ id: behaviorNotes.id })
    return { id: row?.id ?? null, duplicate: !row }
  })
}

export async function deleteBehaviorNote(id: number) {
  return run('behavior.delete', async () => {
    const ctx = await requireParent()
    await db.delete(behaviorNotes).where(and(eq(behaviorNotes.id, id), eq(behaviorNotes.householdId, ctx.householdId)))
    return { id }
  })
}
