'use server'

import { and, desc, eq, gt, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { householdReminders } from '@/lib/db/schema'
import { requireHousehold } from '@/lib/household'
import { run, requireText, cleanDate, cleanKey, UserError } from '@/lib/action'

function visibility(ctx: Awaited<ReturnType<typeof requireHousehold>>) {
  // Private reminders are visible only to their creator, and never in public display mode.
  return ctx.publicMode
    ? eq(householdReminders.isPrivate, false)
    : or(eq(householdReminders.isPrivate, false), eq(householdReminders.createdByUserId, ctx.userId))
}

export async function listReminders() {
  return run('reminders.list', async () => {
    const ctx = await requireHousehold()
    const since = new Date(Date.now() - 86400000)
    return db
      .select()
      .from(householdReminders)
      .where(and(eq(householdReminders.householdId, ctx.householdId), visibility(ctx), or(eq(householdReminders.done, false), gt(householdReminders.doneAt, since))))
      .orderBy(householdReminders.done, sql`${householdReminders.dueDate} asc nulls last`, desc(householdReminders.createdAt))
  })
}

export async function addReminders(inputs: { clientKey: string; text: string; dueDate?: string | null; isPrivate?: boolean }[]) {
  return run('reminders.add', async () => {
    const ctx = await requireHousehold()
    if (!inputs.length || inputs.length > 20) throw new UserError('Add between 1 and 20 reminders.')
    const rows = inputs.map((i) => ({
      householdId: ctx.householdId,
      clientKey: cleanKey(i.clientKey),
      text: requireText(i.text, 'Reminder', 200),
      dueDate: cleanDate(i.dueDate),
      isPrivate: ctx.role === 'display' ? false : !!i.isPrivate,
      createdBy: ctx.displayName,
      createdByUserId: ctx.userId,
    }))
    const added = await db.insert(householdReminders).values(rows).onConflictDoNothing().returning()
    return { added: added.length }
  })
}

export async function setReminderDone(id: number, done: boolean) {
  return run('reminders.done', async () => {
    const ctx = await requireHousehold()
    const rows = await db
      .update(householdReminders)
      .set({ done, doneAt: done ? new Date() : null, doneBy: done ? ctx.displayName : null })
      .where(and(eq(householdReminders.id, id), eq(householdReminders.householdId, ctx.householdId), visibility(ctx)))
      .returning({ id: householdReminders.id })
    if (!rows.length) throw new UserError('That reminder no longer exists.')
    return true
  })
}

export async function deleteReminder(id: number) {
  return run('reminders.delete', async () => {
    const ctx = await requireHousehold()
    const rows = await db
      .delete(householdReminders)
      .where(
        and(
          eq(householdReminders.id, id),
          eq(householdReminders.householdId, ctx.householdId),
          ctx.role === 'parent' ? visibility(ctx) : eq(householdReminders.createdByUserId, ctx.userId),
        ),
      )
      .returning()
    if (!rows.length) throw new UserError('You can only delete reminders you created.')
    return rows[0]
  })
}

export async function restoreReminder(row: { clientKey: string; text: string; dueDate: string | null; isPrivate: boolean }) {
  return addReminders([{ clientKey: `${row.clientKey}:r${Date.now()}`, text: row.text, dueDate: row.dueDate, isPrivate: row.isPrivate }])
}
