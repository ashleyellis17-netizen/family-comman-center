'use server';

import { db } from '@/lib/db';
import { brainDump, type BrainDumpRow, type NewBrainDumpRow } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

function revalidateAll() {
  revalidatePath('/');
  revalidatePath('/family-hub');
  revalidatePath('/alex');
  revalidatePath('/jaxon');
  revalidatePath('/carson');
}

export async function getBrainDump(childId?: string): Promise<BrainDumpRow[]> {
  if (childId) {
    return db
      .select()
      .from(brainDump)
      .where(eq(brainDump.childId, childId))
      .orderBy(desc(brainDump.createdAt));
  }
  return db.select().from(brainDump).orderBy(desc(brainDump.createdAt));
}

export async function createBrainDump(input: { childId: string; content: string }) {
  const content = input.content?.trim();
  if (!content) throw new Error('Write something first');
  if (!input.childId) throw new Error('Child is required');

  const row: NewBrainDumpRow = {
    childId: input.childId,
    content,
    status: 'open',
  };
  const [created] = await db.insert(brainDump).values(row).returning();
  revalidateAll();
  return created;
}

export async function updateBrainDump(
  id: number,
  input: { content?: string; status?: string; convertedTo?: string }
) {
  const patch: Partial<NewBrainDumpRow> = {};
  if (input.content !== undefined) {
    const content = input.content.trim();
    if (!content) throw new Error('Write something first');
    patch.content = content;
  }
  if (input.status !== undefined) patch.status = input.status;
  if (input.convertedTo !== undefined) patch.convertedTo = input.convertedTo || null;

  await db.update(brainDump).set(patch).where(eq(brainDump.id, id));
  revalidateAll();
}

export async function deleteBrainDump(id: number) {
  await db.delete(brainDump).where(eq(brainDump.id, id));
  revalidateAll();
}
