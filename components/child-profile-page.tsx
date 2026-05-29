import { cn } from '@/lib/utils';
import {
  children,
  getChildStats,
  getTodayChoresForChild,
  getBehaviorForChild,
  getGradesForChild,
  getEventsForChild,
  getTransactionsForChild,
  getRedemptionsForChild,
  rewards,
} from '@/lib/mock-data';
import { ChildAvatar } from '@/components/child-avatar';
import type { ChildId } from '@/lib/types';
import {
  Check,
  Clock,
  Star,
  TrendingUp,
  Wallet,
  Calendar,
  GraduationCap,
  Gift,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface ChildProfilePageProps {
  childId: ChildId;
}

export function ChildProfilePage({ childId }: ChildProfilePageProps) {
  const child = children.find((c) => c.id === childId);
  if (!child) return null;

  const stats = getChildStats(childId);
  const todayChores = getTodayChoresForChild(childId);
  const behaviorNotes = getBehaviorForChild(childId);
  const grades = getGradesForChild(childId);
  const events = getEventsForChild(childId);
  const transactions = getTransactionsForChild(childId);
  const redemptions = getRedemptionsForChild(childId);

  const pendingChores = todayChores.filter((c) => !c.completed);
  const completedChores = todayChores.filter((c) => c.completed);
  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= new Date())
    .slice(0, 5);
  const recentBehavior = behaviorNotes.slice(0, 5);
  const recentGrades = grades.slice(0, 5);

  const choreProgress = todayChores.length > 0 
    ? (completedChores.length / todayChores.length) * 100 
    : 100;

  const gradientClasses = {
    alex: 'from-alex via-alex-light to-alex',
    jaxon: 'from-jaxon via-jaxon-light to-jaxon',
    carson: 'from-carson via-carson-light to-carson',
  };

  const bgGradient = {
    alex: 'from-alex/20 via-alex/10 to-transparent',
    jaxon: 'from-jaxon/20 via-jaxon/10 to-transparent',
    carson: 'from-carson/20 via-carson/10 to-transparent',
  };

  const accentClass = {
    alex: 'bg-alex/10 border-alex/30',
    jaxon: 'bg-jaxon/10 border-jaxon/30',
    carson: 'bg-carson/10 border-carson/30',
  };

  const textGradient = {
    alex: 'gradient-text-alex',
    jaxon: 'gradient-text-jaxon',
    carson: 'gradient-text-carson',
  };

  const iconBg = {
    alex: 'bg-gradient-to-br from-alex to-alex-light text-alex-foreground shadow-lg shadow-alex/30',
    jaxon: 'bg-gradient-to-br from-jaxon to-jaxon-light text-jaxon-foreground shadow-lg shadow-jaxon/30',
    carson: 'bg-gradient-to-br from-carson to-carson-light text-carson-foreground shadow-lg shadow-carson/30',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Animated gradient border */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-r animate-gradient',
          gradientClasses[childId]
        )} />
        
        <div className="relative m-[2px] rounded-[22px] bg-card overflow-hidden">
          {/* Background gradient */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br',
            bgGradient[childId]
          )} />
          
          {/* Decorative elements */}
          <Sparkles className={cn(
            'absolute top-6 right-6 w-8 h-8 opacity-30',
            childId === 'alex' ? 'text-alex' : childId === 'jaxon' ? 'text-jaxon' : 'text-carson'
          )} />
          
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <ChildAvatar childId={childId} name={child.name} size="xl" animated />
              <div className="flex-1">
                <h1 className={cn('text-4xl md:text-5xl font-bold mb-1', textGradient[childId])}>
                  {child.name}
                </h1>
                <p className="text-lg text-muted-foreground">Age {child.age}</p>
                
                {/* Progress bar */}
                <div className="mt-4 max-w-sm">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{"Today's Progress"}</span>
                    <span className="font-medium text-foreground">{Math.round(choreProgress)}%</span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        'h-full rounded-full transition-all duration-500 progress-shine',
                        `bg-gradient-to-r ${gradientClasses[childId]}`
                      )}
                      style={{ width: `${choreProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {[
                { icon: Check, label: 'Chores Today', value: `${stats.choresCompletedToday}/${stats.choresDueToday}` },
                { icon: Star, label: 'Behavior', value: `${stats.behaviorPoints >= 0 ? '+' : ''}${stats.behaviorPoints}`, isPositive: stats.behaviorPoints >= 0 },
                { icon: TrendingUp, label: 'Grade Avg', value: `${stats.gradeAverage}%` },
                { icon: Wallet, label: 'Balance', value: `$${stats.allowanceBalance}` },
              ].map((stat, index) => (
                <div 
                  key={index}
                  className={cn(
                    'rounded-2xl p-4 text-center border backdrop-blur-sm hover-lift',
                    accentClass[childId]
                  )}
                >
                  <stat.icon className={cn(
                    'w-6 h-6 mx-auto mb-2',
                    childId === 'alex' ? 'text-alex' : childId === 'jaxon' ? 'text-jaxon' : 'text-carson'
                  )} />
                  <p className={cn(
                    'text-2xl font-bold',
                    stat.isPositive !== undefined 
                      ? (stat.isPositive ? 'text-success' : 'text-destructive')
                      : 'text-foreground'
                  )}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chores Section */}
        <div className="rounded-3xl glass-card overflow-hidden hover-lift">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg[childId])}>
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{"Today's Chores"}</h2>
                <p className="text-xs text-muted-foreground">{completedChores.length} of {todayChores.length} done</p>
              </div>
            </div>
            <Link href="/chores" className="flex items-center gap-1 text-sm text-primary hover:underline group">
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-5 space-y-2">
            {pendingChores.length === 0 && completedChores.length === 0 ? (
              <div className="text-center py-8">
                <Sparkles className={cn('w-10 h-10 mx-auto mb-3', childId === 'alex' ? 'text-alex' : childId === 'jaxon' ? 'text-jaxon' : 'text-carson')} />
                <p className="text-muted-foreground">No chores today - enjoy!</p>
              </div>
            ) : (
              <>
                {pendingChores.map((chore) => (
                  <div
                    key={chore.id}
                    className={cn('flex items-center gap-3 p-3 rounded-xl border transition-all hover:scale-[1.02]', accentClass[childId])}
                  >
                    <div className="w-7 h-7 rounded-full bg-muted/50 border-2 border-border" />
                    <span className="flex-1 font-medium text-foreground">{chore.title}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">{chore.points} pts</span>
                  </div>
                ))}
                {completedChores.map((chore) => (
                  <div
                    key={chore.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/20"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-success to-success/80 text-success-foreground flex items-center justify-center shadow-lg shadow-success/30">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="flex-1 text-muted-foreground line-through">{chore.title}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success font-medium">+{chore.points} pts</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Behavior Section */}
        <div className="rounded-3xl glass-card overflow-hidden hover-lift">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning to-warning/80 flex items-center justify-center shadow-lg shadow-warning/30">
                <Star className="w-5 h-5 text-warning-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Recent Behavior</h2>
                <p className="text-xs text-muted-foreground">{stats.behaviorPoints >= 0 ? '+' : ''}{stats.behaviorPoints} total points</p>
              </div>
            </div>
            <Link href="/behavior" className="flex items-center gap-1 text-sm text-primary hover:underline group">
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-5 space-y-2">
            {recentBehavior.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No behavior notes yet</p>
            ) : (
              recentBehavior.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl transition-all hover:scale-[1.02]',
                    note.type === 'positive' ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    note.type === 'positive' ? 'bg-success/20' : 'bg-destructive/20'
                  )}>
                    {note.type === 'positive' ? (
                      <ThumbsUp className="w-4 h-4 text-success" />
                    ) : (
                      <ThumbsDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{note.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{note.createdBy} - {note.createdAt}</p>
                  </div>
                  <span className={cn(
                    'text-sm font-bold px-2 py-0.5 rounded-full',
                    note.type === 'positive' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                  )}>
                    {note.points >= 0 ? '+' : ''}{note.points}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Grades Section */}
        <div className="rounded-3xl glass-card overflow-hidden hover-lift">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Recent Grades</h2>
                <p className="text-xs text-muted-foreground">{stats.gradeAverage}% average</p>
              </div>
            </div>
            <Link href="/grades" className="flex items-center gap-1 text-sm text-primary hover:underline group">
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-5 space-y-2">
            {recentGrades.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No grades recorded</p>
            ) : (
              recentGrades.map((grade) => (
                <div key={grade.id} className={cn('flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02]', accentClass[childId])}>
                  <div>
                    <p className="font-medium text-foreground">{grade.subject}</p>
                    {grade.assignment && <p className="text-xs text-muted-foreground">{grade.assignment}</p>}
                  </div>
                  <div className="text-right">
                    <p className={cn('text-2xl font-bold', textGradient[childId])}>{grade.letterGrade}</p>
                    <p className="text-xs text-muted-foreground">{grade.grade}%</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-3xl glass-card overflow-hidden hover-lift">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg[childId])}>
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Upcoming Events</h2>
                <p className="text-xs text-muted-foreground">{upcomingEvents.length} upcoming</p>
              </div>
            </div>
            <Link href="/calendar" className="flex items-center gap-1 text-sm text-primary hover:underline group">
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-5 space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No upcoming events</p>
            ) : (
              upcomingEvents.map((event) => (
                <div key={event.id} className={cn('flex items-center gap-4 p-3 rounded-xl border transition-all hover:scale-[1.02]', accentClass[childId])}>
                  <div className={cn(
                    'text-center min-w-[50px] rounded-xl p-2',
                    childId === 'alex' ? 'bg-alex/20' : childId === 'jaxon' ? 'bg-jaxon/20' : 'bg-carson/20'
                  )}>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className={cn('text-xl font-bold', textGradient[childId])}>
                      {new Date(event.date).getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{event.title}</p>
                    {event.time && <p className="text-xs text-muted-foreground">{event.time}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Allowance Section */}
        <div className="rounded-3xl glass-card overflow-hidden hover-lift">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg[childId])}>
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Allowance</h2>
                <p className="text-xs text-muted-foreground">Recent transactions</p>
              </div>
            </div>
            <Link href="/allowance" className="flex items-center gap-1 text-sm text-primary hover:underline group">
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-5">
            <div className="text-center mb-5 pb-5 border-b border-border/30">
              <div className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-2', accentClass[childId])}>
                <DollarSign className={cn('w-4 h-4', childId === 'alex' ? 'text-alex' : childId === 'jaxon' ? 'text-jaxon' : 'text-carson')} />
                <span className="text-xs font-medium text-muted-foreground">Current Balance</span>
              </div>
              <p className="text-4xl font-bold flex items-center justify-center">
                <DollarSign className={cn('w-8 h-8', childId === 'alex' ? 'text-alex' : childId === 'jaxon' ? 'text-jaxon' : 'text-carson')} />
                <span className={textGradient[childId]}>{stats.allowanceBalance}</span>
              </p>
            </div>
            <div className="space-y-2">
              {transactions.slice(0, 4).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <span className="text-muted-foreground truncate">{tx.description}</span>
                  <span className={cn('font-medium', tx.amount >= 0 ? 'text-success' : 'text-destructive')}>
                    {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rewards Section */}
        <div className="rounded-3xl glass-card overflow-hidden hover-lift">
          <div className="p-5 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-carson to-carson-light flex items-center justify-center shadow-lg shadow-carson/30">
                <Gift className="w-5 h-5 text-carson-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Rewards Redeemed</h2>
                <p className="text-xs text-muted-foreground">{stats.rewardsRedeemed} total</p>
              </div>
            </div>
            <Link href="/rewards" className="flex items-center gap-1 text-sm text-primary hover:underline group">
              View All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-5">
            {redemptions.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No rewards redeemed yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {redemptions.map((redemption) => {
                  const reward = rewards.find((r) => r.id === redemption.rewardId);
                  if (!reward) return null;
                  return (
                    <div
                      key={redemption.id}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-xl border transition-all hover:scale-[1.02]',
                        redemption.fulfilled ? 'bg-success/10 border-success/20' : 'bg-warning/10 border-warning/20'
                      )}
                    >
                      <div>
                        <p className="font-medium text-foreground">{reward.title}</p>
                        <p className="text-xs text-muted-foreground">{redemption.redeemedAt}</p>
                      </div>
                      <span className={cn(
                        'text-xs px-3 py-1 rounded-full font-medium',
                        redemption.fulfilled ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning-foreground'
                      )}>
                        {redemption.fulfilled ? 'Fulfilled' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
