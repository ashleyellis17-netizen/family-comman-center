'use server';

import { db } from '@/lib/db';
import {
  assignments,
  schoolBehavior,
  type AssignmentRow,
  type NewAssignmentRow,
  type NewSchoolBehaviorRow,
} from '@/lib/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

function revalidateSchool() {
  revalidatePath('/school');
  revalidatePath('/');
  revalidatePath('/family-hub');
  revalidatePath('/api/calendar');
}

// ---------- Assignments ----------

export async function getAssignments(): Promise<AssignmentRow[]> {
  return db.select().from(assignments).orderBy(asc(assignments.dueDate));
}

export async function createAssignment(input: {
  childId: string;
  title: string;
  subject?: string;
  dueDate?: string;
  status?: string;
  grade?: string;
  notes?: string;
}) {
  const title = input.title?.trim();
  if (!title) throw new Error('Title is required');
  if (!input.childId) throw new Error('Child is required');

  const row: NewAssignmentRow = {
    childId: input.childId,
    title,
    subject: input.subject?.trim() || '',
    dueDate: input.dueDate?.trim() || null,
    status: input.status || 'Not Started',
    grade: input.grade?.trim() || null,
    notes: input.notes?.trim() || null,
  };

  const [created] = await db.insert(assignments).values(row).returning();
  revalidateSchool();
  return created;
}

export async function updateAssignment(
  id: number,
  input: {
    title?: string;
    subject?: string;
    dueDate?: string;
    status?: string;
    grade?: string;
    notes?: string;
  }
) {
  const patch: Partial<NewAssignmentRow> = {};
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) throw new Error('Title is required');
    patch.title = title;
  }
  if (input.subject !== undefined) patch.subject = input.subject.trim();
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate.trim() || null;
  if (input.status !== undefined) patch.status = input.status;
  if (input.grade !== undefined) patch.grade = input.grade.trim() || null;
  if (input.notes !== undefined) patch.notes = input.notes.trim() || null;

  await db.update(assignments).set(patch).where(eq(assignments.id, id));
  revalidateSchool();
}

export async function deleteAssignment(id: number) {
  await db.delete(assignments).where(eq(assignments.id, id));
  revalidateSchool();
}

// ---------- School-day behavior ----------

export async function getSchoolBehavior() {
  return db.select().from(schoolBehavior).orderBy(desc(schoolBehavior.date));
}

export async function createBehaviorEntry(input: {
  childId: string;
  date: string;
  rating: string;
  note?: string;
  loggedBy?: string;
}) {
  if (!input.childId) throw new Error('Child is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Valid date is required');
  if (!input.rating) throw new Error('Rating is required');

  const row: NewSchoolBehaviorRow = {
    childId: input.childId,
    date: input.date,
    rating: input.rating,
    note: input.note?.trim() || null,
    loggedBy: input.loggedBy?.trim() || null,
  };

  const [created] = await db.insert(schoolBehavior).values(row).returning();
  revalidateSchool();
  return created;
}

export async function updateBehaviorEntry(
  id: number,
  input: { date?: string; rating?: string; note?: string; loggedBy?: string }
) {
  const patch: Partial<NewSchoolBehaviorRow> = {};
  if (input.date !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Valid date is required');
    patch.date = input.date;
  }
  if (input.rating !== undefined) patch.rating = input.rating;
  if (input.note !== undefined) patch.note = input.note.trim() || null;
  if (input.loggedBy !== undefined) patch.loggedBy = input.loggedBy.trim() || null;

  await db.update(schoolBehavior).set(patch).where(eq(schoolBehavior.id, id));
  revalidateSchool();
}

export async function deleteBehaviorEntry(id: number) {
  await db.delete(schoolBehavior).where(eq(schoolBehavior.id, id));
  revalidateSchool();
}

// ---------- Progress (shared by dashboard + family hub) ----------

export async function getSchoolProgressByChild() {
  const all = await getAssignments();
  const byChild: Record<string, AssignmentRow[]> = {};
  for (const a of all) {
    (byChild[a.childId] ??= []).push(a);
  }
  return byChild;
}
