'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/state-views';
import { mealIdeas } from '@/lib/mock-data';
import { Lightbulb, Star, Clock, Baby } from 'lucide-react';

function formatShort(date?: string) {
  if (!date) return 'Not yet';
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MealIdeasPage() {
  const [filter, setFilter] = useState<'all' | 'kid' | 'quick'>('all');

  const visible = mealIdeas.filter((m) =>
    filter === 'all' ? true : filter === 'kid' ? m.kidFriendly : m.quickMeal
  );

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Meal Ideas"
        description="Family favorites and dinner inspiration"
        icon={Lightbulb}
        iconClassName="from-carson to-carson-light text-white"
      />

      <div className="flex gap-2 mb-6">
        {([['all', 'All'], ['kid', 'Kid Friendly'], ['quick', 'Quick Meals']] as const).map(([f, label]) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-5 py-2.5 rounded-2xl text-sm font-bold transition-all touch-target',
              filter === f ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:bg-accent'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border/50 shadow-sm">
          <EmptyState title="No meals match" description="Try a different filter." icon={Lightbulb} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((m) => (
            <div key={m.id} className="rounded-3xl bg-card border border-border/50 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-bold text-foreground text-lg text-balance">{m.name}</h3>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className={cn('w-3.5 h-3.5', idx < m.rating ? 'fill-warning text-warning' : 'text-muted-foreground/30')} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{m.category} · {m.protein}</p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {m.kidFriendly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-jaxon/10 text-jaxon">
                    <Baby className="w-3 h-3" /> Kid friendly
                  </span>
                )}
                {m.quickMeal && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-alex/10 text-alex">
                    <Clock className="w-3 h-3" /> Quick
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Ingredients:</span> {m.ingredients.join(', ')}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Last made: {formatShort(m.lastMade)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
