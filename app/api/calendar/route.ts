import { children, assignments } from '@/lib/mock-data';
import { getEvents } from '@/app/actions/events';
import type { EventRow } from '@/lib/db/schema';

// Force dynamic so the feed always reflects the latest data
export const dynamic = 'force-dynamic';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

// Escape text per RFC 5545
function esc(text: string) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Convert "3:00 PM" -> { h: 15, m: 0 }
function parseTime(time?: string): { h: number; m: number } | null {
  if (!time) return null;
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return { h, m };
}

// "2026-09-01" -> "20260901"
function dateToICS(dateStr: string) {
  return dateStr.replace(/-/g, '');
}

function foldLine(line: string) {
  // RFC 5545: lines longer than 75 octets should be folded
  if (line.length <= 74) return line;
  const chunks: string[] = [];
  let remaining = line;
  chunks.push(remaining.slice(0, 74));
  remaining = remaining.slice(74);
  while (remaining.length > 0) {
    chunks.push(' ' + remaining.slice(0, 73));
    remaining = remaining.slice(73);
  }
  return chunks.join('\r\n');
}

function childLabel(event: EventRow): string {
  if (event.allChildren) return 'All Kids';
  if (event.childId) {
    const child = children.find((c) => c.id === event.childId);
    return child ? child.name : '';
  }
  return '';
}

function buildEvent(opts: {
  uid: string;
  date: string;
  time?: string;
  title: string;
  description?: string;
  dtstamp: string;
}): string {
  const { uid, date, time, title, description, dtstamp } = opts;
  const lines: string[] = ['BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${dtstamp}`];

  const parsed = parseTime(time);
  if (parsed) {
    const dtStart = `${dateToICS(date)}T${pad(parsed.h)}${pad(parsed.m)}00`;
    // default 1 hour duration
    let endH = parsed.h + 1;
    let endDate = date;
    if (endH >= 24) {
      endH -= 24;
      const d = new Date(date + 'T00:00:00');
      d.setDate(d.getDate() + 1);
      endDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }
    const dtEnd = `${dateToICS(endDate)}T${pad(endH)}${pad(parsed.m)}00`;
    lines.push(`DTSTART;TZID=America/New_York:${dtStart}`);
    lines.push(`DTEND;TZID=America/New_York:${dtEnd}`);
  } else {
    // All-day event
    lines.push(`DTSTART;VALUE=DATE:${dateToICS(date)}`);
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const endDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    lines.push(`DTEND;VALUE=DATE:${dateToICS(endDate)}`);
  }

  lines.push(`SUMMARY:${esc(title)}`);
  if (description) lines.push(`DESCRIPTION:${esc(description)}`);
  lines.push('END:VEVENT');
  return lines.map(foldLine).join('\r\n');
}

export async function GET() {
  const now = new Date();
  const dtstamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(
    now.getUTCDate(),
  )}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const vevents: string[] = [];

  const calendarEvents = await getEvents();

  // Family + school district calendar events
  for (const event of calendarEvents) {
    const who = childLabel(event);
    const title = who ? `${event.title} (${who})` : event.title;
    vevents.push(
      buildEvent({
        uid: `event-${event.id}@family-command-center`,
        date: event.date,
        time: event.time,
        title,
        description: event.description,
        dtstamp,
      }),
    );
  }

  // Assignment due dates
  for (const a of assignments) {
    const child = children.find((c) => c.id === a.childId);
    const who = child ? child.name : '';
    vevents.push(
      buildEvent({
        uid: `assignment-${a.id}@family-command-center`,
        date: a.dueDate,
        title: `Due: ${a.title}${who ? ` (${who})` : ''}`,
        description: `${a.subject} - Status: ${a.status}`,
        dtstamp,
      }),
    );
  }

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Family Command Center//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Family Command Center',
    'X-WR-TIMEZONE:America/New_York',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');

  return new Response(calendar, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="family-command-center.ics"',
      'Cache-Control': 'no-cache, must-revalidate',
    },
  });
}
