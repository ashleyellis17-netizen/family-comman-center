'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { BellRing, Lock, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { act, newKey, useActionData } from '@/lib/client-actions'
import { addReminders, deleteReminder, listReminders, restoreReminder, setReminderDone } from '@/app/actions/reminders'
import { VoiceCapture } from '@/components/food/voice-capture'

export function TodayReminders() {
  const { data, error, mutate } = useActionData('reminders', listReminders)
  const [text, setText] = useState('')
  const [isPrivate, setPrivate] = useState(false)
  const [key, setKey] = useState(() => newKey('rem'))

  async function add(value: string) {
    if (!value.trim()) return
    if (await act(addReminders([{ clientKey: key, text: value, isPrivate }]))) {
      setText('')
      setKey(newKey('rem'))
      mutate()
    }
  }

  async function toggle(id: number, done: boolean) {
    mutate((d) => d?.map((r) => (r.id === id ? { ...r, done } : r)), { revalidate: false })
    await act(setReminderDone(id, done))
    mutate()
  }

  async function remove(id: number) {
    const row = await act(deleteReminder(id))
    if (!row) return
    mutate()
    toast('Reminder removed', { action: { label: 'Undo', onClick: async () => { await act(restoreReminder(row)); mutate() } } })
  }

  return (
    <section aria-labelledby="t-rem" className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-5">
      <h2 id="t-rem" className="flex items-center gap-2 text-lg font-bold text-foreground"><BellRing className="w-5 h-5 text-primary" aria-hidden /> Reminders</h2>
      <form onSubmit={(e) => { e.preventDefault(); add(text) }} className="flex flex-wrap gap-2">
        <Label htmlFor="rem-add" className="sr-only">New reminder</Label>
        <Input id="rem-add" value={text} onChange={(e) => setText(e.target.value)} placeholder="Return library books" className="h-11 flex-1 min-w-40" />
        <Button type="submit" className="h-11 rounded-xl" disabled={!text.trim()}><Plus className="w-4 h-4" aria-hidden /> Add</Button>
        <VoiceCapture onTranscript={(t) => setText(t)} label="Say it" />
        <label className="flex w-full items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={isPrivate} onChange={(e) => setPrivate(e.target.checked)} className="w-4 h-4" /> Only visible to me
        </label>
      </form>
      {error && <p role="alert" className="text-sm text-destructive">{error.message}</p>}
      <ul className="flex flex-col gap-1">
        {data?.length === 0 && <li className="text-muted-foreground">No reminders.</li>}
        {data?.map((r) => (
          <li key={r.id} className="flex items-center gap-3 rounded-lg px-2 py-1">
            <input type="checkbox" aria-label={`Done: ${r.text}`} checked={r.done} onChange={(e) => toggle(r.id, e.target.checked)} className="w-6 h-6 shrink-0" />
            <span className={cn('flex-1 text-foreground', r.done && 'line-through text-muted-foreground')}>
              {r.text}
              {r.isPrivate && <Lock className="ml-1 inline w-3 h-3 text-muted-foreground" aria-label="Private" />}
              <span className="block text-xs text-muted-foreground">{r.createdBy}{r.dueDate ? ` · due ${r.dueDate}` : ''}{r.done && r.doneBy ? ` · done by ${r.doneBy}` : ''}</span>
            </span>
            <Button variant="ghost" size="icon" aria-label={`Remove ${r.text}`} onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" aria-hidden /></Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
