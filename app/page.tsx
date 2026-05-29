import Link from 'next/link';
import { GreetingHeader } from '@/components/greeting-header';
import { DashboardChildCard } from '@/components/dashboard-child-card';
import { EmptyState } from '@/components/empty-state';
import {
  children,
  parents,
  chores,
  calendarEvents,
  summerTasks,
  approvalQueue,
  groceryItems,
  mealPlan,
} from '@/lib/mock-data';
import { colorFor, personLabel, categoryColor } from '@/lib/people';
import { cn } from '@/lib/utils';
import {
  CalendarDays,
  CheckCheck,
  ShoppingCart,
  UtensilsCrossed,
  Clock,
  ChevronRight,
  ListTodo,
  Sun,
  ArrowRight,
} from 'lucide-react';

const todayStr = new Date().toISOString().split('T')[0];
const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function SectionTitle({
  title,
  href,
  linkLabel = 'View all',
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default function Dashboard() {
  const todayEvents = calendarEvents
    .filter((e) => e.date === todayStr)
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));
  const todayChores = chores.filter((c) => c.dueDate === todayStr);
  const completedChores = todayChores.filter((c) => c.completed).length;
  const pendingApprovals = approvalQueue.filter((a) => a.status === 'pending');
  const requiredSummer = summerTasks.filter((t) => t.required);
  const approvedSummer = requiredSummer.filter((t) => t.status === 'approved');
  const summerPct = requiredSummer.length
    ? Math.round((approvedSummer.length / requiredSummer.length) * 100)
    : 0;
  const groceriesNeeded = groceryItems.filter((g) => !g.purchased);
  const todayPlan = mealPlan.days.find((d) => d.day === dayName);

  // Weekly glance: events per day this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const ds = d.toISOString().split('T')[0];
    return {
      ds,
      label: weekdayShort[d.getDay()],
      num: d.getDate(),
      isToday: ds === todayStr,
      count: calendarEvents.filter((e) => e.date === ds).length,
    };
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <GreetingHeader />

      {/* Summary chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Events today', value: todayEvents.length, icon: CalendarDays, cls: 'bg-alex-muted text-alex' },
          { label: 'Chores done', value: `${completedChores}/${todayChores.length}`, icon: ListTodo, cls: 'bg-jaxon-muted text-jaxon' },
          { label: 'Need approval', value: pendingApprovals.length, icon: CheckCheck, cls: 'bg-carson-muted text-carson' },
          { label: 'Summer unlock', value: `${summerPct}%`, icon: Sun, cls: 'bg-mom-muted text-mom' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="boho-card flex items-center gap-3 rounded-2xl p-4">
              <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', s.cls)}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-extrabold leading-none tabular-nums">{s.value}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Three large child cards */}
      <section>
        <SectionTitle title="The Kids" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {children.map((child) => (
            <DashboardChildCard key={child.id} child={child} />
          ))}
        </div>
      </section>

      {/* Main widget grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Today's schedule (wide) */}
        <section className="boho-card rounded-3xl p-5 lg:col-span-2">
          <SectionTitle title="Today's Schedule" href="/calendar" />
          {todayEvents.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No events today" description="Enjoy the open schedule." />
          ) : (
            <div className="space-y-2.5">
              {todayEvents.map((e) => (
                <div key={e.id} className="flex items-center gap-4 rounded-2xl bg-secondary/50 p-3.5">
                  <div className="flex w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-card py-2 shadow-sm">
                    <Clock className="mb-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-bold leading-none">{e.time ?? 'All day'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold">{e.title}</p>
                    {e.location && <p className="truncate text-sm text-muted-foreground">{e.location}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize', categoryColor[e.category])}>
                      {e.category}
                    </span>
                    {e.person && e.person !== 'all' && (
                      <span className="text-xs font-semibold text-muted-foreground">{personLabel[e.person] ?? ''}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Approvals panel */}
        <section className="boho-card flex flex-col rounded-3xl p-5">
          <SectionTitle title="Approvals" href="/approvals" linkLabel="Open queue" />
          {pendingApprovals.length === 0 ? (
            <EmptyState icon={CheckCheck} title="All caught up" />
          ) : (
            <div className="flex-1 space-y-2.5">
              {pendingApprovals.slice(0, 5).map((a) => {
                const c = colorFor(a.childId);
                return (
                  <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
                    <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold', c.bgSolid)}>
                      {personLabel[a.childId]?.[0]}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{a.title}</p>
                      <p className="truncate text-xs capitalize text-muted-foreground">
                        {personLabel[a.childId]} · {a.type.replace('-', ' ')}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                );
              })}
            </div>
          )}
          {pendingApprovals.length > 0 && (
            <Link
              href="/approvals"
              className="mt-4 flex items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Review {pendingApprovals.length} item{pendingApprovals.length === 1 ? '' : 's'}
            </Link>
          )}
        </section>
      </div>

      {/* Meal + grocery row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Tonight's dinner */}
        <section className="boho-card rounded-3xl p-5">
          <SectionTitle title="Tonight's Dinner" href="/meal-plan" linkLabel="Meal plan" />
          <div className="rounded-2xl bg-carson-muted p-5 text-center">
            <UtensilsCrossed className="mx-auto mb-2 h-6 w-6 text-carson" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{dayName}</p>
            <p className="mt-1 text-xl font-extrabold text-balance">{todayPlan?.dinner ?? 'Not planned'}</p>
            {todayPlan?.cook && <p className="mt-1 text-sm font-semibold text-muted-foreground">Cook: {todayPlan.cook}</p>}
          </div>
        </section>

        {/* Grocery quick view (wide) */}
        <section className="boho-card rounded-3xl p-5 lg:col-span-2">
          <SectionTitle title="Grocery List" href="/grocery-list" />
          {groceriesNeeded.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Nothing on the list" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {groceriesNeeded.slice(0, 12).map((g) => (
                <span key={g.id} className="rounded-full bg-secondary px-3.5 py-1.5 text-sm font-semibold">
                  {g.item} <span className="text-muted-foreground">· {g.quantity}</span>
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Weekly glance */}
      <section className="boho-card rounded-3xl p-5">
        <SectionTitle title="This Week at a Glance" href="/calendar" />
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d) => (
            <div
              key={d.ds}
              className={cn(
                'flex flex-col items-center gap-1 rounded-2xl p-3 text-center transition-colors',
                d.isToday ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary/50',
              )}
            >
              <span className={cn('text-xs font-bold uppercase', d.isToday ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                {d.label}
              </span>
              <span className="text-lg font-extrabold tabular-nums">{d.num}</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.65rem] font-bold',
                  d.isToday ? 'bg-white/20 text-primary-foreground' : 'bg-card text-muted-foreground',
                )}
              >
                {d.count} {d.count === 1 ? 'event' : 'events'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Parent quick links */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {parents.map((p) => {
          const c = colorFor(p.id);
          return (
            <Link key={p.id} href={`/${p.id}`} className="boho-card hover-lift flex items-center gap-3 rounded-2xl p-4">
              <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-base font-extrabold', c.bgSolid)}>
                {p.avatar}
              </span>
              <div>
                <p className="font-extrabold">{p.name}</p>
                <p className="text-xs font-semibold text-muted-foreground">View profile</p>
              </div>
            </Link>
          );
        })}
        <Link href="/family-hub" className="boho-card hover-lift flex items-center gap-3 rounded-2xl p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-family-muted text-family">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="font-extrabold">Family Hub</p>
            <p className="text-xs font-semibold text-muted-foreground">Shared space</p>
          </div>
        </Link>
        <Link href="/admin" className="boho-card hover-lift flex items-center gap-3 rounded-2xl p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CheckCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="font-extrabold">Parent Admin</p>
            <p className="text-xs font-semibold text-muted-foreground">Manage all</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
