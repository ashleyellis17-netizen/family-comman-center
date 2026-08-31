import Link from 'next/link';
import { cn } from '@/lib/utils';
import { UrgencyBadge } from '@/components/check-in/shared';
import {
  BookOpen,
  FileText,
  FolderKanban,
  CalendarDays,
  ListChecks,
  HandHelping,
  GraduationCap,
} from 'lucide-react';
import type { PlanItem, PlanSource } from '@/lib/family-data';

const SOURCE_ICON: Record<PlanSource, React.ElementType> = {
  assignment: BookOpen,
  event: CalendarDays,
  project: FolderKanban,
  chore: ListChecks,
  request: HandHelping,
};

const KIND_ICON: Record<string, React.ElementType> = {
  Homework: BookOpen,
  Test: FileText,
  Quiz: FileText,
  Reading: BookOpen,
  Worksheet: FileText,
  School: GraduationCap,
  Project: FolderKanban,
  Event: CalendarDays,
  Chore: ListChecks,
  Request: HandHelping,
};

const CHILD_DOT: Record<string, string> = {
  alex: 'bg-alex',
  jaxon: 'bg-jaxon',
  carson: 'bg-carson',
  family: 'bg-primary',
};

export function PlanItemRow({
  item,
  showChild = true,
  showUrgency = true,
  className,
}: {
  item: PlanItem;
  showChild?: boolean;
  showUrgency?: boolean;
  className?: string;
}) {
  const Icon = KIND_ICON[item.kind] ?? SOURCE_ICON[item.source];
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-2xl bg-muted/40 px-4 py-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-muted-foreground shadow-sm'
        )}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          {showChild && (
            <span
              className={cn('h-2.5 w-2.5 shrink-0 rounded-full', CHILD_DOT[item.childId] ?? 'bg-muted')}
              aria-hidden="true"
            />
          )}
          <span className="truncate font-bold text-foreground">{item.title}</span>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {showChild && <span className="font-semibold">{item.childName}</span>}
          {showChild && item.subtitle ? <span aria-hidden="true">·</span> : null}
          {item.subtitle ? <span className="truncate">{item.subtitle}</span> : null}
          {item.dueTime ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{item.dueTime}</span>
            </>
          ) : null}
        </span>
      </span>

      {showUrgency && item.source !== 'request' && item.dueDate ? (
        <UrgencyBadge dueDate={item.dueDate} className="shrink-0" />
      ) : null}
    </Link>
  );
}
