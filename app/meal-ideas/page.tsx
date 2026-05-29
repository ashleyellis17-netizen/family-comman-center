"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { Badge } from "@/components/ui/badge"
import { mealIdeas } from "@/lib/mock-data"
import type { MealCategory } from "@/lib/types"
import { UtensilsCrossed, Star, Zap, Baby, Sparkles } from "lucide-react"

const filters: { key: "all" | MealCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "dinner", label: "Dinner" },
  { key: "snack", label: "Snacks" },
  { key: "dessert", label: "Dessert" },
]

const categoryTint: Record<MealCategory, string> = {
  breakfast: "bg-carson-muted text-carson",
  lunch: "bg-jaxon-muted text-jaxon",
  dinner: "bg-alex-muted text-alex",
  snack: "bg-family-muted text-family",
  dessert: "bg-mom-muted text-mom",
}

export default function MealIdeasPage() {
  const [filter, setFilter] = useState<"all" | MealCategory>("all")
  const [quickOnly, setQuickOnly] = useState(false)
  const [kidOnly, setKidOnly] = useState(false)

  const visible = mealIdeas.filter(
    (m) =>
      (filter === "all" || m.category === filter) &&
      (!quickOnly || m.quick) &&
      (!kidOnly || m.kidFriendly),
  )

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Meal Ideas"
        description="A library of family-approved meals to pull from when planning the week."
        icon={UtensilsCrossed}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
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
          </button>
        ))}
        <span className="mx-1 h-6 w-px bg-border" aria-hidden />
        <button
          type="button"
          onClick={() => setQuickOnly((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition ${
            quickOnly ? "bg-carson text-carson-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          <Zap className="h-4 w-4" /> Quick
        </button>
        <button
          type="button"
          onClick={() => setKidOnly((v) => !v)}
          className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition ${
            kidOnly ? "bg-jaxon text-jaxon-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
          }`}
        >
          <Baby className="h-4 w-4" /> Kid-friendly
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="boho-card rounded-3xl">
          <EmptyState icon={Sparkles} title="No matching meals" description="Try clearing a filter." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((meal) => (
            <article key={meal.id} className="boho-card hover-lift flex flex-col rounded-3xl p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="text-lg font-extrabold leading-tight text-foreground text-balance">{meal.name}</h3>
                <Badge className={`shrink-0 capitalize ${categoryTint[meal.category]}`}>{meal.category}</Badge>
              </div>

              <div className="mb-3 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < meal.rating ? "fill-carson text-carson" : "text-border"}`}
                  />
                ))}
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {meal.protein ? <Badge variant="secondary">{meal.protein}</Badge> : null}
                {meal.quick ? (
                  <Badge className="gap-1 bg-carson-muted text-carson">
                    <Zap className="h-3 w-3" /> Quick
                  </Badge>
                ) : null}
                {meal.kidFriendly ? (
                  <Badge className="gap-1 bg-jaxon-muted text-jaxon">
                    <Baby className="h-3 w-3" /> Kid-friendly
                  </Badge>
                ) : null}
              </div>

              <p className="mt-auto text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Ingredients: </span>
                {meal.ingredients.join(", ")}
              </p>
              {meal.lastMade ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Last made{" "}
                  {new Date(meal.lastMade + "T00:00:00").toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
