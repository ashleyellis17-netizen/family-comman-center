'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  getParentById,
  getParentEvents,
  getRemindersForParent,
  parentNotes as initialNotes,
} from '@/lib/mock-data';
import type { ParentId } from '@/lib/types';
import { SectionCard } from './section-card';
import { EmptyState } from './state-views';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CalendarDays,
  BellRing,
  StickyNote,
  CalendarPlus,
  ShoppingCart,
  ChefHat,
  PenLine,
  Check,
  UserCog,
} from 'lucide-react';
import Link from 'next/link';

function formatShort(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ParentProfilePageProps {
  parentId: ParentId;
}

export function ParentProfilePage({ parentId }: ParentProfilePageProps) {
  const parent = getParentById(parentId);
  const events = getParentEvents(parentId);
  const [reminders, setReminders] = useState(() => getRemindersForParent(parentId));
  const [notes, setNotes] = useState(() => initialNotes);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  if (!parent) return null;

  const accent = parentId === 'mom' ? 'primary' : 'alex';
  const iconGrad =
    parentId === 'mom'
      ? 'from-primary to-primary/80 text-primary-foreground'
      : 'from-alex to-alex-light text-white';

  const toggleReminder = (id: string) =>
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));

  const addNote = () => {
    const text = noteText.trim();
    if (!text) return;
    setNotes((prev) => [
      { id: `note-${Date.now()}`, author: parent.name, text, createdAt: new Date().toISOString().split('T')[0] },
      ...prev,
    ]);
    setNoteText('');
    setAddingNote(false);
  };

  const quickActions = [
    { label: 'Add Event', icon: CalendarPlus, href: '/calendar' },
    { label: 'Add Grocery Item', icon: ShoppingCart, href: '/grocery-list' },
    { label: 'Add Meal Idea', icon: ChefHat, href: '/meal-ideas' },
    { label: 'Add Parent Note', icon: PenLine, onClick: () => setAddingNote(true) },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
        <div className={cn('h-2 bg-gradient-to-r', iconGrad)} />
        <div className="p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className={cn('w-20 h-20 rounded-3xl bg-gradient-to-br flex items-center justify-center shadow-lg text-3xl font-extrabold shrink-0', iconGrad)}>
            {parent.avatar}
          </div>
          <div>
            <h1 className="cozyla-heading text-foreground">{parent.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <UserCog className="w-4 h-4" />
              <p className="font-medium">{parent.role}</p>
            </div>
            {parent.email && <p className="text-sm text-muted-foreground mt-1">{parent.email}</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickActions.map((a) => {
          const content = (
            <div className={cn('flex flex-col items-center justify-center gap-2 p-5 rounded-3xl bg-card border border-border/50 shadow-sm hover-lift text-center h-full')}>
              <div className={cn('w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md', iconGrad)}>
                <a.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-foreground">{a.label}</span>
            </div>
          );
          return a.href ? (
            <Link key={a.label} href={a.href}>{content}</Link>
          ) : (
            <button key={a.label} onClick={a.onClick} className="text-left">{content}</button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal calendar preview */}
        <SectionCard title="Personal Calendar" subtitle="Upcoming for you" icon={CalendarDays} iconClassName={iconGrad} href="/calendar">
          {events.length === 0 ? (
            <EmptyState title="No events" description="Nothing scheduled right now." icon={CalendarDays} />
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
                <li key={e.id} className="flex items-center gap-4 p-3 rounded-2xl bg-muted/40">
                  <div className={cn('text-center min-w-[52px] rounded-xl p-2', parentId === 'mom' ? 'bg-primary/15' : 'bg-alex/15')}>
                    <p className="text-xs text-muted-foreground">{new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</p>
                    <p className={cn('text-lg font-extrabold', parentId === 'mom' ? 'text-primary' : 'text-alex')}>{new Date(e.date + 'T00:00:00').getDate()}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{e.title}</p>
                    {e.time && <p className="text-xs text-muted-foreground">{e.time}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Assigned reminders */}
        <SectionCard title="Assigned Reminders" subtitle={`${reminders.filter((r) => !r.done).length} open`} icon={BellRing} iconClassName={iconGrad}>
          {reminders.length === 0 ? (
            <EmptyState title="No reminders" icon={BellRing} />
          ) : (
            <ul className="space-y-2">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
                  <button
                    onClick={() => toggleReminder(r.id)}
                    aria-label={r.done ? 'Mark incomplete' : 'Mark complete'}
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors',
                      r.done ? 'bg-success border-success text-success-foreground' : 'border-border bg-card'
                    )}
                  >
                    {r.done && <Check className="w-4 h-4" />}
                  </button>
                  <span className={cn('flex-1 text-sm font-medium', r.done ? 'line-through text-muted-foreground' : 'text-foreground')}>
                    {r.text}
                  </span>
                  {r.dueDate && <span className="text-xs text-muted-foreground shrink-0">{formatShort(r.dueDate)}</span>}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Family notes */}
      <SectionCard title="Family Notes" subtitle="Shared between parents" icon={StickyNote} iconClassName={iconGrad}>
        {addingNote && (
          <div className="flex gap-2 mb-4">
            <Input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a note for the family..."
              onKeyDown={(e) => e.key === 'Enter' && addNote()}
              autoFocus
            />
            <Button onClick={addNote}>Save</Button>
            <Button variant="ghost" onClick={() => { setAddingNote(false); setNoteText(''); }}>Cancel</Button>
          </div>
        )}
        {notes.length === 0 ? (
          <EmptyState title="No notes yet" icon={StickyNote} />
        ) : (
          <ul className="space-y-2">
            {notes.map((n) => (
              <li key={n.id} className="p-3 rounded-2xl bg-muted/40">
                <p className="text-sm text-foreground">{n.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.author} · {formatShort(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
