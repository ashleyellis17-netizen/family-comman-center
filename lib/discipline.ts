import 'server-only'
import { and, eq, gte, lte, ne } from 'drizzle-orm'
import { db } from '@/lib/db'
import { groundings, type GroundingRow } from '@/lib/db/schema'

export type Restriction = 'allowance' | 'electronics' | 'rewards'

/** Groundings in effect today: not resolved, already started, and not past their end date. */
export async function groundingsInEffect(householdId: number, today: string, assignee?: string): Promise<GroundingRow[]> {
  return db
    .select()
    .from(groundings)
    .where(
      and(
        eq(groundings.householdId, householdId),
        ne(groundings.status, 'resolved'),
        lte(groundings.startDate, today),
        gte(groundings.endDate, today),
        assignee ? eq(groundings.assignee, assignee) : undefined,
      ),
    )
}

export function blocks(g: GroundingRow, restriction: Restriction) {
  if (restriction === 'allowance') return g.blocksAllowance
  if (restriction === 'electronics') return g.blocksElectronics
  return g.blocksRewards
}

/** The grounding blocking this restriction for the kid today, if any. */
export async function blockingGrounding(householdId: number, today: string, assignee: string, restriction: Restriction) {
  const active = await groundingsInEffect(householdId, today, assignee)
  return active.find((g) => blocks(g, restriction)) ?? null
}
