'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { StatusBadge } from '@/components/status-badge';
import { children, unlockRewards as initialRewards } from '@/lib/mock-data';
import type { UnlockReward, RewardUnlockState } from '@/lib/types';
import { Trophy, Lock, Check, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RewardUnlockPage() {
  const [rewards, setRewards] = useState<UnlockReward[]>(initialRewards);

  const setState = (id: string, state: RewardUnlockState) =>
    setRewards((prev) => prev.map((r) => (r.id === id ? { ...r, state } : r)));

  const useReward = (r: UnlockReward) => {
    const used = (r.usedToday ?? 0) + 1;
    const limit = r.dailyLimit ?? Infinity;
    setRewards((prev) =>
      prev.map((x) =>
        x.id === r.id ? { ...x, usedToday: used, state: used >= limit ? 'Daily Limit Reached' : 'Used Today' } : x
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Reward Unlock Center"
        description="Rewards unlock only after required tasks are complete and parent approved"
        icon={Trophy}
        iconClassName="from-carson to-carson-light text-carson-foreground"
      />

      <div className="space-y-8">
        {children.map((child) => {
          const childRewards = rewards.filter((r) => r.childId === child.id);
          const accent = child.id === 'alex' ? 'text-alex' : child.id === 'jaxon' ? 'text-jaxon' : 'text-carson';
          const bar = child.id === 'alex' ? 'bg-alex' : child.id === 'jaxon' ? 'bg-jaxon' : 'bg-carson';
          return (
            <section key={child.id}>
              <h2 className={cn('text-xl font-extrabold mb-4', accent)}>{child.name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {childRewards.map((r) => {
                  const locked = r.state === 'Locked';
                  const pct = Math.min(100, Math.round((r.completedTasks / r.requiredTasks) * 100));
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        'rounded-3xl border shadow-sm p-5 flex flex-col gap-3',
                        locked ? 'bg-muted/40 border-border/50' : 'bg-card border-border/50'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', locked ? 'bg-muted' : 'bg-carson-muted')}>
                          {locked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <Trophy className={cn('w-5 h-5', accent)} />}
                        </div>
                        <StatusBadge status={r.state} />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{r.title}</h3>
                        {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Required tasks</span>
                          <span className="font-bold text-foreground">{r.completedTasks}/{r.requiredTasks}</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', bar)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      {r.dailyLimit != null && (
                        <p className="text-xs text-muted-foreground">
                          Daily use: {r.usedToday ?? 0}/{r.dailyLimit}
                        </p>
                      )}

                      <div className="mt-auto pt-2">
                        {r.state === 'Needs Parent Approval' && (
                          <Button size="sm" onClick={() => setState(r.id, 'Unlocked')} className="w-full rounded-xl gap-1">
                            <Check className="w-4 h-4" /> Approve Unlock
                          </Button>
                        )}
                        {r.state === 'Unlocked' && (
                          <Button size="sm" variant="secondary" onClick={() => useReward(r)} className="w-full rounded-xl gap-1">
                            <Unlock className="w-4 h-4" /> Use Now
                          </Button>
                        )}
                        {(r.state === 'Locked' || r.state === 'In Progress') && (
                          <p className="text-xs text-center text-muted-foreground py-1.5">Finish tasks to unlock</p>
                        )}
                        {(r.state === 'Used Today' || r.state === 'Daily Limit Reached') && (
                          <p className="text-xs text-center text-muted-foreground py-1.5">Come back tomorrow</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
