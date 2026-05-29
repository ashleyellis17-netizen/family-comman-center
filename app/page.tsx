import { ChildQuickCard } from '@/components/child-quick-card';
import { WeekCalendar } from '@/components/week-calendar';
import { TodayChores } from '@/components/today-chores';
import { BehaviorOverview } from '@/components/behavior-overview';
import { AllowanceOverview } from '@/components/allowance-overview';
import { RewardsOverview } from '@/components/rewards-overview';
import { Calendar, Sun, Moon, Heart } from 'lucide-react';

export default function Dashboard() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const hour = today.getHours();
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
          <h1 className="cozyla-heading text-foreground">
            Theveny Boys
          </h1>
          <p className="text-muted-foreground cozyla-text font-medium">Welcome to the family dashboard</p>
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

      {/* Quick View Cards */}
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

      {/* Week Calendar */}
      <section>
        <WeekCalendar />
      </section>

      {/* Main Content Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Chores */}
        <TodayChores />

        {/* Right Column */}
        <div className="space-y-6">
          {/* Behavior Points */}
          <BehaviorOverview />

          {/* Allowance and Rewards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AllowanceOverview />
            <RewardsOverview />
          </div>
        </div>
      </section>
    </div>
  );
}
