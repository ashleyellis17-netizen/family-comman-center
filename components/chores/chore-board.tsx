'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Plus, Repeat, Star, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ChildAvatar } from '@/components/child-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { act, useActionData } from '@/lib/client-actions'
import { addDays, formatDate } from '@/lib/dates'
import { FAMILY_KIDS, WEEKDAYS, recurrenceLabel } from '@/lib/chores'
import type { ChoreRecurrence } from '@/lib/db/schema'
import type { ChildId } from '@/lib/types'
import { archiveChore, createChore, listChoreWeek, restoreChore, setChoreDone, type ChoreOccurrence } from '@/app/actions/chores'
import { kidStyle } from './kid-styles'

type KidFilter = 'all' | string

export function ChoreBoard() {
  const { data, error, isLoading, mutate } = useActionData('chores', listChoreWeek)
  const [kid, setKid] = useState<KidFilter>('all')
  const [showForm, setShowForm] = useState(false)

  async function toggle(o: ChoreOccurrence) {
    const done = !o.done
    mutate(
      (d) =>
        d && {
          ...d,
          occurrences: d.occurrences.map((x) => (x.choreId === o.choreId && x.date === o.date ? { ...x, done } : x)),
          balances: { ...d.balances, [o.assignee]: (d.balances[o.assignee] ?? 0) + (done ? o.points : -o.points) },
        },
      { revalidate: false },
    )
    const ok = await act(setChoreDone({ choreId: o.choreId, date: o.date, done }))
    mutate()
    if (ok && done) {
      toast.success(`${o.title} done${o.points ? ` (+${o.points} pts)` : ''}`, {
        action: { label: 'Undo', onClick: async () => { await act(setChoreDone({ choreId: o.choreId, date: o.date, done: false })); mutate() } },
      })
    }
  }

  async function remove(id: number, title: string) {
    if (!(await act(archiveChore(id)))) return
    mutate()
    toast(`Removed ${title}. Points already earned are kept.`, {
      action: { label: 'Undo', onClick: async () => { await act(restoreChore(id)); mutate() } },
    })
  }

  if (error) return <p className="text-destructive">{error.message}</p>

  const today = data?.today
  const occurrences = (data?.occurrences ?? []).filter((o) => kid === 'all' || o.assignee === kid)
  const todays = (data?.occurrences ?? []).filter((o) => o.date === today)
  const doneToday = todays.filter((o) => o.done).length

  const groups = new Map<string, ChoreOccurrence[]>()
  for (const o of occurrences) {
    const key = today && o.date < today ? 'overdue' : o.date
    groups.set(key, [...(groups.get(key) ?? []), o])
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader title="Chores" description="Check things off on the day. Points go toward rewards." />
        {data?.canManage && (
          <Button onClick={() => setShowForm((s) => !s)} className="h-12 rounded-xl" size="lg">
            <Plus className="size-5" aria-hidden="true" />
            New chore
          </Button>
        )}
      </div>

      <section aria-label="Today and points" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {FAMILY_KIDS.map((k) => {
          const mine = todays.filter((o) => o.assignee === k.id)
          const s = kidStyle(k.id)
          return (
            <div key={k.id} className={cn('flex items-center gap-3 rounded-2xl border bg-card p-4', s.ring)}>
              <ChildAvatar childId={k.id as ChildId} name={k.name} size="md" />
              <div className="flex flex-1 flex-col">
                <span className="font-semibold text-foreground">{k.name}</span>
                <span className="text-sm text-muted-foreground">
                  {mine.filter((o) => o.done).length}/{mine.length} today
                </span>
              </div>
              <div className={cn('flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold', s.soft, s.text)}>
                <Star className="size-4" aria-hidden="true" />
                {data?.balances[k.id] ?? 0}
              </div>
            </div>
          )
        })}
      </section>

      {showForm && data?.canManage && <NewChoreForm onDone={() => { setShowForm(false); mutate() }} />}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by kid">
        <Button variant={kid === 'all' ? 'default' : 'secondary'} size="sm" className="rounded-xl" onClick={() => setKid('all')} aria-pressed={kid === 'all'}>
          Everyone
        </Button>
        {FAMILY_KIDS.map((k) => (
          <Button
            key={k.id}
            size="sm"
            variant={kid === k.id ? 'default' : 'secondary'}
            className={cn('rounded-xl', kid === k.id && kidStyle(k.id).solid)}
            onClick={() => setKid(k.id)}
            aria-pressed={kid === k.id}
          >
            {k.name}
          </Button>
        ))}
        {todays.length > 0 && (
          <span className="ml-auto text-sm text-muted-foreground">
            {doneToday} of {todays.length} done today
          </span>
        )}
      </div>

      {isLoading && !data ? (
        <p className="text-muted-foreground">Loading chores…</p>
      ) : groups.size === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-medium text-foreground">No chores this week</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {data?.canManage ? 'Add a daily or weekly chore to get started.' : 'A parent can add chores.'}
          </p>
        </div>
      ) : (
        [...groups.entries()].map(([key, items]) => (
          <section key={key} aria-labelledby={`day-${key}`} className={cn('overflow-hidden rounded-2xl border bg-card', key === today ? 'border-primary/50' : 'border-border/50')}>
            <h2 id={`day-${key}`} className={cn('flex items-center justify-between px-4 py-3 font-semibold', key === 'overdue' ? 'bg-destructive/10 text-destructive' : key === today ? 'bg-primary/10 text-foreground' : 'text-foreground')}>
              <span>{key === 'overdue' ? 'Overdue' : key === today ? 'Today' : key === (today && addDays(today, 1)) ? 'Tomorrow' : formatDate(key, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              <span className="text-sm font-normal text-muted-foreground">{items.filter((o) => o.done).length}/{items.length}</span>
            </h2>
            <ul className="divide-y divide-border/50">
              {items.map((o) => {
                const future = !!today && o.date > today
                const name = FAMILY_KIDS.find((k) => k.id === o.assignee)?.name ?? o.assignee
                const repeat = recurrenceLabel(o)
                return (
                  <li key={`${o.choreId}-${o.date}`} className={cn('flex items-center gap-3 p-3', o.done && 'bg-success/5')}>
                    <button
                      type="button"
                      onClick={() => toggle(o)}
                      disabled={future}
                      aria-pressed={o.done}
                      aria-label={`${o.done ? 'Mark not done' : 'Mark done'}: ${o.title} for ${name}`}
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                        o.done ? 'border-success bg-success text-success-foreground' : 'border-border hover:border-primary',
                      )}
                    >
                      {o.done && <Check className="size-5" aria-hidden="true" />}
                    </button>
                    <ChildAvatar childId={o.assignee as ChildId} name={name} size="sm" />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className={cn('font-medium', o.done ? 'text-muted-foreground line-through' : 'text-foreground')}>{o.title}</span>
                      <span className="flex items-center gap-2 truncate text-sm text-muted-foreground">
                        {repeat && (
                          <span className="flex items-center gap-1">
                            <Repeat className="size-3" aria-hidden="true" />
                            {repeat}
                          </span>
                        )}
                        {o.description}
                      </span>
                    </div>
                    {o.points > 0 && <span className={cn('rounded-full px-2 py-1 text-sm font-semibold', kidStyle(o.assignee).soft, kidStyle(o.assignee).text)}>{o.points} pts</span>}
                    {data?.canManage && (
                      <Button variant="ghost" size="icon" onClick={() => remove(o.choreId, o.title)} aria-label={`Remove chore ${o.title}`}>
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

function NewChoreForm({ onDone }: { onDone: () => void }) {
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState(FAMILY_KIDS[0]?.id ?? '')
  const [points, setPoints] = useState('5')
  const [recurrence, setRecurrence] = useState<ChoreRecurrence>('daily')
  const [weekday, setWeekday] = useState('6')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await act(
      createChore({ title, assignee, points: Number(points), recurrence, weekday: Number(weekday), dueDate: dueDate || null }),
      'Chore added',
    )
    setSaving(false)
    if (res) onDone()
  }

  const selectClass = 'h-11 rounded-md border border-input bg-background px-3 text-base text-foreground'

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-4 rounded-2xl border border-border/50 bg-card p-4 md:grid-cols-2">
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="chore-title">Chore</Label>
        <Input id="chore-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Feed the dog" className="h-11" required maxLength={80} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="chore-kid">For</Label>
        <select id="chore-kid" value={assignee} onChange={(e) => setAssignee(e.target.value)} className={selectClass}>
          {FAMILY_KIDS.map((k) => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="chore-points">Points</Label>
        <Input id="chore-points" type="number" min={0} max={1000} value={points} onChange={(e) => setPoints(e.target.value)} className="h-11" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="chore-repeat">Repeats</Label>
        <select id="chore-repeat" value={recurrence} onChange={(e) => setRecurrence(e.target.value as ChoreRecurrence)} className={selectClass}>
          <option value="daily">Every day</option>
          <option value="weekly">Once a week</option>
          <option value="once">Just once</option>
        </select>
      </div>
      {recurrence === 'weekly' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="chore-weekday">Day</Label>
          <select id="chore-weekday" value={weekday} onChange={(e) => setWeekday(e.target.value)} className={selectClass}>
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </div>
      )}
      {recurrence === 'once' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="chore-date">Date</Label>
          <Input id="chore-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="h-11" />
        </div>
      )}
      <div className="flex justify-end gap-2 md:col-span-2">
        <Button type="submit" size="lg" className="h-11 rounded-xl" disabled={saving || !title.trim()}>
          {saving ? 'Saving…' : 'Add chore'}
        </Button>
      </div>
    </form>
  )
}
