'use client'

import { useState } from 'react'
import { Minus, Plus, StickyNote, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ChildAvatar } from '@/components/child-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { act, newKey, useActionData } from '@/lib/client-actions'
import { FAMILY_KIDS } from '@/lib/chores'
import type { ChildId } from '@/lib/types'
import type { BehaviorKind } from '@/lib/db/schema'
import { addBehaviorNote, deleteBehaviorNote, listBehavior } from '@/app/actions/behavior'
import { kidStyle } from '@/components/chores/kid-styles'

const KINDS: { id: BehaviorKind; label: string; icon: typeof Plus }[] = [
  { id: 'positive', label: 'Positive', icon: Plus },
  { id: 'concern', label: 'Concern', icon: Minus },
  { id: 'note', label: 'Note', icon: StickyNote },
]

export function BehaviorLog() {
  const { data, error, mutate } = useActionData('behavior', listBehavior)
  const [filter, setFilter] = useState<string>('all')

  if (error) return <p className="text-destructive">{error.message}</p>

  const notes = (data?.notes ?? []).filter((n) => filter === 'all' || n.assignee === filter)

  async function remove(id: number) {
    if (!window.confirm('Delete this note? Any points it gave or took will be reversed.')) return
    await act(deleteBehaviorNote(id), 'Note deleted')
    mutate()
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader title="Behavior" description="Positive notes can add points and concerns can remove them. Points share the same balance as chores." />

      {data?.canManage && data && <BehaviorForm today={data.today} onSaved={() => mutate()} />}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by kid">
        {[{ id: 'all', name: 'Everyone' }, ...FAMILY_KIDS].map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setFilter(k.id)}
            aria-pressed={filter === k.id}
            className={cn('h-10 rounded-full border px-4 text-sm font-medium', filter === k.id ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-muted')}
          >
            {k.name}
          </button>
        ))}
      </div>

      {!data ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">No behavior notes yet.</div>
      ) : (
        <ul className="flex flex-col divide-y rounded-2xl border bg-card">
          {notes.map((n) => {
            const name = FAMILY_KIDS.find((k) => k.id === n.assignee)?.name ?? n.assignee
            return (
              <li key={n.id} className="flex items-start gap-3 px-4 py-3">
                <ChildAvatar childId={n.assignee as ChildId} name={name} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="text-sm text-muted-foreground">
                    <span className={cn('font-medium', kidStyle(n.assignee).text)}>{name}</span> · {n.date}
                  </p>
                  <p className="text-foreground text-pretty leading-relaxed">{n.note}</p>
                </div>
                {n.points !== 0 && (
                  <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold', n.points > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                    {n.points > 0 ? `+${n.points}` : n.points} pts
                  </span>
                )}
                {data.canManage && (
                  <Button variant="ghost" size="icon" onClick={() => remove(n.id)} aria-label={`Delete note about ${name}`}>
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function BehaviorForm({ today, onSaved }: { today: string; onSaved: () => void }) {
  const [assignee, setAssignee] = useState(FAMILY_KIDS[0]?.id ?? '')
  const [kind, setKind] = useState<BehaviorKind>('positive')
  const [note, setNote] = useState('')
  const [points, setPoints] = useState('5')
  const [date, setDate] = useState(today)
  const [key, setKey] = useState(() => newKey('behavior'))
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    const ok = await act(addBehaviorNote({ clientKey: key, assignee, kind, note, points: kind === 'note' ? 0 : Number(points), date }), 'Note saved')
    setSaving(false)
    if (ok) {
      setNote('')
      setKey(newKey('behavior'))
      onSaved()
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Kid">
        {FAMILY_KIDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setAssignee(k.id)}
            aria-pressed={assignee === k.id}
            className={cn('h-11 rounded-xl border px-4 font-medium', assignee === k.id ? kidStyle(k.id).solid : 'bg-background text-foreground hover:bg-muted')}
          >
            {k.name}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Type">
        {KINDS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            aria-pressed={kind === id}
            className={cn('flex h-11 items-center gap-1.5 rounded-xl border px-4 font-medium', kind === id ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted')}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="b-note">What happened</Label>
        <Input id="b-note" value={note} onChange={(e) => setNote(e.target.value)} required maxLength={400} className="h-11" />
      </div>
      <div className="flex flex-wrap gap-3">
        {kind !== 'note' && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="b-points">{kind === 'positive' ? 'Points to add' : 'Points to remove'}</Label>
            <Input id="b-points" type="number" min={0} max={500} value={points} onChange={(e) => setPoints(e.target.value)} className="h-11 w-32" />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="b-date">Date</Label>
          <Input id="b-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11" />
        </div>
      </div>
      <Button type="submit" disabled={saving} className="h-11 self-start">{saving ? 'Saving…' : 'Save note'}</Button>
    </form>
  )
}
