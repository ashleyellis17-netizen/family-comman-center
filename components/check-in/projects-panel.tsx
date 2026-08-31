'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FolderKanban, Plus, ArrowRight, Trash2, CheckCircle2 } from 'lucide-react';
import type { ProjectWithMilestones } from '@/app/actions/projects';
import {
  createProject,
  deleteProject,
  updateProject,
  addMilestone,
  toggleMilestone,
} from '@/app/actions/projects';
import { getAccent, UrgencyBadge } from './shared';

export function ProjectsPanel({
  childId,
  projects,
}: {
  childId: string;
  projects: ProjectWithMilestones[];
}) {
  const accent = getAccent(childId);
  const active = projects.filter((p) => p.status !== 'done');

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', accent.soft)}>
            <FolderKanban className={cn('w-5 h-5', accent.text)} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-foreground">Projects</h3>
            <p className="text-xs text-muted-foreground font-medium">Big things, one step at a time</p>
          </div>
        </div>
        <AddProjectDialog childId={childId} accentSolid={accent.solid} />
      </div>

      {active.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No projects yet. Add one and we&apos;ll break it into steps.
        </p>
      ) : (
        <div className="space-y-4">
          {active.map((p) => (
            <ProjectCard key={p.id} project={p} accentBar={accent.bar} accentText={accent.text} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  accentBar,
  accentText,
}: {
  project: ProjectWithMilestones;
  accentBar: string;
  accentText: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [newStep, setNewStep] = useState('');

  const total = project.milestones.length;
  const done = project.milestones.filter((m) => m.done).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const nextStep = project.milestones.find((m) => !m.done);

  function toggle(id: number, value: boolean) {
    startTransition(async () => { await toggleMilestone(id, value); });
  }
  function addStep() {
    const title = newStep.trim();
    if (!title) return;
    startTransition(async () => {
      await addMilestone({ projectId: project.id, title });
      setNewStep('');
    });
  }
  function finish() {
    startTransition(async () => { await updateProject(project.id, { status: 'done' }); });
  }
  function remove() {
    startTransition(async () => { await deleteProject(project.id); });
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-extrabold text-foreground">{project.title}</p>
          <p className="text-xs text-muted-foreground">
            {project.subject ? `${project.subject} · ` : ''}{done}/{total} steps done
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <UrgencyBadge dueDate={project.dueDate} />
          <Button variant="ghost" size="icon" onClick={remove} aria-label="Delete project">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="h-2.5 bg-muted rounded-full overflow-hidden my-3">
        <div className={cn('h-full rounded-full transition-all', accentBar)} style={{ width: `${percent}%` }} />
      </div>

      {nextStep ? (
        <div className="flex items-center gap-2 rounded-xl bg-card border border-border/60 px-3 py-2 mb-3">
          <ArrowRight className={cn('w-4 h-4 shrink-0', accentText)} aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Next: {nextStep.title}</span>
        </div>
      ) : total > 0 ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-success/10 border border-success/20 px-3 py-2 mb-3">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-success">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            All steps done!
          </span>
          <Button size="sm" variant="ghost" onClick={finish} disabled={isPending}>
            Mark project done
          </Button>
        </div>
      ) : null}

      <ul className="space-y-1.5">
        {project.milestones.map((m) => (
          <li key={m.id} className="flex items-center gap-2.5">
            <Checkbox
              id={`m-${m.id}`}
              checked={m.done}
              onCheckedChange={(v) => toggle(m.id, Boolean(v))}
              className="touch-target"
            />
            <label
              htmlFor={`m-${m.id}`}
              className={cn('text-sm cursor-pointer', m.done ? 'line-through text-muted-foreground' : 'text-foreground')}
            >
              {m.title}
            </label>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mt-3">
        <Input
          placeholder="Add a step…"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addStep();
          }}
          className="h-9"
        />
        <Button variant="secondary" size="sm" onClick={addStep} disabled={isPending || !newStep.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function AddProjectDialog({ childId, accentSolid }: { childId: string; accentSolid: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [steps, setSteps] = useState('');

  function reset() {
    setTitle(''); setSubject(''); setDueDate(''); setSteps('');
  }
  function save() {
    if (!title.trim()) return;
    startTransition(async () => {
      await createProject({
        childId,
        title,
        subject,
        dueDate,
        milestones: steps.split('\n').map((s) => s.trim()).filter(Boolean),
      });
      reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className={cn('touch-target font-bold', accentSolid)}>
          <Plus className="w-4 h-4" />
          New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-title">Project name</Label>
            <Input id="p-title" placeholder="e.g. Solar System diorama" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-subject">Subject</Label>
              <Input id="p-subject" placeholder="Science" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-due">Due date</Label>
              <Input id="p-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-steps">Steps (one per line)</Label>
            <Textarea
              id="p-steps"
              placeholder={'Research planets\nBuy supplies\nBuild the base\nPaint & label'}
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); setOpen(false); }}>Cancel</Button>
          <Button onClick={save} disabled={isPending || !title.trim()}>
            {isPending ? 'Creating…' : 'Create project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
