import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconClassName?: string;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  href,
  linkLabel = 'View All',
  children,
  className,
}: SectionCardProps) {
  return (
    <section className={cn('rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden', className)}>
      <div className="p-5 border-b border-border/50 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md',
                iconClassName
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          </div>
        </div>
        {href && (
          <Link href={href} className="flex items-center gap-1 text-sm text-primary hover:underline group shrink-0">
            {linkLabel}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
