import { ChildQuickCard } from '@/components/child-quick-card';
import { WeekCalendar } from '@/components/week-calendar';
import { TodayChores } from '@/components/today-chores';
import { AfterSchoolStatus } from '@/components/after-school-surface';
import { TonightTomorrow } from '@/components/plan/tonight-tomorrow';
import { NeedsAttentionPanel } from '@/components/plan/needs-attention-panel';
import { ParentRequestsInbox } from '@/components/parent-requests-inbox';
import { getParentRequests } from '@/app/actions/parent-requests';
import { getSkillCheckins } from '@/app/actions/school';
import {
  getFamilyPlan,
  tonight,
  tomorrow,
  needsAttention,
  allChildStatuses,
} from '@/lib/family-data';
import { todayISO } from '@/lib/checkin';
import {
  TodayFamilyOverview,
  CalendarHighlights,
  SchoolProgress,
  ApprovalQueuePreview,
  GroceryQuickView,
  TonightsDinner,
  AllowanceGroundingAlerts,
} from '@/components/dashboard-sections';
import { Calendar, Sun, Moon, Heart, ChevronDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const [plan, parentRequests, checkins] = await Promise.all([
    getFamilyPlan(),
    getParentRequests(),
    getSkillCheckins(),
  ]);

  const today = todayISO();
  const tonightItems = tonight(plan);
  const tomorrowItems = tomorrow(plan);
  const attention = needsAttention(plan);
  const statuses = allChildStatuses(plan);
  const checkedInIds = Array.from(
    new Set(checkins.filter((k) => k.date === today).map((k) => k.childId))
  );

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {hour < 19 ? (
              <Sun className="w-8 h-8 text-carson animate-wiggle" />
            ) : (
              <Moon className="w-8 h-8 text-alex animate-float" />
            )}
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{greeting}</span>
          </div>
          <h1 className="cozyla-heading text-foreground">Theveny Family</h1>
          <p className="text-muted-foreground cozyla-text font-medium">Here&apos;s what needs to happen today</p>
        </div>
        <div className="flex items-center gap-4 bg-card rounded-2xl px-5 py-4 hover-lift shadow-lg shadow-primary/10 border border-border/50">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-jaxon flex items-center justify-center shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today</p>
            <p className="text-lg font-extrabold text-foreground">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* THE PLAN: tonight + tomorrow, from one source of truth */}
      <section>
        <TonightTomorrow tonightItems={tonightItems} tomorrowItems={tomorrowItems} />
      </section>

      {/* After-school status + needs attention */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AfterSchoolStatus statuses={statuses} checkedInIds={checkedInIds} />
        </div>
        <div className="lg:col-span-1">
          <NeedsAttentionPanel groups={attention} />
        </div>
      </section>

      {/* Kids cards */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <Heart className="w-5 h-5 text-jaxon fill-jaxon/30" />
          <h2 className="text-xl font-extrabold text-foreground">The Boys</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <ChildQuickCard childId="alex" />
          <ChildQuickCard childId="jaxon" />
          <ChildQuickCard childId="carson" />
        </div>
      </section>

      {/* Ask a Parent inbox */}
      <section>
        <ParentRequestsInbox requests={parentRequests} />
      </section>

      {/* Everything else — collapsed by default to keep the dashboard decision-first */}
      <details className="group rounded-3xl border border-border/60 bg-card/60">
        <summary className="flex cursor-pointer items-center justify-between gap-3 rounded-3xl px-6 py-4 font-extrabold text-foreground marker:content-none">
          <span className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            More family info
            <span className="text-sm font-medium text-muted-foreground">
              Calendar, chores, meals, allowance &amp; approvals
            </span>
          </span>
          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>

        <div className="space-y-8 px-6 pb-6 pt-2">
          <section>
            <TodayFamilyOverview />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <CalendarHighlights />
            </div>
            <div className="lg:col-span-2">
              <WeekCalendar />
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodayChores />
            <SchoolProgress />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ApprovalQueuePreview />
            <GroceryQuickView />
            <TonightsDinner />
          </section>

          <section>
            <AllowanceGroundingAlerts />
          </section>
        </div>
      </details>
    </div>
  );
}
