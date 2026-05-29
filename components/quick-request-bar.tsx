'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { quickRequestPresets } from '@/lib/mock-data';
import { colorFor, personLabel } from '@/lib/people';
import { useMessages } from '@/lib/messages-context';
import { RequestIcon } from '@/components/request-icon';
import type { PersonId, QuickRequestKind } from '@/lib/types';
import { Check } from 'lucide-react';

interface QuickRequestBarProps {
  from: PersonId;
  to?: PersonId; // defaults to Mom
  title?: string;
  compact?: boolean;
}

export function QuickRequestBar({
  from,
  to = 'mom',
  title = 'Quick requests',
  compact = false,
}: QuickRequestBarProps) {
  const { sendRequest } = useMessages();
  const [justSent, setJustSent] = useState<QuickRequestKind | null>(null);

  const handleSend = (kind: QuickRequestKind) => {
    sendRequest(to, kind, from);
    setJustSent(kind);
    window.setTimeout(() => setJustSent((k) => (k === kind ? null : k)), 1800);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <span className="text-xs font-semibold text-muted-foreground">
          Sends to {personLabel[to] ?? to}
        </span>
      </div>
      <div
        className={cn(
          'grid gap-2.5',
          compact ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6',
        )}
      >
        {quickRequestPresets.map((preset) => {
          const c = colorFor(preset.color);
          const sent = justSent === preset.kind;
          return (
            <button
              key={preset.kind}
              type="button"
              onClick={() => handleSend(preset.kind)}
              aria-label={`Send request: ${preset.message}`}
              className={cn(
                'group flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition-all active:scale-95',
                sent
                  ? 'border-success/40 bg-success/10'
                  : cn('border-border bg-card hover:-translate-y-0.5 hover:shadow-md', c.border),
              )}
            >
              <span
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
                  sent ? 'bg-success text-white' : c.bg,
                )}
              >
                {sent ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <RequestIcon name={preset.icon} className={cn('h-5 w-5', c.text)} />
                )}
              </span>
              <span className="text-xs font-bold leading-tight">{sent ? 'Sent!' : preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
