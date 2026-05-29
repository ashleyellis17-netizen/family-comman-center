import { children, getChildStats } from '@/lib/mock-data';
import { Wallet, DollarSign, TrendingUp, Coins } from 'lucide-react';
import { ChildAvatar } from './child-avatar';
import type { ChildId } from '@/lib/types';
import { cn } from '@/lib/utils';

export function AllowanceOverview() {
  const balances = children.map((child) => {
    const stats = getChildStats(child.id);
    return {
      child,
      balance: stats.allowanceBalance,
    };
  });

  const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="rounded-3xl bg-card overflow-hidden hover-lift shadow-lg shadow-alex/5 border border-border/50">
      <div className="p-4 border-b border-border/50 flex items-center gap-3 bg-gradient-to-r from-alex-muted to-transparent">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-alex to-alex-light flex items-center justify-center shadow-lg shadow-alex/25">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Allowance</h2>
          <p className="text-xs text-muted-foreground font-medium">Family savings</p>
        </div>
      </div>

      <div className="p-4">
        <div className="text-center mb-4 pb-4 border-b border-border/50">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-alex-muted border border-alex/20 mb-2">
            <Coins className="w-4 h-4 text-alex" />
            <span className="text-xs font-bold text-alex">Total Family Balance</span>
          </div>
          <p className="text-4xl font-extrabold text-foreground flex items-center justify-center">
            <DollarSign className="w-8 h-8 text-alex" />
            <span className="gradient-text-alex">{totalBalance}</span>
          </p>
        </div>

        <div className="space-y-2">
          {balances.map(({ child, balance }) => {
            const childColor = child.id === 'alex' ? 'alex' : child.id === 'jaxon' ? 'jaxon' : 'carson';
            const bgClass = child.id === 'alex' 
              ? 'bg-alex-muted border-alex/20 hover:bg-alex/20' 
              : child.id === 'jaxon' 
              ? 'bg-jaxon-muted border-jaxon/20 hover:bg-jaxon/20'
              : 'bg-carson-muted border-carson/20 hover:bg-carson/20';
            
            return (
              <div
                key={child.id}
                className={cn(
                  'flex items-center justify-between rounded-xl p-3 border transition-all shadow-sm',
                  bgClass
                )}
              >
                <div className="flex items-center gap-3">
                  <ChildAvatar childId={child.id as ChildId} name={child.name} size="sm" />
                  <span className={cn(
                    'font-bold',
                    childColor === 'alex' ? 'gradient-text-alex' : childColor === 'jaxon' ? 'gradient-text-jaxon' : 'gradient-text-carson'
                  )}>{child.name}</span>
                </div>
                <div className="flex items-center gap-1 text-xl font-extrabold text-foreground">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  {balance}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-center gap-2 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="font-bold text-success">Chores can earn more!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
