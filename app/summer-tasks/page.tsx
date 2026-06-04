'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/state-views';
import { children, summerTasks as initialTasks, getSummerCategories } from '@/lib/mock-data';
import type { ChildId, SummerTask, SummerTaskStatus } from '@/lib/types';
import { Sun, Check, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const childTabs: { id: ChildId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Kids' },
  { id: 'alex', label: 'Alex' },
  { id: 'jaxon', label: 'Jaxon' },
  { id: 'carson', label: 'Carson' },
];

const statusOrder: SummerTaskStatus[] = [
  'Not Started', 'In Progress', 'Needs Parent Check', 'Approved', 'Rejected / Redo', 'Missed', 'Excused',
];

export default function SummerTasksPage() {
  const [tasks, setTasks] = useState<SummerTask[]>(initialTasks);
  const [activeChild, setActiveChild] = useState<ChildId | 'all'>('all');
  const categories = getSummerCategories();

  const setStatus = (id: string, status: SummerTaskStatus) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));

  const advance = (t: SummerTask) => {
    const flow: Record<string, SummerTaskStatus> = {
      'Not Started': 'In Progress',
      'In Progress': 'Needs Parent Check',
    };
    const next = flow[t.status];
    if (next) setStatus(t.id, next);
  };

  const visible = activeChild === 'all' ? tasks : tasks.filter((t) => t.childId === activeChild);
  const approvedCount = visible.filter((t) => t.status === 'Approved').length;

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Summer Task Center"
        description="Kids complete tasks before rewards unlock"
        icon={Sun}
        iconClassName="from-carson to-carson-light text-carson-foreground"
      />

      {/* Child filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {childTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChild(tab.id)}
            className={cn(
              'px-5 py-2.5 rounded-2xl text-sm font-bold transition-all touch-target',
              activeChild === tab.id ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:bg-accent'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-3xl bg-card border border-border/50 shadow-sm p-5 mb-6 flex items-center justify-between">
        <p className="font-semibold text-foreground">
          {approvedCount} of {visible.length} tasks approved
        </p>
        <div className="h-3 w-40 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-carson rounded-full transition-all" style={{ width: `${visible.length ? (approvedCount / visible.length) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Tasks grouped by category */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catTasks = visible.filter((t) => t.category === cat);
          if (catTasks.length === 0) return null;
          return (
            <section key={cat} className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border/50 bg-muted/30">
                <h2 className="font-bold text-foreground">{cat}</h2>
              </div>
              <ul className="divide-y divide-border/40">
                {catTasks
                  .slice()
                  .sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status))
                  .map((t) => {
                    const child = children.find((c) => c.id === t.childId);
                    return (
                      <li key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{t.title}</p>
                            {t.required && <span className="text-xs font-bold text-primary">Required</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{child?.name} · {t.points} pts</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={t.status} />
                          {(t.status === 'Not Started' || t.status === 'In Progress') && (
                            <Button size="sm" variant="secondary" onClick={() => advance(t)} className="rounded-xl gap-1">
                              {t.status === 'Not Started' ? 'Start' : 'Submit'}
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          )}
                          {t.status === 'Needs Parent Check' && (
                            <>
                              <Button size="icon" variant="secondary" onClick={() => setStatus(t.id, 'Approved')} aria-label="Approve" className="rounded-xl bg-success/15 text-success hover:bg-success/25">
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="secondary" onClick={() => setStatus(t.id, 'Rejected / Redo')} aria-label="Reject" className="rounded-xl bg-destructive/15 text-destructive hover:bg-destructive/25">
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {t.status === 'Rejected / Redo' && (
                            <Button size="sm" variant="secondary" onClick={() => setStatus(t.id, 'In Progress')} className="rounded-xl">
                              Redo
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </section>
          );
        })}
        {visible.length === 0 && <EmptyState title="No summer tasks" description="Tasks will appear here once assigned." icon={Sun} />}
      </div>
    </div>
  );
}
