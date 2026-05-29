"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { ChildAvatar } from "@/components/child-avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { children, approvalQueue } from "@/lib/mock-data"
import { colorFor, personLabel } from "@/lib/people"
import type { ApprovalItem, ApprovalType } from "@/lib/types"
import { CheckCheck, Check, X, ClipboardList, Sun, Gift, ShoppingCart, RotateCcw, Sparkles } from "lucide-react"

const typeMeta: Record<ApprovalType, { label: string; icon: typeof Check; tint: string }> = {
  chore: { label: "Chore", icon: ClipboardList, tint: "bg-jaxon-muted text-jaxon" },
  "summer-task": { label: "Summer Task", icon: Sun, tint: "bg-carson-muted text-carson" },
  reward: { label: "Reward", icon: Gift, tint: "bg-alex-muted text-alex" },
  wishlist: { label: "Wishlist", icon: ShoppingCart, tint: "bg-family-muted text-family" },
  "earn-back": { label: "Earn Back", icon: RotateCcw, tint: "bg-mom-muted text-mom" },
}

const filters: { key: "all" | ApprovalType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "chore", label: "Chores" },
  { key: "summer-task", label: "Summer" },
  { key: "reward", label: "Rewards" },
  { key: "wishlist", label: "Wishlist" },
  { key: "earn-back", label: "Earn Back" },
]

export default function ApprovalsPage() {
  const [items, setItems] = useState<ApprovalItem[]>(approvalQueue)
  const [filter, setFilter] = useState<"all" | ApprovalType>("all")

  const pending = items.filter((i) => i.status === "pending")
  const visible = pending.filter((i) => filter === "all" || i.type === filter)

  const decide = (id: string, status: "approved" | "rejected") =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Parent Approval Queue"
        description="Review everything the kids submitted in one place."
        icon={CheckCheck}
      >
        <Badge className="bg-primary text-primary-foreground text-sm">{pending.length} pending</Badge>
      </PageHeader>

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => {
          const count = f.key === "all" ? pending.length : pending.filter((i) => i.type === f.key).length
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                filter === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {f.label}
              <span className="ml-1.5 opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="boho-card rounded-3xl p-2">
          <EmptyState
            icon={Sparkles}
            title="All caught up"
            description="There's nothing waiting for your approval right now."
          />
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((item) => {
            const meta = typeMeta[item.type]
            const Icon = meta.icon
            const child = children.find((c) => c.id === item.childId)
            const colors = colorFor(item.childId)
            return (
              <article
                key={item.id}
                className="boho-card flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  {child ? (
                    <ChildAvatar childId={child.id} name={child.name} size="md" />
                  ) : (
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full ${colors.bgSolid} font-extrabold`}>
                      {personLabel[item.childId]?.charAt(0) ?? "?"}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-bold text-foreground">{item.title}</h3>
                      <Badge className={`gap-1 ${meta.tint}`}>
                        <Icon className="h-3 w-3" />
                        {meta.label}
                      </Badge>
                    </div>
                    {item.detail ? (
                      <p className="truncate text-sm text-muted-foreground">{item.detail}</p>
                    ) : null}
                    <p className="text-xs font-medium text-muted-foreground">
                      {personLabel[item.childId] ?? item.childId} ·{" "}
                      {new Date(item.submittedAt + "T00:00:00").toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    onClick={() => decide(item.id, "rejected")}
                    variant="outline"
                    className="flex-1 rounded-2xl border-destructive/40 font-bold text-destructive hover:bg-destructive/10 sm:flex-none"
                  >
                    <X className="mr-1 h-4 w-4" /> Deny
                  </Button>
                  <Button
                    onClick={() => decide(item.id, "approved")}
                    className="flex-1 rounded-2xl bg-success font-bold text-success-foreground hover:bg-success/90 sm:flex-none"
                  >
                    <Check className="mr-1 h-4 w-4" /> Approve
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
