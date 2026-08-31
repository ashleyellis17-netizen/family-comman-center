'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Clock,
  HandHelping,
  CheckCircle2,
  Check,
  CalendarPlus,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { updateAssignment } from '@/app/actions/school';
import { updateParentRequest } from '@/app/actions/parent-requests';
import type { PlanItem, AttentionGroup } from '@/lib/family-data';

const CHILD_DOT: Record<string, string> = {
  alex: 'bg-alex',
  jaxon: 'bg-jaxon',
  carson: 'bg-carson',
  family: 'bg-primary',
};

const GROUP_ICON: Record<string, React.ElementType> = {
  missing: AlertTriangle,
  overdue: Clock,
  requests: HandHelping,
};

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function Row({ item }: { item: PlanItem }) {
  const [isPending, startTransition] = useTransition();

  const isRequest = item.source === 'request';
  const assignmentId = typeof item.refId === 'number' ? item.refId : Number(item.refId);

  function snooze() {
    startTransition(() => updateAssignment(assignmentId, { dueDate: tomorrowISO(), status: 'Not Started' }));
  }
  function markDone() {
    startTransition(() => updateAssignment(assignmentId, { status: 'Turned In' }));
  }
  function requestSeen() {
    startTransition(() => updateParentRequest(assignmentId, { status: 'seen' }));
  }
  function requestDone() {
    startTransition(() => updateParentRequest(assignmentId, { status: 'done' }));
  }

  return (
    <li className={cn('rounded-2xl border border-border/60 bg-card p-4', isPending && 'opacity-60')}>
      <div className="flex items-start gap-2">
        <span
          className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', CHILD_DOT[item.childId] ?? 'bg-muted')}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-foreground text-pretty">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {item.childName}
            {item.subtitle ? ` · ${item.subtitle}` : ''}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {isRequest ? (
          <>
            {item.status === 'new' && (
              <Button size="sm" variant="secondary" disabled={isPending} onClick={requestSeen}>
                <Eye className="mr-1 h-4 w-4" aria-hidden="true" />
                Mark seen
              </Button>
            )}
            <Button size="sm" disabled={isPending} onClick={requestDone}>
              <Check className="mr-1 h-4 w-4" aria-hidden="true" />
              Done
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" disabled={isPending} onClick={markDone}>
              <Check className="mr-1 h-4 w-4" aria-hidden="true" />
              Mark done
            </Button>
            <Button size="sm" variant="secondary" disabled={isPending} onClick={snooze}>
              <CalendarPlus className="mr-1 h-4 w-4" aria-hidden="true" />
              Snooze to tomorrow
            </Button>
          </>
        )}
        <Button asChild size="sm" variant="ghost" className="ml-auto">
          <Link href={item.href}>
            Handle
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </li>
  );
}

export function NeedsAttentionPanel({ groups }: { groups: AttentionGroup[] }) {
  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <section className="rounded-3xl border border-border/60 bg-card shadow-sm p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-jaxon to-jaxon-light">
          <AlertTriangle className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground leading-none">Needs Attention</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {total > 0 ? `${total} thing${total > 1 ? 's' : ''} to handle` : 'Nothing needs you right now'}
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/30 py-8 text-center">
          <CheckCircle2 className="mb-2 h-8 w-8 text-success" aria-hidden="true" />
          <p className="font-bold text-foreground">All clear</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground text-pretty">
            No missing work, overdue assignments, or open requests. Everything is on track.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => {
            const Icon = GROUP_ICON[g.key] ?? AlertTriangle;
            return (
              <div key={g.key}>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {g.label} ({g.items.length})
                </p>
                <ul className="space-y-2">
                  {g.items.map((item) => (
                    <Row key={item.id} item={item} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
