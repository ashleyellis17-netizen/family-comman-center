import { cn } from '@/lib/utils';
import { colorFor, personLabel } from '@/lib/people';
import type { PersonId } from '@/lib/types';

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-11 w-11 text-base',
  lg: 'h-14 w-14 text-xl',
};

export function PersonAvatar({
  id,
  size = 'md',
  className,
}: {
  id: PersonId;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const c = colorFor(id);
  const label = personLabel[id] ?? id;
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-extrabold',
        c.bgSolid,
        sizeClasses[size],
        className,
      )}
      aria-hidden="true"
    >
      {label.charAt(0)}
    </span>
  );
}
