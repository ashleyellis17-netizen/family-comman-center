"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { googleAccounts } from "@/lib/mock-data"
import type { GoogleAccount } from "@/lib/types"
import { colorFor } from "@/lib/people"
import { Settings, Calendar, ListChecks, Link2, Unlink, Mail } from "lucide-react"

export default function GoogleAccountsPage() {
  const [accounts, setAccounts] = useState<GoogleAccount[]>(googleAccounts)

  const update = (id: string, patch: Partial<GoogleAccount>) =>
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)))

  const connectedCount = accounts.filter((a) => a.connected).length

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Google Accounts"
        description="Connect each person's Google Calendar (and Tasks where available) to sync with the command center."
        icon={Settings}
      >
        <Badge className="bg-primary text-primary-foreground text-sm">{connectedCount} connected</Badge>
      </PageHeader>

      <SectionCard
        title="How syncing works"
        className="mb-5"
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Connecting an account links its Google Calendar so events appear on the shared and personal calendars.
          Google Tasks sync is only available for accounts that have it enabled. These toggles are saved per person.
        </p>
      </SectionCard>

      <div className="grid gap-3">
        {accounts.map((account) => {
          const colors = colorFor(account.personId ?? "family")
          return (
            <article key={account.id} className="boho-card rounded-3xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${colors.bgSolid} text-lg font-extrabold`}
                  >
                    {account.name.charAt(0)}
                  </span>
                  <div>
                    <h2 className="font-extrabold text-foreground">{account.name}</h2>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {account.role}
                    </p>
                  </div>
                </div>
                {account.connected ? (
                  <Button
                    variant="outline"
                    onClick={() => update(account.id, { connected: false, email: "", lastSynced: undefined })}
                    className="rounded-2xl border-destructive/40 font-bold text-destructive hover:bg-destructive/10"
                  >
                    <Unlink className="mr-1 h-4 w-4" /> Disconnect
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      update(account.id, {
                        connected: true,
                        email: account.email || `${account.name.toLowerCase()}@gmail.com`,
                        lastSynced: new Date().toISOString().slice(0, 10),
                      })
                    }
                    className="rounded-2xl font-bold"
                  >
                    <Link2 className="mr-1 h-4 w-4" /> Connect
                  </Button>
                )}
              </div>

              {account.connected ? (
                <div className="mt-4 grid gap-3">
                  <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-2.5 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{account.email}</span>
                  </div>

                  <label className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      Sync Calendar
                    </span>
                    <Switch
                      checked={account.syncCalendar}
                      onCheckedChange={(v) => update(account.id, { syncCalendar: v })}
                    />
                  </label>

                  <label
                    className={`flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3 ${
                      account.syncTasksAvailable ? "" : "opacity-60"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ListChecks className="h-4 w-4 text-muted-foreground" />
                      Sync Google Tasks
                      {!account.syncTasksAvailable ? (
                        <Badge variant="secondary" className="ml-1">
                          Not available
                        </Badge>
                      ) : null}
                    </span>
                    <Switch
                      checked={account.syncTasks}
                      disabled={!account.syncTasksAvailable}
                      onCheckedChange={(v) => update(account.id, { syncTasks: v })}
                    />
                  </label>

                  {account.lastSynced ? (
                    <p className="text-xs text-muted-foreground">
                      Last synced{" "}
                      {new Date(account.lastSynced + "T00:00:00").toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2">
                  <Input
                    placeholder="account@gmail.com"
                    value={account.email}
                    onChange={(e) => update(account.id, { email: e.target.value })}
                    className="rounded-2xl"
                  />
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
