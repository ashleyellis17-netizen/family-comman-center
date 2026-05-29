import { behaviorNotes, children } from '@/lib/mock-data';
import { ChildAvatar } from './child-avatar';
import { ThumbsUp, ThumbsDown, Star, TrendingUp, TrendingDown } from 'lucide-react';
import type { ChildId } from '@/lib/types';
import { cn } from '@/lib/utils';

export function BehaviorOverview() {
  // Get recent behavior notes (last 5)
  const recentNotes = [...behaviorNotes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Calculate totals per child
  const behaviorByChild = children.map((child) => {
    const childNotes = behaviorNotes.filter((b) => b.childId === child.id);
    const total = childNotes.reduce((sum, b) => sum + b.points, 0);
    return { child, total };
  });

  return (
    <div className="rounded-3xl bg-card overflow-hidden hover-lift shadow-lg shadow-carson/5 border border-border/50">
      <div className="p-5 border-b border-border/50 flex items-center gap-3 bg-gradient-to-r from-carson-muted to-transparent">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-carson to-carson-light flex items-center justify-center shadow-lg shadow-carson/25">
          <Star className="w-5 h-5 text-carson-foreground" />
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-foreground">Behavior Points</h2>
          <p className="text-xs text-muted-foreground font-medium">Track positive & negative behavior</p>
        </div>
      </div>

      <div className="p-5">
        {/* Point totals */}
        <div className="flex items-center justify-around mb-5 pb-5 border-b border-border/50">
          {behaviorByChild.map(({ child, total }) => {
            const childColor = child.id === 'alex' ? 'alex' : child.id === 'jaxon' ? 'jaxon' : 'carson';
            const isPositive = total >= 0;
            
            return (
              <div key={child.id} className="text-center group">
                <div className="relative">
                  <ChildAvatar childId={child.id as ChildId} name={child.name} size="md" />
                  <div className={cn(
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md',
                    isPositive ? 'bg-success' : 'bg-destructive'
                  )}>
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-white" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <p className={cn(
                  'text-2xl font-extrabold mt-2',
                  isPositive ? 'text-success' : 'text-destructive'
                )}>
                  {total >= 0 ? '+' : ''}{total}
                </p>
                <p className={cn(
                  'text-xs font-bold',
                  childColor === 'alex' ? 'text-alex' : childColor === 'jaxon' ? 'text-jaxon' : 'text-carson'
                )}>{child.name}</p>
              </div>
            );
          })}
        </div>

        {/* Recent notes */}
        <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Recent Activity</p>
        <div className="space-y-2">
          {recentNotes.map((note) => {
            const child = children.find((c) => c.id === note.childId);
            if (!child) return null;
            const childColor = child.id === 'alex' ? 'text-alex' : child.id === 'jaxon' ? 'text-jaxon' : 'text-carson';

            return (
              <div
                key={note.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-xl text-sm transition-all hover:scale-[1.02] shadow-sm',
                  note.type === 'positive' 
                    ? 'bg-success/10 border border-success/20' 
                    : 'bg-destructive/10 border border-destructive/20'
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
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    <span className={cn('font-bold', childColor)}>{child.name}</span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full font-bold',
                      note.type === 'positive' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    )}>
                      {note.points >= 0 ? '+' : ''}{note.points}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">{note.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
