"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/stat-card"
import { pantryItems } from "@/lib/mock-data"
import type { PantryItem } from "@/lib/types"
import { Package, Check, X, TriangleAlert, ShoppingCart } from "lucide-react"

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>(pantryItems)

  const toggleHave = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, haveIt: !i.haveIt } : i)))
  const toggleLow = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, lowStock: !i.lowStock } : i)))

  const inStock = items.filter((i) => i.haveIt).length
  const low = items.filter((i) => i.lowStock || !i.haveIt).length

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Pantry & Staples"
        description="Keep tabs on the staples so the grocery list writes itself."
        icon={Package}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard title="Items tracked" value={items.length} icon={<Package className="h-5 w-5" />} />
        <StatCard
          title="In stock"
          value={inStock}
          icon={<Check className="h-5 w-5 text-success" />}
          colorClass="bg-success/10"
        />
        <StatCard
          title="Need restock"
          value={low}
          icon={<TriangleAlert className="h-5 w-5 text-carson" />}
          colorClass="bg-carson-muted"
        />
      </div>

      <div className="boho-card overflow-hidden rounded-3xl">
        <ul className="divide-y divide-border/60">
          {items.map((item) => {
            const needs = !item.haveIt || item.lowStock
            return (
              <li
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 ${needs ? "bg-destructive/5" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => toggleHave(item.id)}
                  aria-label={item.haveIt ? "Mark as out" : "Mark as in stock"}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    item.haveIt
                      ? "border-success bg-success text-success-foreground"
                      : "border-destructive/40 text-destructive"
                  }`}
                >
                  {item.haveIt ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </button>

                <div className="min-w-0 flex-1">
                  <span className="block font-bold text-foreground">{item.item}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.quantity}
                    {item.lastChecked
                      ? ` · checked ${new Date(item.lastChecked + "T00:00:00").toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}`
                      : ""}
                  </span>
                </div>

                {!item.haveIt ? (
                  <Badge className="gap-1 bg-destructive/15 text-destructive">
                    <ShoppingCart className="h-3 w-3" /> Out
                  </Badge>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleLow(item.id)}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      item.lowStock
                        ? "bg-carson text-carson-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-muted"
                    }`}
                  >
                    {item.lowStock ? "Low stock" : "Plenty"}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
