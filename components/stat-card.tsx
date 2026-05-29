import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  colorClass?: string;
  large?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  colorClass = 'bg-card',
  large = false,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-4 md:p-6 shadow-lg border border-border/50',
        colorClass
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm md:text-base text-muted-foreground font-medium truncate">{title}</p>
          <p
            className={cn(
              'font-bold text-foreground mt-1',
              large ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-2xl md:text-3xl'
            )}
          >
            {value}
          </p>
          {description && (
            <p className="text-xs md:text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground flex-shrink-0">{icon}</div>
        )}
      </div>
    </div>
  );
}
