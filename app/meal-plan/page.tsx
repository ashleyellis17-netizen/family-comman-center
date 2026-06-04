'use client';

import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { mealPlan } from '@/lib/mock-data';
import { CalendarDays, ChefHat, ShoppingCart } from 'lucide-react';

const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

export default function MealPlanPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Weekly Meal Plan"
        description="What's for breakfast, lunch, and dinner"
        icon={CalendarDays}
        iconClassName="from-primary to-primary/70 text-primary-foreground"
      />

      <div className="space-y-3">
        {mealPlan.map((day) => {
          const isToday = day.day === todayName;
          return (
            <div
              key={day.id}
              className={cn(
                'rounded-3xl border shadow-sm overflow-hidden',
                isToday ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-border/50 bg-card'
              )}
            >
              <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between gap-2">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  {day.day}
                  {isToday && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground uppercase">Today</span>}
                </h2>
                {day.helper && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                    <ChefHat className="w-3.5 h-3.5" /> Helper: {day.helper}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border/40">
                {([['Breakfast', day.breakfast], ['Lunch', day.lunch], ['Dinner', day.dinner], ['Snack', day.snack]] as const).map(([label, val]) => (
                  <div key={label} className="p-4">
                    <p className="text-[11px] uppercase tracking-wide font-bold text-muted-foreground mb-1">{label}</p>
                    <p className="text-sm font-semibold text-foreground">{val || '—'}</p>
                  </div>
                ))}
              </div>
              {day.groceryNeeded && day.groceryNeeded.length > 0 && (
                <div className="px-5 py-2.5 bg-muted/30 border-t border-border/40 flex items-center gap-2 flex-wrap">
                  <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">Need:</span>
                  {day.groceryNeeded.map((g) => (
                    <span key={g} className="px-2 py-0.5 rounded-full text-xs font-medium bg-card border border-border/50 text-foreground">{g}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
