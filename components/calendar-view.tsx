'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { children } from '@/lib/mock-data';
import { ChildAvatar } from '@/components/child-avatar';
import { CalendarSubscribe } from '@/components/calendar-subscribe';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Stethoscope,
  Users,
  Trophy,
  MoreHorizontal,
  Clock,
  Briefcase,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ChildId } from '@/lib/types';
import type { EventRow } from '@/lib/db/schema';
import { createEvent, updateEvent, deleteEvent } from '@/app/actions/events';

const categoryIcons = {
  school: GraduationCap,
  sports: Trophy,
  appointment: Stethoscope,
  family: Users,
  work: Briefcase,
  other: MoreHorizontal,
} as const;

const categoryColors = {
  school: 'bg-primary/20 text-primary border-primary/30',
  sports: 'bg-success/20 text-success border-success/30',
  appointment: 'bg-destructive/20 text-destructive border-destructive/30',
  family: 'bg-warning/20 text-warning-foreground border-warning/30',
  work: 'bg-alex/20 text-alex border-alex/30',
  other: 'bg-muted text-muted-foreground border-border',
} as const;

type Category = keyof typeof categoryIcons;
const categories: Category[] = ['school', 'sports', 'appointment', 'family', 'work', 'other'];

type FormState = {
  title: string;
  description: string;
  date: string;
  time: string;
  who: string; // 'all' | 'none' | childId
  category: Category;
};

const emptyForm = (date?: string): FormState => ({
  title: '',
  description: '',
  date: date || new Date().toISOString().split('T')[0],
  time: '',
  who: 'none',
  category: 'family',
});

export function CalendarView({ initialEvents }: { initialEvents: EventRow[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const events = initialEvents;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  const formatDate = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const getEventsForDay = (day: number) => {
    const dateStr = formatDate(day);
    return events.filter((e) => e.date === dateStr);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const todayStr = today.toISOString().split('T')[0];
  const upcomingEvents = [...events]
    .filter((e) => e.date >= todayStr)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  function openAdd(date?: string) {
    setEditingId(null);
    setForm(emptyForm(date));
    setError(null);
    setDialogOpen(true);
  }

  function openEdit(event: EventRow) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      who: event.allChildren ? 'all' : event.childId || 'none',
      category: (event.category as Category) || 'other',
    });
    setError(null);
    setDialogOpen(true);
  }

  function handleSave() {
    setError(null);
    const payload = {
      title: form.title,
      description: form.description,
      date: form.date,
      time: form.time,
      allChildren: form.who === 'all',
      childId: form.who === 'all' || form.who === 'none' ? null : form.who,
      category: form.category,
    };
    if (!payload.title.trim()) {
      setError('Please enter a title.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
      setError('Please pick a date.');
      return;
    }
    startTransition(async () => {
      try {
        if (editingId != null) await updateEvent(editingId, payload);
        else await createEvent(payload);
        setDialogOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.');
      }
    });
  }

  function handleDelete() {
    if (editingId == null) return;
    startTransition(async () => {
      try {
        await deleteEvent(editingId);
        setDialogOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong.');
      }
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="cozyla-heading text-foreground flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1">Family events and appointments</p>
        </div>
        <Button onClick={() => openAdd()} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      <CalendarSubscribe />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 rounded-2xl bg-card shadow-lg border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="touch-target">
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h2 className="text-xl font-bold text-foreground">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="touch-target">
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>

          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-[80px] md:min-h-[100px] p-1 md:p-2 border-b border-r border-border',
                    !day && 'bg-muted/30',
                    day && isToday(day) && 'bg-primary/10',
                    day && 'cursor-pointer hover:bg-muted/40 transition-colors'
                  )}
                  onClick={day ? () => openAdd(formatDate(day)) : undefined}
                >
                  {day && (
                    <>
                      <p
                        className={cn(
                          'text-sm font-medium mb-1',
                          isToday(day)
                            ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center'
                            : 'text-foreground'
                        )}
                      >
                        {day}
                      </p>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => {
                          const CategoryIcon =
                            categoryIcons[event.category as Category] || MoreHorizontal;
                          return (
                            <button
                              key={event.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEdit(event);
                              }}
                              className={cn(
                                'w-full text-left text-xs px-1 py-0.5 rounded truncate border',
                                categoryColors[event.category as Category]
                              )}
                              title={event.title}
                            >
                              <CategoryIcon className="w-3 h-3 inline mr-1" />
                              <span className="hidden md:inline">{event.title}</span>
                            </button>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <p className="text-xs text-muted-foreground">+{dayEvents.length - 2}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="rounded-2xl bg-card shadow-lg border border-border/50 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-bold text-foreground">Upcoming Events</h2>
          </div>

          <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
            {upcomingEvents.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No upcoming events.</p>
            )}
            {upcomingEvents.map((event) => {
              const CategoryIcon = categoryIcons[event.category as Category] || MoreHorizontal;
              const child = event.childId ? children.find((c) => c.id === event.childId) : null;
              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => openEdit(event)}
                  className="w-full text-left p-4 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        categoryColors[event.category as Category]
                      )}
                    >
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{event.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>
                          {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {event.time && (
                          <>
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                          </>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {child && (
                      <ChildAvatar childId={child.id as ChildId} name={child.name} size="sm" />
                    )}
                    {event.allChildren && (
                      <div className="flex -space-x-2">
                        {children.map((c) => (
                          <ChildAvatar
                            key={c.id}
                            childId={c.id as ChildId}
                            name={c.name}
                            size="sm"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-2xl bg-card shadow-lg border border-border/50 p-4">
        <p className="text-sm font-medium text-foreground mb-3">Legend</p>
        <div className="flex flex-wrap gap-4">
          {Object.entries(categoryIcons).map(([category, Icon]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-6 h-6 rounded flex items-center justify-center',
                  categoryColors[category as Category]
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm text-muted-foreground capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId != null ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Soccer Practice"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="event-time">Time (optional)</Label>
                <Input
                  id="event-time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  placeholder="e.g. 4:00 PM"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Who</Label>
                <Select value={form.who} onValueChange={(v) => setForm({ ...form, who: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Whole family / general</SelectItem>
                    <SelectItem value="all">All kids</SelectItem>
                    {children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v as Category })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="event-desc">Notes (optional)</Label>
              <Textarea
                id="event-desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Any extra details"
                rows={2}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
            {editingId != null ? (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isPending}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending} className="gap-2">
                {editingId != null ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
