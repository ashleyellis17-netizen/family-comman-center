'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { calendarEvents, children } from '@/lib/mock-data';
import { ChildAvatar } from '@/components/child-avatar';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Stethoscope,
  Users,
  Trophy,
  MoreHorizontal,
  Clock,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarSubscribe } from '@/components/calendar-subscribe';
import type { ChildId } from '@/lib/types';

const categoryIcons = {
  school: GraduationCap,
  sports: Trophy,
  appointment: Stethoscope,
  family: Users,
  work: Briefcase,
  other: MoreHorizontal,
};

const categoryColors = {
  school: 'bg-primary/20 text-primary border-primary/30',
  sports: 'bg-success/20 text-success border-success/30',
  appointment: 'bg-destructive/20 text-destructive border-destructive/30',
  family: 'bg-warning/20 text-warning-foreground border-warning/30',
  work: 'bg-alex/20 text-alex border-alex/30',
  other: 'bg-muted text-muted-foreground border-border',
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Create calendar grid
  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getEventsForDay = (day: number) => {
    const dateStr = formatDate(day);
    return calendarEvents.filter((e) => e.date === dateStr);
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  // Get upcoming events for sidebar
  const todayStr = today.toISOString().split('T')[0];
  const upcomingEvents = calendarEvents
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="cozyla-heading text-foreground flex items-center gap-3">
          <Calendar className="w-8 h-8" />
          Calendar
        </h1>
        <p className="text-muted-foreground mt-1">
          Family events and appointments
        </p>
      </div>

      <CalendarSubscribe />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 rounded-2xl bg-card shadow-lg border border-border/50 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevMonth}
              className="touch-target"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h2 className="text-xl font-bold text-foreground">
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="touch-target"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const events = day ? getEventsForDay(day) : [];

              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-b border-r border-border',
                    !day && 'bg-muted/30',
                    day && isToday(day) && 'bg-primary/10'
                  )}
                >
                  {day && (
                    <>
                      <p
                        className={cn(
                          'text-sm font-medium mb-1',
                          isToday(day)
                            ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center'
                            : 'text-foreground'
                        )}
                      >
                        {day}
                      </p>
                      <div className="space-y-1">
                        {events.slice(0, 2).map((event) => {
                          const CategoryIcon =
                            categoryIcons[event.category] || MoreHorizontal;
                          return (
                            <div
                              key={event.id}
                              className={cn(
                                'text-xs px-1 py-0.5 rounded truncate border',
                                categoryColors[event.category]
                              )}
                              title={event.title}
                            >
                              <CategoryIcon className="w-3 h-3 inline mr-1" />
                              <span className="hidden md:inline">
                                {event.title}
                              </span>
                            </div>
                          );
                        })}
                        {events.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{events.length - 2}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="rounded-2xl bg-card shadow-lg border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-foreground">Upcoming Events</h2>
          </div>

          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {upcomingEvents.map((event) => {
              const CategoryIcon =
                categoryIcons[event.category] || MoreHorizontal;
              const child = event.childId
                ? children.find((c) => c.id === event.childId)
                : null;

              return (
                <div key={event.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        categoryColors[event.category]
                      )}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {event.time && (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {event.description}
                        </p>
                      )}
                    </div>

                    {child && (
                      <ChildAvatar
                        childId={child.id as ChildId}
                        name={child.name}
                        size="sm"
                      />
                    )}
                    {event.allChildren && (
                      <div className="flex -space-x-2">
                        {children.map((c) => (
                          <ChildAvatar
                            key={c.id}
                            childId={c.id as ChildId}
                            name={c.name}
                            size="sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 p-4">
        <p className="text-sm font-medium text-foreground mb-3">Legend</p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(categoryIcons).map(([category, Icon]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-6 h-6 rounded flex items-center justify-center',
                  categoryColors[category as keyof typeof categoryColors]
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-muted-foreground capitalize">
                {category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
