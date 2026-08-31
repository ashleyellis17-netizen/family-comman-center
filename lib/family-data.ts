import { getAssignments } from '@/app/actions/school';
import { getEvents } from '@/app/actions/events';
import { getProjects } from '@/app/actions/projects';
import { getParentRequests } from '@/app/actions/parent-requests';
import { chores as mockChores, children } from '@/lib/mock-data';
import {
  getUrgency,
  URGENCY_META,
  todayISO,
  type Urgency,
} from '@/lib/checkin';

// ---------------------------------------------------------------------------
// The connection layer: one normalized model that every view reads from.
// Merges assignments, calendar events, projects, chores, and parent requests
// into a single `PlanItem` shape with a consistent urgency + bucketing model.
// ---------------------------------------------------------------------------

export type PlanSource = 'assignment' | 'event' | 'project' | 'chore' | 'request';

export interface PlanItem {
  id: string; // globally unique, e.g. "assignment-12"
  source: PlanSource;
  refId: number | string; // original row id
  childId: string; // 'alex' | 'jaxon' | 'carson' | 'family'
  childName: string;
  title: string;
  subtitle?: string; // subject/type/category context line
  kind: string; // human label: Homework, Test, Event, Chore, Project, Request
  dueDate: string | null;
  dueTime?: string | null;
  urgency: Urgency;
  status?: string;
  href: string; // where tapping the item should go
  done: boolean;
  missing?: boolean;
  priority?: string;
  actionable: boolean; // false for read-only sources (chores this pass)
}

const CHILD_NAME: Record<string, string> = {
  alex: 'Alex',
  jaxon: 'Jaxon',
  carson: 'Carson',
  family: 'Everyone',
};

function nameFor(childId: string | null | undefined): string {
  if (!childId) return CHILD_NAME.family;
  return CHILD_NAME[childId] ?? childId;
}

const ASSIGNMENT_KIND: Record<string, string> = {
  homework: 'Homework',
  test: 'Test',
  quiz: 'Quiz',
  project: 'Project',
  reading: 'Reading',
  worksheet: 'Worksheet',
  other: 'School',
};

const DONE_ASSIGNMENT = new Set(['Turned In', 'Graded']);

function childHref(childId: string): string {
  if (childId === 'alex' || childId === 'jaxon' || childId === 'carson') return `/${childId}`;
  return '/';
}

// ---------------------------------------------------------------------------
// Fetch + normalize everything.
// ---------------------------------------------------------------------------

export interface FamilyPlanOptions {
  // Include items that are already completed/turned in (default false).
  includeDone?: boolean;
}

