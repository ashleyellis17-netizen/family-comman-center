'use client';

import { useData } from '@/lib/data-context';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WeeklyProgress() {
  const { getWeeklyProgress, children, getChildStats } = useData();
  const progress = getWeeklyProgress();

  return (
    <div className="rounded-3xl bg-card overflow-hidden hover-lift shadow-lg shadow-primary/5 border border-border/50">
      <div className="p-5 border-b border-border/50 flex items-center gap-3 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-carson flex items-center justify-center shadow-lg shadow-primary/25">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg md:text-xl font-extrabold text-foreground">Weekly Family Progress</h2>
          <p className="text-xs text-muted-foreground font-medium">Keep up the great work!</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold text-primary">{progress.percentage}%</p>
          <p className="text-xs text-muted-foreground font-medium">complete</p>
        </div>
      </div>

      <div className="p-5">
        {/* Big progress bar */}
        <div className="mb-6">
          <div className="h-5 bg-muted rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-primary via-jaxon to-carson rounded-full transition-all duration-700 progress-shine relative"
              style={{ width: `${progress.percentage}%` }}
            >
              {progress.percentage >= 20 && (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {progress.completedChores} / {progress.totalChores} chores
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Child progress breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {children.map((child) => {
            const stats = getChildStats(child.id);
            const childProgress = stats.choresDueToday > 0 
              ? Math.round((stats.choresCompletedToday / stats.choresDueToday) * 100) 
              : 100;
            
            const childColor = child.id === 'alex' ? 'alex' : child.id === 'jaxon' ? 'jaxon' : 'carson';
            const bgClass = child.id === 'alex' 
              ? 'from-alex/20 to-alex/5' 
              : child.id === 'jaxon' 
              ? 'from-jaxon/20 to-jaxon/5'
              : 'from-carson/20 to-carson/5';
            const progressBg = child.id === 'alex' 
              ? 'from-alex to-alex-light' 
              : child.id === 'jaxon' 
              ? 'from-jaxon to-jaxon-light'
              : 'from-carson to-carson-light';
            
            return (
              <div
                key={child.id}
                className={cn(
                  'rounded-2xl p-4 bg-gradient-to-br border border-border/50 text-center',
                  bgClass
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center font-extrabold text-xl',
                  childColor === 'alex' ? 'bg-alex text-white' : childColor === 'jaxon' ? 'bg-jaxon text-white' : 'bg-carson text-carson-foreground'
                )}>
                  {child.name.charAt(0)}
                </div>
                <p className={cn(
                  'font-bold mb-2',
                  childColor === 'alex' ? 'text-alex' : childColor === 'jaxon' ? 'text-jaxon' : 'text-carson'
                )}>{child.name}</p>
                
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                  <div 
                    className={cn('h-full rounded-full bg-gradient-to-r', progressBg)}
                    style={{ width: `${childProgress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-center gap-1">
                  {childProgress === 100 && stats.choresDueToday > 0 ? (
                    <Trophy className={cn('w-4 h-4', childColor === 'alex' ? 'text-alex' : childColor === 'jaxon' ? 'text-jaxon' : 'text-carson')} />
                  ) : (
                    <Target className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-bold text-foreground">
                    {stats.choresCompletedToday}/{stats.choresDueToday}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
