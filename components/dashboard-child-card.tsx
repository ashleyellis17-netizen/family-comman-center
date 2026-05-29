import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProgressRing } from '@/components/progress-ring';
import { Lock, ChevronRight } from 'lucide-react';
import {
  getSummerTasksForChild,
  getTodayChoresForChild,
  getAllowanceBalance,
  getActiveGroundingForChild,
} from '@/lib/mock-data';
import type { Child } from '@/lib/types';

const colorMap: Record<
  string,
  { ring: string; chipBg: string; chipText: string; avatar: string; bar: string; soft: string }
> = {
  alex: { ring: 'text-alex', chipBg: 'bg-alex-muted', chipText: 'text-alex', avatar: 'bg-alex text-alex-foreground', bar: 'bg-alex', soft: 'bg-alex-muted' },
  jaxon: { ring: 'text-jaxon', chipBg: 'bg-jaxon-muted', chipText: 'text-jaxon', avatar: 'bg-jaxon text-jaxon-foreground', bar: 'bg-jaxon', soft: 'bg-jaxon-muted' },
  carson: { ring: 'text-carson', chipBg: 'bg-carson-muted', chipText: 'text-carson', avatar: 'bg-carson text-carson-foreground', bar: 'bg-carson', soft: 'bg-carson-muted' },
};

export function DashboardChildCard({ child }: { child: Child }) {
  const c = colorMap[child.id] ?? colorMap.alex;

  const summerTasks = getSummerTasksForChild(child.id);
  const summerDone = summerTasks.filter((t) => t.status === 'approved').length;
  const summerTotal = summerTasks.length;
  const summerPct = summerTotal ? Math.round((summerDone / summerTotal) * 100) : 0;

  const todayChores = getTodayChoresForChild(child.id);
  const choresDone = todayChores.filter((t) => t.completed).length;
  const choresTotal = todayChores.length;
  const choresPct = choresTotal ? Math.round((choresDone / choresTotal) * 100) : 0;

  const balance = getAllowanceBalance(child.id);
  const grounding = getActiveGroundingForChild(child.id);

  return (
    <Link
      href={`/${child.id}`}
      className="boho-card hover-lift group flex flex-col gap-4 rounded-3xl p-5"
    >
      <div className="flex items-center gap-4">
        <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-extrabold shadow-sm', c.avatar)}>
          {child.avatar}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold tracking-tight">{child.name}</h3>
            {grounding && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/12 px-2 py-0.5 text-[0.7rem] font-bold text-destructive">
                <Lock className="h-3 w-3" /> Grounded
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{child.grade}</p>
        </div>
        <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="flex items-center gap-5">
        <ProgressRing value={summerPct} size={92} strokeWidth={10} className={c.ring}>
          <div className="text-center">
            <p className="text-xl font-extrabold leading-none">{summerPct}%</p>
            <p className="text-[0.62rem] font-semibold uppercase tracking-wide text-muted-foreground">Summer</p>
          </div>
        </ProgressRing>

        <div className="flex-1 space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm font-semibold">
              <span className="text-muted-foreground">Today&apos;s chores</span>
              <span>{choresDone}/{choresTotal}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className={cn('h-full rounded-full transition-all', c.bar)} style={{ width: `${choresPct}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2">
            <span className="text-sm font-semibold text-muted-foreground">Allowance</span>
            <span className="text-base font-extrabold tabular-nums">${balance}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn('rounded-full px-3 py-1 text-xs font-bold', c.chipBg, c.chipText)}>
          {summerDone}/{summerTotal} tasks done
        </span>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
          Age {child.age}
        </span>
      </div>
    </Link>
  );
}
