'use client';

import { useState, useTransition } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { updateParentRequest, deleteParentRequest } from '@/app/actions/parent-requests';
import type { ParentRequestRow } from '@/lib/db/schema';
import { Inbox, Check, Eye, Loader2, Trash2, MessageSquareReply } from 'lucide-react';

const CHILD_NAME: Record<string, string> = { alex: 'Alex', jaxon: 'Jaxon', carson: 'Carson' };
const CHILD_DOT: Record<string, string> = { alex: 'bg-alex', jaxon: 'bg-jaxon', carson: 'bg-carson' };

const CATEGORY_LABEL: Record<string, string> = {
  permission: 'Permission',
  supplies: 'Supplies / money',
  help: 'Help',
  question: 'Question',
  other: 'Other',
};

const STATUS_FLOW: Record<string, { label: string; next: string; icon: typeof Eye }> = {
  new: { label: 'New', next: 'seen', icon: Eye },
  seen: { label: 'Seen', next: 'handling', icon: Loader2 },
  handling: { label: 'Handling', next: 'done', icon: Loader2 },
  done: { label: 'Done', next: 'new', icon: Check },
};

export function ParentRequestsInbox({ requests }: { requests: ParentRequestRow[] }) {
  const [pending, startTransition] = useTransition();
  const [replyFor, setReplyFor] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  const active = requests.filter((r) => r.status !== 'done');
  const done = requests.filter((r) => r.status === 'done');

  function advance(r: ParentRequestRow) {
    const next = STATUS_FLOW[r.status]?.next ?? 'seen';
    startTransition(() => updateParentRequest(r.id, { status: next }));
  }

  function sendReply(r: ParentRequestRow) {
    const text = replyText.trim();
    startTransition(async () => {
      await updateParentRequest(r.id, { response: text, status: 'done' });
      setReplyFor(null);
      setReplyText('');
    });
  }

  function renderRow(r: ParentRequestRow) {
    const flow = STATUS_FLOW[r.status] ?? STATUS_FLOW.new;
    return (
      <li key={r.id} className="rounded-xl border border-border/60 bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn('w-2.5 h-2.5 rounded-full', CHILD_DOT[r.childId] ?? 'bg-muted')} aria-hidden />
              <span className="text-sm font-bold text-foreground">{CHILD_NAME[r.childId] ?? r.childId}</span>
              <span className="text-xs text-muted-foreground">· {CATEGORY_LABEL[r.category] ?? r.category}</span>
            </div>
            <p className="text-sm text-foreground text-pretty">{r.content}</p>
            {r.response ? (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Reply:</span> {r.response}
              </p>
            ) : null}
          </div>
          <span
            className={cn(
              'shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold',
              r.status === 'new'
                ? 'border-primary/40 bg-primary/10 text-primary'
                : r.status === 'done'
                  ? 'border-border bg-muted text-muted-foreground'
                  : 'border-jaxon/40 bg-jaxon/10 text-jaxon'
            )}
          >
            <flow.icon className="w-3.5 h-3.5" aria-hidden />
            {flow.label}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {r.status !== 'done' && (
            <Button size="sm" variant="secondary" disabled={pending} onClick={() => advance(r)}>
              Mark {STATUS_FLOW[r.status]?.next === 'seen' ? 'Seen' : STATUS_FLOW[r.status]?.next === 'handling' ? 'Handling' : 'Done'}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setReplyFor(replyFor === r.id ? null : r.id);
              setReplyText(r.response ?? '');
            }}
          >
            <MessageSquareReply className="w-4 h-4 mr-1" aria-hidden />
            Reply
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={pending}
            onClick={() => startTransition(() => deleteParentRequest(r.id))}
            aria-label="Delete request"
          >
            <Trash2 className="w-4 h-4" aria-hidden />
          </Button>
        </div>

        {replyFor === r.id && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply (this also marks it done)…"
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" disabled={pending || !replyText.trim()} onClick={() => sendReply(r)}>
                Send reply
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setReplyFor(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </li>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-jaxon flex items-center justify-center">
          <Inbox className="w-5 h-5 text-white" aria-hidden />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Ask a Parent</h2>
          <p className="text-sm text-muted-foreground">
            {active.length > 0 ? `${active.length} needing attention` : 'All caught up'}
          </p>
        </div>
      </div>

      {active.length === 0 && done.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No requests from the kids right now.
        </p>
      ) : (
        <div className="space-y-4">
          {active.length > 0 && <ul className="space-y-3">{active.map(renderRow)}</ul>}
          {done.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer text-sm font-semibold text-muted-foreground hover:text-foreground">
                Done ({done.length})
              </summary>
              <ul className="space-y-3 mt-3">{done.map(renderRow)}</ul>
            </details>
          )}
        </div>
      )}
    </Card>
  );
}
