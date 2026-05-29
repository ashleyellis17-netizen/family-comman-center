import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';
import { EmptyState } from '@/components/empty-state';
import {
  children,
  calendarEvents,
  parentNotes,
  groceryItems,
  mealPlan,
  approvalQueue,
  rewardUnlocks,
} from '@/lib/mock-data';
import { colorFor, personLabel, categoryColor } from '@/lib/people';
import { cn } from '@/lib/utils';
import {
  Home,
  CalendarDays,
  StickyNote,
  ShoppingCart,
  UtensilsCrossed,
  Gift,
  CheckCheck,
  Clock,
} from 'lucide-react';

const todayStr = new Date().toISOString().split('T')[0];
const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

const unlockStateLabel: Record<string, { label: string; cls: string }> = {
  locked: { label: 'Locked', cls: 'bg-muted text-muted-foreground' },
  'in-progress': { label: 'In Progress', cls: 'bg-carson-muted text-carson' },
  'needs-approval': { label: 'Needs Approval', cls: 'bg-primary/15 text-primary' },
  unlocked: { label: 'Unlocked', cls: 'bg-success/15 text-success' },
  'used-today': { label: 'Used Today', cls: 'bg-muted text-muted-foreground' },
  'limit-reached': { label: 'Limit Reached', cls: 'bg-destructive/15 text-destructive' },
};

export default function FamilyHubPage() {
  const upcoming = calendarEvents
    .filter((e) => (e.calendar ?? 'shared') === 'shared' && e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);
  const groceriesNeeded = groceryItems.filter((g) => !g.purchased);
  const pendingApprovals = approvalQueue.filter((a) => a.status === 'pending');
  const todayPlan = mealPlan.days.find((d) => d.day === dayName);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <PageHeader
        title="Family Hub"
        description="One central place for the whole household"
        icon={Home}
        iconClassName="bg-gradient-to-br from-family to-family-light text-family-foreground shadow-family/25"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Shared calendar / upcoming */}
        <SectionCard title="Upcoming Family Events" subtitle="School, sports & family" icon={CalendarDays} iconClassName="bg-family text-family-foreground" href="/calendar" className="lg:col-span-2">
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No upcoming events" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((e) => (
                <div key={e.id} className="rounded-2xl border border-border/50 bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">
                      {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className={cn('rounded-full border px-2 py-0.5 text-xs font-semibold capitalize', categoryColor[e.category])}>{e.category}</span>
                  </div>
                  <p className="mt-1 font-semibold text-foreground">{e.title}</p>
                  {e.time && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {e.time}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Parent notes */}
        <SectionCard title="Parent Notes" subtitle="Shared reminders" icon={StickyNote} iconClassName="bg-mom text-mom-foreground">
          <div className="space-y-2">
            {parentNotes.map((n) => (
              <div key={n.id} className="flex gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', colorFor(n.author).dot)} />
                <div>
                  <p className="text-sm text-foreground">{n.text}</p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">{n.author} · {n.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Grocery reminders */}
        <SectionCard title="Grocery Reminders" subtitle={`${groceriesNeeded.length} items needed`} icon={ShoppingCart} iconClassName="bg-dad text-dad-foreground" href="/grocery-list">
          {groceriesNeeded.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Nothing needed" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {groceriesNeeded.slice(0, 12).map((g) => (
                <span key={g.id} className="rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground">
                  {g.item}
                </span>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Meal plan */}
        <SectionCard title="This Week's Meals" subtitle={todayPlan ? `Tonight: ${todayPlan.dinner}` : 'Weekly plan'} icon={UtensilsCrossed} iconClassName="bg-carson text-carson-foreground" href="/meal-plan">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {mealPlan.days.map((d) => (
              <div key={d.day} className={cn('rounded-xl border p-2.5', d.day === dayName ? 'border-carson/40 bg-carson-muted' : 'border-border/50 bg-muted/30')}>
                <p className="text-xs font-bold text-muted-foreground">{d.day.slice(0, 3)}</p>
                <p className="truncate text-sm font-semibold text-foreground">{d.dinner}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Kids reward status */}
        <SectionCard title="Kids Reward Status" subtitle="Today's unlocks" icon={Gift} iconClassName="bg-jaxon text-jaxon-foreground" href="/reward-unlock">
          <div className="space-y-4">
            {children.map((child) => {
              const unlocks = rewardUnlocks.filter((u) => u.childId === child.id);
              const c = colorFor(child.id);
              return (
                <div key={child.id}>
                  <p className={cn('mb-1.5 text-sm font-bold', c.text)}>{child.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {unlocks.map((u) => {
                      const s = unlockStateLabel[u.state];
                      return (
                        <span key={u.id} className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', s.cls)}>
                          {u.label}: {s.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Needs approval */}
        <SectionCard title="Needs Parent Approval" subtitle={`${pendingApprovals.length} waiting`} icon={CheckCheck} iconClassName="bg-primary text-primary-foreground" href="/approvals">
          {pendingApprovals.length === 0 ? (
            <EmptyState icon={CheckCheck} title="All caught up" />
          ) : (
            <div className="space-y-2">
              {pendingApprovals.map((a) => {
                const c = colorFor(a.childId);
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                    <span className={cn('h-2.5 w-2.5 rounded-full', c.dot)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{a.title}</p>
                      <p className="text-xs capitalize text-muted-foreground">{personLabel[a.childId]} · {a.type.replace('-', ' ')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
