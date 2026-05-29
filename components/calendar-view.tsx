'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { calendarEvents } from '@/lib/mock-data';
import { colorFor, personLabel, categoryColor } from '@/lib/people';
import { PageHeader } from '@/components/page-header';
import { SectionCard } from '@/components/section-card';
import { EmptyState } from '@/components/empty-state';
import type { CalendarId, CalendarEvent } from '@/lib/types';
import {
  CalendarDays,
  CalendarHeart,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  GraduationCap,
  Trophy,
  Stethoscope,
  Users,
  Briefcase,
  Bell,
  UtensilsCrossed,
  ListTodo,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

const categoryIcon: Record<string, LucideIcon> = {
  school: GraduationCap,
  sports: Trophy,
  appointment: Stethoscope,
  family: Users,
  work: Briefcase,
  reminder: Bell,
  meal: UtensilsCrossed,
  chore: ListTodo,
  other: MoreHorizontal,
};

interface CalendarViewProps {
  calendar: CalendarId;
}

const titles: Record<CalendarId, { title: string; description: string; icon: LucideIcon; accent: string }> = {
  shared: {
    title: 'Shared Family Calendar',
    description: 'Everything happening across the whole family',
    icon: CalendarHeart,
    accent: 'bg-family text-family-foreground shadow-family/25',
  },
  mom: {
    title: 'Mom Calendar',
    description: "Mom's schedule, work blocks, and reminders",
    icon: CalendarDays,
    accent: 'bg-mom text-mom-foreground shadow-mom/25',
  },
  dad: {
    title: 'Dad Calendar',
    description: "Dad's schedule, work, and personal events",
    icon: CalendarDays,
    accent: 'bg-dad text-dad-foreground shadow-dad/25',
  },
};

const fmt = (d: Date) => d.toISOString().split('T')[0];

export function CalendarView({ calendar }: CalendarViewProps) {
  const meta = titles[calendar];
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(fmt(new Date()));

  const events = useMemo<CalendarEvent[]>(() => {
    if (calendar === 'shared') return calendarEvents;
    return calendarEvents.filter((e) => (e.calendar ?? 'shared') === calendar);
  }, [calendar]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startPad = firstDay.getDay();
  const todayStr = fmt(new Date());

  const cells: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const dateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const eventsOn = (day: number) => events.filter((e) => e.date === dateStr(day));

  const selectedEvents = events
    .filter((e) => e.date === selected)
    .sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''));

  const upcoming = events
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? ''))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={meta.title} description={meta.description} icon={meta.icon} iconClassName={meta.accent} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Month grid */}
        <div className="overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg shadow-primary/5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border/50 p-4">
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-foreground transition-colors hover:bg-muted"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-extrabold text-foreground">
              {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-foreground transition-colors hover:bg-muted"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-border/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="p-2 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={i} className="min-h-[72px] border-b border-r border-border/40 bg-muted/20" />;
              const ds = dateStr(day);
              const dayEvents = eventsOn(day);
              const isToday = ds === todayStr;
              const isSelected = ds === selected;
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSelected(ds)}
                  className={cn(
                    'min-h-[72px] border-b border-r border-border/40 p-1.5 text-left align-top transition-colors hover:bg-muted/40',
                    isSelected && 'bg-primary/10 ring-2 ring-inset ring-primary/40',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                      isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
                    )}
                  >
                    {day}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => {
                      const c = colorFor(e.person);
                      return (
                        <div key={e.id} className={cn('truncate rounded px-1 py-0.5 text-[0.62rem] font-semibold', c.bg, c.text)}>
                          {e.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <p className="px-1 text-[0.62rem] font-medium text-muted-foreground">+{dayEvents.length - 2} more</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          <SectionCard
            title={new Date(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            subtitle={`${selectedEvents.length} event${selectedEvents.length === 1 ? '' : 's'}`}
            icon={meta.icon}
            iconClassName={meta.accent}
          >
            {selectedEvents.length === 0 ? (
              <EmptyState icon={meta.icon} title="No events" description="Nothing scheduled for this day." />
            ) : (
              <div className="space-y-2">
                {selectedEvents.map((e) => (
                  <EventRow key={e.id} event={e} showPerson={calendar === 'shared'} />
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Upcoming */}
      <SectionCard title="Upcoming" subtitle={`Next ${upcoming.length} events`} icon={CalendarDays} iconClassName={meta.accent}>
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No upcoming events" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => {
              const c = colorFor(e.person);
              const Icon = categoryIcon[e.category] ?? MoreHorizontal;
              return (
                <button
                  type="button"
                  key={e.id}
                  onClick={() => {
                    setSelected(e.date);
                    setCursor(new Date(e.date));
                  }}
                  className={cn('flex items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/40', c.border, c.bg)}
                >
                  <div className="min-w-[52px] rounded-xl bg-card p-2 text-center shadow-sm">
                    <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className={cn('text-xl font-extrabold', c.text)}>{new Date(e.date).getDate()}</p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{e.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Icon className="h-3 w-3" /> {e.time ?? personLabel[e.person ?? 'all'] ?? 'Family'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function EventRow({ event, showPerson }: { event: CalendarEvent; showPerson: boolean }) {
  const Icon = categoryIcon[event.category] ?? MoreHorizontal;
  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
      <div className="flex items-start gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border', categoryColor[event.category] ?? categoryColor.other)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{event.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {event.time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {event.time}
                {event.endTime && ` – ${event.endTime}`}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {event.location}
              </span>
            )}
          </div>
          {event.notes && <p className="mt-1 text-xs text-muted-foreground">{event.notes}</p>}
        </div>
        {showPerson && event.person && (
          <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold', colorFor(event.person).bg, colorFor(event.person).text)}>
            {personLabel[event.person] ?? 'Family'}
          </span>
        )}
      </div>
    </div>
  );
}
