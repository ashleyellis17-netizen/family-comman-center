"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { wishlistItems } from "@/lib/mock-data"
import type { WishlistItem } from "@/lib/types"
import { Sparkles, Check, Plus, ShoppingCart, Star } from "lucide-react"

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(wishlistItems)

  const approve = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, approved: true } : i)))
  const addToList = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, approved: true, addedToList: true } : i)))

  const pending = items.filter((i) => !i.approved)
  const approved = items.filter((i) => i.approved)

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Grocery Wishlist"
        description="Snack and treat requests from the family — approve them onto the grocery list."
        icon={Star}
      >
        <Badge className="bg-primary text-primary-foreground text-sm">{pending.length} waiting</Badge>
      </PageHeader>

      <section className="mb-6">
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          Pending requests
        </h2>
        {pending.length === 0 ? (
          <div className="boho-card rounded-3xl">
            <EmptyState icon={Sparkles} title="No requests" description="Approved items move down below." />
          </div>
        ) : (
          <div className="grid gap-3">
            {pending.map((item) => (
              <article key={item.id} className="boho-card flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{item.item}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {item.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Requested by <span className="font-semibold text-foreground">{item.requestedBy}</span>
                    {item.reason ? ` — ${item.reason}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button onClick={() => approve(item.id)} variant="outline" className="flex-1 rounded-2xl font-bold sm:flex-none">
                    <Check className="mr-1 h-4 w-4" /> Approve
                  </Button>
                  <Button onClick={() => addToList(item.id)} className="flex-1 rounded-2xl font-bold sm:flex-none">
                    <Plus className="mr-1 h-4 w-4" /> Add to list
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">Approved</h2>
        {approved.length === 0 ? (
          <p className="rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">Nothing approved yet.</p>
        ) : (
          <ul className="grid gap-2">
            {approved.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-success-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 font-semibold text-foreground">{item.item}</span>
                <span className="text-xs text-muted-foreground">by {item.requestedBy}</span>
                {item.addedToList ? (
                  <Badge className="gap-1 bg-success/15 text-success">
                    <ShoppingCart className="h-3 w-3" /> On list
                  </Badge>
                ) : (
                  <Badge variant="secondary">Approved</Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
