"use client"

import { useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { groceryItems } from "@/lib/mock-data"
import type { GroceryItem, GroceryCategory } from "@/lib/types"
import { ShoppingCart, Check, Store, CircleAlert, Sparkles } from "lucide-react"

const categoryLabels: Record<GroceryCategory, string> = {
  produce: "Produce",
  meat: "Meat & Seafood",
  dairy: "Dairy",
  frozen: "Frozen",
  pantry: "Pantry",
  snacks: "Snacks",
  drinks: "Drinks",
  household: "Household",
  toiletries: "Toiletries",
  school: "School",
  other: "Other",
}

const categoryOrder: GroceryCategory[] = [
  "produce",
  "meat",
  "dairy",
  "frozen",
  "pantry",
  "snacks",
  "drinks",
  "household",
  "toiletries",
  "school",
  "other",
]

const priorityTint: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-carson-muted text-carson",
  low: "bg-secondary text-secondary-foreground",
}

export default function GroceryListPage() {
  const [items, setItems] = useState<GroceryItem[]>(groceryItems)
  const [hidePurchased, setHidePurchased] = useState(false)

  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, purchased: !i.purchased } : i)))

  const remaining = items.filter((i) => !i.purchased).length

  const grouped = useMemo(() => {
    const visible = hidePurchased ? items.filter((i) => !i.purchased) : items
    return categoryOrder
      .map((cat) => ({ cat, list: visible.filter((i) => i.category === cat) }))
      .filter((g) => g.list.length > 0)
  }, [items, hidePurchased])

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Grocery List"
        description="Everything the family needs, grouped by aisle."
        icon={ShoppingCart}
      >
        <Badge className="bg-primary text-primary-foreground text-sm">{remaining} to buy</Badge>
      </PageHeader>

      <div className="mb-4 flex items-center justify-between rounded-2xl bg-card p-3 boho-card">
        <span className="text-sm font-semibold text-muted-foreground">
          {items.length - remaining} of {items.length} in the cart
        </span>
        <button
          type="button"
          onClick={() => setHidePurchased((v) => !v)}
          className="rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground hover:bg-muted"
        >
          {hidePurchased ? "Show purchased" : "Hide purchased"}
        </button>
      </div>

      {grouped.length === 0 ? (
        <div className="boho-card rounded-3xl">
          <EmptyState icon={Sparkles} title="List is clear" description="Nothing left to grab right now." />
        </div>
      ) : (
        <div className="grid gap-5">
          {grouped.map(({ cat, list }) => (
            <section key={cat} className="boho-card overflow-hidden rounded-3xl">
              <header className="border-b border-border/60 bg-muted/40 px-4 py-2.5">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
                  {categoryLabels[cat]}
                </h2>
              </header>
              <ul className="divide-y divide-border/60">
                {list.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted/50"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          item.purchased ? "border-success bg-success text-success-foreground" : "border-border"
                        }`}
                      >
                        {item.purchased ? <Check className="h-3.5 w-3.5" /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block font-bold ${
                            item.purchased ? "text-muted-foreground line-through" : "text-foreground"
                          }`}
                        >
                          {item.item}
                        </span>
                        <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.quantity}</span>
                          <span aria-hidden>·</span>
                          <span>Added by {item.addedBy}</span>
                          {item.store ? (
                            <span className="inline-flex items-center gap-1">
                              <Store className="h-3 w-3" />
                              {item.store}
                            </span>
                          ) : null}
                          {item.notes ? <span className="italic">"{item.notes}"</span> : null}
                        </span>
                      </span>
                      {item.priority === "high" && !item.purchased ? (
                        <CircleAlert className="h-4 w-4 shrink-0 text-destructive" />
                      ) : null}
                      <Badge className={`shrink-0 capitalize ${priorityTint[item.priority]}`}>
                        {item.priority}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
