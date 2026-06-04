import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  iconClassName?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, icon: Icon, iconClassName, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shrink-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
              iconClassName
            )}
          >
            <Icon className="w-7 h-7" />
          </div>
        )}
        <div>
          <h1 className="cozyla-heading text-foreground text-balance">{title}</h1>
          {description && <p className="text-muted-foreground font-medium mt-1 text-pretty">{description}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
