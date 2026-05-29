import { rewards, rewardRedemptions, children } from '@/lib/mock-data';
import { Gift, Star, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RewardsOverview() {
  const availableRewards = rewards.filter((r) => r.available);
  const pendingRedemptions = rewardRedemptions.filter((r) => !r.fulfilled);

  return (
    <div className="rounded-3xl bg-card overflow-hidden hover-lift shadow-lg shadow-primary/5 border border-border/50">
      <div className="p-4 border-b border-border/50 flex items-center gap-3 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-jaxon flex items-center justify-center shadow-lg shadow-primary/25">
          <Gift className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Rewards</h2>
          <p className="text-xs text-muted-foreground font-medium">Earn & redeem</p>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {availableRewards.slice(0, 4).map((reward) => (
            <div
              key={reward.id}
              className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-3 text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2 group-hover:animate-wiggle">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{reward.title}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Sparkles className="w-3 h-3 text-primary" />
                <p className="text-xs font-bold text-primary">{reward.cost} pts</p>
              </div>
            </div>
          ))}
        </div>

        {pendingRedemptions.length > 0 && (
          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-carson" />
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Redemptions</p>
            </div>
            <div className="space-y-2">
              {pendingRedemptions.map((redemption) => {
                const reward = rewards.find((r) => r.id === redemption.rewardId);
                const child = children.find((c) => c.id === redemption.childId);
                if (!reward || !child) return null;

                const childColor = child.id === 'alex' ? 'alex' : child.id === 'jaxon' ? 'jaxon' : 'carson';
                const bgClass = child.id === 'alex' 
                  ? 'bg-alex-muted border-alex/20' 
                  : child.id === 'jaxon' 
                  ? 'bg-jaxon-muted border-jaxon/20'
                  : 'bg-carson-muted border-carson/20';

                return (
                  <div
                    key={redemption.id}
                    className={cn(
                      'flex items-center gap-2 text-sm rounded-xl p-2.5 border shadow-sm',
                      bgClass
                    )}
                  >
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold',
                      childColor === 'alex' ? 'bg-alex text-white' : childColor === 'jaxon' ? 'bg-jaxon text-white' : 'bg-carson text-carson-foreground'
                    )}>
                      {child.name.charAt(0)}
                    </div>
                    <span className="text-muted-foreground truncate flex-1 font-medium">{reward.title}</span>
                    <Gift className="w-4 h-4 text-primary" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
