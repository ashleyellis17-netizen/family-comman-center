'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/state-views';
import { children, groundings as initialGroundings, getEarnBackForGrounding } from '@/lib/mock-data';
import type { Grounding } from '@/lib/types';
import { Lock, Wallet, Tv, Gift, RotateCcw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function EligibilityRow({ icon: Icon, label, allowed }: { icon: React.ElementType; label: string; allowed: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40">
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <span className={cn('text-xs font-bold px-3 py-1 rounded-full', allowed ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
        {allowed ? 'Allowed' : 'Blocked'}
      </span>
    </div>
  );
}

export default function GroundingPage() {
  const [groundings, setGroundings] = useState<Grounding[]>(initialGroundings);

  const override = (id: string) =>
    setGroundings((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, allowanceEligible: true, electronicsAllowed: true, rewardsAllowed: true, status: 'Resolved' as const }
          : g
      )
    );

  const active = groundings.filter((g) => g.status !== 'Resolved');

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Grounding & Eligibility"
        description="Grounding pauses allowance and reward access until resolved"
        icon={Lock}
        iconClassName="from-jaxon to-jaxon-light text-white"
      />

      {active.length === 0 ? (
        <div className="rounded-3xl bg-card border border-border/50 shadow-sm">
          <EmptyState
            title="No active groundings"
            description="Everyone is eligible for allowance and rewards right now."
            icon={Lock}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {active.map((g) => {
            const child = children.find((c) => c.id === g.childId);
            const earnBack = getEarnBackForGrounding(g.id);
            const done = earnBack.filter((t) => t.completed).length;
            return (
              <section key={g.id} className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border/50 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-jaxon-muted flex items-center justify-center text-xl font-extrabold text-jaxon">
                      {child?.avatar}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">{child?.name}</h2>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(g.startDate)} – {formatDate(g.endDate)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={g.status} />
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Reason</p>
                    <p className="text-sm text-foreground mb-4">{g.reason}</p>
                    <div className="space-y-2">
                      <EligibilityRow icon={Wallet} label="Allowance" allowed={g.allowanceEligible} />
                      <EligibilityRow icon={Tv} label="Electronics / Games" allowed={g.electronicsAllowed} />
                      <EligibilityRow icon={Gift} label="Rewards" allowed={g.rewardsAllowed} />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Earn Back</p>
                    {g.earnBackAvailable ? (
                      <div className="rounded-2xl bg-warning/10 border border-warning/30 p-4 flex-1">
                        <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-warning-foreground" /> Earn Back Available
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">{done} of {earnBack.length} restore tasks complete</p>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-3">
                          <div className="h-full bg-warning rounded-full" style={{ width: `${earnBack.length ? (done / earnBack.length) * 100 : 0}%` }} />
                        </div>
                        <Link href="/earn-back">
                          <Button size="sm" variant="secondary" className="rounded-xl w-full">View Earn Back Plan</Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No earn back available for this grounding.</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-4 mb-2">Tasks can still be completed while grounded.</p>
                    <Button onClick={() => override(g.id)} variant="outline" className="rounded-xl">
                      Parent Override (End Grounding)
                    </Button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
