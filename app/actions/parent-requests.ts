'use server';

import { db } from '@/lib/db';
import {
  parentRequests,
  type ParentRequestRow,
  type NewParentRequestRow,
} from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

function revalidateAll() {
  revalidatePath('/');
  revalidatePath('/family-hub');
  revalidatePath('/alex');
  revalidatePath('/jaxon');
  revalidatePath('/carson');
}

export async function getParentRequests(childId?: string): Promise<ParentRequestRow[]> {
  if (childId) {
    return db
      .select()
      .from(parentRequests)
      .where(eq(parentRequests.childId, childId))
      .orderBy(desc(parentRequests.createdAt));
  }
  return db.select().from(parentRequests).orderBy(desc(parentRequests.createdAt));
}

export async function createParentRequest(input: {
  childId: string;
  content: string;
  category?: string;
}) {
  const content = input.content?.trim();
  if (!content) throw new Error('Type your request first');
  if (!input.childId) throw new Error('Child is required');

  const row: NewParentRequestRow = {
    childId: input.childId,
    content,
    category: input.category || 'question',
    status: 'new',
  };
  const [created] = await db.insert(parentRequests).values(row).returning();
  revalidateAll();
  return created;
}

export async function updateParentRequest(
  id: number,
  input: { status?: string; response?: string; category?: string }
) {
  const patch: Partial<NewParentRequestRow> = {};
  if (input.status !== undefined) patch.status = input.status;
  if (input.response !== undefined) patch.response = input.response.trim() || null;
  if (input.category !== undefined) patch.category = input.category;

  await db.update(parentRequests).set(patch).where(eq(parentRequests.id, id));
  revalidateAll();
}

export async function deleteParentRequest(id: number) {
  await db.delete(parentRequests).where(eq(parentRequests.id, id));
  revalidateAll();
}
