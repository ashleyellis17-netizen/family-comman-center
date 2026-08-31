'use server';

import { db } from '@/lib/db';
import { events, type NewEventRow } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getEvents() {
  return db.select().from(events).orderBy(asc(events.date));
}

export async function createEvent(input: {
  title: string;
  description?: string;
  date: string;
  time?: string;
  childId?: string | null;
  allChildren?: boolean;
  category?: string;
}) {
  const title = input.title?.trim();
  if (!title) throw new Error('Title is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Valid date is required');

  const row: NewEventRow = {
    title,
    description: input.description?.trim() || null,
    date: input.date,
    time: input.time?.trim() || null,
    childId: input.allChildren ? null : input.childId || null,
    allChildren: !!input.allChildren,
    category: input.category || 'other',
  };

  const [created] = await db.insert(events).values(row).returning();
  revalidatePath('/calendar');
  revalidatePath('/');
  return created;
}

export async function updateEvent(
  id: number,
  input: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    childId?: string | null;
    allChildren?: boolean;
    category?: string;
  }
) {
  const title = input.title?.trim();
  if (!title) throw new Error('Title is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Valid date is required');

  await db
    .update(events)
    .set({
      title,
      description: input.description?.trim() || null,
      date: input.date,
      time: input.time?.trim() || null,
      childId: input.allChildren ? null : input.childId || null,
      allChildren: !!input.allChildren,
      category: input.category || 'other',
    })
    .where(eq(events.id, id));

  revalidatePath('/calendar');
  revalidatePath('/');
}

export async function deleteEvent(id: number) {
  await db.delete(events).where(eq(events.id, id));
  revalidatePath('/calendar');
  revalidatePath('/');
}
