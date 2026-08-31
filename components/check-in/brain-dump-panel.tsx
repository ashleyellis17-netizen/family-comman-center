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
import { Lightbulb, Plus, Check, Trash2, MoreHorizontal, BookOpen } from 'lucide-react';
import type { BrainDumpRow } from '@/lib/db/schema';
import { createBrainDump, updateBrainDump, deleteBrainDump } from '@/app/actions/brain-dump';
import { createAssignment } from '@/app/actions/school';
import { getAccent } from './shared';

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

  function add() {
    const content = text.trim();
    if (!content) return;
    startTransition(async () => {
      await createBrainDump({ childId, content });
      setText('');
    });
  }

  function markDone(id: number, convertedTo?: string) {
    startTransition(async () => {
      await updateBrainDump(id, { status: convertedTo ? 'converted' : 'done', convertedTo });
    });
  }

  function turnIntoHomework(item: BrainDumpRow) {
    startTransition(async () => {
      await createAssignment({ childId, title: item.content, type: 'homework', status: 'Not Started' });
      await updateBrainDump(item.id, { status: 'converted', convertedTo: 'assignment' });
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      await deleteBrainDump(id);
    });
  }

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
            <li key={item.id} className="flex items-center gap-2 rounded-2xl bg-muted/40 px-4 py-3">
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
                  <Button variant="ghost" size="icon" className="shrink-0" aria-label="More options">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => turnIntoHomework(item)}>
                    <BookOpen className="w-4 h-4" />
                    Turn into homework
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => remove(item.id)} className="text-destructive focus:text-destructive">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
