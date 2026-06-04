'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/state-views';
import { children, approvalQueue as initialQueue } from '@/lib/mock-data';
import type { ApprovalItem } from '@/lib/types';
import { ClipboardCheck, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const filters = ['Pending', 'Approved', 'Rejected'] as const;

export default function ApprovalsPage() {
  const [queue, setQueue] = useState<ApprovalItem[]>(initialQueue);
  const [filter, setFilter] = useState<(typeof filters)[number]>('Pending');

  const decide = (id: string, status: 'Approved' | 'Rejected') =>
    setQueue((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const visible = queue.filter((a) => a.status === filter);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Parent Approval Queue"
        description="Review and approve items submitted by the kids"
        icon={ClipboardCheck}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => {
          const count = queue.filter((a) => a.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-5 py-2.5 rounded-2xl text-sm font-bold transition-all touch-target flex items-center gap-2',
                filter === f ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border/50 text-muted-foreground hover:bg-accent'
              )}
            >
              {f}
              <span className={cn('text-xs px-2 py-0.5 rounded-full', filter === f ? 'bg-primary-foreground/20' : 'bg-muted')}>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border/50 shadow-sm">
          <EmptyState title={`No ${filter.toLowerCase()} items`} icon={ClipboardCheck} />
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((a) => {
            const child = children.find((c) => c.id === a.childId);
            const accent = a.childId === 'alex' ? 'bg-alex-muted text-alex' : a.childId === 'jaxon' ? 'bg-jaxon-muted text-jaxon' : 'bg-carson-muted text-carson';
            return (
              <li key={a.id} className="rounded-3xl bg-card border border-border/50 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-extrabold shrink-0', accent)}>
                  {child?.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-foreground">{a.title}</p>
                    <span className="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-muted">{a.type}</span>
                  </div>
                  {a.detail && <p className="text-sm text-muted-foreground mt-0.5">{a.detail}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">{child?.name}</p>
                </div>
                {a.status === 'Pending' ? (
                  <div className="flex items-center gap-2">
                    <Button onClick={() => decide(a.id, 'Approved')} className="rounded-xl gap-1 bg-success text-success-foreground hover:bg-success/90">
                      <Check className="w-4 h-4" /> Approve
                    </Button>
                    <Button onClick={() => decide(a.id, 'Rejected')} variant="outline" className="rounded-xl gap-1 border-destructive/40 text-destructive hover:bg-destructive/10">
                      <X className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                ) : (
                  <StatusBadge status={a.status} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
