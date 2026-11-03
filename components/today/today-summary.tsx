import Link from 'next/link';
import { CalendarDays, ChevronRight, Package, ShoppingCart, Sparkles, Utensils } from 'lucide-react';

type TodayEvent = { id: number; title: string; time: string | null; category: string; label?: string };

interface TodaySummaryProps {
  greeting: string;
  name: string;
  dateLabel: string;
  todayEvents: TodayEvent[];
  laterEvents: TodayEvent[];
  dinner: string[];
  lowPantry: { id: number; name: string; status: string }[];
  counts: { toBuy: number; neededSoon: number; wishlistPending: number };
}

function Panel({
  title,
  href,
  icon: Icon,
  children,
}: {
  title: string;
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl glass-card flex flex-col" aria-labelledby={`panel-${href}`}>
      <div className="flex items-center justify-between gap-3 p-5 border-b border-border/50">
        <h2 id={`panel-${href}`} className="flex items-center gap-3 text-lg font-bold text-foreground">
          <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
          {title}
        </h2>
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline touch-target"
        >
          Open
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="p-5 flex-1">{children}</div>
    </section>
  );
}

function EventRow({ event }: { event: TodayEvent }) {
  return (
    <li className="flex items-center justify-between gap-4 py-3 border-b border-border/40 last:border-0">
      <span className="font-semibold text-foreground text-pretty">{event.title}</span>
      <span className="text-sm text-muted-foreground shrink-0">
        {[event.label, event.time].filter(Boolean).join(' · ') || 'All day'}
      </span>
    </li>
  );
}

export function TodaySummary(props: TodaySummaryProps) {
  const { counts } = props;
  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <header>
        <p className="text-muted-foreground font-medium">{props.dateLabel}</p>
        <h1 className="cozyla-heading text-foreground text-balance">
          {props.greeting}, {props.name}
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Today" href="/calendar" icon={CalendarDays}>
            {props.todayEvents.length === 0 ? (
              <p className="text-muted-foreground py-4">Nothing on the calendar today.</p>
            ) : (
              <ul>
                {props.todayEvents.map((e) => (
                  <EventRow key={e.id} event={e} />
                ))}
              </ul>
            )}
            {props.laterEvents.length > 0 && (
              <>
                <h3 className="mt-6 mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Coming up this week
                </h3>
                <ul>
                  {props.laterEvents.map((e) => (
                    <EventRow key={e.id} event={e} />
                  ))}
                </ul>
              </>
            )}
          </Panel>
        </div>

        <Panel title="Groceries" href="/grocery-list" icon={ShoppingCart}>
          <p className="text-5xl font-bold text-foreground">{counts.toBuy}</p>
          <p className="text-muted-foreground mt-1">{counts.toBuy === 1 ? 'item to buy' : 'items to buy'}</p>
          {counts.neededSoon > 0 && (
            <p className="mt-4 text-sm font-semibold text-foreground">{counts.neededSoon} needed by a date</p>
          )}
          <Link
            href="/grocery-wishlist"
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary hover:underline touch-target"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            {counts.wishlistPending === 0
              ? 'No wishlist requests waiting'
              : `${counts.wishlistPending} wishlist ${counts.wishlistPending === 1 ? 'request' : 'requests'} waiting`}
          </Link>
        </Panel>

        <Panel title="Tonight's dinner" href="/meal-planner" icon={Utensils}>
          {props.dinner.length === 0 ? (
            <p className="text-muted-foreground">No dinner planned yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {props.dinner.map((d) => (
                <li key={d} className="text-xl font-bold text-foreground">
                  {d}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Running low" href="/pantry" icon={Package}>
          {props.lowPantry.length === 0 ? (
            <p className="text-muted-foreground">Pantry looks stocked.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {props.lowPantry.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">{p.name}</span>
                  <span className="text-sm text-muted-foreground">{p.status === 'out' ? 'Out' : 'Low'}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
