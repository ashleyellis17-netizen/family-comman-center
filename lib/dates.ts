// Calendar dates are stored as plain YYYY-MM-DD strings in the household timezone.
// All arithmetic is done on UTC midnight so daylight saving changes never shift a day.

export function todayInTimezone(timezone: string, now = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  } catch {
    return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
  }
}

export function hourInTimezone(timezone: string, now = new Date()): number {
  try {
    return Number(new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', hourCycle: 'h23' }).format(now))
  } catch {
    return now.getHours()
  }
}

function toUTC(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function fromUTC(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function addDays(date: string, days: number): string {
  const d = toUTC(date)
  d.setUTCDate(d.getUTCDate() + days)
  return fromUTC(d)
}

/** Monday of the week containing `date`. */
export function startOfWeek(date: string): string {
  const dow = toUTC(date).getUTCDay()
  return addDays(date, dow === 0 ? -6 : 1 - dow)
}

export function weekDates(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUTC(to).getTime() - toUTC(from).getTime()) / 86400000)
}

export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return new Intl.DateTimeFormat('en-US', { ...opts, timeZone: 'UTC' }).format(toUTC(date))
}

export function isValidTimezone(tz: string) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

/** Parse "3:00 PM" style event times into minutes after midnight for sorting. */
export function timeToMinutes(time?: string | null): number | null {
  if (!time) return null
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!m) return null
  let h = Number(m[1])
  const meridiem = m[3]?.toUpperCase()
  if (meridiem === 'PM' && h !== 12) h += 12
  if (meridiem === 'AM' && h === 12) h = 0
  return h * 60 + Number(m[2])
}
