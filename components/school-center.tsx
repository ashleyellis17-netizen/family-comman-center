'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  GraduationCap,
  BookOpen,
  CalendarClock,
  AlertTriangle,
  FolderKanban,
  Award,
  Check,
  Trash2,
  ArrowRight,
  FolderPlus,
  School,
} from 'lucide-react';
import type { AssignmentRow } from '@/lib/db/schema';
import type { ProjectWithMilestones } from '@/app/actions/projects';
import { updateAssignment, deleteAssignment } from '@/app/actions/school';
import { createProject } from '@/app/actions/projects';
import { computeSchoolProgress } from '@/lib/school';
import { getUrgency, sortByUrgency, isMissing, isOpen } from '@/lib/checkin';
import { UrgencyBadge, getAccent } from '@/components/check-in/shared';
import { QuickAddAssignment } from '@/components/check-in/quick-add-assignment';

type ChildInfo = { id: string; name: string; grade: string; school?: string };

const TYPE_LABEL: Record<string, string> = {
  homework: 'Homework',
  test: 'Test',
  quiz: 'Quiz',
  project: 'Project',
  reading: 'Reading',
  worksheet: 'Worksheet',
  other: 'Other',
};

function AssignmentRowItem({
  a,
  accentText,
  accentSoft,
}: {
  a: AssignmentRow;
  accentText: string;
  accentSoft: string;
}) {
  const [isPending, startTransition] = useTransition();
  const subtitle = [TYPE_LABEL[a.type] ?? 'School', a.subject || null, a.teacher || null]
    .filter(Boolean)
    .join(' · ');

  return (
    <li className={cn('flex flex-col gap-3 p-4 sm:flex-row sm:items-center', isPending && 'opacity-60')}>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', accentSoft, accentText)}>
            {TYPE_LABEL[a.type] ?? 'School'}
          </span>
          <p className="font-semibold text-foreground">{a.title}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {a.dueDate && <UrgencyBadge dueDate={a.dueDate} />}
        <Button
          size="sm"
          variant="secondary"
          disabled={isPending}
          onClick={() => startTransition(() => updateAssignment(a.id, { status: 'Turned In' }))}
        >
          <Check className="mr-1 h-4 w-4" aria-hidden="true" />
          Done
        </Button>
        {!isMissing(a) && (
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={isPending}
            onClick={() => startTransition(() => updateAssignment(a.id, { status: 'Missing' }))}
          >
            Mark missing
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Delete assignment"
          disabled={isPending}
          onClick={() => startTransition(() => deleteAssignment(a.id))}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
}

function Section({
  title,
  icon: Icon,
  count,
  tone = 'default',
  children,
}: {
  title: string;
  icon: React.ElementType;
  count: number;
  tone?: 'default' | 'alert';
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
      <div
        className={cn(
          'flex items-center gap-3 border-b border-border/50 px-5 py-4',
          tone === 'alert' ? 'bg-destructive/10' : 'bg-muted/30'
        )}
      >
        <Icon className={cn('h-5 w-5', tone === 'alert' ? 'text-destructive' : 'text-muted-foreground')} aria-hidden="true" />
        <h2 className="flex-1 font-bold text-foreground">{title}</h2>
        <span className="rounded-full bg-card px-2.5 py-0.5 text-sm font-bold text-foreground shadow-sm">{count}</span>
      </div>
      {children}
    </section>
  );
}

function AddProjectDialog({ childId, accentSolid }: { childId: string; accentSolid: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');

  function save() {
    if (!title.trim()) return;
    startTransition(async () => {
      await createProject({ childId, title, subject, dueDate });
      setTitle('');
      setSubject('');
      setDueDate('');
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="touch-target font-bold">
          <FolderPlus className="h-4 w-4" />
          Add project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="proj-title">Project</Label>
            <Input id="proj-title" placeholder="e.g. Solar system model" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="proj-subject">Subject</Label>
              <Input id="proj-subject" placeholder="Science" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-due">Due date</Label>
              <Input id="proj-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Break it into steps from the child&apos;s Projects card after adding.</p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button className={accentSolid} onClick={save} disabled={isPending || !title.trim()}>
            {isPending ? 'Adding…' : 'Add project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SchoolCenter({
  childrenData,
  assignments,
  projects,
}: {
  childrenData: ChildInfo[];
  assignments: AssignmentRow[];
  projects: ProjectWithMilestones[];
}) {
  const [activeChild, setActiveChild] = useState<string>(childrenData[0]?.id ?? 'alex');
  const child = childrenData.find((c) => c.id === activeChild)!;
  const accent = getAccent(activeChild);

  const data = useMemo(() => {
    const mine = assignments.filter((a) => a.childId === activeChild);
    const open = mine.filter(isOpen);
    const missing = mine.filter(isMissing);
    const openNotMissing = open.filter((a) => !isMissing(a));
    const today = sortByUrgency(
      openNotMissing.filter((a) => ['today', 'overdue'].includes(getUrgency(a.dueDate)))
    );
    const comingUp = sortByUrgency(
      openNotMissing.filter((a) => ['tomorrow', 'soon', 'later', 'none'].includes(getUrgency(a.dueDate)))
    );
    const graded = mine.filter((a) => a.status === 'Graded');
    const progress = computeSchoolProgress(mine);
    const myProjects = projects.filter((p) => p.childId === activeChild && p.status !== 'done');
    return { missing, today, comingUp, graded, progress, myProjects };
  }, [assignments, projects, activeChild]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="School Center"
        description="One place for every assignment, test, project, and grade"
        icon={GraduationCap}
        iconClassName="from-primary to-primary/80 text-primary-foreground"
      />

      {/* Child filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {childrenData.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChild(tab.id)}
            className={cn(
              'touch-target rounded-2xl px-5 py-2.5 text-sm font-bold transition-all',
              activeChild === tab.id
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'border border-border/50 bg-card text-muted-foreground hover:bg-accent'
            )}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Header + unified add */}
      <div className={cn('mb-6 rounded-3xl border bg-card p-5 shadow-sm', accent.ring)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', accent.soft)}>
              <School className={cn('h-6 w-6', accent.text)} />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-tight text-foreground">{child.name}</p>
              <p className="text-sm text-muted-foreground">
                {child.grade}
                {child.school ? ` · ${child.school}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-2xl font-extrabold leading-none text-foreground">{data.progress.outstanding}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">To Do</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold leading-none text-foreground">{data.progress.done}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">Done</p>
            </div>
            <div className="w-32">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold">Progress</span>
                <span className="font-bold text-foreground">{data.progress.percent}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className={cn('h-full rounded-full transition-all', accent.bar)} style={{ width: `${data.progress.percent}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-4">
          <QuickAddAssignment
            key={activeChild}
            childId={activeChild}
            triggerLabel="Add school item"
            triggerClassName={accent.solid}
          />
          <AddProjectDialog childId={activeChild} accentSolid={accent.solid} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Missing — only when there is something, shown first */}
        {data.missing.length > 0 && (
          <Section title="Missing work" icon={AlertTriangle} count={data.missing.length} tone="alert">
            <ul className="divide-y divide-border/40">
              {data.missing.map((a) => (
                <AssignmentRowItem key={a.id} a={a} accentText={accent.text} accentSoft={accent.soft} />
              ))}
            </ul>
          </Section>
        )}

        {/* Today */}
        <Section title="Due today" icon={CalendarClock} count={data.today.length}>
          {data.today.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nothing due today for {child.name}. {data.comingUp.length > 0 ? 'Check "Coming up" to get ahead.' : 'All caught up!'}
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {data.today.map((a) => (
                <AssignmentRowItem key={a.id} a={a} accentText={accent.text} accentSoft={accent.soft} />
              ))}
            </ul>
          )}
        </Section>

        {/* Coming up */}
        <Section title="Coming up" icon={BookOpen} count={data.comingUp.length}>
          {data.comingUp.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              Nothing on the horizon. New work shows up here as it&apos;s added.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {data.comingUp.map((a) => (
                <AssignmentRowItem key={a.id} a={a} accentText={accent.text} accentSoft={accent.soft} />
              ))}
            </ul>
          )}
        </Section>

        {/* Projects */}
        <Section title="Projects" icon={FolderKanban} count={data.myProjects.length}>
          {data.myProjects.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No active projects. Use <span className="font-semibold text-foreground">Add project</span> for anything with multiple steps.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {data.myProjects.map((p) => {
                const nextStep = p.milestones.find((m) => !m.done);
                const done = p.milestones.filter((m) => m.done).length;
                return (
                  <li key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">{p.title}</p>
                        {p.subject && (
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-bold', accent.soft, accent.text)}>
                            {p.subject}
                          </span>
                        )}
                      </div>
                      {nextStep ? (
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          Next: {nextStep.title}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {p.milestones.length > 0 ? `${done}/${p.milestones.length} steps done` : 'No steps yet'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.dueDate && <UrgencyBadge dueDate={p.dueDate} />}
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/${activeChild}`}>
                          Open
                          <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        {/* Grades */}
        <Section title="Grades" icon={Award} count={data.graded.length}>
          {data.graded.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No grades posted yet this term.</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {data.graded.map((a) => (
                <li key={a.id} className="flex items-center justify-between p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{a.subject || a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.title}</p>
                  </div>
                  <span className={cn('text-lg font-extrabold', accent.text)}>{a.grade}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
