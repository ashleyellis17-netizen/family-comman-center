'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { behaviorNotes, children } from '@/lib/mock-data';
import { ChildAvatar } from '@/components/child-avatar';
import { Star, ThumbsUp, ThumbsDown, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChildId } from '@/lib/types';

type TypeFilter = 'all' | 'positive' | 'negative';
type ChildFilterType = 'all' | ChildId;

export default function BehaviorPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [childFilter, setChildFilter] = useState<ChildFilterType>('all');

  const filteredNotes = behaviorNotes
    .filter((note) => {
      if (childFilter !== 'all' && note.childId !== childFilter) return false;
      if (typeFilter !== 'all' && note.type !== typeFilter) return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  // Calculate totals by child
  const behaviorByChild = children.map((child) => {
    const childNotes = behaviorNotes.filter((b) => b.childId === child.id);
    const total = childNotes.reduce((sum, b) => sum + b.points, 0);
    const positive = childNotes
      .filter((b) => b.type === 'positive')
      .reduce((sum, b) => sum + b.points, 0);
    const negative = childNotes
      .filter((b) => b.type === 'negative')
      .reduce((sum, b) => sum + b.points, 0);
    return { child, total, positive, negative };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="cozyla-heading text-foreground flex items-center gap-3">
          <Star className="w-8 h-8" />
          Behavior
        </h1>
        <p className="text-muted-foreground mt-1">
          Track positive and negative behavior notes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {behaviorByChild.map(({ child, total, positive, negative }) => (
          <div
            key={child.id}
            className={cn(
              'rounded-2xl p-4 shadow-lg border-2',
              `border-${child.color}/50 bg-${child.color}-muted/20`
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              <ChildAvatar childId={child.id as ChildId} name={child.name} size="md" />
              <div>
                <p className="font-bold text-foreground">{child.name}</p>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    total >= 0 ? 'text-success' : 'text-destructive'
                  )}
                >
                  {total >= 0 ? '+' : ''}
                  {total}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-success">
                <TrendingUp className="w-4 h-4" />+{positive}
              </span>
              <span className="flex items-center gap-1 text-destructive">
                <TrendingDown className="w-4 h-4" />
                {negative}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'positive', 'negative'] as TypeFilter[]).map((filter) => (
            <Button
              key={filter}
              variant={typeFilter === filter ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setTypeFilter(filter)}
              className={cn(
                'touch-target capitalize',
                typeFilter === filter &&
                  filter === 'positive' &&
                  'bg-success hover:bg-success/90',
                typeFilter === filter &&
                  filter === 'negative' &&
                  'bg-destructive hover:bg-destructive/90'
              )}
            >
              {filter === 'positive' && <ThumbsUp className="w-4 h-4 mr-1" />}
              {filter === 'negative' && <ThumbsDown className="w-4 h-4 mr-1" />}
              {filter}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={childFilter === 'all' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setChildFilter('all')}
            className="touch-target"
          >
            All Kids
          </Button>
          {children.map((child) => (
            <Button
              key={child.id}
              variant={childFilter === child.id ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setChildFilter(child.id as ChildId)}
              className={cn(
                'touch-target',
                childFilter === child.id &&
                  `bg-${child.color} hover:bg-${child.color}/90`
              )}
            >
              {child.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-foreground">Behavior Notes</h2>
          <p className="text-sm text-muted-foreground">
            {filteredNotes.length} notes
          </p>
        </div>

        <div className="divide-y divide-border">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">
                No behavior notes match your filters
              </p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const child = children.find((c) => c.id === note.childId);
              if (!child) return null;

              return (
                <div
                  key={note.id}
                  className={cn(
                    'flex items-start gap-4 p-4',
                    note.type === 'positive' ? 'bg-success/5' : 'bg-destructive/5'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      note.type === 'positive'
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive'
                    )}
                  >
                    {note.type === 'positive' ? (
                      <ThumbsUp className="w-5 h-5" />
                    ) : (
                      <ThumbsDown className="w-5 h-5" />
                    )}
                  </div>

                  <ChildAvatar
                    childId={child.id as ChildId}
                    name={child.name}
                    size="sm"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {note.description}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Added by {note.createdBy} on{' '}
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div
                    className={cn(
                      'text-xl font-bold flex-shrink-0',
                      note.type === 'positive'
                        ? 'text-success'
                        : 'text-destructive'
                    )}
                  >
                    {note.points >= 0 ? '+' : ''}
                    {note.points}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
