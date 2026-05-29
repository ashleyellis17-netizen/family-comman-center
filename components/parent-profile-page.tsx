import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  parents,
  calendarEvents,
  parentNotes,
  approvalQueue,
  googleAccounts,
  groundings,
  children,
} from '@/lib/mock-data';
import { SectionCard } from '@/components/section-card';
import { EmptyState } from '@/components/empty-state';
import { colorFor, personLabel } from '@/lib/people';
import type { ParentId } from '@/lib/types';
import {
  ArrowLeft,
  CalendarDays,
  ShieldCheck,
  StickyNote,
  CheckCheck,
  Plug,
  Clock,
  MapPin,
  Lock,
} from 'lucide-react';

interface ParentProfilePageProps {
  parentId: ParentId;
}

const todayStr = new Date().toISOString().split('T')[0];

const permissionLabels: Record<string, string> = {
  settings: 'App Settings',
  kids: 'Manage Kids',
  tasks: 'Manage Tasks',
  'tasks-view': 'View Tasks',
  allowance: 'Allowance',
  meals: 'Meal Planning',
  groceries: 'Groceries',
  calendars: 'Calendars',
  rewards: 'Rewards',
  grounding: 'Grounding',
  approvals: 'Approvals',
  dashboard: 'Dashboard',
  notes: 'Parent Notes',
};

export function ParentProfilePage({ parentId }: ParentProfilePageProps) {
  const parent = parents.find((p) => p.id === parentId);
  if (!parent) return null;

  const c = colorFor(parentId);
  const myEvents = calendarEvents
    .filter((e) => e.person === parentId || e.calendar === parentId)
    .sort((a, b) => a.date.localeCompare(b.date));
  const upcomingEvents = myEvents.filter((e) => e.date >= todayStr).slice(0, 6);
  const myNotes = parentNotes.filter((n) => n.author === parentId);
  const pendingApprovals = approvalQueue.filter((a) => a.status === 'pending');
  const account = googleAccounts.find((g) => g.personId === parentId);
  const activeGroundings = groundings.filter((g) => g.status === 'active');

  const calendarHref = `/${parentId}-calendar`;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/family-hub"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Family Hub
      </Link>

      {/* Header */}
      <div className={cn('overflow-hidden rounded-3xl border bg-card', c.border)}>
        <div className={cn('p-6 md:p-8', c.bg)}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className={cn(
                'flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-4xl font-extrabold ring-4 ring-offset-4 ring-offset-card',
                c.bgSolid,
                c.ring,
              )}
            >
              {parent.avatar}
            </div>
            <div className="flex-1">
              <h1 className={cn('text-4xl font-extrabold md:text-5xl', c.text)}>{parent.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold">
                <span className="rounded-full bg-card px-3 py-1 text-foreground shadow-sm">Parent</span>
                <span className="flex items-center gap-1 rounded-full bg-card px-3 py-1 text-foreground shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5" /> {parent.permissions.length} permissions
                </span>
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full px-3 py-1 shadow-sm',
                    account?.connected ? 'bg-success/15 text-success' : 'bg-card text-muted-foreground',
                  )}
                >
                  <Plug className="h-3.5 w-3.5" /> {account?.connected ? 'Google linked' : 'Google not linked'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick tiles */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: CalendarDays, label: 'Upcoming', value: `${upcomingEvents.length}` },
              { icon: CheckCheck, label: 'To Approve', value: `${pendingApprovals.length}` },
              { icon: StickyNote, label: 'My Notes', value: `${myNotes.length}` },
              { icon: Lock, label: 'Active Groundings', value: `${activeGroundings.length}` },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card p-4 text-center shadow-sm">
                <s.icon className={cn('mx-auto mb-2 h-6 w-6', c.text)} />
                <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <SectionCard
          title={`${parent.name}'s Calendar`}
          subtitle={`${upcomingEvents.length} upcoming`}
          icon={CalendarDays}
          iconClassName={c.bgSolid}
          href={calendarHref}
        >
          {upcomingEvents.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No upcoming events" />
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((e) => (
                <div key={e.id} className={cn('flex items-center gap-4 rounded-xl border p-3', c.border, c.bg)}>
                  <div className="min-w-[52px] rounded-xl bg-card p-2 text-center shadow-sm">
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className={cn('text-xl font-extrabold', c.text)}>{new Date(e.date).getDate()}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{e.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {e.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {e.time}
                        </span>
                      )}
                      {e.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {e.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Permissions */}
        <SectionCard title="Access & Permissions" subtitle="What this parent can manage" icon={ShieldCheck} iconClassName={c.bgSolid}>
          <div className="flex flex-wrap gap-2">
            {parent.permissions.map((perm) => (
              <span
                key={perm}
                className={cn('rounded-full border px-3 py-1.5 text-sm font-semibold', c.border, c.bg, c.text)}
              >
                {permissionLabels[perm] ?? perm}
              </span>
            ))}
          </div>
        </SectionCard>

        {/* Notes */}
        <SectionCard title="Parent Notes" subtitle={`${myNotes.length} from ${parent.name}`} icon={StickyNote} iconClassName="bg-warning text-warning-foreground" href="/family-hub">
          {myNotes.length === 0 ? (
            <EmptyState icon={StickyNote} title="No notes yet" />
          ) : (
            <div className="space-y-2">
              {myNotes.map((n) => (
                <div key={n.id} className="rounded-xl border border-border/50 bg-muted/30 p-3">
                  <p className="text-sm text-foreground">{n.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Approvals */}
        <SectionCard title="Waiting on Approval" subtitle={`${pendingApprovals.length} pending`} icon={CheckCheck} iconClassName="bg-primary text-primary-foreground" href="/approvals">
          {pendingApprovals.length === 0 ? (
            <EmptyState icon={CheckCheck} title="Nothing to approve" />
          ) : (
            <div className="space-y-2">
              {pendingApprovals.slice(0, 5).map((a) => {
                const child = children.find((ch) => ch.id === a.childId);
                const cc = colorFor(a.childId);
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                    <span className={cn('flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold', cc.bgSolid)}>
                      {child?.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{a.title}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {personLabel[a.childId]} · {a.type.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
