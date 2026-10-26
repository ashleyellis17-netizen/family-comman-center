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
import {
  createDisplayAccount,
  createInvite,
  getHouseholdSettings,
  removeMember,
  revokeInvite,
  rotateCalendarToken,
  setDisplayMode,
  updateHousehold,
  updateMember,
} from '@/app/actions/household'

const ROLE_LABEL: Record<Role, string> = { parent: 'Parent', member: 'Family member', display: 'Shared display' }

function copy(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success('Copied'), () => toast.error('Could not copy — select and copy manually.'))
}

export function HouseholdSettings({ displayMode }: { displayMode: boolean }) {
  const router = useRouter()
  const { data, error, mutate } = useActionData('settings', getHouseholdSettings, { refreshInterval: 0 })
  const [displayCreds, setDisplayCreds] = useState<{ email: string; password: string } | null>(null)
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

      <Section title="Shared display (Cozyla / wall screen)">
        <p className="text-sm text-muted-foreground">
          Create a dedicated sign-in for the wall screen. It stays signed in, can check off groceries and reminders, and never shows private items or settings.
        </p>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const creds = await act(createDisplayAccount({ label: String(f.get('label')) }))
            if (creds) { setDisplayCreds(creds); mutate() }
          }}
        >
          <Label htmlFor="d-label" className="sr-only">Display name</Label>
          <Input id="d-label" name="label" defaultValue="Kitchen screen" className="h-11 flex-1 min-w-40" required />
          <Button type="submit" className="h-11 rounded-xl"><Monitor className="w-4 h-4" aria-hidden /> Create display sign-in</Button>
        </form>
        {displayCreds && (
          <div role="status" className="flex flex-col gap-2 rounded-xl border border-primary/40 bg-primary/5 p-3 text-sm">
            <p className="font-bold text-foreground">Sign in on the display with these. They are shown only once.</p>
            <p className="font-mono break-all">Email: {displayCreds.email} <Button variant="ghost" size="sm" onClick={() => copy(displayCreds.email)}>Copy</Button></p>
            <p className="font-mono break-all">Password: {displayCreds.password} <Button variant="ghost" size="sm" onClick={() => copy(displayCreds.password)}>Copy</Button></p>
          </div>
        )}
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
