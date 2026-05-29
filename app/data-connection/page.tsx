"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { appSettings, expectedSheetTabs } from "@/lib/mock-data"
import { getDataSourceMode } from "@/lib/api"
import type { AppSettings } from "@/lib/types"
import { Plug, Database, CircleCheck, CircleAlert, KeyRound, Link as LinkIcon, FileSpreadsheet, ListChecks } from "lucide-react"

export default function DataConnectionPage() {
  const [settings, setSettings] = useState<AppSettings>(appSettings)
  const [saved, setSaved] = useState(false)

  const update = (patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
    setSaved(false)
  }

  const canConnect = settings.webAppUrl.trim() !== "" && settings.apiToken.trim() !== ""
  const mode = getDataSourceMode()

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Data Connection"
        description="Connect the command center to your Google Sheet + Apps Script backend. Until connected, the app runs on sample data."
        icon={Plug}
      >
        {settings.connected ? (
          <Badge className="gap-1 bg-success/15 text-success text-sm">
            <CircleCheck className="h-3.5 w-3.5" /> Connected
          </Badge>
        ) : (
          <Badge className="gap-1 bg-carson-muted text-carson text-sm">
            <CircleAlert className="h-3.5 w-3.5" /> Sample data
          </Badge>
        )}
      </PageHeader>

      <SectionCard title="Current mode" icon={Database} className="mb-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Data source:{" "}
          <span className="font-bold text-foreground">
            {mode === "live" ? "Live (Google Sheets)" : "Mock / sample data"}
          </span>
          . All screens read through a single data layer, so connecting here will swap every page over to your
          real sheet without any other changes.
        </p>
      </SectionCard>

      <SectionCard title="Apps Script Web App" icon={LinkIcon} className="mb-5">
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="webAppUrl" className="font-semibold">
              Web App URL
            </Label>
            <Input
              id="webAppUrl"
              placeholder="https://script.google.com/macros/s/…/exec"
              value={settings.webAppUrl}
              onChange={(e) => update({ webAppUrl: e.target.value })}
              className="rounded-2xl font-mono text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="apiToken" className="flex items-center gap-1.5 font-semibold">
              <KeyRound className="h-3.5 w-3.5" /> API Token
            </Label>
            <Input
              id="apiToken"
              type="password"
              placeholder="Shared secret from your Apps Script"
              value={settings.apiToken}
              onChange={(e) => update({ apiToken: e.target.value })}
              className="rounded-2xl font-mono text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="sheetId" className="flex items-center gap-1.5 font-semibold">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Google Sheet ID
            </Label>
            <Input
              id="sheetId"
              placeholder="1AbC…xyz"
              value={settings.sheetId}
              onChange={(e) => update({ sheetId: e.target.value })}
              className="rounded-2xl font-mono text-sm"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="oauthClientId" className="font-semibold">
              OAuth Client ID <span className="text-muted-foreground">(for Google Calendar sync)</span>
            </Label>
            <Input
              id="oauthClientId"
              placeholder="…apps.googleusercontent.com"
              value={settings.oauthClientId}
              onChange={(e) => update({ oauthClientId: e.target.value })}
              className="rounded-2xl font-mono text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              disabled={!canConnect}
              onClick={() => {
                setSettings((prev) => ({
                  ...prev,
                  connected: true,
                  lastSync: new Date().toISOString().slice(0, 10),
                  calendarApiStatus: prev.oauthClientId ? "configured" : "not-configured",
                }))
                setSaved(true)
              }}
              className="rounded-2xl font-bold"
            >
              {settings.connected ? "Re-test & save" : "Connect"}
            </Button>
            {settings.connected ? (
              <Button
                variant="outline"
                onClick={() => setSettings((prev) => ({ ...prev, connected: false }))}
                className="rounded-2xl font-bold"
              >
                Disconnect
              </Button>
            ) : null}
            {saved ? <span className="text-sm font-semibold text-success">Saved.</span> : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Expected Sheet Tabs" icon={ListChecks}>
        <p className="mb-3 text-sm text-muted-foreground">
          Your spreadsheet should contain these tabs. The backend maps each one to a screen in the app.
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {expectedSheetTabs.map((tab) => (
            <div
              key={tab}
              className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm font-medium text-foreground"
            >
              <CircleCheck className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-mono text-xs">{tab}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
