import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  children,
  getChildStats,
  getTodayChoresForChild,
  getBehaviorForChild,
  getGradesForChild,
  getEventsForChild,
  getTransactionsForChild,
  getRedemptionsForChild,
  getSummerTasksForChild,
  getActiveGroundingForChild,
  getNextBirthday,
  rewards,
} from '@/lib/mock-data';
import { ChildAvatar } from '@/components/child-avatar';
import { SectionCard } from '@/components/section-card';
import { EmptyState } from '@/components/empty-state';
import { QuickRequestBar } from '@/components/quick-request-bar';
import { colorFor } from '@/lib/people';
import type { ChildId } from '@/lib/types';
import {
  Check,
  Clock,
  Star,
  TrendingUp,
  Wallet,
  Calendar,
  GraduationCap,
  Gift,
  ThumbsUp,
  ThumbsDown,
  Cake,
  Sun,
  Lock,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

interface ChildProfilePageProps {
  childId: ChildId;
}

const todayStr = new Date().toISOString().split('T')[0];

export function ChildProfilePage({ childId }: ChildProfilePageProps) {
  const child = children.find((c) => c.id === childId);
  if (!child) return null;

  const c = colorFor(childId);
  const stats = getChildStats(childId);
  const todayChores = getTodayChoresForChild(childId);
  const behaviorNotes = getBehaviorForChild(childId);
  const grades = getGradesForChild(childId);
  const events = getEventsForChild(childId);
  const transactions = getTransactionsForChild(childId);
  const redemptions = getRedemptionsForChild(childId);
  const summer = getSummerTasksForChild(childId);
  const grounding = getActiveGroundingForChild(childId);
  const nextBd = getNextBirthday(child.birthday);

  const summerToday = summer.filter((t) => t.dueDate === todayStr);
  const summerDone = summer.filter((t) => t.status === 'approved');
  const completedChores = todayChores.filter((ch) => ch.completed);
  const pendingChores = todayChores.filter((ch) => !ch.completed);
  const upcomingEvents = events.filter((e) => e.date >= todayStr).slice(0, 5);
  const redeemedRewards = redemptions.map((r) => rewards.find((rw) => rw.id === r.rewardId)).filter(Boolean);
  const availableRewards = rewards.filter((r) => r.available).slice(0, 4);
  const allowanceEligible = !grounding || grounding.allowanceEligible;

  const choreProgress = todayChores.length > 0 ? (completedChores.length / todayChores.length) * 100 : 100;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className={cn('overflow-hidden rounded-3xl border bg-card', c.border)}>
        <div className={cn('p-6 md:p-8', c.bg)}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <ChildAvatar childId={childId} name={child.name} size="xl" animated />
            <div className="flex-1">
              <h1 className={cn('text-4xl font-extrabold md:text-5xl', c.gradientText)}>{child.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold">
                <span className="rounded-full bg-card px-3 py-1 text-foreground shadow-sm">Age {child.age}</span>
                <span className="rounded-full bg-card px-3 py-1 text-foreground shadow-sm">{child.grade}</span>
                <span className="flex items-center gap-1 rounded-full bg-card px-3 py-1 text-foreground shadow-sm">
                  <Cake className="h-3.5 w-3.5" /> {new Date(child.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1 rounded-full bg-card px-3 py-1 text-foreground shadow-sm">
                  Next birthday: {nextBd.label} ({nextBd.daysUntil} days)
                </span>
              </div>
              {grounding && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-destructive/15 px-3 py-1.5 text-sm font-bold text-destructive">
                  <Lock className="h-4 w-4" /> Grounded until {new Date(grounding.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>
          </div>

          {/* Stat tiles */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { icon: Check, label: 'Chores Today', value: `${stats.choresCompletedToday}/${stats.choresDueToday}` },
              { icon: Star, label: 'Behavior', value: `${stats.behaviorPoints >= 0 ? '+' : ''}${stats.behaviorPoints}`, positive: stats.behaviorPoints >= 0 },
              { icon: TrendingUp, label: 'Grade Avg', value: `${stats.gradeAverage}%` },
              { icon: Wallet, label: 'Balance', value: `$${stats.allowanceBalance}` },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-border/50 bg-card p-4 text-center shadow-sm">
                <s.icon className={cn('mx-auto mb-2 h-6 w-6', c.text)} />
                <p className={cn('text-2xl font-extrabold', s.positive === false ? 'text-destructive' : 'text-foreground')}>{s.value}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick requests to a parent */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <QuickRequestBar from={childId} to="mom" title={`Ask Mom & Dad`} />
        <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
          Tap a button to send a request, or{' '}
          <Link href="/messages" className="font-bold text-primary hover:underline">
            open Messages
          </Link>{' '}
          to chat.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chores */}
        <SectionCard title="Today's Chores" subtitle={`${completedChores.length} of ${todayChores.length} done`} icon={Clock} iconClassName={c.bgSolid} href="/chores">
          {todayChores.length === 0 ? (
            <EmptyState icon={Check} title="No chores today" />
          ) : (
            <div className="space-y-2">
              {pendingChores.map((ch) => (
                <div key={ch.id} className={cn('flex items-center gap-3 rounded-xl border p-3', c.border, c.bg)}>
                  <div className="h-6 w-6 rounded-full border-2 border-border bg-card" />
                  <span className="flex-1 font-medium text-foreground">{ch.title}</span>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">{ch.points} pts</span>
                </div>
              ))}
              {completedChores.map((ch) => (
                <div key={ch.id} className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/10 p-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-muted-foreground line-through">{ch.title}</span>
                  <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">+{ch.points}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Summer tasks */}
        <SectionCard title="Summer Tasks Today" subtitle={`${summerDone.length} approved overall`} icon={Sun} iconClassName="bg-carson text-carson-foreground" href="/summer-tasks">
          {summerToday.length === 0 ? (
            <EmptyState icon={Sun} title="No summer tasks today" />
          ) : (
            <div className="space-y-2">
              {summerToday.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                  <span className="flex-1 font-medium text-foreground">{t.title}</span>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
                    t.status === 'approved' ? 'bg-success/15 text-success'
                      : t.status === 'needs-check' ? 'bg-primary/15 text-primary'
                      : t.status === 'in-progress' ? 'bg-carson-muted text-carson'
                      : 'bg-muted text-muted-foreground')}>
                    {t.status.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Behavior */}
        <SectionCard title="Recent Behavior" subtitle={`${stats.behaviorPoints >= 0 ? '+' : ''}${stats.behaviorPoints} total points`} icon={Star} iconClassName="bg-warning text-warning-foreground" href="/behavior">
          {behaviorNotes.length === 0 ? (
            <EmptyState icon={Star} title="No behavior notes yet" />
          ) : (
            <div className="space-y-2">
              {behaviorNotes.slice(0, 5).map((note) => (
                <div key={note.id} className={cn('flex items-start gap-3 rounded-xl border p-3', note.type === 'positive' ? 'border-success/20 bg-success/10' : 'border-destructive/20 bg-destructive/10')}>
                  <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', note.type === 'positive' ? 'bg-success/20' : 'bg-destructive/20')}>
                    {note.type === 'positive' ? <ThumbsUp className="h-4 w-4 text-success" /> : <ThumbsDown className="h-4 w-4 text-destructive" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{note.description}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{note.createdBy} · {note.createdAt}</p>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 text-sm font-bold', note.type === 'positive' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive')}>
                    {note.points >= 0 ? '+' : ''}{note.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Grades */}
        <SectionCard title="Grade Records" subtitle={`${stats.gradeAverage}% average`} icon={GraduationCap} iconClassName="bg-primary text-primary-foreground" href="/grades">
          {grades.length === 0 ? (
            <EmptyState icon={GraduationCap} title="No grades recorded" />
          ) : (
            <div className="space-y-2">
              {grades.slice(0, 5).map((g) => (
                <div key={g.id} className={cn('flex items-center justify-between rounded-xl border p-3', c.border, c.bg)}>
                  <div>
                    <p className="font-medium text-foreground">{g.subject}</p>
                    {g.assignment && <p className="text-xs text-muted-foreground">{g.assignment}</p>}
                  </div>
                  <div className="text-right">
                    <p className={cn('text-2xl font-extrabold', c.gradientText)}>{g.letterGrade}</p>
                    <p className="text-xs text-muted-foreground">{g.grade}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Allowance + eligibility */}
        <SectionCard title="Allowance" subtitle="Balance & eligibility" icon={Wallet} iconClassName={c.bgSolid} href="/allowance">
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/50 bg-muted/30 p-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Current Balance</p>
              <p className={cn('text-3xl font-extrabold', c.gradientText)}>${stats.allowanceBalance}</p>
            </div>
            <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold', allowanceEligible ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
              {allowanceEligible ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {allowanceEligible ? 'Eligible' : 'Locked'}
            </span>
          </div>
          <div className="space-y-1.5">
            {transactions.slice(0, 4).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg p-2 text-sm hover:bg-muted/30">
                <span className="truncate text-muted-foreground">{tx.description}</span>
                <span className={cn('font-semibold', tx.amount >= 0 ? 'text-success' : 'text-destructive')}>
                  {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Rewards */}
        <SectionCard title="Rewards" subtitle={`${redeemedRewards.length} redeemed`} icon={Gift} iconClassName="bg-carson text-carson-foreground" href="/rewards">
          <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Available</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {availableRewards.map((r) => (
              <span key={r!.id} className={cn('rounded-full border px-3 py-1.5 text-sm font-medium', c.border, c.bg)}>
                {r!.title} · ${r!.cost}
              </span>
            ))}
          </div>
          <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">Redeemed</p>
          {redeemedRewards.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {redeemedRewards.map((r, i) => (
                <span key={i} className="rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 text-sm font-medium text-muted-foreground">{r!.title}</span>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Upcoming events */}
        <SectionCard title="Upcoming Events" subtitle={`${upcomingEvents.length} upcoming`} icon={Calendar} iconClassName={c.bgSolid} href="/calendar" className="lg:col-span-2">
          {upcomingEvents.length === 0 ? (
            <EmptyState icon={Calendar} title="No upcoming events" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((e) => (
                <div key={e.id} className={cn('flex items-center gap-4 rounded-xl border p-3', c.border, c.bg)}>
                  <div className="min-w-[52px] rounded-xl bg-card p-2 text-center shadow-sm">
                    <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className={cn('text-xl font-extrabold', c.gradientText)}>{new Date(e.date).getDate()}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">{e.title}</p>
                    {e.time && <p className="text-xs text-muted-foreground">{e.time}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
