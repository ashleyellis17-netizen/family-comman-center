import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, icon: Icon, iconClassName, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg',
            iconClassName ?? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-primary/25',
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h1 className="cozyla-heading text-balance text-foreground">{title}</h1>
          {description && <p className="text-pretty text-muted-foreground font-medium">{description}</p>}
        </div>
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}
