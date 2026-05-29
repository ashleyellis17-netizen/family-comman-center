import Link from 'next/link';
import { ChildQuickCard } from '@/components/child-quick-card';
import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';
import { StatPill } from '@/components/stat-pill';
import { EmptyState } from '@/components/empty-state';
import {
  children,
  parents,
  chores,
  calendarEvents,
  summerTasks,
  approvalQueue,
  groundings,
  groceryItems,
  mealPlan,
  parentNotes,
  getAllowanceBalance,
  getActiveGroundingForChild,
} from '@/lib/mock-data';
import { colorFor, personLabel, categoryColor } from '@/lib/people';
import { cn } from '@/lib/utils';
import {
  Sun,
  Moon,
  Calendar,
  CalendarDays,
  ListTodo,
  CheckCheck,
  Wallet,
  Lock,
  ShoppingCart,
  UtensilsCrossed,
  CalendarRange,
  StickyNote,
  Users,
  AlertTriangle,
  Sparkles,
  Clock,
} from 'lucide-react';

const todayStr = new Date().toISOString().split('T')[0];
const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

export default function Dashboard() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const todayEvents = calendarEvents.filter((e) => e.date === todayStr);
  const todayChores = chores.filter((c) => c.dueDate === todayStr);
  const completedChores = todayChores.filter((c) => c.completed).length;
  const choresNeedingApproval = chores.filter((c) => c.needsApproval && c.approvalStatus === 'pending');
  const pendingApprovals = approvalQueue.filter((a) => a.status === 'pending');
  const activeGroundings = groundings.filter((g) => g.status === 'active');
  const requiredSummer = summerTasks.filter((t) => t.required);
  const approvedSummer = requiredSummer.filter((t) => t.status === 'approved');
  const summerPct = requiredSummer.length ? Math.round((approvedSummer.length / requiredSummer.length) * 100) : 0;
  const groceriesNeeded = groceryItems.filter((g) => !g.purchased);
  const todayPlan = mealPlan.days.find((d) => d.day === dayName);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {hour < 19 ? <Sun className="h-7 w-7 text-carson animate-wiggle" /> : <Moon className="h-7 w-7 text-alex animate-float" />}
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{greeting}, Theveny Family</span>
          </div>
          <h1 className="cozyla-heading text-foreground">Family Command Center</h1>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-border/50 bg-card px-5 py-4 shadow-lg shadow-primary/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-alex text-white shadow-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today</p>
            <p className="text-lg font-extrabold text-foreground">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Household summary */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatPill icon={Users} label="Family Members" value={children.length + parents.length} iconClassName="bg-family-muted text-family" />
        <StatPill icon={CalendarDays} label="Events Today" value={todayEvents.length} iconClassName="bg-alex-muted text-alex" />
        <StatPill icon={ListTodo} label="Chores Done" value={`${completedChores}/${todayChores.length}`} iconClassName="bg-jaxon-muted text-jaxon" />
        <StatPill icon={CheckCheck} label="Need Approval" value={pendingApprovals.length} iconClassName="bg-carson-muted text-carson" />
        <StatPill icon={Sun} label="Summer Unlock" value={`${summerPct}%`} iconClassName="bg-carson-muted text-carson" />
        <StatPill icon={ShoppingCart} label="Grocery Items" value={groceriesNeeded.length} iconClassName="bg-mom-muted text-mom" />
      </div>

      {/* Kid cards */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-jaxon" />
          <h2 className="text-xl font-extrabold text-foreground">The Kids</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <ChildQuickCard childId="alex" />
          <ChildQuickCard childId="jaxon" />
          <ChildQuickCard childId="carson" />
        </div>
      </section>

      {/* Alerts: grounding */}
      {activeGroundings.length > 0 && (
        <SectionCard title="Eligibility Alerts" subtitle="Active grounding in effect" icon={AlertTriangle} iconClassName="bg-destructive/15 text-destructive" href="/grounding">
          <div className="grid gap-3 sm:grid-cols-2">
            {activeGroundings.map((g) => {
              const c = colorFor(g.childId);
              return (
                <div key={g.id} className={cn('rounded-2xl border p-4', c.border, c.bg)}>
                  <div className="flex items-center justify-between">
                    <span className={cn('font-extrabold', c.text)}>{personLabel[g.childId]}</span>
                    <span className="rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-bold text-destructive">Grounded</span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{g.reason}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                    <span className={cn('rounded-full px-2 py-0.5', g.allowanceEligible ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
                      Allowance {g.allowanceEligible ? 'OK' : 'Locked'}
                    </span>
                    <span className={cn('rounded-full px-2 py-0.5', g.electronicsAllowed ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
                      Electronics {g.electronicsAllowed ? 'OK' : 'Blocked'}
                    </span>
                    {g.earnBackAvailable && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-primary">Earn Back</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's events */}
        <SectionCard title="Today's Events" subtitle={`${todayEvents.length} scheduled`} icon={CalendarDays} iconClassName="bg-alex text-alex-foreground" href="/calendar">
          {todayEvents.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No events today" description="Enjoy the open schedule!" />
          ) : (
            <div className="space-y-2">
              {todayEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                  <div className="w-16 shrink-0 text-sm font-bold text-foreground">{e.time ?? 'All day'}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{e.title}</p>
                    {e.location && <p className="truncate text-xs text-muted-foreground">{e.location}</p>}
                  </div>
                  <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize', categoryColor[e.category])}>{e.category}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Today's tasks */}
        <SectionCard title="Today's Kids Tasks" subtitle={`${completedChores}/${todayChores.length} chores done`} icon={ListTodo} iconClassName="bg-jaxon text-jaxon-foreground" href="/chores">
          {todayChores.length === 0 ? (
            <EmptyState icon={ListTodo} title="No tasks due today" />
          ) : (
            <div className="space-y-2">
              {todayChores.map((c) => {
                const col = colorFor(c.assignedTo);
                return (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                    <span className={cn('h-2.5 w-2.5 rounded-full', col.dot)} />
                    <span className={cn('flex-1 font-semibold', c.completed ? 'text-muted-foreground line-through' : 'text-foreground')}>{c.title}</span>
                    <span className="text-xs font-medium text-muted-foreground">{personLabel[c.assignedTo]}</span>
                    {c.completed && <CheckCheck className="h-4 w-4 text-success" />}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Parent calendar highlights */}
        <SectionCard title="Mom & Dad Highlights" subtitle="Parent calendar today" icon={CalendarDays} iconClassName="bg-mom text-mom-foreground">
          <div className="grid gap-3 sm:grid-cols-2">
            {parents.map((p) => {
              const events = calendarEvents.filter((e) => e.calendar === p.id && e.date === todayStr);
              const c = colorFor(p.id);
              return (
                <div key={p.id} className={cn('rounded-2xl border p-4', c.border, c.bg)}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', c.dot)} />
                    <span className={cn('font-extrabold', c.text)}>{p.name}</span>
                  </div>
                  {events.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nothing scheduled today</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {events.map((e) => (
                        <li key={e.id} className="flex items-center gap-2 text-sm text-foreground">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{e.time}</span>
                          <span className="truncate">{e.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Approvals */}
        <SectionCard title="Needs Parent Approval" subtitle={`${pendingApprovals.length} waiting`} icon={CheckCheck} iconClassName="bg-carson text-carson-foreground" href="/approvals">
          {pendingApprovals.length === 0 ? (
            <EmptyState icon={CheckCheck} title="All caught up" description="No items waiting for approval." />
          ) : (
            <div className="space-y-2">
              {pendingApprovals.slice(0, 5).map((a) => {
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

        {/* Allowance balances */}
        <SectionCard title="Allowance Balances" subtitle="Current totals" icon={Wallet} iconClassName="bg-jaxon text-jaxon-foreground" href="/allowance">
          <div className="grid grid-cols-3 gap-3">
            {children.map((child) => {
              const c = colorFor(child.id);
              const grounded = getActiveGroundingForChild(child.id);
              const locked = grounded && !grounded.allowanceEligible;
              return (
                <div key={child.id} className={cn('rounded-2xl border p-4 text-center', c.border, c.bg)}>
                  <p className={cn('text-sm font-bold', c.text)}>{child.name}</p>
                  <p className="mt-1 text-2xl font-extrabold text-foreground">${getAllowanceBalance(child.id)}</p>
                  {locked && (
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                      <Lock className="h-3 w-3" /> Locked
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Tonight's dinner + meal preview */}
        <SectionCard title="Tonight's Dinner" subtitle={todayPlan?.cook ? `Cook: ${todayPlan.cook}` : 'Weekly plan'} icon={UtensilsCrossed} iconClassName="bg-carson text-carson-foreground" href="/meal-plan">
          <div className="rounded-2xl border border-carson/30 bg-carson-muted p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{dayName} Dinner</p>
            <p className="mt-1 text-2xl font-extrabold text-foreground">{todayPlan?.dinner ?? 'Not planned yet'}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            {mealPlan.days.slice(0, 6).map((d) => (
              <div key={d.day} className="rounded-xl border border-border/50 bg-muted/30 p-2.5">
                <p className="text-xs font-bold text-muted-foreground">{d.day.slice(0, 3)}</p>
                <p className="truncate text-sm font-semibold text-foreground">{d.dinner}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Bottom row: grocery + reminders */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Grocery Quick View" subtitle={`${groceriesNeeded.length} items needed`} icon={ShoppingCart} iconClassName="bg-mom text-mom-foreground" href="/grocery-list">
          {groceriesNeeded.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Nothing on the list" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {groceriesNeeded.slice(0, 10).map((g) => (
                <span key={g.id} className="rounded-full border border-border/50 bg-muted/40 px-3 py-1.5 text-sm font-medium text-foreground">
                  {g.item} <span className="text-muted-foreground">· {g.quantity}</span>
                </span>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Family Reminders" subtitle="Shared parent notes" icon={StickyNote} iconClassName="bg-dad text-dad-foreground" href="/family-hub">
          <div className="space-y-2">
            {parentNotes.map((n) => (
              <div key={n.id} className="flex gap-3 rounded-xl border border-border/50 bg-muted/30 p-3">
                <span className={cn('mt-1 h-2.5 w-2.5 shrink-0 rounded-full', colorFor(n.author).dot)} />
                <div>
                  <p className="text-sm text-foreground">{n.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">{n.author} · {n.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
