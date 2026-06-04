'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/state-views';
import { children, groundings, earnBackTasks as initialTasks } from '@/lib/mock-data';
import type { EarnBackTask } from '@/lib/types';
import { RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EarnBackPage() {
  const [tasks, setTasks] = useState<EarnBackTask[]>(initialTasks);

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));

  const activeGroundings = groundings.filter((g) => g.earnBackAvailable && g.status !== 'Resolved');

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Earn Back Plan"
        description="Complete restore tasks to earn back privileges"
        icon={RotateCcw}
        iconClassName="from-jaxon to-jaxon-light text-white"
      />

      {activeGroundings.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border/50 shadow-sm">
          <EmptyState title="No earn back plans" description="Earn back tasks appear here when a grounding allows it." icon={RotateCcw} />
        </div>
      ) : (
        <div className="space-y-6">
          {activeGroundings.map((g) => {
            const child = children.find((c) => c.id === g.childId);
            const ebTasks = tasks.filter((t) => t.groundingId === g.id);
            const done = ebTasks.filter((t) => t.completed).length;
            const ready = done === ebTasks.length && ebTasks.length > 0;
            return (
              <section key={g.id} className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-jaxon-muted flex items-center justify-center text-xl font-extrabold text-jaxon">
                      {child?.avatar}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{child?.name}</h2>
                      <p className="text-xs text-muted-foreground">Grounded — Earn Back Available</p>
                    </div>
                  </div>
                  <StatusBadge status={ready ? 'Ready for Review' : 'Earn Back Available'} />
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-bold text-foreground">{done} of {ebTasks.length} restore tasks complete</span>
                    <span className="text-muted-foreground">{ebTasks.length ? Math.round((done / ebTasks.length) * 100) : 0}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden mb-5">
                    <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${ebTasks.length ? (done / ebTasks.length) * 100 : 0}%` }} />
                  </div>

                  <ul className="space-y-2">
                    {ebTasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
                        <button
                          onClick={() => toggle(t.id)}
                          aria-label={t.completed ? 'Mark incomplete' : 'Mark complete'}
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors',
                            t.completed ? 'bg-success border-success text-success-foreground' : 'border-border bg-card'
                          )}
                        >
                          {t.completed && <Check className="w-4 h-4" />}
                        </button>
                        <span className={cn('flex-1 text-sm font-medium', t.completed ? 'line-through text-muted-foreground' : 'text-foreground')}>
                          {t.title}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {ready && (
                    <div className="mt-5 p-4 rounded-2xl bg-success/10 border border-success/30 flex items-center justify-between gap-3">
                      <p className="text-sm font-bold text-success">All restore tasks complete — ready for parent review!</p>
                      <Button size="sm" className="rounded-xl shrink-0">Send for Review</Button>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
