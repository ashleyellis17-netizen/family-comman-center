import type { AssignmentRow } from '@/lib/db/schema';

// Pure helper shared by the dashboard, family hub, and school view.
// Kept out of the 'use server' actions file because that file may only
// export async server actions.
export function computeSchoolProgress(items: AssignmentRow[]) {
  const done = items.filter((a) => a.status === 'Turned In' || a.status === 'Graded').length;
  const outstanding = items.filter((a) => a.status === 'Not Started' || a.status === 'In Progress').length;
  const missing = items.filter((a) => a.status === 'Missing').length;
  return {
    done,
    outstanding,
    missing,
    total: items.length,
    percent: items.length ? Math.round((done / items.length) * 100) : 0,
  };
}
