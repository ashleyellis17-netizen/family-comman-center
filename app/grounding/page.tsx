"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { EmptyState } from "@/components/empty-state"
import { ChildAvatar } from "@/components/child-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { children, groundings, getEarnBackForChild } from "@/lib/mock-data"
import { colorFor } from "@/lib/people"
import { ShieldAlert, CalendarDays, Ban, Check, Sparkles, Lock, Unlock } from "lucide-react"

function daysLeft(endDate: string) {
  const end = new Date(endDate + "T23:59:59")
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default function GroundingPage() {
  const active = groundings.filter((g) => g.status === "active")

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Grounding Center"
        description="Track restrictions, what's blocked, and earn-back progress for each child."
        icon={ShieldAlert}
      />

      {active.length === 0 ? (
        <SectionCard title="All clear">
          <EmptyState
            icon={Sparkles}
            title="No active groundings"
            description="Everyone is in good standing. Restrictions you set will show up here."
          />
        </SectionCard>
      ) : (
        <div className="grid gap-5">
          {active.map((g) => (
            <GroundingCard key={g.id} grounding={g} />
          ))}
        </div>
      )}
    </div>
  )
}

function GroundingCard({ grounding }: { grounding: (typeof groundings)[number] }) {
  const child = children.find((c) => c.id === grounding.childId)
  if (!child) return null
  const colors = colorFor(child.id)
  const left = daysLeft(grounding.endDate)
  const earnBack = getEarnBackForChild(child.id)
  const [tasks, setTasks] = useState(earnBack?.tasks ?? [])

  const completed = tasks.filter((t) => t.complete).length
  const allDone = tasks.length > 0 && completed === tasks.length

  const restrictions = [
    { label: "Allowance", allowed: grounding.allowanceEligible },
    { label: "Electronics", allowed: grounding.electronicsAllowed },
    { label: "Rewards", allowed: grounding.rewardsAllowed },
  ]

  return (
    <article className="boho-card overflow-hidden rounded-3xl">
      <div className={`flex items-center gap-4 border-b border-border/60 p-5 ${colors.bg}`}>
        <ChildAvatar childId={child.id} name={child.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold text-foreground">{child.name}</h2>
          <p className="text-sm font-medium text-muted-foreground">{grounding.reason}</p>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-extrabold ${colors.text}`}>{left}</div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {left === 1 ? "day left" : "days left"}
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {new Date(grounding.startDate + "T00:00:00").toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}{" "}
            –{" "}
            {new Date(grounding.endDate + "T00:00:00").toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </div>
          <ul className="grid gap-2">
            {restrictions.map((r) => (
              <li
                key={r.label}
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3"
              >
                <span className="text-sm font-semibold text-foreground">{r.label}</span>
                {r.allowed ? (
                  <Badge className="gap-1 bg-success/15 text-success">
                    <Unlock className="h-3 w-3" /> Allowed
                  </Badge>
                ) : (
                  <Badge className="gap-1 bg-destructive/15 text-destructive">
                    <Ban className="h-3 w-3" /> Blocked
                  </Badge>
                )}
              </li>
            ))}
          </ul>
          {grounding.parentNotes ? (
            <p className="mt-3 rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-bold text-foreground">Note: </span>
              {grounding.parentNotes}
            </p>
          ) : null}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
            <Sparkles className="h-4 w-4 text-carson" />
            Earn-Back Plan
          </div>
          {!grounding.earnBackAvailable || tasks.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-center">
              <div>
                <Lock className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  No earn-back available for this grounding.
                </p>
              </div>
            </div>
          ) : (
            <>
              <ul className="grid gap-2">
                {tasks.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() =>
                        setTasks((prev) =>
                          prev.map((x) => (x.id === t.id ? { ...x, complete: !x.complete } : x)),
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                        t.complete
                          ? "border-success/40 bg-success/10"
                          : "border-border/60 bg-card hover:bg-muted/60"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          t.complete ? "border-success bg-success text-success-foreground" : "border-border"
                        }`}
                      >
                        {t.complete ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          t.complete ? "text-muted-foreground line-through" : "text-foreground"
                        }`}
                      >
                        {t.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <Button
                disabled={!allDone}
                className="mt-3 w-full rounded-2xl font-bold"
                variant={allDone ? "default" : "secondary"}
              >
                {allDone ? "Submit for parent review" : `${completed}/${tasks.length} tasks complete`}
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}