export async function getFamilyPlan(opts: FamilyPlanOptions = {}): Promise<PlanItem[]> {
  const { includeDone = false } = opts;
  const today = todayISO();

  const [assignments, events, projects, requests] = await Promise.all([
    getAssignments(),
    getEvents(),
    getProjects(),
    getParentRequests(),
  ]);

  const items: PlanItem[] = [];

  // --- Assignments -------------------------------------------------------
  for (const a of assignments) {
    const done = DONE_ASSIGNMENT.has(a.status);
    const missing = a.status === 'Missing' || a.status === 'Waiting for confirmation';
    if (done && !includeDone) continue;
    items.push({
      id: `assignment-${a.id}`,
      source: 'assignment',
      refId: a.id,
      childId: a.childId,
      childName: nameFor(a.childId),
      title: a.title,
      subtitle: [ASSIGNMENT_KIND[a.type] ?? 'School', a.subject || null, a.teacher || null]
        .filter(Boolean)
        .join(' · '),
      kind: ASSIGNMENT_KIND[a.type] ?? 'School',
      dueDate: a.dueDate ?? null,
      dueTime: a.dueTime ?? null,
      urgency: getUrgency(a.dueDate),
      status: a.status,
      href: childHref(a.childId),
      done,
      missing,
      priority: a.priority,
      actionable: true,
    });
  }

  // --- Calendar events (today + future only) -----------------------------
  for (const e of events) {
    if (e.date < today) continue;
    const childId = e.allChildren ? 'family' : e.childId ?? 'family';
    items.push({
      id: `event-${e.id}`,
      source: 'event',
      refId: e.id,
      childId,
      childName: nameFor(childId),
      title: e.title,
      subtitle: [e.category, e.description || null].filter(Boolean).join(' · '),
      kind: 'Event',
      dueDate: e.date,
      dueTime: e.time ?? null,
      urgency: getUrgency(e.date),
      href: '/calendar',
      done: false,
      actionable: false,
    });
  }

  // --- Projects (surface the next unfinished milestone) ------------------
  for (const p of projects) {
    if (p.status === 'done' && !includeDone) continue;
    const nextStep = p.milestones.find((m) => !m.done);
    const totalSteps = p.milestones.length;
    const doneSteps = p.milestones.filter((m) => m.done).length;
    items.push({
      id: `project-${p.id}`,
      source: 'project',
      refId: p.id,
      childId: p.childId,
      childName: nameFor(p.childId),
      title: p.title,
      subtitle: nextStep
        ? `Next: ${nextStep.title}`
        : totalSteps > 0
          ? `${doneSteps}/${totalSteps} steps done`
          : p.subject || 'Project',
      kind: 'Project',
      dueDate: p.dueDate ?? null,
      urgency: getUrgency(p.dueDate),
      status: p.status,
      href: childHref(p.childId),
      done: p.status === 'done',
      priority: 'high',
      actionable: true,
    });
  }

  // --- Chores (read-only this pass, from mock data) ----------------------
  for (const c of mockChores) {
    if (c.completed && !includeDone) continue;
    items.push({
      id: `chore-${c.id}`,
      source: 'chore',
      refId: c.id,
      childId: c.assignedTo,
      childName: nameFor(c.assignedTo),
      title: c.title,
      subtitle: c.description || 'Chore',
      kind: 'Chore',
      dueDate: c.dueDate ?? null,
      urgency: getUrgency(c.dueDate),
      status: c.completed ? 'done' : 'open',
      href: '/chores',
      done: c.completed,
      actionable: false,
    });
  }

  // --- Parent requests ----------------------------------------------------
  for (const r of requests) {
    const done = r.status === 'done';
    if (done && !includeDone) continue;
    items.push({
      id: `request-${r.id}`,
      source: 'request',
      refId: r.id,
      childId: r.childId,
      childName: nameFor(r.childId),
      title: r.content,
      subtitle: `Asked a parent · ${r.category}`,
      kind: 'Request',
      dueDate: null,
      urgency: 'none',
      status: r.status,
      href: '/',
      done,
      actionable: true,
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Pure selectors over a PlanItem[] (no extra DB calls, so views can share one fetch).
// ---------------------------------------------------------------------------

export function sortPlan(items: PlanItem[]): PlanItem[] {
  const priorityRank: Record<string, number> = { high: 0, normal: 1, low: 2 };
  return [...items].sort((a, b) => {
    const ua = URGENCY_META[a.urgency].rank;
    const ub = URGENCY_META[b.urgency].rank;
    if (ua !== ub) return ua - ub;
    return (priorityRank[a.priority ?? 'normal'] ?? 1) - (priorityRank[b.priority ?? 'normal'] ?? 1);
  });
}

// "Tonight": actionable schoolwork/projects/chores/events that are due today
// or already overdue. Requests are handled in Needs Attention, not here.
export function tonight(items: PlanItem[]): PlanItem[] {
  return sortPlan(
    items.filter(
      (i) =>
        i.source !== 'request' &&
        !i.done &&
        (i.urgency === 'today' || i.urgency === 'overdue')
    )
  );
}

export function tomorrow(items: PlanItem[]): PlanItem[] {
  return sortPlan(
    items.filter((i) => i.source !== 'request' && !i.done && i.urgency === 'tomorrow')
  );
}

// "Coming Up": due later this week or beyond (not today/tomorrow/overdue).
export function comingUp(items: PlanItem[]): PlanItem[] {
  return sortPlan(
    items.filter(
      (i) => i.source !== 'request' && !i.done && (i.urgency === 'soon' || i.urgency === 'later')
    )
  );
}

export interface AttentionGroup {
  key: string;
  label: string;
  items: PlanItem[];
}

// Exceptions a parent should act on, grouped by reason.
export function needsAttention(items: PlanItem[]): AttentionGroup[] {
  const overdue = sortPlan(
    items.filter((i) => i.source === 'assignment' && !i.done && !i.missing && i.urgency === 'overdue')
  );
  const missing = sortPlan(items.filter((i) => i.source === 'assignment' && i.missing && !i.done));
  const newRequests = items.filter((i) => i.source === 'request' && i.status !== 'done');

  const groups: AttentionGroup[] = [];
  if (missing.length) groups.push({ key: 'missing', label: 'Missing work', items: missing });
  if (overdue.length) groups.push({ key: 'overdue', label: 'Overdue', items: overdue });
  if (newRequests.length)
    groups.push({ key: 'requests', label: 'Requests to answer', items: newRequests });
  return groups;
}

export function byChild(items: PlanItem[], childId: string): PlanItem[] {
  return items.filter((i) => i.childId === childId);
}

export interface ChildStatus {
  childId: string;
  name: string;
  todo: number; // open actionable items due today or overdue
  comingUp: number;
  missing: number;
  nextUp: PlanItem | null;
}

export function childStatus(items: PlanItem[], childId: string): ChildStatus {
  const mine = items.filter((i) => i.childId === childId && !i.done);
  const due = tonight(mine);
  const soon = comingUp(mine);
  const missing = mine.filter((i) => i.missing).length;
  return {
    childId,
    name: nameFor(childId),
    todo: due.length,
    comingUp: soon.length,
    missing,
    nextUp: due[0] ?? soon[0] ?? null,
  };
}

export function allChildStatuses(items: PlanItem[]): ChildStatus[] {
  return children.map((c) => childStatus(items, c.id));
}
