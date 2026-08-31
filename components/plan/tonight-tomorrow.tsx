import { cn } from '@/lib/utils';
import { PlanItemRow } from './plan-item-row';
import { Moon, Sunrise, CheckCircle2, ArrowRight } from 'lucide-react';
import type { PlanItem } from '@/lib/family-data';

function Panel({
  title,
  subtitle,
  icon: Icon,
  iconClass,
  items,
  emptyTitle,
  emptyHint,
  limit = 6,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconClass: string;
  items: PlanItem[];
  emptyTitle: string;
  emptyHint: string;
  limit?: number;
}) {
  const shown = items.slice(0, limit);
  const extra = items.length - shown.length;

  return (
    <section className="rounded-3xl bg-card border border-border/60 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br', iconClass)}>
          <Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground leading-none">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {items.length > 0 && (
          <span className="ml-auto rounded-full bg-muted px-3 py-1 text-sm font-bold text-foreground">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-muted/30 py-8 text-center">
          <CheckCircle2 className="h-8 w-8 text-success mb-2" aria-hidden="true" />
          <p className="font-bold text-foreground">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground text-pretty max-w-xs mt-1">{emptyHint}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {shown.map((item) => (
            <li key={item.id}>
              <PlanItemRow item={item} />
            </li>
          ))}
          {extra > 0 && (
            <li className="flex items-center justify-center gap-1.5 pt-1 text-sm font-semibold text-muted-foreground">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              {extra} more
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

export function TonightTomorrow({
  tonightItems,
  tomorrowItems,
}: {
  tonightItems: PlanItem[];
  tomorrowItems: PlanItem[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Panel
        title="Tonight"
        subtitle="Due today or overdue — across everyone"
        icon={Moon}
        iconClass="from-primary to-jaxon"
        items={tonightItems}
        emptyTitle="Nothing due tonight"
        emptyHint="No homework, chores, or events are due today. Enjoy the evening!"
      />
      <Panel
        title="Tomorrow"
        subtitle="Get a head start tonight"
        icon={Sunrise}
        iconClass="from-alex to-carson"
        items={tomorrowItems}
        emptyTitle="Tomorrow looks clear"
        emptyHint="Nothing is due tomorrow yet. Check-ins will fill this in as the kids add work."
      />
    </div>
  );
}
