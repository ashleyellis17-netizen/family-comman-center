'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { allowanceTransactions, children, getChildStats, getActiveGroundingForChild } from '@/lib/mock-data';
import { ChildAvatar } from '@/components/child-avatar';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Gift,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ChildId } from '@/lib/types';

type ChildFilterType = 'all' | ChildId;
type TypeFilter = 'all' | 'add' | 'subtract' | 'chore' | 'reward';

const typeIcons = {
  add: ArrowUpRight,
  subtract: ArrowDownRight,
  chore: CheckCircle,
  reward: Gift,
};

const typeLabels = {
  add: 'Added',
  subtract: 'Deducted',
  chore: 'Chore Bonus',
  reward: 'Redeemed',
};

export default function AllowancePage() {
  const [childFilter, setChildFilter] = useState<ChildFilterType>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const filteredTransactions = allowanceTransactions
    .filter((tx) => {
      if (childFilter !== 'all' && tx.childId !== childFilter) return false;
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      return true;
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  // Calculate balances by child
  const balancesByChild = children.map((child) => {
    const stats = getChildStats(child.id);
    const childTx = allowanceTransactions.filter(
      (tx) => tx.childId === child.id
    );
    const earned = childTx
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const spent = childTx
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const grounding = getActiveGroundingForChild(child.id);
    return {
      child,
      balance: stats.allowanceBalance,
      earned,
      spent,
      locked: grounding ? !grounding.allowanceEligible : false,
    };
  });

  const totalBalance = balancesByChild.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="cozyla-heading text-foreground flex items-center gap-3">
            <Wallet className="w-8 h-8" />
            Allowance
          </h1>
          <p className="text-muted-foreground mt-1">
            Track earnings and spending
          </p>
        </div>
        <div className="bg-card rounded-xl px-6 py-4 shadow-lg border border-border/50 text-center">
          <p className="text-sm text-muted-foreground">Family Total</p>
          <p className="text-3xl font-bold text-foreground flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
            {totalBalance}
          </p>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {balancesByChild.map(({ child, balance, earned, spent, locked }) => (
          <div
            key={child.id}
            className={cn(
              'rounded-2xl p-4 shadow-lg border-2 relative',
              locked ? 'border-destructive/40 bg-destructive/5' : `border-${child.color}/50 bg-${child.color}-muted/20`
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <ChildAvatar childId={child.id as ChildId} name={child.name} size="md" />
              <div>
                <p className="font-bold text-foreground">{child.name}</p>
                <p className="text-2xl font-bold text-foreground flex items-center">
                  <DollarSign className="w-5 h-5" />
                  {balance}
                </p>
              </div>
            </div>

            {locked && (
              <div className="mb-3 flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2">
                <Lock className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-xs font-bold text-destructive">Allowance frozen - currently grounded</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-success/10 rounded-lg p-2 text-center">
                <TrendingUp className="w-4 h-4 text-success mx-auto mb-1" />
                <p className="text-success font-medium">+${earned}</p>
                <p className="text-xs text-muted-foreground">Earned</p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-2 text-center">
                <TrendingDown className="w-4 h-4 text-destructive mx-auto mb-1" />
                <p className="text-destructive font-medium">-${spent}</p>
                <p className="text-xs text-muted-foreground">Spent</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Filters</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={childFilter === 'all' ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setChildFilter('all')}
            className="touch-target"
          >
            All Kids
          </Button>
          {children.map((child) => (
            <Button
              key={child.id}
              variant={childFilter === child.id ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setChildFilter(child.id as ChildId)}
              className={cn(
                'touch-target',
                childFilter === child.id &&
                  `bg-${child.color} hover:bg-${child.color}/90`
              )}
            >
              {child.name}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {(['all', 'add', 'chore', 'reward'] as TypeFilter[]).map(
            (filter) => {
              const Icon = filter === 'all' ? Filter : typeIcons[filter];
              return (
                <Button
                  key={filter}
                  variant={typeFilter === filter ? 'default' : 'secondary'}
                  size="sm"
                  onClick={() => setTypeFilter(filter)}
                  className="touch-target capitalize"
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {filter === 'all' ? 'All Types' : typeLabels[filter]}
                </Button>
              );
            }
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-bold text-foreground">Transaction History</h2>
          <p className="text-sm text-muted-foreground">
            {filteredTransactions.length} transactions
          </p>
        </div>

        <div className="divide-y divide-border">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const child = children.find((c) => c.id === tx.childId);
              if (!child) return null;

              const Icon = typeIcons[tx.type];
              const isPositive = tx.amount > 0;

              return (
                <div
                  key={tx.id}
                  className={cn(
                    'flex items-center gap-4 p-4',
                    isPositive ? 'bg-success/5' : 'bg-destructive/5'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                      isPositive
                        ? 'bg-success/20 text-success'
                        : 'bg-destructive/20 text-destructive'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <ChildAvatar
                    childId={child.id as ChildId}
                    name={child.name}
                    size="sm"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {tx.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {typeLabels[tx.type]} -{' '}
                      {new Date(tx.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <p
                    className={cn(
                      'text-xl font-bold flex-shrink-0',
                      isPositive ? 'text-success' : 'text-destructive'
                    )}
                  >
                    {isPositive ? '+' : '-'}${Math.abs(tx.amount)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
