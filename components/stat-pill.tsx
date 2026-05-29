import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatPillProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  className?: string;
  iconClassName?: string;
}

export function StatPill({ icon: Icon, label, value, className, iconClassName }: StatPillProps) {
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-sm', className)}>
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground', iconClassName)}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none text-foreground">{value}</p>
        <p className="mt-1 truncate text-xs font-semibold text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
