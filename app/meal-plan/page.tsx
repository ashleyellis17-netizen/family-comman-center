import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { mealPlan } from "@/lib/mock-data"
import { colorFor } from "@/lib/people"
import { CalendarRange, Coffee, Sandwich, UtensilsCrossed, Apple, ChefHat } from "lucide-react"

const slots = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "lunch", label: "Lunch", icon: Sandwich },
  { key: "dinner", label: "Dinner", icon: UtensilsCrossed },
  { key: "snack", label: "Snack", icon: Apple },
] as const

function cookColor(cook?: string) {
  if (!cook) return "bg-secondary text-secondary-foreground"
  const c = colorFor(cook.toLowerCase())
  return c.bgSolid
}

export default function MealPlanPage() {
  const weekOf = new Date(mealPlan.weekOf + "T00:00:00").toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  })
  const todayName = new Date().toLocaleDateString(undefined, { weekday: "long" })

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Meal Plan"
        description={`Week of ${weekOf}`}
        icon={CalendarRange}
      />

      {/* Mobile: stacked day cards */}
      <div className="grid gap-4 lg:hidden">
        {mealPlan.days.map((day) => {
          const isToday = day.day === todayName
          return (
            <article
              key={day.day}
              className={`boho-card rounded-3xl p-4 ${isToday ? "ring-2 ring-primary" : ""}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-foreground">
                  {day.day}
                  {isToday ? <span className="ml-2 text-sm font-bold text-primary">Today</span> : null}
                </h2>
                {day.cook ? (
                  <Badge className={`gap-1 ${cookColor(day.cook)}`}>
                    <ChefHat className="h-3 w-3" />
                    {day.cook}
                  </Badge>
                ) : null}
              </div>
              <div className="grid gap-2">
                {slots.map((slot) => (
                  <div key={slot.key} className="flex items-center gap-3 rounded-2xl bg-muted/40 px-3 py-2">
                    <slot.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="w-20 shrink-0 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      {slot.label}
                    </span>
                    <span className="font-semibold text-foreground">{day[slot.key] ?? "—"}</span>
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </div>

      {/* Desktop: weekly grid */}
      <div className="hidden overflow-hidden rounded-3xl boho-card lg:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="border-b border-border p-3 text-left text-xs font-extrabold uppercase tracking-wide text-muted-foreground">
                Meal
              </th>
              {mealPlan.days.map((day) => {
                const isToday = day.day === todayName
                return (
                  <th
                    key={day.day}
                    className={`border-b border-l border-border p-3 text-center text-sm font-extrabold ${
                      isToday ? "bg-primary/10 text-primary" : "text-foreground"
                    }`}
                  >
                    {day.day.slice(0, 3)}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.key}>
                <td className="border-b border-border bg-muted/30 p-3 align-middle">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    <slot.icon className="h-4 w-4" />
                    {slot.label}
                  </span>
                </td>
                {mealPlan.days.map((day) => {
                  const isToday = day.day === todayName
                  return (
                    <td
                      key={day.day}
                      className={`border-b border-l border-border p-3 text-center text-sm font-medium text-foreground ${
                        isToday ? "bg-primary/5" : ""
                      }`}
                    >
                      {day[slot.key] ?? "—"}
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <td className="bg-muted/30 p-3">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <ChefHat className="h-4 w-4" />
                  Cook
                </span>
              </td>
              {mealPlan.days.map((day) => (
                <td key={day.day} className="border-l border-border p-3 text-center">
                  {day.cook ? (
                    <Badge className={`${cookColor(day.cook)}`}>{day.cook}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
