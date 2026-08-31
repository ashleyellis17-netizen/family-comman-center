'use server';

import { db } from '@/lib/db';
import {
  assignments,
  schoolBehavior,
  skillCheckins,
  type AssignmentRow,
  type NewAssignmentRow,
  type NewSchoolBehaviorRow,
  type SkillCheckinRow,
  type NewSkillCheckinRow,
} from '@/lib/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

function revalidateSchool() {
  revalidatePath('/school');
  revalidatePath('/');
  revalidatePath('/family-hub');
  revalidatePath('/api/calendar');
  revalidatePath('/alex');
  revalidatePath('/jaxon');
  revalidatePath('/carson');
}

// ---------- Assignments ----------

export async function getAssignments(): Promise<AssignmentRow[]> {
  return db.select().from(assignments).orderBy(asc(assignments.dueDate));
}

export async function createAssignment(input: {
  childId: string;
  title: string;
  subject?: string;
  type?: string;
  teacher?: string;
  dueDate?: string;
  dueTime?: string;
  status?: string;
  priority?: string;
  effort?: string;
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
    type: input.type || 'homework',
    teacher: input.teacher?.trim() || null,
    dueDate: input.dueDate?.trim() || null,
    dueTime: input.dueTime?.trim() || null,
    status: input.status || 'Not Started',
    priority: input.priority || 'normal',
    effort: input.effort?.trim() || null,
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
    type?: string;
    teacher?: string;
    dueDate?: string;
    dueTime?: string;
    status?: string;
    priority?: string;
    effort?: string;
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
  if (input.type !== undefined) patch.type = input.type;
  if (input.teacher !== undefined) patch.teacher = input.teacher.trim() || null;
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate.trim() || null;
  if (input.dueTime !== undefined) patch.dueTime = input.dueTime.trim() || null;
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.effort !== undefined) patch.effort = input.effort.trim() || null;
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

// ---------- Skill / behavior check-ins (age-based) ----------

export async function getSkillCheckins(childId?: string): Promise<SkillCheckinRow[]> {
  if (childId) {
    return db
      .select()
      .from(skillCheckins)
      .where(eq(skillCheckins.childId, childId))
      .orderBy(desc(skillCheckins.date));
  }
  return db.select().from(skillCheckins).orderBy(desc(skillCheckins.date));
}

// Save (or replace) a full day's skill ratings for one child in one call.
export async function saveSkillCheckin(input: {
  childId: string;
  date: string;
  ratings: { skill: string; rating: string }[];
  note?: string;
}) {
  if (!input.childId) throw new Error('Child is required');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error('Valid date is required');

  // Replace any existing ratings for this child+date so re-checking-in is idempotent.
  const existing = await db
    .select()
    .from(skillCheckins)
    .where(eq(skillCheckins.childId, input.childId));
  const sameDay = existing.filter((e) => e.date === input.date);
  for (const e of sameDay) {
    await db.delete(skillCheckins).where(eq(skillCheckins.id, e.id));
  }

  const rows: NewSkillCheckinRow[] = input.ratings
    .filter((r) => r.rating)
    .map((r) => ({
      childId: input.childId,
      date: input.date,
      skill: r.skill,
      rating: r.rating,
      note: input.note?.trim() || null,
    }));

  if (rows.length > 0) {
    await db.insert(skillCheckins).values(rows);
  }
  revalidateSchool();
}

export async function deleteSkillCheckinsForDay(childId: string, date: string) {
  const existing = await db
    .select()
    .from(skillCheckins)
    .where(eq(skillCheckins.childId, childId));
  const sameDay = existing.filter((e) => e.date === date);
  for (const e of sameDay) {
    await db.delete(skillCheckins).where(eq(skillCheckins.id, e.id));
  }
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
