import { cn } from '@/lib/utils';
import type { ChildId } from '@/lib/types';

interface ChildAvatarProps {
  childId: ChildId;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  animated?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-4xl',
};

const ringClasses = {
  sm: 'ring-2 ring-offset-2',
  md: 'ring-3 ring-offset-2',
  lg: 'ring-4 ring-offset-3',
  xl: 'ring-4 ring-offset-4',
};

export function ChildAvatar({ childId, name, size = 'md', showName = false, animated = false }: ChildAvatarProps) {
  const colorClasses = {
    alex: 'bg-gradient-to-br from-alex to-alex-light text-white ring-alex/40 ring-offset-card',
    jaxon: 'bg-gradient-to-br from-jaxon to-jaxon-light text-white ring-jaxon/40 ring-offset-card',
    carson: 'bg-gradient-to-br from-carson to-carson-light text-carson-foreground ring-carson/40 ring-offset-card',
  };

  const shadowClasses = {
    alex: 'shadow-lg shadow-alex/30',
    jaxon: 'shadow-lg shadow-jaxon/30',
    carson: 'shadow-lg shadow-carson/30',
  };

  return (
    <div className={cn('flex items-center gap-3', showName && 'flex-col')}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-extrabold transition-all duration-300',
          sizeClasses[size],
          ringClasses[size],
          colorClasses[childId],
          shadowClasses[childId],
          animated && 'animate-bounce-soft'
        )}
      >
        {name.charAt(0)}
      </div>
      {showName && (
        <span className="font-bold text-foreground">{name}</span>
      )}
    </div>
  );
}
