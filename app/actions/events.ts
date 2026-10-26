'use server';

import { db } from '@/lib/db';
import { events, type NewEventRow } from '@/lib/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { requireHousehold } from '@/lib/household';

export async function getEventsForHousehold(householdId: number) {
  return db.select().from(events).where(eq(events.householdId, householdId)).orderBy(asc(events.date));
}

export async function getEvents() {
  const ctx = await requireHousehold();
  return getEventsForHousehold(ctx.householdId);
}

type EventInput = {
  title: string;
  description?: string;
  date: string;
  time?: string;
  childId?: string | null;
  allChildren?: boolean;
  category?: string;
};

function toRow(input: EventInput) {
  const title = input.title?.trim().slice(0, 160);
  if (!title) throw new Error('Title is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Valid date is required');
  return {
    title,
    description: input.description?.trim().slice(0, 2000) || null,
    date: input.date,
    time: input.time?.trim().slice(0, 20) || null,
    childId: input.allChildren ? null : input.childId || null,
    allChildren: !!input.allChildren,
    category: input.category || 'other',
  };
}

export async function createEvent(input: EventInput) {
  const ctx = await requireHousehold();
  const row: NewEventRow = { ...toRow(input), householdId: ctx.householdId };
  const [created] = await db.insert(events).values(row).returning();
  revalidatePath('/calendar');
  revalidatePath('/');
  return created;
}

export async function updateEvent(id: number, input: EventInput) {
  const ctx = await requireHousehold();
  await db
    .update(events)
    .set(toRow(input))
    .where(and(eq(events.id, id), eq(events.householdId, ctx.householdId)));
  revalidatePath('/calendar');
  revalidatePath('/');
}

export async function deleteEvent(id: number) {
  const ctx = await requireHousehold();
  await db.delete(events).where(and(eq(events.id, id), eq(events.householdId, ctx.householdId)));
  revalidatePath('/calendar');
  revalidatePath('/');
}
