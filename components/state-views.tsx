import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Inbox, AlertTriangle, Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="status" aria-live="polite">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground font-medium">{label}</p>
    </div>
  );
}

export function EmptyState({
  title = 'Nothing here yet',
  description,
  icon: Icon = Inbox,
  action,
  className,
}: {
  title?: string;
  description?: string;
  icon?: React.ElementType;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {description && <p className="text-muted-foreground mt-1 max-w-sm text-pretty">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We could not load this section. Please try again.',
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" role="alert">
      <div className="w-16 h-16 rounded-3xl bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-pretty">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
