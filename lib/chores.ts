import { children } from '@/lib/mock-data'
import type { ChoreRow } from '@/lib/db/schema'

export const FAMILY_KIDS: { id: string; name: string }[] = children.map((c) => ({ id: c.id, name: c.name }))
export const KID_IDS = new Set<string>(FAMILY_KIDS.map((k) => k.id))

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function weekdayOf(date: string) {
  return new Date(`${date}T00:00:00Z`).getUTCDay()
}

/** Whether a chore template produces an occurrence on the given calendar date. */
export function occursOn(chore: Pick<ChoreRow, 'recurrence' | 'weekday' | 'dueDate' | 'createdAt'>, date: string) {
  if (chore.recurrence === 'once') return chore.dueDate === date
  if (chore.recurrence === 'daily') return true
  return chore.weekday === weekdayOf(date)
}

export function recurrenceLabel(chore: Pick<ChoreRow, 'recurrence' | 'weekday'>) {
  if (chore.recurrence === 'daily') return 'Every day'
  if (chore.recurrence === 'weekly' && chore.weekday !== null) return `Every ${WEEKDAYS[chore.weekday]}`
  return null
}
