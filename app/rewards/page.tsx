'use client';

import { cn } from '@/lib/utils';
import { rewards, rewardRedemptions, children, getChildStats } from '@/lib/mock-data';
import { ChildAvatar } from '@/components/child-avatar';
import {
  Gift,
  Star,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChildId } from '@/lib/types';

export default function RewardsPage() {
  const availableRewards = rewards.filter((r) => r.available);
  
  // Get balances for each child
  const childBalances = children.map((child) => {
    const stats = getChildStats(child.id);
    const redemptions = rewardRedemptions.filter((r) => r.childId === child.id);
    return {
      child,
      balance: stats.allowanceBalance,
      redemptions,
    };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="cozyla-heading text-foreground flex items-center gap-3">
          <Gift className="w-8 h-8" />
          Rewards
        </h1>
        <p className="text-muted-foreground mt-1">
          Redeem points for awesome rewards
        </p>
      </div>

      {/* Child Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {childBalances.map(({ child, balance }) => (
          <div
            key={child.id}
            className={cn(
              'rounded-2xl p-4 shadow-lg border-2 flex items-center gap-4',
              `border-${child.color}/50 bg-${child.color}-muted/20`
            )}
          >
            <ChildAvatar childId={child.id as ChildId} name={child.name} size="md" />
            <div>
              <p className="font-bold text-foreground">{child.name}</p>
              <p className="text-2xl font-bold text-foreground flex items-center gap-1">
                <Star className="w-5 h-5 text-warning" />
                {balance} pts
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Available Rewards */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-warning" />
              Available Rewards
            </h2>
            <p className="text-sm text-muted-foreground">
              {availableRewards.length} rewards available
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {availableRewards.map((reward) => (
            <div
              key={reward.id}
              className="rounded-xl border border-border bg-muted/30 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">
                    {reward.title}
                  </h3>
                  {reward.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {reward.description}
                    </p>
                  )}
                </div>
                <div className="bg-warning/20 text-warning-foreground px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {reward.cost}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {children.map((child) => {
                  const stats = getChildStats(child.id);
                  const canAfford = stats.allowanceBalance >= reward.cost;
                  
                  return (
                    <Button
                      key={child.id}
                      variant={canAfford ? 'default' : 'secondary'}
                      size="sm"
                      disabled={!canAfford}
                      className={cn(
                        'touch-target',
                        canAfford && `bg-${child.color} hover:bg-${child.color}/90`
                      )}
                    >
                      {child.name}
                      {canAfford ? (
                        <Check className="w-4 h-4 ml-1" />
                      ) : (
                        <span className="text-xs ml-1">
                          ({reward.cost - stats.allowanceBalance} more)
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Redemptions */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-foreground">Recent Redemptions</h2>
        </div>

        <div className="divide-y divide-border">
          {rewardRedemptions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No rewards redeemed yet</p>
            </div>
          ) : (
            rewardRedemptions.map((redemption) => {
              const reward = rewards.find((r) => r.id === redemption.rewardId);
              const child = children.find((c) => c.id === redemption.childId);
              if (!reward || !child) return null;

              return (
                <div
                  key={redemption.id}
                  className={cn(
                    'flex items-center gap-4 p-4',
                    redemption.fulfilled ? 'bg-success/5' : 'bg-warning/5'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      redemption.fulfilled
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning-foreground'
                    )}
                  >
                    {redemption.fulfilled ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  <ChildAvatar
                    childId={child.id as ChildId}
                    name={child.name}
                    size="sm"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {reward.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {child.name} -{' '}
                      {new Date(redemption.redeemedAt).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>

                  <div
                    className={cn(
                      'text-xs px-3 py-1 rounded-full font-medium',
                      redemption.fulfilled
                        ? 'bg-success/20 text-success'
                        : 'bg-warning/20 text-warning-foreground'
                    )}
                  >
                    {redemption.fulfilled ? 'Fulfilled' : 'Pending'}
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
