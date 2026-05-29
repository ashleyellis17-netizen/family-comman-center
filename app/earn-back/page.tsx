"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { SectionCard } from "@/components/section-card"
import { EmptyState } from "@/components/empty-state"
import { ChildAvatar } from "@/components/child-avatar"
import { ProgressRing } from "@/components/progress-ring"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { children, groundings, earnBackPlans } from "@/lib/mock-data"
import { colorFor } from "@/lib/people"
import { RotateCcw, Check, BookOpen, Home, Heart, Volume2, Smile, ClipboardCheck, Sparkles } from "lucide-react"

const taskIcon = {
  learning: BookOpen,
  home: Home,
  reflection: Heart,
  quiet: Volume2,
  behavior: Smile,
  approval: ClipboardCheck,
} as const

export default function EarnBackPage() {
  const plans = earnBackPlans.filter((p) =>
    groundings.some((g) => g.id === p.groundingId && g.status === "active"),
  )

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Earn Back Plan"
        description="Complete the assigned tasks to shorten a grounding or restore privileges."
        icon={RotateCcw}
      />

      {plans.length === 0 ? (
        <SectionCard title="Nothing to earn back">
          <EmptyState
            icon={Sparkles}
            title="No active earn-back plans"
            description="When a grounding allows earn-back, the tasks will appear here."
          />
        </SectionCard>
      ) : (
        <div className="grid gap-5">
          {plans.map((plan) => (
            <EarnBackCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  )
}

function EarnBackCard({ plan }: { plan: (typeof earnBackPlans)[number] }) {
  const child = children.find((c) => c.id === plan.childId)
  const [tasks, setTasks] = useState(plan.tasks)
  if (!child) return null
  const colors = colorFor(child.id)
  const completed = tasks.filter((t) => t.complete).length
  const pct = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const allDone = completed === tasks.length

  return (
    <article className="boho-card overflow-hidden rounded-3xl">
      <div className={`flex items-center gap-4 border-b border-border/60 p-5 ${colors.bg}`}>
        <ChildAvatar childId={child.id} name={child.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-extrabold text-foreground">{child.name}</h2>
          <p className="text-sm font-medium text-muted-foreground">
            {completed} of {tasks.length} tasks complete
          </p>
        </div>
        <ProgressRing value={pct} size={56} className={colors.text}>
          <span className="text-xs font-extrabold text-foreground">{pct}%</span>
        </ProgressRing>
      </div>

      <div className="grid gap-2 p-5">
        {tasks.map((t) => {
          const Icon = taskIcon[t.type] ?? ClipboardCheck
          return (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, complete: !x.complete } : x)))
              }
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                t.complete ? "border-success/40 bg-success/10" : "border-border/60 bg-card hover:bg-muted/60"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  t.complete ? "border-success bg-success text-success-foreground" : "border-border"
                }`}
              >
                {t.complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4 text-muted-foreground" />}
              </span>
              <span
                className={`flex-1 text-sm font-semibold ${
                  t.complete ? "text-muted-foreground line-through" : "text-foreground"
                }`}
              >
                {t.label}
              </span>
              <Badge variant="secondary" className="capitalize">
                {t.type}
              </Badge>
            </button>
          )
        })}

        <Button
          disabled={!allDone}
          className="mt-2 w-full rounded-2xl font-bold"
          variant={allDone ? "default" : "secondary"}
        >
          {allDone ? "Submit for parent review" : `Finish ${tasks.length - completed} more to submit`}
        </Button>
      </div>
    </article>
  )
}
