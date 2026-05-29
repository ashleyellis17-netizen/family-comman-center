import { cn } from '@/lib/utils';
import { chores, children } from '@/lib/mock-data';
import { ChildAvatar } from './child-avatar';
import { Check, Clock, ListTodo, Sparkles } from 'lucide-react';
import type { ChildId } from '@/lib/types';

export function TodayChores() {
  const today = new Date().toISOString().split('T')[0];
  const todayChores = chores.filter((c) => c.dueDate === today);
  const completedCount = todayChores.filter((c) => c.completed).length;
  const progress = todayChores.length > 0 ? (completedCount / todayChores.length) * 100 : 100;

  const choresByChild = children.map((child) => ({
    child,
    chores: todayChores.filter((c) => c.assignedTo === child.id),
  }));

  return (
    <div className="rounded-3xl bg-card overflow-hidden hover-lift shadow-lg shadow-jaxon/5 border border-border/50">
      <div className="p-5 border-b border-border/50 bg-gradient-to-r from-jaxon-muted to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-jaxon to-jaxon-light flex items-center justify-center shadow-lg shadow-jaxon/25">
              <ListTodo className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-extrabold text-foreground">{"Today's Chores"}</h2>
              <p className="text-xs text-muted-foreground font-medium">Track daily tasks</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-foreground">{completedCount}</span>
            <span className="text-muted-foreground font-bold">/{todayChores.length}</span>
            <p className="text-xs text-muted-foreground font-medium">completed</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-3 bg-muted rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-jaxon to-jaxon-light rounded-full transition-all duration-500 progress-shine"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {choresByChild.map(({ child, chores: childChores }) => {
          const childCompleted = childChores.filter(c => c.completed).length;
          const childColor = child.id === 'alex' ? 'alex' : child.id === 'jaxon' ? 'jaxon' : 'carson';
          
          return (
            <div key={child.id} className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <ChildAvatar childId={child.id as ChildId} name={child.name} size="sm" />
                <span className={cn(
                  'font-bold',
                  childColor === 'alex' ? 'gradient-text-alex' : childColor === 'jaxon' ? 'gradient-text-jaxon' : 'gradient-text-carson'
                )}>{child.name}</span>
                <div className="ml-auto flex items-center gap-2">
                  {childCompleted === childChores.length && childChores.length > 0 && (
                    <Sparkles className="w-4 h-4 text-success animate-wiggle" />
                  )}
                  <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                    {childCompleted}/{childChores.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2 ml-11">
                {childChores.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic font-medium">No chores today - enjoy!</p>
                ) : (
                  childChores.map((chore) => (
                    <div
                      key={chore.id}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl transition-all duration-200 shadow-sm',
                        chore.completed
                          ? 'bg-success/10 border border-success/20'
                          : 'bg-muted/50 border border-border/50 hover:bg-muted'
                      )}
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                          chore.completed
                            ? 'bg-gradient-to-br from-success to-success/80 shadow-lg shadow-success/30'
                            : 'bg-card border-2 border-border'
                        )}
                      >
                        {chore.completed && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-semibold truncate',
                            chore.completed
                              ? 'text-muted-foreground line-through'
                              : 'text-foreground'
                          )}
                        >
                          {chore.title}
                        </p>
                      </div>
                      <span className={cn(
                        'text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-full',
                        chore.completed
                          ? 'bg-success/20 text-success'
                          : 'bg-muted text-muted-foreground'
                      )}>
                        {chore.completed ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {chore.points} pts
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
