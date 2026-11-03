'use server';

import { and, asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { events, type NewEventRow } from '@/lib/db/schema';
import { requireActor } from '@/lib/household';

const eventInput = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  description: z.string().trim().max(1000).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid date is required'),
  time: z.string().trim().max(20).optional(),
  childId: z.string().max(40).nullable().optional(),
  allChildren: z.boolean().optional(),
  category: z.string().max(30).optional(),
});

type EventInput = z.input<typeof eventInput>;

function toRow(input: EventInput): Omit<NewEventRow, 'householdId'> {
  const parsed = eventInput.parse(input);
  return {
    title: parsed.title,
    description: parsed.description || null,
    date: parsed.date,
    time: parsed.time || null,
    childId: parsed.allChildren ? null : parsed.childId || null,
    allChildren: !!parsed.allChildren,
    category: parsed.category || 'other',
  };
}

export async function getEventsForHousehold(householdId: number) {
  return db.select().from(events).where(eq(events.householdId, householdId)).orderBy(asc(events.date));
}

export async function createEvent(input: EventInput) {
  const actor = await requireActor();
  const [created] = await db
    .insert(events)
    .values({ ...toRow(input), householdId: actor.householdId })
    .returning();
  revalidatePath('/calendar');
  revalidatePath('/');
  return created;
}

export async function updateEvent(id: number, input: EventInput) {
  const actor = await requireActor();
  await db
    .update(events)
    .set(toRow(input))
    .where(and(eq(events.id, id), eq(events.householdId, actor.householdId)));
  revalidatePath('/calendar');
  revalidatePath('/');
}

export async function deleteEvent(id: number) {
  const actor = await requireActor();
  await db.delete(events).where(and(eq(events.id, id), eq(events.householdId, actor.householdId)));
  revalidatePath('/calendar');
  revalidatePath('/');
}
