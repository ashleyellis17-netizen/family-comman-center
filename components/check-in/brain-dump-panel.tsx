'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Lightbulb,
  Plus,
  Check,
  Trash2,
  MoreHorizontal,
  BookOpen,
  Sunrise,
  CalendarPlus,
  HandHelping,
  ShoppingCart,
  HelpCircle,
} from 'lucide-react';
import type { BrainDumpRow } from '@/lib/db/schema';
import { createBrainDump, updateBrainDump, deleteBrainDump } from '@/app/actions/brain-dump';
import { createAssignment } from '@/app/actions/school';
import { createEvent } from '@/app/actions/events';
import { createParentRequest } from '@/app/actions/parent-requests';
import { todayISO } from '@/lib/checkin';
import { getAccent } from './shared';

function tomorrowISO(): string {
  const d = new Date(todayISO() + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

type Route = 'prep' | 'calendar' | 'ask' | 'school' | 'shopping';

// Full literal class strings per child so Tailwind generates the hover variants
// (dynamically concatenated class names would be missed by the scanner).
const CHIP_CLASS: Record<string, string> = {
  alex: 'border-alex/30 hover:bg-alex/10 hover:text-alex',
  jaxon: 'border-jaxon/30 hover:bg-jaxon/10 hover:text-jaxon',
  carson: 'border-carson/30 hover:bg-carson/10 hover:text-carson',
};

export function BrainDumpPanel({
  childId,
  items,
  compact = false,
}: {
  childId: string;
  items: BrainDumpRow[];
  compact?: boolean;
}) {
  const accent = getAccent(childId);
  const [text, setText] = useState('');
  const [isPending, startTransition] = useTransition();

  const open = items.filter((i) => i.status === 'open');
  // The most recently added open item gets inline routing chips right away.
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  function add() {
    const content = text.trim();
    if (!content) return;
    startTransition(async () => {
      const created = await createBrainDump({ childId, content });
      setText('');
      if (created?.id) setJustAddedId(created.id);
    });
  }

  function markDone(id: number, convertedTo?: string) {
    startTransition(async () => {
      await updateBrainDump(id, { status: convertedTo ? 'converted' : 'done', convertedTo });
      if (justAddedId === id) setJustAddedId(null);
    });
  }

  // One-tap routing: send the note where it actually belongs, using real actions.
  function route(item: BrainDumpRow, dest: Route) {
    startTransition(async () => {
      const title = item.content;
      if (dest === 'prep') {
        await createAssignment({ childId, title, type: 'other', dueDate: tomorrowISO(), status: 'Not Started', notes: 'Prep for tomorrow' });
      } else if (dest === 'calendar') {
        await createEvent({ title, date: tomorrowISO(), childId, category: 'Personal' });
      } else if (dest === 'ask') {
        await createParentRequest({ childId, content: title, category: 'question' });
      } else if (dest === 'school') {
        await createAssignment({ childId, title, type: 'homework', status: 'Not Started' });
      } else if (dest === 'shopping') {
        await createParentRequest({ childId, content: title, category: 'supplies' });
      }
      await updateBrainDump(item.id, { status: 'converted', convertedTo: dest });
      if (justAddedId === item.id) setJustAddedId(null);
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      await deleteBrainDump(id);
      if (justAddedId === id) setJustAddedId(null);
    });
  }

  const ROUTES: { dest: Route; label: string; icon: React.ElementType }[] = [
    { dest: 'prep', label: 'Prep for tomorrow', icon: Sunrise },
    { dest: 'calendar', label: 'Add to calendar', icon: CalendarPlus },
    { dest: 'ask', label: 'Ask a parent', icon: HandHelping },
    { dest: 'school', label: 'School item', icon: BookOpen },
    { dest: 'shopping', label: 'Need to buy it', icon: ShoppingCart },
  ];

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', accent.soft)}>
          <Lightbulb className={cn('w-5 h-5', accent.text)} />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-foreground">Don&apos;t Forget!</h3>
          <p className="text-xs text-muted-foreground font-medium">Dump anything on your mind</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Type it before you forget…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) add();
          }}
        />
        <Button onClick={add} disabled={isPending || !text.trim()} className={cn('touch-target', accent.solid)}>
          <Plus className="w-4 h-4" />
          <span className="sr-only">Add</span>
        </Button>
      </div>

      {open.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">Nothing here right now. Nice and clear!</p>
      ) : (
        <ul className={cn('mt-4 space-y-2', compact && 'max-h-64 overflow-y-auto')}>
          {open.map((item) => (
            <li key={item.id} className="rounded-2xl bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="flex-1 text-foreground font-medium break-words">{item.content}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-success hover:text-success"
                  onClick={() => markDone(item.id)}
                  aria-label="Mark handled"
                >
                  <Check className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0" aria-label="Where should this go?">
                      <MoreHorizontal className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {ROUTES.map((r) => (
                      <DropdownMenuItem key={r.dest} onClick={() => route(item, r.dest)}>
                        <r.icon className="w-4 h-4" />
                        {r.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={() => remove(item.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Right after capture, offer one-tap routing so it lands in the right place. */}
              {justAddedId === item.id && (
                <div className="mt-3 border-t border-border/60 pt-3">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    Where should this go?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ROUTES.map((r) => (
                      <button
                        key={r.dest}
                        type="button"
                        onClick={() => route(item, r.dest)}
                        disabled={isPending}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition-colors',
                          CHIP_CLASS[childId] ?? 'border-border'
                        )}
                      >
                        <r.icon className="w-4 h-4" aria-hidden="true" />
                        {r.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setJustAddedId(null)}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Not sure yet
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
