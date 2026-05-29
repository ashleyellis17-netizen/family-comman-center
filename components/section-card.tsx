import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  href?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  href,
  action,
  className,
  children,
}: SectionCardProps) {
  return (
    <section className={cn('overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg shadow-primary/5', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/50 p-5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', iconClassName ?? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25')}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div>
            <h2 className="text-lg font-extrabold text-foreground">{title}</h2>
            {subtitle && <p className="text-xs font-medium text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action}
        {href && !action && (
          <Link href={href} className="group flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View All
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
