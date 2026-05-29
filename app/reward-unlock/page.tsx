'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { children, rewardUnlocks as seed } from '@/lib/mock-data';
import { colorFor } from '@/lib/people';
import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';
import type { ChildId, RewardUnlock, UnlockState } from '@/lib/types';
import {
  Unlock,
  Lock,
  Tablet,
  Tv,
  Gamepad2,
  Trees,
  Cookie,
  Wind,
  Check,
  Clock,
  Hourglass,
  type LucideIcon,
} from 'lucide-react';

const categoryIcon: Record<string, LucideIcon> = {
  tablet: Tablet,
  tv: Tv,
  game: Gamepad2,
  outside: Trees,
  snack: Cookie,
  inflatable: Wind,
};

const stateMeta: Record<UnlockState, { label: string; cls: string; barFrom: string }> = {
  locked: { label: 'Locked', cls: 'bg-muted text-muted-foreground', barFrom: 'bg-muted-foreground/40' },
  'in-progress': { label: 'In Progress', cls: 'bg-carson-muted text-carson', barFrom: 'bg-carson' },
  'needs-approval': { label: 'Needs Approval', cls: 'bg-primary/15 text-primary', barFrom: 'bg-primary' },
  unlocked: { label: 'Unlocked', cls: 'bg-success/15 text-success', barFrom: 'bg-success' },
  'used-today': { label: 'Used Today', cls: 'bg-warning/20 text-warning-foreground', barFrom: 'bg-warning' },
  'limit-reached': { label: 'Limit Reached', cls: 'bg-destructive/15 text-destructive', barFrom: 'bg-destructive' },
};

export default function RewardUnlockPage() {
  const [unlocks, setUnlocks] = useState<RewardUnlock[]>(seed);
  const [childFilter, setChildFilter] = useState<'all' | ChildId>('all');

  const approve = (id: string) =>
    setUnlocks((prev) => prev.map((u) => (u.id === id ? { ...u, state: 'unlocked' } : u)));
  const relock = (id: string) =>
    setUnlocks((prev) => prev.map((u) => (u.id === id ? { ...u, state: 'locked' } : u)));

  const visibleChildren = childFilter === 'all' ? children : children.filter((c) => c.id === childFilter);
  const needsApproval = unlocks.filter((u) => u.state === 'needs-approval').length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Reward Unlock Center"
        description="Screen time and rewards unlock as tasks get completed"
        icon={Unlock}
        iconClassName="bg-primary text-primary-foreground shadow-primary/25"
        action={
          <span className="rounded-full bg-primary/15 px-4 py-2 text-sm font-bold text-primary">
            {needsApproval} waiting for approval
          </span>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Chip active={childFilter === 'all'} onClick={() => setChildFilter('all')} label="All Kids" />
        {children.map((c) => (
          <Chip key={c.id} active={childFilter === c.id} onClick={() => setChildFilter(c.id)} label={c.name} colorClass={colorFor(c.id).bgSolid} />
        ))}
      </div>

      <div className={cn('grid grid-cols-1 gap-6', childFilter === 'all' && 'lg:grid-cols-3')}>
        {visibleChildren.map((child) => {
          const c = colorFor(child.id);
          const list = unlocks.filter((u) => u.childId === child.id);
          const unlockedCount = list.filter((u) => u.state === 'unlocked' || u.state === 'used-today').length;
          return (
            <SectionCard
              key={child.id}
              title={child.name}
              subtitle={`${unlockedCount}/${list.length} unlocked`}
              icon={Unlock}
              iconClassName={c.bgSolid}
            >
              <div className="space-y-3">
                {list.map((u) => {
                  const Icon = categoryIcon[u.rewardCategory] ?? Unlock;
                  const sm = stateMeta[u.state];
                  const pct = u.requiredTasks > 0 ? Math.min(100, Math.round((u.completedTasks / u.requiredTasks) * 100)) : 100;
                  const isOpen = u.state === 'unlocked' || u.state === 'used-today';
                  return (
                    <div key={u.id} className="rounded-xl border border-border/50 bg-muted/30 p-3">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', isOpen ? 'bg-success/15 text-success' : cn(c.bg, c.text))}>
                          {isOpen ? <Icon className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-foreground">{u.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.completedTasks}/{u.requiredTasks} tasks
                            {u.dailyLimitMinutes ? ` · ${u.usedMinutes ?? 0}/${u.dailyLimitMinutes} min` : ''}
                          </p>
                        </div>
                        <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold', sm.cls)}>{sm.label}</span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div className={cn('h-full rounded-full transition-all duration-500', sm.barFrom)} style={{ width: `${pct}%` }} />
                      </div>

                      {u.state === 'needs-approval' && (
                        <button
                          type="button"
                          onClick={() => approve(u.id)}
                          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-success/15 py-1.5 text-xs font-bold text-success transition-colors hover:bg-success/25"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve Unlock
                        </button>
                      )}
                      {isOpen && (
                        <button
                          type="button"
                          onClick={() => relock(u.id)}
                          className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-muted py-1.5 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted-foreground/20"
                        >
                          <Lock className="h-3.5 w-3.5" /> Re-lock
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          );
        })}
      </div>

      <div className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold text-foreground">Unlock states</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(stateMeta) as UnlockState[]).map((s) => (
            <span key={s} className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', stateMeta[s].cls)}>
              {s === 'unlocked' ? <Unlock className="h-3 w-3" /> : s === 'locked' ? <Lock className="h-3 w-3" /> : s === 'needs-approval' ? <Hourglass className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
              {stateMeta[s].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, label, colorClass }: { active: boolean; onClick: () => void; label: string; colorClass?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-sm font-bold transition-all',
        active ? cn(colorClass ?? 'bg-primary text-primary-foreground', 'shadow-md') : 'bg-card text-muted-foreground hover:bg-muted',
      )}
    >
      {label}
    </button>
  );
}
