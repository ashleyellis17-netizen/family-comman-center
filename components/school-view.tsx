'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GraduationCap,
  BookOpen,
  Smile,
  School,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { AssignmentRow, SchoolBehaviorRow } from '@/lib/db/schema';
import {
  createAssignment,
  updateAssignment,
  deleteAssignment,
  createBehaviorEntry,
  updateBehaviorEntry,
  deleteBehaviorEntry,
} from '@/app/actions/school';
import { computeSchoolProgress } from '@/lib/school';

type ChildInfo = { id: string; name: string; grade: string; school?: string };

const ASSIGNMENT_STATUSES = ['Not Started', 'In Progress', 'Turned In', 'Graded', 'Missing'] as const;
const RATINGS = ['Great Day', 'Good Day', 'Okay Day', 'Rough Day'] as const;

// Only younger kids get the daily school-day behavior tracker
const behaviorTrackerKids = ['jaxon', 'carson'];

const ratingStyles: Record<string, { chip: string; dot: string }> = {
  'Great Day': { chip: 'bg-success/15 text-success border-success/30', dot: 'bg-success' },
  'Good Day': { chip: 'bg-primary/15 text-primary border-primary/30', dot: 'bg-primary' },
  'Okay Day': { chip: 'bg-warning/15 text-warning-foreground border-warning/30', dot: 'bg-warning' },
  'Rough Day': { chip: 'bg-destructive/15 text-destructive border-destructive/30', dot: 'bg-destructive' },
};

const accentByChild: Record<string, { bar: string; ring: string; text: string; soft: string }> = {
  alex: { bar: 'bg-alex', ring: 'border-alex/30', text: 'text-alex', soft: 'bg-alex/10' },
  jaxon: { bar: 'bg-jaxon', ring: 'border-jaxon/30', text: 'text-jaxon', soft: 'bg-jaxon/10' },
  carson: { bar: 'bg-carson', ring: 'border-carson/30', text: 'text-carson', soft: 'bg-carson/10' },
};

