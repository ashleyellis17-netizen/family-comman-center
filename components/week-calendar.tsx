import { cn } from '@/lib/utils';
import { getWeekDates, getEventsForDate } from '@/lib/mock-data';
import { children } from '@/lib/mock-data';
import type { CalendarEvent } from '@/lib/types';
import { Calendar } from 'lucide-react';

const categoryColors = {
  school: 'bg-alex-muted text-alex border-alex/30',
  sports: 'bg-success/20 text-success border-success/30',
  appointment: 'bg-destructive/20 text-destructive border-destructive/30',
  family: 'bg-jaxon-muted text-jaxon border-jaxon/30',
  work: 'bg-alex-muted text-alex border-alex/30',
  other: 'bg-muted text-muted-foreground border-muted',
};

function EventPill({ event }: { event: CalendarEvent }) {
  const child = event.childId ? children.find(c => c.id === event.childId) : null;
  
  const childColorClass = child?.color === 'alex' 
    ? 'bg-alex-muted text-alex border-alex/30'
    : child?.color === 'jaxon'
    ? 'bg-jaxon-muted text-jaxon border-jaxon/30'
    : child?.color === 'carson'
    ? 'bg-carson-muted text-carson border-carson/30'
    : '';
  
  return (
    <div
      className={cn(
        'text-xs px-2.5 py-1.5 rounded-xl truncate border font-semibold transition-transform hover:scale-105 shadow-sm',
        event.childId && child ? childColorClass : categoryColors[event.category]
      )}
      title={`${event.title}${event.time ? ` at ${event.time}` : ''}`}
    >
      {event.time && (
        <span className="font-bold mr-1 opacity-80">{event.time.split(' ')[0]}</span>
      )}
      {event.title}
    </div>
  );
}

export function WeekCalendar() {
  const weekDates = getWeekDates();

  return (
    <div className="rounded-3xl bg-card overflow-hidden hover-lift shadow-lg shadow-primary/5 border border-border/50">
      <div className="p-5 border-b border-border/50 flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-jaxon flex items-center justify-center shadow-lg">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-foreground">This Week</h2>
          <p className="text-xs text-muted-foreground font-medium">Upcoming events and activities</p>
        </div>
      </div>
      
      <div className="grid grid-cols-7 divide-x divide-border/30">
        {weekDates.map((day) => {
          const events = getEventsForDate(day.date);
          
          return (
            <div
              key={day.date}
              className={cn(
                'p-2 md:p-4 min-h-[140px] md:min-h-[160px] transition-colors',
                day.isToday && 'bg-gradient-to-b from-primary/10 to-transparent'
              )}
            >
              <div className="text-center mb-3">
                <p className="text-xs md:text-sm text-muted-foreground font-semibold uppercase tracking-wide">{day.dayName}</p>
                <div className={cn(
                  'text-lg md:text-2xl font-extrabold mt-1 mx-auto',
                  day.isToday
                    ? 'bg-gradient-to-br from-primary to-jaxon text-white rounded-full w-9 h-9 md:w-11 md:h-11 flex items-center justify-center shadow-lg shadow-primary/30'
                    : 'text-foreground'
                )}>
                  {day.dayNumber}
                </div>
              </div>
              
              <div className="space-y-1.5">
                {events.slice(0, 3).map((event) => (
                  <EventPill key={event.id} event={event} />
                ))}
                {events.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center font-semibold">
                    +{events.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
