import { cn } from '@/lib/utils';
import { children, getChildStats, getTodayChoresForChild } from '@/lib/mock-data';
import { ChildAvatar } from './child-avatar';
import { Check, Clock, Star, DollarSign, TrendingUp, ChevronRight, Flower2 } from 'lucide-react';
import Link from 'next/link';
import type { ChildId } from '@/lib/types';

interface ChildQuickCardProps {
  childId: ChildId;
}

export function ChildQuickCard({ childId }: ChildQuickCardProps) {
  const child = children.find((c) => c.id === childId);
  if (!child) return null;

  const stats = getChildStats(childId);
  const todayChores = getTodayChoresForChild(childId);
  const pendingChores = todayChores.filter((c) => !c.completed);
  const choreProgress = todayChores.length > 0 
    ? (todayChores.filter(c => c.completed).length / todayChores.length) * 100 
    : 100;

  const borderGradient = {
    alex: 'from-alex via-alex-light to-alex',
    jaxon: 'from-jaxon via-jaxon-light to-jaxon',
    carson: 'from-carson via-carson-light to-carson',
  };

  const bgGradient = {
    alex: 'from-alex-muted/80 via-transparent to-alex-muted/30',
    jaxon: 'from-jaxon-muted/80 via-transparent to-jaxon-muted/30',
    carson: 'from-carson-muted/80 via-transparent to-carson-muted/30',
  };

  const accentColor = {
    alex: 'bg-alex-muted border-alex/20',
    jaxon: 'bg-jaxon-muted border-jaxon/20',
    carson: 'bg-carson-muted border-carson/20',
  };

  const progressColor = {
    alex: 'bg-gradient-to-r from-alex to-alex-light',
    jaxon: 'bg-gradient-to-r from-jaxon to-jaxon-light',
    carson: 'bg-gradient-to-r from-carson to-carson-light',
  };

  const iconColor = {
    alex: 'text-alex',
    jaxon: 'text-jaxon',
    carson: 'text-carson',
  };

  return (
    <Link href={`/${childId}`} className="block group">
      <div className="relative rounded-3xl p-[2px] overflow-hidden hover-lift">
        {/* Animated border gradient */}
        <div className={cn(
          'absolute inset-0 rounded-3xl bg-gradient-to-r opacity-50 group-hover:opacity-100 transition-opacity animate-gradient',
          borderGradient[childId]
        )} />
        
        {/* Card content */}
        <div className="relative rounded-3xl p-5 md:p-6 bg-card overflow-hidden shadow-sm">
          {/* Background gradient */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br',
            bgGradient[childId]
          )} />
          
          {/* Decorative element */}
          <Flower2 className={cn(
            'absolute top-4 right-4 w-6 h-6 opacity-20 group-hover:opacity-40 transition-opacity group-hover:rotate-12 duration-500',
            iconColor[childId]
          )} />
          
          {/* Header */}
          <div className="relative flex items-center gap-4 mb-5">
            <ChildAvatar childId={childId} name={child.name} size="lg" />
            <div className="flex-1">
              <h3 className={cn(
                'text-2xl md:text-3xl font-extrabold',
                childId === 'alex' ? 'gradient-text-alex' : childId === 'jaxon' ? 'gradient-text-jaxon' : 'gradient-text-carson'
              )}>{child.name}</h3>
              <p className="text-sm text-muted-foreground font-medium">Age {child.age}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Chore progress bar */}
          <div className="relative mb-5">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-medium">{"Today's Progress"}</span>
              <span className="font-bold text-foreground">{Math.round(choreProgress)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
              <div 
                className={cn('h-full rounded-full transition-all duration-500 progress-shine', progressColor[childId])}
                style={{ width: `${choreProgress}%` }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="relative grid grid-cols-2 gap-3">
            <div className={cn('rounded-2xl p-3 border shadow-sm', accentColor[childId])}>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Check className={cn('w-4 h-4', iconColor[childId])} />
                <span className="text-xs font-semibold">Chores</span>
              </div>
              <p className="text-xl font-extrabold text-foreground">
                {stats.choresCompletedToday}<span className="text-muted-foreground text-sm font-medium">/{stats.choresDueToday}</span>
              </p>
            </div>

            <div className={cn('rounded-2xl p-3 border shadow-sm', accentColor[childId])}>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Star className={cn('w-4 h-4', iconColor[childId])} />
                <span className="text-xs font-semibold">Behavior</span>
              </div>
              <p className={cn(
                'text-xl font-extrabold',
                stats.behaviorPoints >= 0 ? 'text-success' : 'text-destructive'
              )}>
                {stats.behaviorPoints >= 0 ? '+' : ''}{stats.behaviorPoints}
              </p>
            </div>

            <div className={cn('rounded-2xl p-3 border shadow-sm', accentColor[childId])}>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className={cn('w-4 h-4', iconColor[childId])} />
                <span className="text-xs font-semibold">Grades</span>
              </div>
              <p className="text-xl font-extrabold text-foreground">{stats.gradeAverage}<span className="text-muted-foreground text-sm font-medium">%</span></p>
            </div>

            <div className={cn('rounded-2xl p-3 border shadow-sm', accentColor[childId])}>
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className={cn('w-4 h-4', iconColor[childId])} />
                <span className="text-xs font-semibold">Balance</span>
              </div>
              <p className="text-xl font-extrabold text-foreground">${stats.allowanceBalance}</p>
            </div>
          </div>

          {/* Pending chores */}
          {pendingChores.length > 0 && (
            <div className="relative mt-5 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" />
                {pendingChores.length} chore{pendingChores.length > 1 ? 's' : ''} pending
              </p>
              <div className="flex flex-wrap gap-2">
                {pendingChores.slice(0, 3).map((chore) => (
                  <span
                    key={chore.id}
                    className={cn('text-xs px-3 py-1.5 rounded-full font-semibold border shadow-sm', accentColor[childId])}
                  >
                    {chore.title}
                  </span>
                ))}
                {pendingChores.length > 3 && (
                  <span className="text-xs text-muted-foreground px-2 py-1.5 font-medium">
                    +{pendingChores.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