function formatDue(date?: string | null) {
  if (!date) return 'No due date';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function SchoolView({
  childrenData,
  assignments,
  behavior,
}: {
  childrenData: ChildInfo[];
  assignments: AssignmentRow[];
  behavior: SchoolBehaviorRow[];
}) {
  const [activeChild, setActiveChild] = useState<string>(childrenData[0]?.id ?? 'alex');
  const [isPending, startTransition] = useTransition();

  // Assignment dialog state
  const [assignOpen, setAssignOpen] = useState(false);
  const [editingAssign, setEditingAssign] = useState<AssignmentRow | null>(null);
  const [aTitle, setATitle] = useState('');
  const [aSubject, setASubject] = useState('');
  const [aDue, setADue] = useState('');
  const [aStatus, setAStatus] = useState<string>('Not Started');
  const [aGrade, setAGrade] = useState('');

  // Behavior dialog state
  const [behaviorOpen, setBehaviorOpen] = useState(false);
  const [editingBehavior, setEditingBehavior] = useState<SchoolBehaviorRow | null>(null);
  const [bDate, setBDate] = useState(todayISO());
  const [bRating, setBRating] = useState<string>('Great Day');
  const [bNote, setBNote] = useState('');
  const [bLoggedBy, setBLoggedBy] = useState('');

  const child = childrenData.find((c) => c.id === activeChild)!;
  const accent = accentByChild[activeChild] ?? accentByChild.alex;
  const childAssignments = assignments
    .filter((a) => a.childId === activeChild)
    .sort((x, y) => (x.dueDate || '9999').localeCompare(y.dueDate || '9999'));
  const progress = computeSchoolProgress(childAssignments);
  const childBehavior = behavior
    .filter((b) => b.childId === activeChild)
    .sort((x, y) => y.date.localeCompare(x.date));
  const showBehavior = behaviorTrackerKids.includes(activeChild);

  // ----- Assignment handlers -----
  function openNewAssignment() {
    setEditingAssign(null);
    setATitle('');
    setASubject('');
    setADue('');
    setAStatus('Not Started');
    setAGrade('');
    setAssignOpen(true);
  }

  function openEditAssignment(a: AssignmentRow) {
    setEditingAssign(a);
    setATitle(a.title);
    setASubject(a.subject ?? '');
    setADue(a.dueDate ?? '');
    setAStatus(a.status);
    setAGrade(a.grade ?? '');
    setAssignOpen(true);
  }

  function saveAssignment() {
    if (!aTitle.trim()) return;
    startTransition(async () => {
      if (editingAssign) {
        await updateAssignment(editingAssign.id, {
          title: aTitle,
          subject: aSubject,
          dueDate: aDue,
          status: aStatus,
          grade: aGrade,
        });
      } else {
        await createAssignment({
          childId: activeChild,
          title: aTitle,
          subject: aSubject,
          dueDate: aDue,
          status: aStatus,
          grade: aGrade,
        });
      }
      setAssignOpen(false);
    });
  }

  function quickStatus(a: AssignmentRow, status: string) {
    startTransition(async () => {
      await updateAssignment(a.id, { status });
    });
  }

  function removeAssignment(id: number) {
    startTransition(async () => {
      await deleteAssignment(id);
    });
  }

  // ----- Behavior handlers -----
  function openNewBehavior() {
    setEditingBehavior(null);
    setBDate(todayISO());
    setBRating('Great Day');
    setBNote('');
    setBLoggedBy('');
    setBehaviorOpen(true);
  }

  function openEditBehavior(b: SchoolBehaviorRow) {
    setEditingBehavior(b);
    setBDate(b.date);
    setBRating(b.rating);
    setBNote(b.note ?? '');
    setBLoggedBy(b.loggedBy ?? '');
    setBehaviorOpen(true);
  }

  function saveBehavior() {
    startTransition(async () => {
      if (editingBehavior) {
        await updateBehaviorEntry(editingBehavior.id, {
          date: bDate,
          rating: bRating,
          note: bNote,
          loggedBy: bLoggedBy,
        });
      } else {
        await createBehaviorEntry({
          childId: activeChild,
          date: bDate,
          rating: bRating,
          note: bNote,
          loggedBy: bLoggedBy,
        });
      }
      setBehaviorOpen(false);
    });
  }

  function removeBehavior(id: number) {
    startTransition(async () => {
      await deleteBehaviorEntry(id);
    });
  }

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
        {childrenData.map((tab) => (
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
            {tab.name}
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
                {child.grade}
                {child.school ? ` · ${child.school}` : ''}
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
            <h2 className="font-bold text-foreground flex-1">Assignment Tracker</h2>
            <Button size="sm" onClick={openNewAssignment} className="rounded-xl gap-1">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          {childAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-10 px-5">
              No assignments yet. Tap <span className="font-semibold text-foreground">Add</span> to log {child.name}&apos;s
              work as it comes home.
            </p>
          ) : (
            <ul className="divide-y divide-border/40">
              {childAssignments.map((a) => (
                <li key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {a.subject && (
                        <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', accent.soft, accent.text)}>
                          {a.subject}
                        </span>
                      )}
                      <p className="font-semibold text-foreground">{a.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due {formatDue(a.dueDate)}
                      {a.grade ? ` · Grade: ${a.grade}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={a.status} onValueChange={(v) => quickStatus(a, v)}>
                      <SelectTrigger className="h-8 w-[130px] rounded-xl text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSIGNMENT_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditAssignment(a)}
                      aria-label="Edit assignment"
                      className="rounded-xl h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeAssignment(a.id)}
                      aria-label="Delete assignment"
                      className="rounded-xl h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Behavior tracker (Jaxon & Carson) or grade summary (Alex) */}
        {showBehavior ? (
          <section className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border/50 bg-muted/30 flex items-center gap-3">
              <Smile className={cn('w-5 h-5', accent.text)} />
              <h2 className="font-bold text-foreground flex-1">School-Day Behavior</h2>
              <Button size="sm" onClick={openNewBehavior} className="rounded-xl gap-1">
                <Plus className="w-4 h-4" />
                Log Day
              </Button>
            </div>
            <div className="p-5">
              {childBehavior.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No behavior logged yet. Tap <span className="font-semibold text-foreground">Log Day</span> after school.
                </p>
              ) : (
                <>
                  {/* Week strip (oldest -> newest) */}
                  <div className="flex gap-2 mb-5">
                    {childBehavior
                      .slice(0, 7)
                      .reverse()
                      .map((b) => (
                        <div key={b.id} className="flex-1 text-center">
                          <div
                            className={cn(
                              'rounded-2xl border py-3 flex flex-col items-center gap-1.5',
                              ratingStyles[b.rating]?.chip
                            )}
                          >
                            <span className={cn('w-3 h-3 rounded-full', ratingStyles[b.rating]?.dot)} />
                            <span className="text-[11px] font-bold">
                              {new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Recent entries */}
                  <ul className="space-y-2">
                    {childBehavior.map((b) => (
                      <li key={b.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/40">
                        <span className={cn('w-2.5 h-2.5 rounded-full mt-1.5 shrink-0', ratingStyles[b.rating]?.dot)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground">{b.rating}</p>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-xs text-muted-foreground">{formatDue(b.date)}</span>
                              <button
                                onClick={() => openEditBehavior(b)}
                                aria-label="Edit entry"
                                className="p-1 text-muted-foreground hover:text-foreground"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => removeBehavior(b.id)}
                                aria-label="Delete entry"
                                className="p-1 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          {b.note && <p className="text-xs text-muted-foreground mt-0.5">{b.note}</p>}
                          {b.loggedBy && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{b.loggedBy}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
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
                      <p className="font-semibold text-foreground truncate">{a.subject || a.title}</p>
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

      {/* Assignment dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editingAssign ? 'Edit Assignment' : `Add Assignment for ${child.name}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="a-title">Title</Label>
              <Input id="a-title" value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder="e.g. Reading log" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="a-subject">Subject</Label>
                <Input id="a-subject" value={aSubject} onChange={(e) => setASubject(e.target.value)} placeholder="Math" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-due">Due date</Label>
                <Input id="a-due" type="date" value={aDue} onChange={(e) => setADue(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={aStatus} onValueChange={setAStatus}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSIGNMENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-grade">Grade (optional)</Label>
                <Input id="a-grade" value={aGrade} onChange={(e) => setAGrade(e.target.value)} placeholder="A, 95%, etc." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAssignOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={saveAssignment} disabled={isPending || !aTitle.trim()} className="rounded-xl">
              {editingAssign ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Behavior dialog */}
      <Dialog open={behaviorOpen} onOpenChange={setBehaviorOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editingBehavior ? 'Edit Behavior Entry' : `Log a Day for ${child.name}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="b-date">Date</Label>
                <Input id="b-date" type="date" value={bDate} onChange={(e) => setBDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Rating</Label>
                <Select value={bRating} onValueChange={setBRating}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RATINGS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-note">Note (optional)</Label>
              <Textarea
                id="b-note"
                value={bNote}
                onChange={(e) => setBNote(e.target.value)}
                placeholder="What happened today?"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="b-logged">Logged by (optional)</Label>
              <Input
                id="b-logged"
                value={bLoggedBy}
                onChange={(e) => setBLoggedBy(e.target.value)}
                placeholder="Teacher name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBehaviorOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button onClick={saveBehavior} disabled={isPending} className="rounded-xl">
              {editingBehavior ? 'Save' : 'Log Day'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
