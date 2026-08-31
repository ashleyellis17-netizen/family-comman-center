'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  CalendarClock,
  AlertTriangle,
  Check,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type {
  AssignmentRow,
  BrainDumpRow,
  ParentRequestRow,
  SkillCheckinRow,
} from '@/lib/db/schema';
import type { ProjectWithMilestones } from '@/app/actions/projects';
import type { PlanItem } from '@/lib/family-data';
import { updateAssignment } from '@/app/actions/school';
import { isOpen, isMissing, sortByUrgency, todayISO } from '@/lib/checkin';
import { getAccent, UrgencyBadge, formatDue } from './shared';
import { GuidedCheckIn } from './guided-check-in';
import { QuickAddAssignment } from './quick-add-assignment';
import { SkillTrackerCard } from './skill-tracker';
import { ProjectsPanel } from './projects-panel';
import { BrainDumpPanel } from './brain-dump-panel';
import { AskParentPanel } from './ask-parent-panel';

export function CheckInStation({
  childId,
  childName,
  grade,
  assignments,
  projects,
  brainDump,
  parentRequests,
  skillCheckins,
  comingUpEvents = [],
}: {
  childId: string;
  childName: string;
  grade?: string;
  assignments: AssignmentRow[];
  projects: ProjectWithMilestones[];
  brainDump: BrainDumpRow[];
  parentRequests: ParentRequestRow[];
  skillCheckins: SkillCheckinRow[];
  comingUpEvents?: PlanItem[];
}) {
  const accent = getAccent(childId);
  const [guidedOpen, setGuidedOpen] = useState(false);

  const openItems = assignments.filter(isOpen);
  const missing = assignments.filter(isMissing);
  const homework = sortByUrgency(
    openItems.filter((a) => !['test', 'quiz', 'project'].includes(a.type) && !isMissing(a))
  );
  const comingUp = sortByUrgency(
    openItems.filter((a) => ['test', 'quiz'].includes(a.type) && !isMissing(a))
  );

  const today = todayISO();
  const checkedInToday = skillCheckins.some((c) => c.date === today);

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Family Dashboard
          </Link>
          <h1 className="cozyla-heading text-foreground text-balance">
            {childName}&apos;s After-School Check-In
          </h1>
          <p className="text-muted-foreground font-medium">
            {dateLabel}
            {grade ? ` · ${grade}` : ''}
          </p>
        </div>
        <div
          className={cn(
            'flex items-center gap-2 rounded-2xl px-4 py-2.5 font-bold text-sm border',
            checkedInToday
              ? 'bg-success/12 text-success border-success/30'
              : 'bg-muted text-muted-foreground border-border'
          )}
        >
          {checkedInToday ? (
            <>
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              Checked in today
            </>
          ) : (
            <>
              <Clock className="w-5 h-5" aria-hidden="true" />
              Not checked in yet
            </>
          )}
        </div>
      </div>

      {/* Big start CTA */}
      <div
        className={cn(
          'rounded-3xl p-6 sm:p-8 bg-gradient-to-br text-white shadow-lg flex flex-col sm:flex-row sm:items-center gap-5 justify-between',
          accent.grad
        )}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-balance">Ready to check in?</h2>
            <p className="text-white/90 font-medium">A few quick questions about your day.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            onClick={() => setGuidedOpen(true)}
            className="touch-target font-bold bg-white text-foreground hover:bg-white/90"
          >
            {checkedInToday ? 'Check in again' : 'Start Check-In'}
          </Button>
          <QuickAddAssignment
            childId={childId}
            triggerLabel="Quick add"
            triggerClassName="bg-white/15 text-white hover:bg-white/25 border-0"
          />
        </div>
      </div>

      {/* Missing work rescue */}
      {missing.length > 0 && (
        <div className="rounded-3xl border-2 border-destructive/30 bg-destructive/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" aria-hidden="true" />
            <h3 className="text-lg font-extrabold text-foreground">Let&apos;s rescue missing work</h3>
          </div>
          <ul className="space-y-3">
            {missing.map((a) => (
              <MissingItem key={a.id} assignment={a} />
            ))}
          </ul>
        </div>
      )}

      {/* Homework + Coming up */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssignmentColumn
          title="Homework tonight"
          icon={BookOpen}
          accentSoft={accent.soft}
          accentText={accent.text}
          items={homework}
          emptyText="No homework right now. Enjoy the afternoon!"
          childId={childId}
          addLabel="Add homework"
          addType="homework"
        />
        <AssignmentColumn
          title="Coming up"
          icon={CalendarClock}
          accentSoft={accent.soft}
          accentText={accent.text}
          items={comingUp}
          events={comingUpEvents}
          emptyText="No tests, quizzes, or events on the radar."
          childId={childId}
          addLabel="Add a test"
          addType="test"
          showDue
        />
      </div>

      {/* Projects + Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectsPanel childId={childId} projects={projects} />
        <SkillTrackerCard childId={childId} checkins={skillCheckins} />
      </div>

      {/* Brain dump + Ask a parent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BrainDumpPanel childId={childId} items={brainDump} />
        <AskParentPanel childId={childId} items={parentRequests} />
      </div>

      <GuidedCheckIn
        childId={childId}
        childName={childName}
        open={guidedOpen}
        onOpenChange={setGuidedOpen}
        openHomework={openItems}
        projects={projects}
      />
    </div>
  );
}

function AssignmentColumn({
  title,
  icon: Icon,
  accentSoft,
  accentText,
  items,
  events = [],
  emptyText,
  childId,
  addLabel,
  addType,
  showDue = false,
}: {
  title: string;
  icon: React.ElementType;
  accentSoft: string;
  accentText: string;
  items: AssignmentRow[];
  events?: PlanItem[];
  emptyText: string;
  childId: string;
  addLabel: string;
  addType: string;
  showDue?: boolean;
}) {
  const isEmpty = items.length === 0 && events.length === 0;
  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', accentSoft)}>
            <Icon className={cn('w-5 h-5', accentText)} />
          </div>
          <h3 className="text-lg font-extrabold text-foreground">{title}</h3>
        </div>
        <QuickAddAssignment
          childId={childId}
          defaultType={addType}
          triggerLabel={addLabel}
          triggerVariant="secondary"
        />
      </div>
      {isEmpty ? (
        <p className="text-sm text-muted-foreground text-center py-6">{emptyText}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((a) => (
            <AssignmentItem key={a.id} assignment={a} showDue={showDue} />
          ))}
          {events.map((e) => (
            <EventItem key={e.id} event={e} />
          ))}
        </ul>
      )}
    </div>
  );
}

// Read-only calendar event surfaced from the unified plan.
function EventItem({ event: e }: { event: PlanItem }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-muted/40 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
        <CalendarClock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{e.title}</p>
        <p className="text-xs text-muted-foreground truncate">
          {['On the calendar', e.dueTime || null].filter(Boolean).join(' · ')}
        </p>
      </div>
      <UrgencyBadge dueDate={e.dueDate} />
    </li>
  );
}

function AssignmentItem({ assignment: a, showDue }: { assignment: AssignmentRow; showDue?: boolean }) {
  const [isPending, startTransition] = useTransition();
  function markDone() {
    startTransition(async () => {
      await updateAssignment(a.id, { status: 'Turned In' });
    });
  }
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-muted/40 px-4 py-3">
      <button
        type="button"
        onClick={markDone}
        disabled={isPending}
        aria-label={`Mark ${a.title} done`}
        className="w-8 h-8 rounded-full border-2 border-border hover:border-success hover:bg-success/10 flex items-center justify-center shrink-0 transition-colors touch-target"
      >
        <Check className="w-4 h-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{a.title}</p>
        <p className="text-xs text-muted-foreground">
          {[a.subject, a.priority === 'high' ? 'High priority' : null, showDue ? formatDue(a.dueDate) : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      <UrgencyBadge dueDate={a.dueDate} />
    </li>
  );
}

function MissingItem({ assignment: a }: { assignment: AssignmentRow }) {
  const [isPending, startTransition] = useTransition();
  const waiting = a.status === 'Waiting for confirmation';

  function set(status: string) {
    startTransition(async () => {
      await updateAssignment(a.id, { status });
    });
  }

  return (
    <li className="rounded-2xl bg-card border border-border/60 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-bold text-foreground">{a.title}</p>
          <p className="text-xs text-muted-foreground">
            {a.subject ? `${a.subject} · ` : ''}
            {waiting ? 'Waiting to confirm it was turned in' : 'Marked missing'}
          </p>
        </div>
        <UrgencyBadge dueDate={a.dueDate} />
      </div>
      {waiting ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => set('Turned In')} disabled={isPending} className="bg-success text-success-foreground hover:bg-success/90">
            <Check className="w-4 h-4" />
            Confirmed turned in
          </Button>
          <Button size="sm" variant="ghost" onClick={() => set('Not Started')} disabled={isPending}>
            Still need to do it
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => set('Waiting for confirmation')} disabled={isPending}>
            I turned it in
          </Button>
          <Button size="sm" variant="ghost" onClick={() => set('In Progress')} disabled={isPending}>
            Working on it now
          </Button>
        </div>
      )}
    </li>
  );
}
