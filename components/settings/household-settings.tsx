'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Copy, Download, KeyRound, Monitor, RefreshCw, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { act, useActionData } from '@/lib/client-actions'
import type { Role } from '@/lib/db/schema'
import { approveDisplayPairing, listDisplayDevices, revokeDisplayDevice } from '@/app/actions/displays'
import {
  createInvite,
  getHouseholdSettings,
  removeMember,
  revokeInvite,
  rotateCalendarToken,
  setDisplayMode,
  updateHousehold,
  updateMember,
  weeklyReset,
} from '@/app/actions/household'

const ROLE_LABEL: Record<Role, string> = { parent: 'Parent', member: 'Family member', display: 'Shared display' }

function copy(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied'), () => toast.error('Could not copy — select and copy manually.'))
}

export function HouseholdSettings({ displayMode }: { displayMode: boolean }) {
  const router = useRouter()
  const { data, error, mutate } = useActionData('settings', getHouseholdSettings, { refreshInterval: 0 })
  const [origin, setOrigin] = useState('')
  useEffect(() => setOrigin(window.location.origin), [])

  if (error) return <p role="alert" className="text-destructive">{error.message}</p>
  if (!data) return <p className="text-muted-foreground">Loading settings…</p>
  const feed = origin && data.household.calendarToken ? `${origin}/api/calendar?token=${data.household.calendarToken}` : ''

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader title="Household Settings" description="Members, shared screens, privacy, and your data." />

      <Section title="Household">
        <form
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            if (await act(updateHousehold({ name: String(f.get('name')), timezone: String(f.get('timezone')) }), 'Saved')) mutate()
          }}
        >
          <Field id="h-name" label="Name"><Input id="h-name" name="name" defaultValue={data.household.name} className="h-11" required /></Field>
          <Field id="h-tz" label="Time zone"><Input id="h-tz" name="timezone" defaultValue={data.household.timezone} className="h-11" placeholder="America/Chicago" required /></Field>
          <Button type="submit" className="h-11">Save</Button>
        </form>
        <p className="text-xs text-muted-foreground">Used for &quot;today&quot;, meal plan weeks, and reminders on every device.</p>
      </Section>

      <Section title="Members">
        <ul className="flex flex-col gap-2">
          {data.members.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 p-3">
              <span className="flex-1 font-semibold text-foreground">{m.displayName}{m.userId === data.me && <span className="text-muted-foreground font-normal"> (you)</span>}</span>
              <Label htmlFor={`role-${m.id}`} className="sr-only">Role for {m.displayName}</Label>
              <select
                id={`role-${m.id}`}
                value={m.role}
                disabled={m.userId === data.me}
                onChange={async (e) => { await act(updateMember({ memberId: m.id, role: e.target.value as Role }), 'Role updated'); mutate() }}
                className="h-10 rounded-md border border-input bg-background px-2"
              >
                {Object.entries(ROLE_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {m.userId !== data.me && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={async () => {
                    if (!confirm(`Remove ${m.displayName}? They will be signed out of this household on every device.`)) return
                    if (await act(removeMember(m.id), 'Member removed')) mutate()
                  }}
                >
                  Remove
                </Button>
              )}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {(['member', 'parent'] as Role[]).map((role) => (
            <Button key={role} variant="outline" className="rounded-xl" onClick={async () => { if (await act(createInvite({ role }), 'Invite created')) mutate() }}>
              <UserPlus className="w-4 h-4" aria-hidden /> Invite {ROLE_LABEL[role].toLowerCase()}
            </Button>
          ))}
        </div>
        {data.invites.length > 0 && (
          <ul className="flex flex-col gap-1 text-sm">
            {data.invites.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-2">
                <code className="rounded bg-muted px-2 py-1 font-mono text-base font-bold tracking-widest text-foreground">{i.code}</code>
                <span className="text-muted-foreground">{ROLE_LABEL[i.role as Role]} · expires {new Date(i.expiresAt).toLocaleDateString()}</span>
                <Button variant="ghost" size="sm" onClick={() => copy(i.code)}><Copy className="w-4 h-4" aria-hidden /> Copy</Button>
                <Button variant="ghost" size="sm" onClick={async () => { await act(revokeInvite(i.id)); mutate() }}>Revoke</Button>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">The invitee creates an account, then enters the code on the welcome screen. Codes are single-use.</p>
      </Section>

      <Section title="Shared displays (Cozyla / wall screen)">
        <SharedDisplays origin={origin} />
        <div className="flex flex-wrap items-center gap-3 border-t border-border/50 pt-3">
          <p className="flex-1 text-sm text-foreground">
            <span className="font-semibold">Display mode on this device:</span> {displayMode ? 'On — private items hidden' : 'Off'}
          </p>
          <Button variant="outline" className="rounded-xl" onClick={async () => { await act(setDisplayMode(!displayMode)); router.refresh() }}>
            Turn {displayMode ? 'off' : 'on'}
          </Button>
        </div>
      </Section>

      <Section title="Calendar feed">
        <p className="text-sm text-muted-foreground">Subscribe from Google Calendar, Apple Calendar, or the Cozyla. Anyone with this link can read the family calendar — rotate it if it leaks.</p>
        {feed && (
          <div className="flex flex-wrap items-center gap-2">
            <code className="flex-1 min-w-0 truncate rounded bg-muted px-2 py-2 text-xs">{feed}</code>
            <Button variant="outline" size="sm" onClick={() => copy(feed)}><Copy className="w-4 h-4" aria-hidden /> Copy</Button>
          </div>
        )}
        <Button
          variant="ghost"
          className="self-start"
          onClick={async () => {
            if (!confirm('Rotate the link? Existing subscriptions will stop updating until re-added.')) return
            if (await act(rotateCalendarToken(), 'New link created')) mutate()
          }}
        >
          <RefreshCw className="w-4 h-4" aria-hidden /> Rotate link
        </Button>
      </Section>

      <Section title="Weekly reset">
        <p className="text-sm text-muted-foreground">Clear bought grocery items and finished reminders to start the week fresh. Unchecked items, recipes, chores, and points are kept.</p>
        <Button
          variant="outline"
          className="self-start rounded-xl"
          onClick={async () => {
            const res = await act(weeklyReset())
            if (res) toast.success(`Cleared ${res.groceries} bought item${res.groceries === 1 ? '' : 's'} and ${res.reminders} finished reminder${res.reminders === 1 ? '' : 's'}`)
          }}
        >
          <RefreshCw className="w-4 h-4" aria-hidden /> Reset for the week
        </Button>
      </Section>

      <Section title="Your data">
        <p className="text-sm text-muted-foreground">Download everything for this household — groceries, wishlist, recipes, ratings, meal plans, pantry, preferences, reminders, and events — as JSON.</p>
        <Button asChild variant="outline" className="self-start rounded-xl">
          <a href="/api/export" download><Download className="w-4 h-4" aria-hidden /> Export household data</a>
        </Button>
      </Section>

      <Section title="Connections">
        <ul className="flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-muted-foreground" aria-hidden /> <span className="font-semibold">Google Calendar & Gmail</span> — not connected. Planned; see the roadmap.</li>
          <li className="flex items-center gap-2"><KeyRound className="w-4 h-4 text-muted-foreground" aria-hidden /> <span className="font-semibold">Recipe search</span> — TheMealDB public API (no account needed).</li>
        </ul>
      </Section>
    </div>
  )
}

function SharedDisplays({ origin }: { origin: string }) {
  const { data: devices, mutate } = useActionData('display-devices', listDisplayDevices, { refreshInterval: 0 })
  const [pending, setPending] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm leading-relaxed text-muted-foreground">
        <li>
          On the display, open <span className="font-mono text-foreground">{origin ? `${origin}/pair` : '/pair'}</span>
          {origin && <Button variant="ghost" size="sm" onClick={() => copy(`${origin}/pair`)}><Copy className="w-4 h-4" aria-hidden /> Copy link</Button>}
        </li>
        <li>Enter the code it shows below. No account or password is needed on the display.</li>
      </ol>
      <form
        className="grid gap-2 sm:grid-cols-[10rem_1fr_auto] sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault()
          const form = e.currentTarget
          const f = new FormData(form)
          setPending(true)
          const res = await act(approveDisplayPairing({ code: String(f.get('code')), name: String(f.get('name')) }))
          setPending(false)
          if (res) {
            toast.success(`${res.name} paired. It will open Today in a few seconds.`)
            form.reset()
            setTimeout(() => mutate(), 4000)
          }
        }}
      >
        <Field id="pair-code" label="Code on display">
          <Input id="pair-code" name="code" required autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={7} placeholder="ABC 123" className="h-11 font-mono text-lg uppercase tracking-widest" />
        </Field>
        <Field id="pair-name" label="Name this display">
          <Input id="pair-name" name="name" defaultValue="Kitchen screen" maxLength={40} className="h-11" />
        </Field>
        <Button type="submit" className="h-11 rounded-xl" disabled={pending}>
          <Monitor className="w-4 h-4" aria-hidden /> {pending ? 'Pairing…' : 'Pair display'}
        </Button>
      </form>
      {devices && devices.length > 0 && (
        <ul className="flex flex-col gap-2">
          {devices.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border/50 p-3">
              <Monitor className="w-4 h-4 text-muted-foreground" aria-hidden />
              <span className="flex-1 font-semibold text-foreground">{d.name}</span>
              <span className="text-xs text-muted-foreground">Last active {new Date(d.lastSeenAt).toLocaleString()}</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={async () => {
                  if (!confirm(`Unpair ${d.name}? It will need a new code to reconnect.`)) return
                  if (await act(revokeDisplayDevice(d.id), 'Display unpaired')) mutate()
                }}
              >
                Unpair
              </Button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">Paired displays can view the household, add groceries, and check things off. They never see private items or settings.</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-5">
      <h2 className="text-lg font-bold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
