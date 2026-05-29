'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useMessages } from '@/lib/messages-context';
import { colorFor, personLabel } from '@/lib/people';
import { PersonAvatar } from '@/components/person-avatar';
import { RequestIcon } from '@/components/request-icon';
import { getQuickRequestPreset } from '@/lib/mock-data';
import { ArrowRight, Check, Clock, X, Inbox } from 'lucide-react';

function timeAgo(iso: string) {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  const h = Math.round(diff / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function MessagesWidget() {
  const { currentPerson, pendingRequestsFor, respondToRequest, unreadFor } = useMessages();
  const pending = pendingRequestsFor(currentPerson);
  const unread = unreadFor(currentPerson);

  return (
    <section className="boho-card rounded-3xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold tracking-tight">Family Requests</h2>
          {unread > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-extrabold text-destructive-foreground">
              {unread}
            </span>
          )}
        </div>
        <Link href="/messages" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
          Messages <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <p className="mb-3 text-xs font-semibold text-muted-foreground">
        Viewing as {personLabel[currentPerson]} · change in Messages
      </p>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-secondary/40 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </span>
          <p className="font-bold">No pending requests</p>
          <p className="text-sm text-muted-foreground">The boys can tap a request to reach you here.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {pending.map((m) => {
            const c = colorFor(m.from);
            const preset = m.request ? getQuickRequestPreset(m.request.kind) : undefined;
            return (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-secondary/50 p-3">
                <PersonAvatar id={m.from} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-bold">
                    <RequestIcon name={preset?.icon} className={cn('h-3.5 w-3.5', c.text)} />
                    {personLabel[m.from]}
                    <span className="text-xs font-medium text-muted-foreground">· {timeAgo(m.createdAt)}</span>
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{m.text}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => respondToRequest(m.id, 'approved', 'Yes, go ahead!')}
                    aria-label="Approve"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-success text-white transition-opacity hover:opacity-90"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => respondToRequest(m.id, 'later', 'Maybe in a little while.')}
                    aria-label="Maybe later"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-mom text-mom-foreground transition-opacity hover:opacity-90"
                  >
                    <Clock className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => respondToRequest(m.id, 'denied', 'Not right now.')}
                    aria-label="Deny"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive text-destructive-foreground transition-opacity hover:opacity-90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
