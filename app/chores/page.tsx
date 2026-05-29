'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { chores, children } from '@/lib/mock-data';
import { ChildAvatar } from '@/components/child-avatar';
import { Check, Clock, ListTodo, Filter, Sparkles, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChildId } from '@/lib/types';

type FilterType = 'all' | 'today' | 'pending' | 'completed';
type ChildFilterType = 'all' | ChildId;

export default function ChoresPage() {
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [childFilter, setChildFilter] = useState<ChildFilterType>('all');

  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = chores.filter((c) => c.dueDate === today && c.completed).length;
  const todayTotal = chores.filter((c) => c.dueDate === today).length;
  const todayProgress = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 100;

  const filteredChores = chores.filter((chore) => {
    if (childFilter !== 'all' && chore.assignedTo !== childFilter) return false;
    if (statusFilter === 'today' && chore.dueDate !== today) return false;
    if (statusFilter === 'pending' && chore.completed) return false;
    if (statusFilter === 'completed' && !chore.completed) return false;
    return true;
  });

  // Group by date
  const choresByDate = filteredChores.reduce(
    (acc, chore) => {
      const date = chore.dueDate;
      if (!acc[date]) acc[date] = [];
      acc[date].push(chore);
      return acc;
    },
    {} as Record<string, typeof chores>
  );

  const sortedDates = Object.keys(choresByDate).sort();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-jaxon to-jaxon-light flex items-center justify-center shadow-lg shadow-jaxon/30">
              <ListTodo className="w-6 h-6 text-jaxon-foreground" />
            </div>
            <div>
              <h1 className="cozyla-heading text-foreground">Chores</h1>
              <p className="text-sm text-muted-foreground">Track and manage household tasks</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl px-5 py-4 hover-lift">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Today</p>
              <p className="text-3xl font-bold text-foreground">
                {todayCompleted}<span className="text-muted-foreground text-lg">/{todayTotal}</span>
              </p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted/30"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={`${todayProgress}, 100`}
                  className="text-jaxon transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-jaxon">{Math.round(todayProgress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'today', 'pending', 'completed'] as FilterType[]).map((filter) => (
            <Button
              key={filter}
              variant={statusFilter === filter ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter(filter)}
              className={cn(
                'touch-target capitalize rounded-xl',
                statusFilter === filter && 'bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30'
              )}
            >
              {filter === 'completed' && <CheckCircle className="w-4 h-4 mr-1" />}
              {filter === 'pending' && <Circle className="w-4 h-4 mr-1" />}
              {filter}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={childFilter === 'all' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setChildFilter('all')}
            className={cn(
              'touch-target rounded-xl',
              childFilter === 'all' && 'bg-gradient-to-r from-primary to-primary/80'
            )}
          >
            All Kids
          </Button>
          {children.map((child) => {
            const isActive = childFilter === child.id;
            const gradientClass = child.id === 'alex' 
              ? 'bg-gradient-to-r from-alex to-alex-light shadow-alex/30' 
              : child.id === 'jaxon' 
              ? 'bg-gradient-to-r from-jaxon to-jaxon-light shadow-jaxon/30'
              : 'bg-gradient-to-r from-carson to-carson-light shadow-carson/30';
            
            return (
              <Button
                key={child.id}
                variant={isActive ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setChildFilter(child.id as ChildId)}
                className={cn(
                  'touch-target rounded-xl',
                  isActive && `${gradientClass} shadow-lg`
                )}
              >
                {child.name}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Chores List */}
      <div className="space-y-4">
        {sortedDates.length === 0 ? (
          <div className="rounded-3xl glass-card p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-foreground">No chores match your filters</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters above</p>
          </div>
        ) : (
          sortedDates.map((date) => {
            const dateChores = choresByDate[date];
            const isToday = date === today;
            const completedCount = dateChores.filter((c) => c.completed).length;
            const dateProgress = (completedCount / dateChores.length) * 100;
            const dateLabel = isToday
              ? 'Today'
              : new Date(date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                });

            return (
              <div
                key={date}
                className={cn(
                  'rounded-3xl glass-card overflow-hidden hover-lift',
                  isToday && 'ring-2 ring-primary/50'
                )}
              >
                <div className={cn(
                  'px-5 py-4 border-b border-border/30 flex items-center justify-between',
                  isToday && 'bg-primary/5'
                )}>
                  <div className="flex items-center gap-3">
                    {isToday && <Sparkles className="w-5 h-5 text-primary animate-float" />}
                    <h2 className="font-bold text-lg text-foreground">{dateLabel}</h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {completedCount}/{dateChores.length}
                    </span>
                    <div className="w-20 h-2 bg-muted/30 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-jaxon to-jaxon-light rounded-full transition-all duration-500"
                        style={{ width: `${dateProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-border/20">
                  {dateChores.map((chore) => {
                    const child = children.find((c) => c.id === chore.assignedTo);
                    if (!child) return null;
                    
                    const childColor = child.id === 'alex' ? 'alex' : child.id === 'jaxon' ? 'jaxon' : 'carson';
                    const accentClass = child.id === 'alex' 
                      ? 'bg-alex/5 hover:bg-alex/10' 
                      : child.id === 'jaxon' 
                      ? 'bg-jaxon/5 hover:bg-jaxon/10'
                      : 'bg-carson/5 hover:bg-carson/10';

                    return (
                      <div
                        key={chore.id}
                        className={cn(
                          'flex items-center gap-4 p-4 transition-all',
                          chore.completed ? 'bg-success/5' : accentClass
                        )}
                      >
                        <div
                          className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer touch-target transition-all',
                            chore.completed
                              ? 'bg-gradient-to-br from-success to-success/80 text-success-foreground shadow-lg shadow-success/30'
                              : 'bg-muted/30 border-2 border-border hover:border-primary hover:scale-110'
                          )}
                        >
                          {chore.completed && <Check className="w-5 h-5" />}
                        </div>

                        <ChildAvatar
                          childId={child.id as ChildId}
                          name={child.name}
                          size="sm"
                        />

                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'font-medium',
                            chore.completed
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground'
                          )}>
                            {chore.title}
                          </p>
                          {chore.description && (
                            <p className="text-sm text-muted-foreground truncate">{chore.description}</p>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className={cn(
                            'text-sm font-bold px-2 py-1 rounded-full',
                            chore.completed
                              ? 'bg-success/20 text-success'
                              : `bg-${childColor}/20 text-${childColor}`
                          )}>
                            {chore.points} pts
                          </span>
                          {chore.recurring && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                              <Clock className="w-3 h-3" />
                              {chore.recurring}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
