// All "what day is it" logic goes through the household timezone so the
// Cozyla, phones, and the server agree regardless of where code runs.

export function dateInTz(timezone: string, at: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at);
}

export function hourInTz(timezone: string, at: Date = new Date()): number {
  const h = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(at);
  return Number(h);
}

export function addDaysToDateString(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDateLabel(date: string, today: string): string {
  if (date === today) return 'Today';
  if (date === addDaysToDateString(today, 1)) return 'Tomorrow';
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function longDateLabel(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Parses "3:00 PM" / "15:30" into minutes after midnight for sorting. */
export function timeToMinutes(time: string | null | undefined): number {
  if (!time) return -1;
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]\.?m\.?)?/i);
  if (!m) return -1;
  let h = Number(m[1]) % 12;
  const min = Number(m[2] ?? 0);
  const mer = m[3]?.toLowerCase();
  if (!mer && Number(m[1]) >= 12) h = Number(m[1]);
  if (mer?.startsWith('p')) h += 12;
  return h * 60 + min;
}

export const US_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
] as const;
