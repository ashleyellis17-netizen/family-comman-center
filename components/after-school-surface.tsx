import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { children } from '@/lib/mock-data';
import { getAssignments, getSkillCheckins } from '@/app/actions/school';
import { getParentRequests } from '@/app/actions/parent-requests';
import {
  getUrgency,
  URGENCY_META,
  isOpen,
  isMissing,
  sortByUrgency,
  todayISO,
} from '@/lib/checkin';
import type { AssignmentRow } from '@/lib/db/schema';
import {
  CircleCheck,
  CircleDashed,
  TriangleAlert,
  Clock,
  Inbox,
  ChevronRight,
} from 'lucide-react';

const CHILD_ACCENT: Record<string, string> = {
  alex: 'text-alex',
  jaxon: 'text-jaxon',
  carson: 'text-carson',
};
const CHILD_RING: Record<string, string> = {
  alex: 'ring-alex/40 bg-alex/10',
  jaxon: 'ring-jaxon/40 bg-jaxon/10',
  carson: 'ring-carson/40 bg-carson/10',
};

export async function AfterSchoolSurface() {
  const today = todayISO();
  const [allAssignments, allCheckins, allRequests] = await Promise.all([
    getAssignments(),
    getSkillCheckins(),
    getParentRequests(),
  ]);

  const perChild = children.map((c) => {
    const items = allAssignments.filter((a) => a.childId === c.id);
    const open = items.filter(isOpen);
    const missing = items.filter(isMissing);
    const checkedIn = allCheckins.some((k) => k.childId === c.id && k.date === today);
    const nextUp = sortByUrgency(open)[0] ?? null;
    return { child: c, open, missing, checkedIn, nextUp };
  });

  // Exceptions panel: only things that actually need a parent.
  const attention: {
    childId: string;
    childName: string;
    kind: 'missing' | 'overdue' | 'request';
    label: string;
    href: string;
  }[] = [];

  for (const { child, missing, open } of perChild) {
    for (const m of missing) {
      attention.push({
        childId: child.id,
        childName: child.name,
        kind: 'missing',
        label: `${m.title}${m.subject ? ` · ${m.subject}` : ''}`,
        href: `/${child.id}`,
      });
    }
    for (const o of open) {
      if (getUrgency(o.dueDate) === 'overdue') {
        attention.push({
          childId: child.id,
          childName: child.name,
          kind: 'overdue',
          label: `${o.title}${o.subject ? ` · ${o.subject}` : ''}`,
          href: `/${child.id}`,
        });
      }
    }
  }
  for (const r of allRequests) {
    if (r.status === 'new') {
      const name = children.find((c) => c.id === r.childId)?.name ?? r.childId;
      attention.push({
        childId: r.childId,
        childName: name,
        kind: 'request',
        label: r.content,
        href: '/',
      });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* After-School Status — one card per child */}
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-extrabold text-foreground">After-School Status</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {perChild.map(({ child, open, checkedIn, nextUp }) => (
            <Link key={child.id} href={`/${child.id}`} className="block group">
              <Card className={cn('p-5 h-full ring-1 transition hover:shadow-md', CHILD_RING[child.id])}>
                <div className="flex items-center justify-between mb-3">
                  <span className={cn('text-lg font-extrabold', CHILD_ACCENT[child.id])}>{child.name}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" aria-hidden />
                </div>

                <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
                  {checkedIn ? (
                    <>
                      <CircleCheck className="w-4 h-4 text-success" aria-hidden />
                      <span className="text-foreground">Checked in today</span>
                    </>
                  ) : (
                    <>
                      <CircleDashed className="w-4 h-4 text-muted-foreground" aria-hidden />
                      <span className="text-muted-foreground">Not checked in yet</span>
                    </>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  {open.length === 0 ? (
                    <span>Nothing to do tonight</span>
                  ) : (
                    <span>
                      <span className="font-bold text-foreground">{open.length}</span> thing{open.length === 1 ? '' : 's'} to do
                    </span>
                  )}
                </div>

                {nextUp && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-1">Next up</p>
                    <p className="text-sm font-semibold text-foreground line-clamp-1">{nextUp.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" aria-hidden />
                      {URGENCY_META[getUrgency(nextUp.dueDate)].label}
                    </p>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Needs Attention — exceptions only */}
      <div className="lg:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <TriangleAlert className={cn('w-5 h-5', attention.length > 0 ? 'text-destructive' : 'text-muted-foreground')} aria-hidden />
          <h2 className="text-xl font-extrabold text-foreground">Needs Attention</h2>
        </div>
        <Card className="p-5 h-[calc(100%-2.5rem)]">
          {attention.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-8 gap-2">
              <CircleCheck className="w-8 h-8 text-success" aria-hidden />
              <p className="text-sm font-semibold text-foreground">All clear</p>
              <p className="text-xs text-muted-foreground">No missing work or new requests.</p>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {attention.map((a, i) => (
                <li key={i}>
                  <Link
                    href={a.href}
                    className="flex items-start gap-2.5 rounded-lg p-2.5 hover:bg-muted transition-colors"
                  >
                    <span className="mt-0.5 shrink-0">
                      {a.kind === 'request' ? (
                        <Inbox className="w-4 h-4 text-primary" aria-hidden />
                      ) : (
                        <TriangleAlert className="w-4 h-4 text-destructive" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        {a.childName}
                        <span className="font-normal text-muted-foreground">
                          {' · '}
                          {a.kind === 'missing' ? 'Missing work' : a.kind === 'overdue' ? 'Overdue' : 'New request'}
                        </span>
                      </span>
                      <span className="block text-sm text-muted-foreground line-clamp-1">{a.label}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
