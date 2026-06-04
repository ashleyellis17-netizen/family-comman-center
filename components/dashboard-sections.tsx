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
  getUnlockPathForChild,
  getAllowanceStatusForChild,
  momWorkStatus,
  momWorkRules,
  getAskMomLater,
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
  Trophy,
  Gamepad2,
  Tablet,
  TreePine,
  Sparkles,
  CheckCircle2,
  Volume2,
  PhoneOff,
  Coffee,
  CircleCheck,
  HelpCircle,
} from 'lucide-react';

function formatShort(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function TodayFamilyOverview() {
  const totalChores = children.reduce((s, c) => s + getChildStats(c.id).choresDueToday, 0);
  const doneChores = children.reduce((s, c) => s + getChildStats(c.id).choresCompletedToday, 0);
  const pending = getPendingApprovals().length;
  const groundedKids = children.filter((c) => isChildGrounded(c.id));
  const groundedValue =
    groundedKids.length === 0
      ? 'None'
      : groundedKids.length === 1
      ? groundedKids[0].name
      : `${groundedKids.length} kids`;

  const tiles = [
    { label: "Chores Done", value: `${doneChores}/${totalChores}`, icon: Sun, color: 'from-carson to-carson-light text-carson-foreground' },
    { label: 'Need Approval', value: pending, icon: ClipboardCheck, color: 'from-primary to-primary/80 text-primary-foreground' },
    { label: 'Grocery Items', value: groceryItems.filter((g) => !g.purchased).length, icon: ShoppingCart, color: 'from-alex to-alex-light text-white' },
    { label: groundedKids.length > 0 ? 'Grounded' : 'All Eligible', value: groundedValue, icon: Lock, color: 'from-jaxon to-jaxon-light text-white' },
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
    <SectionCard title="Grounding & Eligibility" subtitle="Who's grounded and what's locked" icon={AlertTriangle} iconClassName="from-jaxon to-jaxon-light text-white" href="/grounding">
      {grounded.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No active grounding. All kids are eligible.</p>
      ) : (
        <ul className="space-y-3">
          {grounded.map((c) => {
            const g = getActiveGroundingForChild(c.id)!;
            const accent = c.id === 'alex' ? 'bg-alex-muted text-alex' : c.id === 'jaxon' ? 'bg-jaxon-muted text-jaxon' : 'bg-carson-muted text-carson';
            const allowanceStatus = getAllowanceStatusForChild(c.id);
            const restrictions: string[] = [];
            if (!g.electronicsAllowed) restrictions.push('Electronics Locked');
            if (!g.rewardsAllowed) restrictions.push('Game Time Locked');
            if (!g.allowanceEligible) restrictions.push('Allowance Locked');
            if (g.earnBackAvailable) restrictions.push('Earn Back Available');
            return (
              <li key={c.id} className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-base font-extrabold shrink-0', accent)}>
                      {c.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{c.name} is grounded</p>
                      <p className="text-xs text-muted-foreground truncate">{g.reason}</p>
                    </div>
                  </div>
                  <StatusBadge status={g.status} />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Allowance:</span>
                  <StatusBadge status={allowanceStatus} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {restrictions.map((r) => (
                    <StatusBadge key={r} status={r} />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}

const rewardIcons: Record<string, React.ElementType> = {
  'Game Time': Gamepad2,
  'Tablet/Electronics Time': Tablet,
  'Go Outside': TreePine,
  'Inflatable Time': Sparkles,
  'TV/Movie Time': Tablet,
  'Special Snack': Sparkles,
  'Stay Up 15 Minutes Later': Sparkles,
};

export function TodaysUnlockPath() {
  return (
    <SectionCard
      title="Today's Unlock Path"
      subtitle="Each child's reward progress"
      icon={Trophy}
      iconClassName="from-carson to-carson-light text-carson-foreground"
      href="/reward-unlock"
    >
      <ul className="space-y-3">
        {children.map((c) => {
          const path = getUnlockPathForChild(c.id);
          const bar = c.id === 'alex' ? 'bg-alex' : c.id === 'jaxon' ? 'bg-jaxon' : 'bg-carson';
          const accent = c.id === 'alex' ? 'bg-alex-muted text-alex' : c.id === 'jaxon' ? 'bg-jaxon-muted text-jaxon' : 'bg-carson-muted text-carson';
          if (!path) {
            return (
              <li key={c.id} className="p-3 rounded-2xl bg-muted/40 text-sm text-muted-foreground">
                {c.name}: no rewards set up
              </li>
            );
          }
          const RewardIcon = rewardIcons[path.title] ?? Trophy;
          return (
            <li key={c.id} className="p-3 rounded-2xl bg-muted/40">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold shrink-0', accent)}>
                    {c.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground leading-tight">{c.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <RewardIcon className="w-3 h-3 shrink-0" />
                      Working toward {path.title}
                    </p>
                  </div>
                </div>
                <StatusBadge status={path.state} />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', bar)} style={{ width: `${path.percent}%` }} />
                </div>
                <span className="text-xs font-bold text-foreground shrink-0">
                  {path.completedTasks}/{path.requiredTasks} tasks
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}

const workModeIcons: Record<string, React.ElementType> = {
  Available: CheckCircle2,
  'Quiet Time': Volume2,
  'Do Not Interrupt': PhoneOff,
  'Lunch Break': Coffee,
  'Done Working': CircleCheck,
};

export function MomIsWorking() {
  const status = momWorkStatus;
  const ModeIcon = workModeIcons[status.mode] ?? Briefcase;
  const askLater = getAskMomLater();
  const mom = parents.find((p) => p.id === 'mom');

  return (
    <SectionCard title="Mom Is Working" subtitle="Current work mode & house rules" icon={Briefcase}>
      <div className="space-y-4">
        {/* Current mode */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
          <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
            <ModeIcon className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={status.mode} />
              {status.until && <span className="text-xs text-muted-foreground">until {status.until}</span>}
            </div>
            {status.note && <p className="text-xs text-muted-foreground mt-1">{status.note}</p>}
          </div>
        </div>

        {/* Quick rules */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Quick Rules</p>
          <ul className="space-y-1.5">
            {momWorkRules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ask Mom Later */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ask {mom?.name ?? 'Mom'} Later</p>
            <span className="text-xs text-muted-foreground">{askLater.length} waiting</span>
          </div>
          {askLater.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing in the queue.</p>
          ) : (
            <ul className="space-y-2">
              {askLater.map((q) => {
                const child = children.find((c) => c.id === q.childId);
                return (
                  <li key={q.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-muted/40">
                    <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{q.question}</p>
                      <p className="text-xs text-muted-foreground">{child?.name}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
