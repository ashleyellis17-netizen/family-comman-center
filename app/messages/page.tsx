'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { children, parents } from '@/lib/mock-data';
import { colorFor, personLabel } from '@/lib/people';
import { useMessages } from '@/lib/messages-context';
import { PersonAvatar } from '@/components/person-avatar';
import { QuickRequestBar } from '@/components/quick-request-bar';
import { RequestIcon } from '@/components/request-icon';
import { getQuickRequestPreset } from '@/lib/mock-data';
import type { ChatMessage, PersonId, RequestStatus } from '@/lib/types';
import { Send, Check, X, Clock, MessageSquare } from 'lucide-react';

const family: PersonId[] = [...parents.map((p) => p.id), ...children.map((c) => c.id)];

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const statusBadge: Record<RequestStatus, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-carson-muted text-carson' },
  approved: { label: 'Approved', cls: 'bg-success/15 text-success' },
  denied: { label: 'Not now', cls: 'bg-destructive/15 text-destructive' },
  later: { label: 'Maybe later', cls: 'bg-mom-muted text-mom' },
};

export default function MessagesPage() {
  const {
    currentPerson,
    setCurrentPerson,
    threadBetween,
    sendMessage,
    respondToRequest,
    markThreadRead,
    unreadFromPerson,
  } = useMessages();

  const contacts = useMemo(() => family.filter((p) => p !== currentPerson), [currentPerson]);
  const [selected, setSelected] = useState<PersonId>(contacts[0]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the selected contact valid when switching "viewing as".
  useEffect(() => {
    if (selected === currentPerson || !contacts.includes(selected)) {
      setSelected(contacts[0]);
    }
  }, [currentPerson, contacts, selected]);

  const thread = threadBetween(currentPerson, selected);

  // Mark incoming messages from the open thread as read.
  useEffect(() => {
    markThreadRead(selected, currentPerson);
  }, [selected, currentPerson, thread.length, markThreadRead]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [thread.length, selected]);

  const handleSend = () => {
    if (!draft.trim()) return;
    sendMessage(selected, draft);
    setDraft('');
  };

  const isParent = currentPerson === 'mom' || currentPerson === 'dad';

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Header + viewing-as switcher */}
      <header className="boho-card rounded-3xl p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Family Messages</h1>
            <p className="text-sm font-medium text-muted-foreground">
              Tap your face, then send a message or a quick request.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Viewing as</span>
            {family.map((p) => {
              const active = p === currentPerson;
              const c = colorFor(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPerson(p)}
                  className={cn(
                    'flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-bold transition-all',
                    active ? cn(c.bgSolid, 'border-transparent') : 'border-border bg-card hover:bg-secondary',
                  )}
                >
                  <PersonAvatar id={p} size="sm" className={active ? 'bg-white/20' : ''} />
                  {personLabel[p]}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Conversation list */}
        <aside className="lg:col-span-1">
          <div className="boho-card rounded-3xl p-3">
            <p className="px-2 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Conversations</p>
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {contacts.map((p) => {
                const unread = unreadFromPerson(currentPerson, p);
                const last = threadBetween(currentPerson, p).at(-1);
                const active = p === selected;
                const c = colorFor(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelected(p)}
                    className={cn(
                      'flex min-w-[8rem] flex-1 items-center gap-3 rounded-2xl p-3 text-left transition-colors lg:min-w-0 lg:flex-none',
                      active ? c.bg : 'hover:bg-secondary',
                    )}
                  >
                    <div className="relative">
                      <PersonAvatar id={p} />
                      {unread > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[0.7rem] font-extrabold text-destructive-foreground">
                          {unread}
                        </span>
                      )}
                    </div>
                    <div className="hidden min-w-0 flex-1 lg:block">
                      <p className={cn('truncate font-bold', active && c.text)}>{personLabel[p]}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {last ? `${last.from === currentPerson ? 'You: ' : ''}${last.text}` : 'No messages yet'}
                      </p>
                    </div>
                    <p className="font-bold lg:hidden">{personLabel[p]}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Thread */}
        <section className="boho-card flex min-h-[28rem] flex-col rounded-3xl lg:col-span-2">
          {/* Thread header */}
          <div className="flex items-center gap-3 border-b border-border/60 p-4">
            <PersonAvatar id={selected} />
            <div>
              <p className="font-extrabold leading-tight">{personLabel[selected]}</p>
              <p className="text-xs font-semibold text-muted-foreground">
                {currentPerson === 'mom' || currentPerson === 'dad' ? 'Tap a request to respond' : 'Chatting as ' + personLabel[currentPerson]}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {thread.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                  <MessageSquare className="h-7 w-7" />
                </span>
                <p className="font-bold">No messages yet</p>
                <p className="text-sm text-muted-foreground">Send a quick request or say hi.</p>
              </div>
            ) : (
              thread.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  mine={m.from === currentPerson}
                  canRespond={m.to === currentPerson && m.kind === 'request' && m.request?.status === 'pending'}
                  onRespond={respondToRequest}
                />
              ))
            )}
          </div>

          {/* Quick requests */}
          <div className="border-t border-border/60 p-4">
            <QuickRequestBar
              from={currentPerson}
              to={selected}
              compact
              title={isParent ? 'Send a quick note' : 'Quick requests'}
            />
          </div>

          {/* Composer */}
          <div className="flex items-center gap-2 border-t border-border/60 p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message ${personLabel[selected]}…`}
              className="flex-1 rounded-2xl border border-border bg-secondary/50 px-4 py-3 text-sm font-medium outline-none transition-colors focus:border-primary focus:bg-card"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim()}
              aria-label="Send message"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  mine,
  canRespond,
  onRespond,
}: {
  message: ChatMessage;
  mine: boolean;
  canRespond: boolean;
  onRespond: (id: string, status: RequestStatus, reply?: string) => void;
}) {
  const c = colorFor(message.from);
  const preset = message.request ? getQuickRequestPreset(message.request.kind) : undefined;

  return (
    <div className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium shadow-sm sm:max-w-[70%]',
          mine ? cn(c.bgSolid, 'rounded-br-md') : 'rounded-bl-md bg-secondary text-foreground',
        )}
      >
        {message.kind === 'request' && (
          <span className={cn('mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide', mine ? 'opacity-90' : c.text)}>
            <RequestIcon name={preset?.icon} className="h-3.5 w-3.5" />
            Request
          </span>
        )}
        {message.text}
      </div>

      {/* Request status / actions */}
      {message.kind === 'request' && message.request && (
        <div className="flex items-center gap-2">
          {canRespond ? (
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onRespond(message.id, 'approved', 'Yes, go ahead!')}
                className="flex items-center gap-1 rounded-full bg-success px-3 py-1 text-xs font-bold text-white transition-opacity hover:opacity-90"
              >
                <Check className="h-3.5 w-3.5" /> Yes
              </button>
              <button
                type="button"
                onClick={() => onRespond(message.id, 'later', 'Maybe in a little while.')}
                className="flex items-center gap-1 rounded-full bg-mom px-3 py-1 text-xs font-bold text-mom-foreground transition-opacity hover:opacity-90"
              >
                <Clock className="h-3.5 w-3.5" /> Later
              </button>
              <button
                type="button"
                onClick={() => onRespond(message.id, 'denied', 'Not right now.')}
                className="flex items-center gap-1 rounded-full bg-destructive px-3 py-1 text-xs font-bold text-destructive-foreground transition-opacity hover:opacity-90"
              >
                <X className="h-3.5 w-3.5" /> No
              </button>
            </div>
          ) : (
            <span className={cn('rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold', statusBadge[message.request.status].cls)}>
              {statusBadge[message.request.status].label}
            </span>
          )}
        </div>
      )}

      <span className="px-1 text-[0.7rem] font-medium text-muted-foreground">{formatTime(message.createdAt)}</span>
    </div>
  );
}
