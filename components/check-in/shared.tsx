import { cn } from '@/lib/utils';
import { AlertTriangle, CalendarClock, CalendarDays, CalendarCheck, Circle } from 'lucide-react';
import { getUrgency, URGENCY_META, type Urgency } from '@/lib/checkin';

export const accentByChild: Record<
  string,
  { bar: string; ring: string; text: string; soft: string; solid: string; grad: string }
> = {
  alex: {
    bar: 'bg-alex',
    ring: 'border-alex/30',
    text: 'text-alex',
    soft: 'bg-alex/10',
    solid: 'bg-alex text-alex-foreground',
    grad: 'from-alex to-alex-light',
  },
  jaxon: {
    bar: 'bg-jaxon',
    ring: 'border-jaxon/30',
    text: 'text-jaxon',
    soft: 'bg-jaxon/10',
    solid: 'bg-jaxon text-jaxon-foreground',
    grad: 'from-jaxon to-jaxon-light',
  },
  carson: {
    bar: 'bg-carson',
    ring: 'border-carson/30',
    text: 'text-carson',
    soft: 'bg-carson/10',
    solid: 'bg-carson text-carson-foreground',
    grad: 'from-carson to-carson-light',
  },
};

export function getAccent(childId: string) {
  return accentByChild[childId] ?? accentByChild.alex;
}

export function formatDue(date?: string | null) {
  if (!date) return 'No due date';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const urgencyIcon: Record<Urgency, React.ElementType> = {
  overdue: AlertTriangle,
  today: CalendarClock,
  tomorrow: CalendarDays,
  soon: CalendarDays,
  later: CalendarCheck,
  none: Circle,
};

// Urgency is always conveyed with BOTH text and an icon, never color alone,
// so it stays legible for color-blind users and on the wall display.
const urgencyStyle: Record<Urgency, string> = {
  overdue: 'bg-destructive/15 text-destructive border-destructive/30',
  today: 'bg-warning/20 text-warning-foreground border-warning/40',
  tomorrow: 'bg-primary/12 text-primary border-primary/30',
  soon: 'bg-secondary text-secondary-foreground border-border',
  later: 'bg-muted text-muted-foreground border-border',
  none: 'bg-muted text-muted-foreground border-border',
};

export function UrgencyBadge({
  dueDate,
  className,
}: {
  dueDate?: string | null;
  className?: string;
}) {
  const u = getUrgency(dueDate);
  const Icon = urgencyIcon[u];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold',
        urgencyStyle[u],
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {URGENCY_META[u].label}
    </span>
  );
}
