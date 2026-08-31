import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/state-views';
import { cn } from '@/lib/utils';
import {
  children,
  familyEvents,
  parentEvents,
  parentNotes,
  groceryItems,
  mealPlan,
  unlockRewards,
  getPendingApprovals,
  getSchoolProgressForChild,
  getChildStats,
} from '@/lib/mock-data';
import {
  Home,
  CalendarDays,
  Users,
  StickyNote,
  ShoppingCart,
  Utensils,
  ListTodo,
  Trophy,
  ClipboardCheck,
} from 'lucide-react';

function formatShort(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function FamilyHubPage() {
  const allEvents = [...familyEvents, ...parentEvents]
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);
  const pending = getPendingApprovals();
  const unpurchased = groceryItems.filter((g) => !g.purchased);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Family Hub"
        description="The central household command center"
        icon={Home}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shared family calendar */}
        <SectionCard title="Shared Family Calendar" subtitle="Everyone's events in one place" icon={CalendarDays} iconClassName="from-carson to-carson-light text-carson-foreground" href="/calendar">
          {familyEvents.length === 0 ? (
            <EmptyState title="No family events" icon={CalendarDays} />
          ) : (
            <ul className="space-y-2">
              {familyEvents.map((e) => (
                <li key={e.id} className="flex items-center gap-4 p-3 rounded-2xl bg-muted/40">
                  <div className="text-center min-w-[52px] rounded-xl p-2 bg-carson/15">
                    <p className="text-xs text-muted-foreground">{new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className="text-lg font-extrabold text-carson">{new Date(e.date + 'T00:00:00').getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{e.title}</p>
                    {e.description && <p className="text-xs text-muted-foreground truncate">{e.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Upcoming family events (mixed) */}
        <SectionCard title="Upcoming Events" subtitle="Family and parents" icon={Users} href="/calendar">
          <ul className="space-y-2">
            {allEvents.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 text-sm p-3 rounded-2xl bg-muted/40">
                <span className="text-foreground truncate">{e.title}</span>
                <span className="text-muted-foreground shrink-0">{e.time ?? formatShort(e.date)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Parent notes */}
        <SectionCard title="Parent Notes" subtitle="Shared reminders & notes" icon={StickyNote}>
          {parentNotes.length === 0 ? (
            <EmptyState title="No notes" icon={StickyNote} />
          ) : (
            <ul className="space-y-2">
              {parentNotes.map((n) => (
                <li key={n.id} className="p-3 rounded-2xl bg-muted/40">
                  <p className="text-sm text-foreground">{n.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.author} · {formatShort(n.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Grocery reminders */}
        <SectionCard title="Grocery Reminders" subtitle={`${unpurchased.length} items to buy`} icon={ShoppingCart} iconClassName="from-alex to-alex-light text-white" href="/grocery-list">
          <ul className="space-y-2">
            {unpurchased.slice(0, 5).map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-foreground truncate">{g.item} <span className="text-muted-foreground">· {g.quantity}</span></span>
                <StatusBadge status={g.priority} />
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Meal plan preview */}
        <SectionCard title="Meal Plan Preview" subtitle="This week's dinners" icon={Utensils} iconClassName="from-jaxon to-jaxon-light text-white" href="/meal-plan">
          <ul className="space-y-2">
            {mealPlan.slice(0, 5).map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 text-sm p-2 rounded-xl hover:bg-muted/40">
                <span className="font-semibold text-foreground">{m.day}</span>
                <span className="text-muted-foreground truncate ml-2">{m.dinner}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Kids task status */}
        <SectionCard title="Kids' Task Status" subtitle="Chores & school progress" icon={ListTodo} href="/school">
          <ul className="space-y-3">
            {children.map((c) => {
              const stats = getChildStats(c.id);
              const school = getSchoolProgressForChild(c.id);
              const bar = c.id === 'alex' ? 'bg-alex' : c.id === 'jaxon' ? 'bg-jaxon' : 'bg-carson';
              return (
                <li key={c.id}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-bold text-foreground">{c.name}</span>
                    <span className="text-muted-foreground">Chores {stats.choresCompletedToday}/{stats.choresDueToday} · School {school.done}/{school.total}</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', bar)} style={{ width: `${school.percent}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>

        {/* Reward unlock status */}
        <SectionCard title="Reward Unlock Status" subtitle="Across all kids" icon={Trophy} iconClassName="from-carson to-carson-light text-carson-foreground" href="/reward-unlock">
          <ul className="space-y-2">
            {unlockRewards.slice(0, 6).map((r) => {
              const child = children.find((c) => c.id === r.childId);
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/40">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{child?.name}</p>
                  </div>
                  <StatusBadge status={r.state} />
                </li>
              );
            })}
          </ul>
        </SectionCard>

        {/* Needs parent approval */}
        <SectionCard title="Needs Parent Approval" subtitle={`${pending.length} waiting`} icon={ClipboardCheck} href="/approvals">
          {pending.length === 0 ? (
            <EmptyState title="All caught up!" icon={ClipboardCheck} />
          ) : (
            <ul className="space-y-2">
              {pending.map((a) => {
                const child = children.find((c) => c.id === a.childId);
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-muted/40">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{child?.name} · {a.type}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}
