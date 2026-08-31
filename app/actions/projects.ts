'use server';

import { db } from '@/lib/db';
import {
  projects,
  projectMilestones,
  type ProjectRow,
  type ProjectMilestoneRow,
  type NewProjectRow,
  type NewProjectMilestoneRow,
} from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

function revalidateAll() {
  revalidatePath('/');
  revalidatePath('/family-hub');
  revalidatePath('/alex');
  revalidatePath('/jaxon');
  revalidatePath('/carson');
}

export interface ProjectWithMilestones extends ProjectRow {
  milestones: ProjectMilestoneRow[];
}

export async function getProjects(childId?: string): Promise<ProjectWithMilestones[]> {
  const rows = childId
    ? await db.select().from(projects).where(eq(projects.childId, childId)).orderBy(asc(projects.dueDate))
    : await db.select().from(projects).orderBy(asc(projects.dueDate));

  const allMilestones = await db
    .select()
    .from(projectMilestones)
    .orderBy(asc(projectMilestones.position));

  return rows.map((p) => ({
    ...p,
    milestones: allMilestones.filter((m) => m.projectId === p.id),
  }));
}

export async function createProject(input: {
  childId: string;
  title: string;
  subject?: string;
  dueDate?: string;
  notes?: string;
  milestones?: string[];
}) {
  const title = input.title?.trim();
  if (!title) throw new Error('Title is required');
  if (!input.childId) throw new Error('Child is required');

  const row: NewProjectRow = {
    childId: input.childId,
    title,
    subject: input.subject?.trim() || null,
    dueDate: input.dueDate?.trim() || null,
    notes: input.notes?.trim() || null,
    status: 'active',
  };
  const [created] = await db.insert(projects).values(row).returning();

  const steps = (input.milestones ?? []).map((t) => t.trim()).filter(Boolean);
  if (steps.length > 0) {
    const milestoneRows: NewProjectMilestoneRow[] = steps.map((t, i) => ({
      projectId: created.id,
      title: t,
      position: i,
    }));
    await db.insert(projectMilestones).values(milestoneRows);
  }

  revalidateAll();
  return created;
}

export async function updateProject(
  id: number,
  input: { title?: string; subject?: string; dueDate?: string; status?: string; notes?: string }
) {
  const patch: Partial<NewProjectRow> = {};
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) throw new Error('Title is required');
    patch.title = title;
  }
  if (input.subject !== undefined) patch.subject = input.subject.trim() || null;
  if (input.dueDate !== undefined) patch.dueDate = input.dueDate.trim() || null;
  if (input.status !== undefined) patch.status = input.status;
  if (input.notes !== undefined) patch.notes = input.notes.trim() || null;

  await db.update(projects).set(patch).where(eq(projects.id, id));
  revalidateAll();
}

export async function deleteProject(id: number) {
  await db.delete(projectMilestones).where(eq(projectMilestones.projectId, id));
  await db.delete(projects).where(eq(projects.id, id));
  revalidateAll();
}

export async function addMilestone(input: { projectId: number; title: string; dueDate?: string }) {
  const title = input.title?.trim();
  if (!title) throw new Error('Step title is required');

  const existing = await db
    .select()
    .from(projectMilestones)
    .where(eq(projectMilestones.projectId, input.projectId));

  const row: NewProjectMilestoneRow = {
    projectId: input.projectId,
    title,
    dueDate: input.dueDate?.trim() || null,
    position: existing.length,
  };
  const [created] = await db.insert(projectMilestones).values(row).returning();
  revalidateAll();
  return created;
}

export async function toggleMilestone(id: number, done: boolean) {
  await db.update(projectMilestones).set({ done }).where(eq(projectMilestones.id, id));
  revalidateAll();
}

export async function deleteMilestone(id: number) {
  await db.delete(projectMilestones).where(eq(projectMilestones.id, id));
  revalidateAll();
}
