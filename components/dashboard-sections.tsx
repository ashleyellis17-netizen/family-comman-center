import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SectionCard } from './section-card';
import { StatusBadge } from './status-badge';
import {
  children,
  parents,
  parentEvents,
  familyEvents,
  groceryItems,
  getPendingApprovals,
  getMealForToday,
  getSummerProgressForChild,
  isChildGrounded,
  getActiveGroundingForChild,
  getChildStats,
} from '@/lib/mock-data';
import {
  Sun,
  CalendarDays,
  ClipboardCheck,
  ShoppingCart,
  Utensils,
  AlertTriangle,
  Lock,
  Briefcase,
  Users,
} from 'lucide-react';

function formatShort(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TodayFamilyOverview() {
  const totalChores = children.reduce((s, c) => s + getChildStats(c.id).choresDueToday, 0);
  const doneChores = children.reduce((s, c) => s + getChildStats(c.id).choresCompletedToday, 0);
  const pending = getPendingApprovals().length;
  const grounded = children.filter((c) => isChildGrounded(c.id)).length;

  const tiles = [
    { label: "Chores Done", value: `${doneChores}/${totalChores}`, icon: Sun, color: 'from-carson to-carson-light text-carson-foreground' },
    { label: 'Need Approval', value: pending, icon: ClipboardCheck, color: 'from-primary to-primary/80 text-primary-foreground' },
    { label: 'Grocery Items', value: groceryItems.filter((g) => !g.purchased).length, icon: ShoppingCart, color: 'from-alex to-alex-light text-white' },
    { label: 'Grounded', value: grounded, icon: Lock, color: 'from-jaxon to-jaxon-light text-white' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-3xl bg-card border border-border/50 shadow-sm p-5 flex items-center gap-4 hover-lift">
          <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md shrink-0', t.color)}>
            <t.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-foreground leading-none">{t.value}</p>
            <p className="text-xs text-muted-foreground font-semibold mt-1">{t.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CalendarHighlights() {
  const mom = parents.find((p) => p.id === 'mom')!;
  const dad = parents.find((p) => p.id === 'dad')!;
  const momEvents = parentEvents.filter((e) => e.parentId === 'mom').slice(0, 2);
  const dadEvents = parentEvents.filter((e) => e.parentId === 'dad').slice(0, 2);
  const fam = familyEvents.slice(0, 3);

  const Row = ({ title, icon: Icon, items, iconClass }: { title: string; icon: React.ElementType; items: typeof momEvents; iconClass: string }) => (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', iconClass)} />
        <p className="text-sm font-bold text-foreground">{title}</p>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground pl-6">Nothing scheduled</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((e) => (
            <li key={e.id} className="flex items-center justify-between text-sm pl-6">
              <span className="text-foreground truncate">{e.title}</span>
              <span className="text-muted-foreground shrink-0 ml-2">{e.time ?? formatShort(e.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <SectionCard title="Calendar Highlights" subtitle="Mom, Dad & shared family" icon={CalendarDays} href="/calendar">
      <div className="space-y-4">
        <Row title={`${mom.name}'s Day`} icon={Briefcase} items={momEvents} iconClass="text-primary" />
        <Row title={`${dad.name}'s Day`} icon={Briefcase} items={dadEvents} iconClass="text-alex" />
        <Row title="Shared Family" icon={Users} items={fam} iconClass="text-carson" />
      </div>
    </SectionCard>
  );
}

export function SummerUnlockProgress() {
  return (
    <SectionCard title="Summer Task Unlock" subtitle="Progress to unlock rewards" icon={Sun} iconClassName="from-carson to-carson-light text-carson-foreground" href="/summer-tasks">
      <div className="space-y-4">
        {children.map((c) => {
          const p = getSummerProgressForChild(c.id);
          const bar = c.id === 'alex' ? 'bg-alex' : c.id === 'jaxon' ? 'bg-jaxon' : 'bg-carson';
          return (
            <div key={c.id}>
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <span className="font-bold text-foreground">{c.name}</span>
                <span className="text-muted-foreground">{p.approved}/{p.total} approved</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className={cn('h-full rounded-full transition-all', bar)} style={{ width: `${p.percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

export function ApprovalQueuePreview() {
  const pending = getPendingApprovals().slice(0, 4);
  return (
    <SectionCard title="Parent Approval Queue" subtitle={`${getPendingApprovals().length} waiting`} icon={ClipboardCheck} href="/approvals">
      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">All caught up!</p>
      ) : (
        <ul className="space-y-2">
          {pending.map((a) => {
            const child = children.find((c) => c.id === a.childId);
            return (
              <li key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-muted/40">
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
  );
}

export function GroceryQuickView() {
  const items = groceryItems.filter((g) => !g.purchased).slice(0, 5);
  return (
    <SectionCard title="Grocery List" subtitle={`${groceryItems.filter((g) => !g.purchased).length} to buy`} icon={ShoppingCart} iconClassName="from-alex to-alex-light text-white" href="/grocery-list">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nothing on the list</p>
      ) : (
        <ul className="space-y-2">
          {items.map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-foreground truncate">{g.item} <span className="text-muted-foreground">· {g.quantity}</span></span>
              <StatusBadge status={g.priority} />
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

export function TonightsDinner() {
  const meal = getMealForToday();
  return (
    <SectionCard title="Tonight's Dinner" subtitle="From the weekly plan" icon={Utensils} iconClassName="from-jaxon to-jaxon-light text-white" href="/meal-plan">
      {meal?.dinner ? (
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-jaxon-muted flex items-center justify-center shrink-0">
            <Utensils className="w-7 h-7 text-jaxon" />
          </div>
          <div>
            <p className="text-xl font-extrabold text-foreground">{meal.dinner}</p>
            <p className="text-sm text-muted-foreground">{meal.day}{meal.helper ? ` · Helper: ${meal.helper}` : ''}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No dinner planned for today</p>
      )}
    </SectionCard>
  );
}

export function AllowanceGroundingAlerts() {
  const grounded = children.filter((c) => isChildGrounded(c.id));
  return (
    <SectionCard title="Allowance & Grounding Alerts" icon={AlertTriangle} iconClassName="from-jaxon to-jaxon-light text-white" href="/grounding">
      {grounded.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No active grounding. All allowances eligible.</p>
      ) : (
        <ul className="space-y-2">
          {grounded.map((c) => {
            const g = getActiveGroundingForChild(c.id)!;
            return (
              <li key={c.id} className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-foreground">{c.name}</span>
                  <StatusBadge status={g.status} />
                </div>
                <p className="text-xs text-muted-foreground">{g.reason}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {!g.allowanceEligible && <span className="text-xs font-semibold text-destructive">Allowance Locked</span>}
                  {!g.electronicsAllowed && <span className="text-xs font-semibold text-destructive">Electronics Blocked</span>}
                  {!g.rewardsAllowed && <span className="text-xs font-semibold text-destructive">Rewards Blocked</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
