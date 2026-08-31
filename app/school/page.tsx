'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import {
  children,
  assignments as initialAssignments,
  getSchoolBehaviorForChild,
  getSchoolProgressForChild,
} from '@/lib/mock-data';
import type { ChildId, Assignment, AssignmentStatus, SchoolBehaviorRating } from '@/lib/types';
import { GraduationCap, ChevronRight, Check, BookOpen, Smile, School } from 'lucide-react';
import { Button } from '@/components/ui/button';

const childTabs: { id: ChildId; label: string }[] = [
  { id: 'alex', label: 'Alex' },
  { id: 'jaxon', label: 'Jaxon' },
  { id: 'carson', label: 'Carson' },
];

// Only younger kids get the daily school-day behavior tracker
const behaviorTrackerKids: ChildId[] = ['jaxon', 'carson'];

const ratingStyles: Record<SchoolBehaviorRating, { chip: string; dot: string }> = {
  'Great Day': { chip: 'bg-success/15 text-success border-success/30', dot: 'bg-success' },
  'Good Day': { chip: 'bg-primary/15 text-primary border-primary/30', dot: 'bg-primary' },
  'Okay Day': { chip: 'bg-warning/15 text-warning-foreground border-warning/30', dot: 'bg-warning' },
  'Rough Day': { chip: 'bg-destructive/15 text-destructive border-destructive/30', dot: 'bg-destructive' },
};

const accentByChild: Record<ChildId, { bar: string; ring: string; text: string; soft: string }> = {
  alex: { bar: 'bg-alex', ring: 'border-alex/30', text: 'text-alex', soft: 'bg-alex/10' },
  jaxon: { bar: 'bg-jaxon', ring: 'border-jaxon/30', text: 'text-jaxon', soft: 'bg-jaxon/10' },
  carson: { bar: 'bg-carson', ring: 'border-carson/30', text: 'text-carson', soft: 'bg-carson/10' },
};

function formatDue(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SchoolPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [activeChild, setActiveChild] = useState<ChildId>('alex');

  const setStatus = (id: string, status: AssignmentStatus) =>
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const advance = (a: Assignment) => {
    const flow: Partial<Record<AssignmentStatus, AssignmentStatus>> = {
      'Not Started': 'In Progress',
      'In Progress': 'Turned In',
    };
    const next = flow[a.status];
    if (next) setStatus(a.id, next);
  };

  const child = children.find((c) => c.id === activeChild)!;
  const accent = accentByChild[activeChild];
  const childAssignments = assignments
    .filter((a) => a.childId === activeChild)
    .sort((x, y) => new Date(x.dueDate).getTime() - new Date(y.dueDate).getTime());
  const progress = getSchoolProgressForChild(activeChild);
  const behavior = getSchoolBehaviorForChild(activeChild);
  const showBehavior = behaviorTrackerKids.includes(activeChild);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="School Center"
        description="Assignments, grades & school-day behavior"
        icon={GraduationCap}
        iconClassName="from-primary to-primary/80 text-primary-foreground"
      />

      {/* Child filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {childTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChild(tab.id)}
            className={cn(
              'px-5 py-2.5 rounded-2xl text-sm font-bold transition-all touch-target',
              activeChild === tab.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card border border-border/50 text-muted-foreground hover:bg-accent'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* School info + progress */}
      <div className={cn('rounded-3xl bg-card border shadow-sm p-5 mb-6', accent.ring)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', accent.soft)}>
              <School className={cn('w-6 h-6', accent.text)} />
            </div>
            <div>
              <p className="text-lg font-extrabold text-foreground leading-tight">{child.name}</p>
              <p className="text-sm text-muted-foreground">
                {child.grade} · {child.school}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-2xl font-extrabold text-foreground leading-none">{progress.outstanding}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-1">To Do</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-foreground leading-none">{progress.done}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-1">Done</p>
            </div>
            <div className="w-32">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span className="font-semibold">Progress</span>
                <span className="font-bold text-foreground">{progress.percent}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', accent.bar)} style={{ width: `${progress.percent}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Assignment tracker */}
        <section className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50 bg-muted/30 flex items-center gap-3">
            <BookOpen className={cn('w-5 h-5', accent.text)} />
            <h2 className="font-bold text-foreground">Assignment Tracker</h2>
          </div>
          <ul className="divide-y divide-border/40">
            {childAssignments.map((a) => (
              <li key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', accent.soft, accent.text)}>{a.subject}</span>
                    <p className="font-semibold text-foreground">{a.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Due {formatDue(a.dueDate)}
                    {a.grade ? ` · Grade: ${a.grade}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={a.status} />
                  {(a.status === 'Not Started' || a.status === 'In Progress') && (
                    <Button size="sm" variant="secondary" onClick={() => advance(a)} className="rounded-xl gap-1">
                      {a.status === 'Not Started' ? 'Start' : 'Turn In'}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                  {a.status === 'Turned In' && (
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => setStatus(a.id, 'Graded')}
                      aria-label="Mark graded"
                      className="rounded-xl bg-success/15 text-success hover:bg-success/25"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Behavior tracker (Jaxon & Carson) */}
        {showBehavior ? (
          <section className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/30 flex items-center gap-3">
              <Smile className={cn('w-5 h-5', accent.text)} />
              <h2 className="font-bold text-foreground">School-Day Behavior</h2>
            </div>
            <div className="p-5">
              {/* Week strip (oldest -> newest) */}
              <div className="flex gap-2 mb-5">
                {behavior
                  .slice()
                  .reverse()
                  .map((b) => (
                    <div key={b.id} className="flex-1 text-center">
                      <div
                        className={cn(
                          'rounded-2xl border py-3 flex flex-col items-center gap-1.5',
                          ratingStyles[b.rating].chip
                        )}
                      >
                        <span className={cn('w-3 h-3 rounded-full', ratingStyles[b.rating].dot)} />
                        <span className="text-[11px] font-bold">
                          {new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Recent entries */}
              <ul className="space-y-2">
                {behavior.map((b) => (
                  <li key={b.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                    <span className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', ratingStyles[b.rating].dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{b.rating}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{formatDue(b.date)}</span>
                      </div>
                      {b.note && <p className="text-xs text-muted-foreground mt-0.5">{b.note}</p>}
                      {b.loggedBy && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{b.loggedBy}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/30 flex items-center gap-3">
              <GraduationCap className={cn('w-5 h-5', accent.text)} />
              <h2 className="font-bold text-foreground">Grade Summary</h2>
            </div>
            <div className="p-5 space-y-2">
              {childAssignments
                .filter((a) => a.status === 'Graded')
                .map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{a.subject}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.title}</p>
                    </div>
                    <span className={cn('text-lg font-extrabold', accent.text)}>{a.grade}</span>
                  </div>
                ))}
              {childAssignments.filter((a) => a.status === 'Graded').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No grades posted yet this term.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
