import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { UrgencyBadge } from '@/components/check-in/shared';
import { CircleCheck, CircleDashed, ChevronRight, AlertTriangle } from 'lucide-react';
import type { ChildStatus } from '@/lib/family-data';

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

// Presentational: the dashboard fetches the unified plan once and passes the
// derived per-child statuses + which children have checked in today.
export function AfterSchoolStatus({
  statuses,
  checkedInIds,
}: {
  statuses: ChildStatus[];
  checkedInIds: string[];
}) {
  return (
    <div>
      <h2 className="mb-4 text-xl font-extrabold text-foreground">After-School Status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statuses.map((s) => {
          const checkedIn = checkedInIds.includes(s.childId);
          return (
            <Link key={s.childId} href={`/${s.childId}`} className="group block">
              <Card className={cn('h-full p-5 ring-1 transition hover:shadow-md', CHILD_RING[s.childId])}>
                <div className="mb-3 flex items-center justify-between">
                  <span className={cn('text-lg font-extrabold', CHILD_ACCENT[s.childId])}>{s.name}</span>
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>

                <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  {checkedIn ? (
                    <>
                      <CircleCheck className="h-4 w-4 text-success" aria-hidden="true" />
                      <span className="text-foreground">Checked in today</span>
                    </>
                  ) : (
                    <>
                      <CircleDashed className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <span className="text-muted-foreground">Not checked in yet</span>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  {s.todo === 0 ? (
                    <span>Nothing to do tonight</span>
                  ) : (
                    <span>
                      <span className="font-bold text-foreground">{s.todo}</span> to do tonight
                    </span>
                  )}
                  {s.comingUp > 0 && <span>· {s.comingUp} coming up</span>}
                  {s.missing > 0 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      {s.missing} missing
                    </span>
                  )}
                </div>

                {s.nextUp && (
                  <div className="mt-3 border-t border-border/50 pt-3">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Next up</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="line-clamp-1 text-sm font-semibold text-foreground">{s.nextUp.title}</p>
                      {s.nextUp.dueDate && <UrgencyBadge dueDate={s.nextUp.dueDate} className="shrink-0" />}
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
