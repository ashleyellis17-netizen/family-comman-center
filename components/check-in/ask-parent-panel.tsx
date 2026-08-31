'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HandHelping, Send, Trash2, MessageCircle } from 'lucide-react';
import type { ParentRequestRow } from '@/lib/db/schema';
import {
  createParentRequest,
  deleteParentRequest,
} from '@/app/actions/parent-requests';
import { REQUEST_CATEGORIES } from '@/lib/checkin';
import { getAccent } from './shared';

const statusMeta: Record<string, { label: string; className: string }> = {
  new: { label: 'Sent', className: 'bg-primary/12 text-primary border-primary/30' },
  seen: { label: 'Seen', className: 'bg-secondary text-secondary-foreground border-border' },
  handling: { label: 'Working on it', className: 'bg-warning/20 text-warning-foreground border-warning/40' },
  done: { label: 'Done', className: 'bg-success/15 text-success border-success/30' },
};

const categoryLabel: Record<string, string> = Object.fromEntries(
  REQUEST_CATEGORIES.map((c) => [c.value, c.label])
);

export function AskParentPanel({
  childId,
  items,
  compact = false,
}: {
  childId: string;
  items: ParentRequestRow[];
  compact?: boolean;
}) {
  const accent = getAccent(childId);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('question');
  const [isPending, startTransition] = useTransition();

  function send() {
    if (!content.trim()) return;
    startTransition(async () => {
      await createParentRequest({ childId, content, category });
      setContent('');
      setCategory('question');
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      await deleteParentRequest(id);
    });
  }

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', accent.soft)}>
          <HandHelping className={cn('w-5 h-5', accent.text)} />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-foreground">Ask a Parent</h3>
          <p className="text-xs text-muted-foreground font-medium">Send Mom or Dad a request</p>
        </div>
      </div>

      <div className="space-y-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {REQUEST_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          placeholder="What do you need? e.g. I need poster board for my project"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
        />
        <Button onClick={send} disabled={isPending || !content.trim()} className={cn('w-full touch-target font-bold', accent.solid)}>
          <Send className="w-4 h-4" />
          Send to Parents
        </Button>
      </div>

      {items.length > 0 && (
        <ul className={cn('mt-5 space-y-2.5', compact && 'max-h-64 overflow-y-auto')}>
          {items.map((r) => {
            const meta = statusMeta[r.status] ?? statusMeta.new;
            return (
              <li key={r.id} className="rounded-2xl bg-muted/40 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground">{categoryLabel[r.category] ?? 'Request'}</p>
                    <p className="text-foreground font-medium break-words">{r.content}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', meta.className)}>
                      {meta.label}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete request">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {r.response && (
                  <div className="mt-2 flex items-start gap-2 rounded-xl bg-card border border-border/60 px-3 py-2">
                    <MessageCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <p className="text-sm text-foreground"><span className="font-bold">Parent:</span> {r.response}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
