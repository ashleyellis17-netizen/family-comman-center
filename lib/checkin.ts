import type { AssignmentRow } from '@/lib/db/schema';

// ---------- Per-child, age-appropriate configuration ----------
// Alex (12, 7th grade), Jaxon (8, 3rd grade), Carson (5, 1st grade).

export type ChildKey = 'alex' | 'jaxon' | 'carson';

export interface SkillRating {
  label: string;
  emoji: string;
  tone: 'good' | 'mid' | 'low';
}

export interface ChildCheckinConfig {
  // Behavior/skill areas rated during the daily check-in.
  skills: string[];
  // The rating scale, tuned to the child's age.
  ratings: SkillRating[];
  // A short, age-appropriate greeting for the check-in home screen.
  greeting: string;
}

export const CHILD_CHECKIN_CONFIG: Record<ChildKey, ChildCheckinConfig> = {
  alex: {
    greeting: 'How did today go?',
    skills: ['Turned in my work', 'Stayed organized', 'Managed my time', 'Focused in class'],
    ratings: [
      { label: 'Nailed It', emoji: '💪', tone: 'good' },
      { label: 'Needed a Reminder', emoji: '📝', tone: 'low' },
    ],
  },
  jaxon: {
    greeting: 'How was your school day?',
    skills: ['Listened well', 'Finished my work', 'Was kind to friends', 'Followed directions'],
    ratings: [
      { label: 'Great Job', emoji: '⭐', tone: 'good' },
      { label: 'Needed Help', emoji: '🤝', tone: 'low' },
    ],
  },
  carson: {
    greeting: 'How do you feel about today?',
    skills: ['Listened', 'Shared with friends', 'Tried my best'],
    ratings: [
      { label: 'Awesome', emoji: '😀', tone: 'good' },
      { label: 'Okay', emoji: '😐', tone: 'mid' },
      { label: 'Tough', emoji: '😢', tone: 'low' },
    ],
  },
};

export function getCheckinConfig(childId: string): ChildCheckinConfig {
  return CHILD_CHECKIN_CONFIG[childId as ChildKey] ?? CHILD_CHECKIN_CONFIG.jaxon;
}

// ---------- Option lists (shared by forms) ----------

export const ASSIGNMENT_TYPES = [
  'homework',
  'test',
  'quiz',
  'project',
  'reading',
  'worksheet',
  'other',
] as const;

export const ASSIGNMENT_STATUSES = [
  'Not Started',
  'In Progress',
  'Turned In',
  'Graded',
  'Missing',
  'Waiting for confirmation',
] as const;

export const PRIORITIES = ['low', 'normal', 'high'] as const;

export const EFFORTS = [
  { value: 'quick', label: 'Quick (~15 min)' },
  { value: 'medium', label: 'Medium (~30 min)' },
  { value: 'long', label: 'Long (1 hr+)' },
] as const;

export const REQUEST_CATEGORIES = [
  { value: 'permission', label: 'Permission' },
  { value: 'supplies', label: 'Supplies / money' },
  { value: 'help', label: 'Help with something' },
  { value: 'question', label: 'A question' },
  { value: 'other', label: 'Something else' },
] as const;

// ---------- Urgency bucketing (text + icon, never color-only) ----------

export type Urgency = 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later' | 'none';

// Local YYYY-MM-DD for "today" (avoids UTC off-by-one from toISOString).
export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function daysUntil(dateISO: string): number {
  const today = new Date(todayISO() + 'T00:00:00');
  const target = new Date(dateISO + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function getUrgency(dueDate: string | null | undefined): Urgency {
  if (!dueDate) return 'none';
  const d = daysUntil(dueDate);
  if (d < 0) return 'overdue';
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d <= 6) return 'soon';
  return 'later';
}

export const URGENCY_META: Record<Urgency, { label: string; rank: number }> = {
  overdue: { label: 'Overdue', rank: 0 },
  today: { label: 'Due today', rank: 1 },
  tomorrow: { label: 'Due tomorrow', rank: 2 },
  soon: { label: 'This week', rank: 3 },
  later: { label: 'Later', rank: 4 },
  none: { label: 'No due date', rank: 5 },
};

const DONE_STATUSES = new Set(['Turned In', 'Graded']);

export function isOpen(a: AssignmentRow): boolean {
  return !DONE_STATUSES.has(a.status);
}

export function isMissing(a: AssignmentRow): boolean {
  return a.status === 'Missing' || a.status === 'Waiting for confirmation';
}

// Sort open work by urgency, then priority, so the most pressing is first.
export function sortByUrgency(items: AssignmentRow[]): AssignmentRow[] {
  const priorityRank: Record<string, number> = { high: 0, normal: 1, low: 2 };
  return [...items].sort((a, b) => {
    const ua = URGENCY_META[getUrgency(a.dueDate)].rank;
    const ub = URGENCY_META[getUrgency(b.dueDate)].rank;
    if (ua !== ub) return ua - ub;
    return (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1);
  });
}
