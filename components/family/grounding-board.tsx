'use client'

import { useState } from 'react'
import { Check, Lock, Plus, RotateCcw, X } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { ChildAvatar } from '@/components/child-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { act, useActionData } from '@/lib/client-actions'
import { FAMILY_KIDS } from '@/lib/chores'
import { addDays } from '@/lib/dates'
import type { ChildId } from '@/lib/types'
import { addEarnBackTask, createGrounding, listGroundings, resolveGrounding, setEarnBackTaskDone } from '@/app/actions/grounding'
import { kidStyle } from '@/components/chores/kid-styles'

type Data = Extract<Awaited<ReturnType<typeof listGroundings>>, { ok: true }>['data']
type Grounding = Data['open'][number]

const kidName = (id: string) => FAMILY_KIDS.find((k) => k.id === id)?.name ?? id

function restrictionLabels(g: Grounding) {
  return [g.blocksElectronics && 'Electronics', g.blocksAllowance && 'Allowance', g.blocksRewards && 'Rewards'].filter(Boolean) as string[]
}

export function GroundingBoard({ mode = 'grounding' }: { mode?: 'grounding' | 'earn-back' }) {
  const { data, error, mutate } = useActionData('groundings', listGroundings)
  const [showForm, setShowForm] = useState(false)

  if (error) return <p className="text-destructive">{error.message}</p>

  const open = (data?.open ?? []).filter((g) => mode === 'grounding' || g.earnBackEnabled)
  const isEarnBack = mode === 'earn-back'

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <PageHeader
          title={isEarnBack ? 'Earn Back Plan' : 'Grounding & Eligibility'}
          description={
            isEarnBack
              ? 'Finish every task, then a parent approves ending the grounding early.'
              : 'Groundings pause allowance, electronics, or rewards until they end or are earned back.'
          }
        />
        {data?.canManage && !isEarnBack && (
          <Button onClick={() => setShowForm((s) => !s)} size="lg" className="h-12 rounded-xl">
            <Plus className="size-5" aria-hidden="true" />
            New grounding
          </Button>
        )}
      </div>

      {!isEarnBack && data && (
        <section aria-label="Eligibility" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {FAMILY_KIDS.map((k) => {
            const active = data.open.filter((g) => g.assignee === k.id && g.startDate <= data.today && g.endDate >= data.today)
            const blocked = new Set(active.flatMap(restrictionLabels))
            const s = kidStyle(k.id)
            return (
              <div key={k.id} className={cn('flex flex-col gap-3 rounded-2xl border bg-card p-4', s.ring)}>
                <div className="flex items-center gap-3">
                  <ChildAvatar childId={k.id as ChildId} name={k.name} size="sm" />
                  <span className="font-semibold text-foreground">{k.name}</span>
                </div>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {['Electronics', 'Allowance', 'Rewards'].map((r) => (
                    <li key={r} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{r}</span>
                      {blocked.has(r) ? (
                        <span className="flex items-center gap-1 font-medium text-destructive">
                          <Lock className="size-3.5" aria-hidden="true" /> Paused
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-medium text-success">
                          <Check className="size-3.5" aria-hidden="true" /> Allowed
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>
      )}

      {showForm && data && <GroundingForm today={data.today} onDone={() => { setShowForm(false); mutate() }} />}

      {!data ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : open.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-8 text-center text-muted-foreground">
          {isEarnBack ? 'No earn-back plans right now.' : 'Nobody is grounded. Everyone is eligible.'}
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {open.map((g) => (
            <GroundingCard key={g.id} g={g} today={data.today} canManage={data.canManage} canCheck={data.canCheck} onChange={() => mutate()} />
          ))}
        </ul>
      )}

      {!isEarnBack && (data?.recent.length ?? 0) > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Recently ended</h2>
          <ul className="flex flex-col divide-y rounded-2xl border bg-card">
            {data!.recent.map((g) => (
              <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <span>
                  <span className="font-medium text-foreground">{kidName(g.assignee)}</span>
                  <span className="text-muted-foreground"> · {g.reason}</span>
                </span>
                <span className="text-muted-foreground">{g.resolution === 'earned_back' ? 'Earned back' : 'Ended by parent'}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function GroundingCard({ g, today, canManage, canCheck, onChange }: { g: Grounding; today: string; canManage: boolean; canCheck: boolean; onChange: () => void }) {
  const [newTask, setNewTask] = useState('')
  const [busy, setBusy] = useState(false)
  const done = g.tasks.filter((t) => t.doneAt).length
  const ended = g.endDate < today
  const upcoming = g.startDate > today
  const s = kidStyle(g.assignee)

  async function toggle(id: number, value: boolean) {
    setBusy(true)
    await act(setEarnBackTaskDone(id, value))
    setBusy(false)
    onChange()
  }

  async function resolve(resolution: 'earned_back' | 'override') {
    if (resolution === 'override' && !window.confirm(`End ${kidName(g.assignee)}'s grounding now?`)) return
    setBusy(true)
    await act(resolveGrounding(g.id, resolution), resolution === 'earned_back' ? 'Earned back — grounding ended' : 'Grounding ended')
    setBusy(false)
    onChange()
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTask.trim()) return
    const ok = await act(addEarnBackTask(g.id, newTask))
    if (ok) setNewTask('')
    onChange()
  }

  return (
    <li className={cn('flex flex-col gap-4 rounded-2xl border bg-card p-5', s.ring)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ChildAvatar childId={g.assignee as ChildId} name={kidName(g.assignee)} size="sm" />
          <div>
            <p className="font-semibold text-foreground">{kidName(g.assignee)}</p>
            <p className="text-sm text-muted-foreground text-pretty">{g.reason}</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-medium text-foreground">
            {upcoming ? `Starts ${g.startDate}` : ended ? `Ended ${g.endDate}` : `Until ${g.endDate}`}
          </p>
          <p className="text-muted-foreground">{restrictionLabels(g).join(', ') || 'No restrictions'} paused</p>
        </div>
      </div>

      {g.earnBackEnabled && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <RotateCcw className="size-4" aria-hidden="true" /> Earn back
            </span>
            <span className="text-muted-foreground">
              {done}/{g.tasks.length} done
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {g.tasks.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  disabled={!canCheck || busy}
                  onClick={() => toggle(t.id, !t.doneAt)}
                  aria-pressed={!!t.doneAt}
                  className={cn(
                    'flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 text-left transition-colors disabled:cursor-not-allowed',
                    t.doneAt ? 'border-success/40 bg-success/10' : 'bg-background hover:bg-muted',
                  )}
                >
                  <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border-2', t.doneAt ? 'border-success bg-success text-success-foreground' : 'border-muted-foreground/40')}>
                    {t.doneAt && <Check className="size-4" aria-hidden="true" />}
                  </span>
                  <span className={cn('text-foreground', t.doneAt && 'text-muted-foreground line-through')}>{t.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canManage && (
        <div className="flex flex-col gap-3 border-t pt-4">
          <form onSubmit={addTask} className="flex gap-2">
            <Label htmlFor={`task-${g.id}`} className="sr-only">Add earn-back task</Label>
            <Input id={`task-${g.id}`} value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add an earn-back task" className="h-11" maxLength={120} />
            <Button type="submit" variant="outline" className="h-11">Add</Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {g.status === 'review' && (
              <Button onClick={() => resolve('earned_back')} disabled={busy} className="h-11">
                <Check className="size-4" aria-hidden="true" /> Approve earn back
              </Button>
            )}
            <Button variant="outline" onClick={() => resolve('override')} disabled={busy} className="h-11">
              <X className="size-4" aria-hidden="true" /> End grounding
            </Button>
          </div>
        </div>
      )}
      {!canManage && g.status === 'review' && <p className="text-sm font-medium text-success">All done — waiting for a parent to approve.</p>}
    </li>
  )
}

function GroundingForm({ today, onDone }: { today: string; onDone: () => void }) {
  const [assignee, setAssignee] = useState(FAMILY_KIDS[0]?.id ?? '')
  const [reason, setReason] = useState('')
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(addDays(today, 3))
  const [blocks, setBlocks] = useState({ electronics: true, allowance: true, rewards: true })
  const [tasks, setTasks] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    const ok = await act(
      createGrounding({
        assignee,
        reason,
        startDate,
        endDate,
        blocksElectronics: blocks.electronics,
        blocksAllowance: blocks.allowance,
        blocksRewards: blocks.rewards,
        earnBackTasks: tasks.split('\n'),
      }),
      'Grounding saved',
    )
    setSaving(false)
    if (ok) onDone()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-2xl border bg-card p-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-foreground">Who</legend>
        <div className="flex flex-wrap gap-2">
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
      </fieldset>
      <div className="flex flex-col gap-2">
        <Label htmlFor="g-reason">Reason</Label>
        <Input id="g-reason" value={reason} onChange={(e) => setReason(e.target.value)} required maxLength={300} className="h-11" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="g-start">Starts</Label>
          <Input id="g-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="h-11" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="g-end">Ends (last day)</Label>
          <Input id="g-end" type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} required className="h-11" />
        </div>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium text-foreground">Pause</legend>
        <div className="flex flex-wrap gap-4">
          {(['electronics', 'allowance', 'rewards'] as const).map((key) => (
            <label key={key} className="flex min-h-11 items-center gap-2 capitalize text-foreground">
              <input type="checkbox" checked={blocks[key]} onChange={(e) => setBlocks((b) => ({ ...b, [key]: e.target.checked }))} className="size-5 accent-primary" />
              {key}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-2">
        <Label htmlFor="g-tasks">Earn-back tasks (optional, one per line)</Label>
        <textarea
          id="g-tasks"
          value={tasks}
          onChange={(e) => setTasks(e.target.value)}
          rows={3}
          placeholder={'Clean room\nWrite an apology'}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed text-foreground"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving} className="h-11">{saving ? 'Saving…' : 'Save grounding'}</Button>
        <Button type="button" variant="ghost" onClick={onDone} className="h-11">Cancel</Button>
      </div>
    </form>
  )
}
