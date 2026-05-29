'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { children, summerTasks as seedTasks } from '@/lib/mock-data';
import { colorFor } from '@/lib/people';
import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';
import { EmptyState } from '@/components/empty-state';
import { ProgressRing } from '@/components/progress-ring';
import type { ChildId, SummerTask, SummerTaskStatus } from '@/lib/types';
import {
  Sun,
  BookOpen,
  Home as HomeIcon,
  User,
  Smile,
  Volume2,
  Trees,
  Palette,
  Check,
  Clock,
  Eye,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';

const categoryIcon: Record<string, LucideIcon> = {
  learning: BookOpen,
  reading: BookOpen,
  home: HomeIcon,
  personal: User,
  behavior: Smile,
  quiet: Volume2,
  outdoor: Trees,
  creative: Palette,
};

const statusMeta: Record<SummerTaskStatus, { label: string; cls: string }> = {
  'not-started': { label: 'Not Started', cls: 'bg-muted text-muted-foreground' },
  'in-progress': { label: 'In Progress', cls: 'bg-carson-muted text-carson' },
  'needs-check': { label: 'Needs Check', cls: 'bg-primary/15 text-primary' },
  approved: { label: 'Approved', cls: 'bg-success/15 text-success' },
  redo: { label: 'Redo', cls: 'bg-warning/20 text-warning-foreground' },
  missed: { label: 'Missed', cls: 'bg-destructive/15 text-destructive' },
  excused: { label: 'Excused', cls: 'bg-muted text-muted-foreground' },
};

// Kid-facing flow: not-started -> in-progress -> needs-check. Parent approves.
const nextKidStatus: Partial<Record<SummerTaskStatus, SummerTaskStatus>> = {
  'not-started': 'in-progress',
  'in-progress': 'needs-check',
  redo: 'needs-check',
  'needs-check': 'in-progress',
};

export default function SummerTasksPage() {
  const [tasks, setTasks] = useState<SummerTask[]>(seedTasks);
  const [childFilter, setChildFilter] = useState<'all' | ChildId>('all');

  const cycleKid = (id: string) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextKidStatus[t.status] ?? t.status } : t)),
    );

  const setStatus = (id: string, status: SummerTaskStatus) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

  const visibleChildren = childFilter === 'all' ? children : children.filter((c) => c.id === childFilter);

  const totals = useMemo(() => {
    const required = tasks.filter((t) => t.required);
    return {
      required: required.length,
      approved: required.filter((t) => t.status === 'approved').length,
      needsCheck: tasks.filter((t) => t.status === 'needs-check').length,
    };
  }, [tasks]);

  const overallPct = totals.required > 0 ? Math.round((totals.approved / totals.required) * 100) : 100;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Summer Unlock Center"
        description="Finish required tasks to unlock rewards and screen time"
        icon={Sun}
        iconClassName="bg-carson text-carson-foreground shadow-carson/25"
        action={
          <div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-4 py-2 shadow-sm">
            <ProgressRing value={overallPct} size={48} className="text-carson">
              <span className="text-xs font-extrabold text-foreground">{overallPct}%</span>
            </ProgressRing>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground">Required done</p>
              <p className="text-lg font-extrabold text-foreground">
                {totals.approved}/{totals.required}
              </p>
            </div>
          </div>
        }
      />

      {/* Child filter */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={childFilter === 'all'} onClick={() => setChildFilter('all')} label="All Kids" />
        {children.map((c) => (
          <FilterChip
            key={c.id}
            active={childFilter === c.id}
            onClick={() => setChildFilter(c.id)}
            label={c.name}
            colorClass={colorFor(c.id).bgSolid}
          />
        ))}
      </div>

      <div className={cn('grid grid-cols-1 gap-6', childFilter === 'all' && 'lg:grid-cols-3')}>
        {visibleChildren.map((child) => {
          const c = colorFor(child.id);
          const childTasks = tasks.filter((t) => t.childId === child.id);
          const required = childTasks.filter((t) => t.required);
          const approved = required.filter((t) => t.status === 'approved').length;
          const pct = required.length > 0 ? Math.round((approved / required.length) * 100) : 100;
          return (
            <SectionCard
              key={child.id}
              title={child.name}
              subtitle={`${approved}/${required.length} required done`}
              icon={Sun}
              iconClassName={c.bgSolid}
              action={
                <ProgressRing value={pct} size={44} className={c.text}>
                  <span className="text-[0.65rem] font-extrabold text-foreground">{pct}%</span>
                </ProgressRing>
              }
            >
              {childTasks.length === 0 ? (
                <EmptyState icon={Sun} title="No summer tasks" />
              ) : (
                <div className="space-y-2">
                  {childTasks.map((t) => {
                    const Icon = categoryIcon[t.category] ?? Sun;
                    const sm = statusMeta[t.status];
                    return (
                      <div key={t.id} className="rounded-xl border border-border/50 bg-muted/30 p-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => cycleKid(t.id)}
                            className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                              t.status === 'approved' ? 'bg-success text-success-foreground' : cn(c.bg, c.text),
                            )}
                            aria-label="Advance task status"
                          >
                            {t.status === 'approved' ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={cn('truncate font-semibold text-foreground', t.status === 'approved' && 'line-through opacity-70')}>
                              {t.title}
                            </p>
                            <p className="text-xs capitalize text-muted-foreground">
                              {t.category} {t.required ? '· required' : '· optional'}
                            </p>
                          </div>
                          <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold', sm.cls)}>{sm.label}</span>
                        </div>
                        {t.status === 'needs-check' && (
                          <div className="mt-2 flex gap-2 border-t border-border/50 pt-2">
                            <button
                              type="button"
                              onClick={() => setStatus(t.id, 'approved')}
                              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-success/15 py-1.5 text-xs font-bold text-success transition-colors hover:bg-success/25"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setStatus(t.id, 'redo')}
                              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-warning/20 py-1.5 text-xs font-bold text-warning-foreground transition-colors hover:bg-warning/30"
                            >
                              <RotateCcw className="h-3.5 w-3.5" /> Redo
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          );
        })}
      </div>

      {/* Legend */}
      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-bold text-foreground">How it works</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-carson" /> Tap a task to mark it in progress, then submit for check.</span>
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> A parent approves submitted tasks.</span>
          <span>{totals.needsCheck} task{totals.needsCheck === 1 ? '' : 's'} waiting for a parent check.</span>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  colorClass,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  colorClass?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-bold transition-all',
        active
          ? colorClass ?? 'bg-primary text-primary-foreground'
          : 'bg-card text-muted-foreground hover:bg-muted',
        active && 'shadow-md',
      )}
    >
      {label}
    </button>
  );
}
