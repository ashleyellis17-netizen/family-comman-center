import Link from 'next/link'
import { and, asc, count, eq, inArray, isNull, ne } from 'drizzle-orm'
import { CalendarDays, CheckSquare, ChefHat, ListChecks, Package, ShoppingCart } from 'lucide-react'
import { db } from '@/lib/db'
import { choreCompletions, chores, events, groceryItems, mealPlanEntries, pantryItems, wishlistRequests } from '@/lib/db/schema'
import { occursOn } from '@/lib/chores'
import { requirePageContext } from '@/lib/household'
import { addDays, formatDate, hourInTimezone, timeToMinutes, todayInTimezone } from '@/lib/dates'
import { TodayReminders } from '@/components/today/today-reminders'

export const metadata = { title: 'Today' }

const SLOT_ORDER = ['breakfast', 'lunch', 'dinner', 'snack']

export default async function TodayPage() {
  const ctx = await requirePageContext()
  const today = todayInTimezone(ctx.timezone)
  const tomorrow = addDays(today, 1)
  const hour = hourInTimezone(ctx.timezone)
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const [dayEvents, meals, [groceryCount], [wishCount], lowPantry, activeChores, doneToday] = await Promise.all([
    db.select().from(events).where(and(eq(events.householdId, ctx.householdId), inArray(events.date, [today, tomorrow]))),
    db.select().from(mealPlanEntries).where(and(eq(mealPlanEntries.householdId, ctx.householdId), eq(mealPlanEntries.date, today))).orderBy(asc(mealPlanEntries.createdAt)),
    db.select({ n: count() }).from(groceryItems).where(and(eq(groceryItems.householdId, ctx.householdId), eq(groceryItems.checked, false), isNull(groceryItems.deletedAt))),
    db.select({ n: count() }).from(wishlistRequests).where(and(eq(wishlistRequests.householdId, ctx.householdId), eq(wishlistRequests.status, 'pending'))),
    db.select({ name: pantryItems.name, status: pantryItems.status }).from(pantryItems).where(and(eq(pantryItems.householdId, ctx.householdId), ne(pantryItems.status, 'in_stock'))).limit(8),
    db.select().from(chores).where(and(eq(chores.householdId, ctx.householdId), eq(chores.archived, false))),
    db.select({ choreId: choreCompletions.choreId }).from(choreCompletions).where(and(eq(choreCompletions.householdId, ctx.householdId), eq(choreCompletions.date, today))),
  ])
  const choresToday = activeChores.filter((c) => occursOn(c, today))
  const doneIds = new Set(doneToday.map((d) => d.choreId))
  const choresDone = choresToday.filter((c) => doneIds.has(c.id)).length

  const sortEvents = (d: string) =>
    dayEvents.filter((e) => e.date === d).sort((a, b) => (timeToMinutes(a.time) ?? -1) - (timeToMinutes(b.time) ?? -1))
  const todayEvents = sortEvents(today)
  const tomorrowEvents = sortEvents(tomorrow)
  meals.sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot))

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <header className="flex flex-col gap-1">
        <p className="text-sm font-bold uppercase tracking-wider text-primary">{formatDate(today, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <h1 className="cozyla-heading text-foreground text-balance">
          {greeting}{ctx.role === 'display' ? '' : `, ${ctx.displayName}`}
        </h1>
        <p className="text-muted-foreground">{ctx.householdName}{ctx.publicMode ? ' · Shared display — private items hidden' : ''}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="t-sched" className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-5 lg:col-span-2">
          <h2 id="t-sched" className="flex items-center gap-2 text-lg font-bold text-foreground"><CalendarDays className="w-5 h-5 text-primary" aria-hidden /> Schedule</h2>
          {todayEvents.length === 0 ? (
            <p className="text-muted-foreground">Nothing on the calendar today.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {todayEvents.map((e) => (
                <li key={e.id} className="flex gap-4 text-lg">
                  <span className="w-24 shrink-0 font-bold text-primary tabular-nums">{e.time || 'All day'}</span>
                  <span className="text-foreground">{e.title}{e.description && <span className="text-muted-foreground text-base"> · {e.description}</span>}</span>
                </li>
              ))}
            </ul>
          )}
          {tomorrowEvents.length > 0 && (
            <p className="border-t border-border/50 pt-3 text-sm text-muted-foreground">
              <span className="font-bold text-foreground">Tomorrow:</span> {tomorrowEvents.map((e) => `${e.time ? `${e.time} ` : ''}${e.title}`).join(' · ')}
            </p>
          )}
        </section>

        <section aria-labelledby="t-meals" className="flex flex-col gap-3 rounded-2xl bg-card border border-border/50 p-5">
          <h2 id="t-meals" className="flex items-center gap-2 text-lg font-bold text-foreground"><ChefHat className="w-5 h-5 text-primary" aria-hidden /> Meals today</h2>
          {meals.length === 0 ? (
            <p className="text-muted-foreground">Nothing planned. <Link href="/meal-plan" className="underline">Plan a meal</Link></p>
          ) : (
            <ul className="flex flex-col gap-2">
              {meals.map((m) => (
                <li key={m.id}>
                  <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{m.slot}</span>
                  {m.recipeId && m.kind === 'recipe' ? (
                    <Link href={`/recipes/${m.recipeId}`} className="text-lg font-semibold text-foreground hover:underline">{m.title}</Link>
                  ) : (
                    <span className="text-lg font-semibold text-foreground">{m.title}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodayReminders />
        </div>
        <nav aria-label="Food and home" className="flex flex-col gap-2">
          <QuickLink href="/chores" icon={CheckSquare} label="Chores" detail={choresToday.length ? `${choresDone} of ${choresToday.length} done today` : 'No chores today'} />
          <QuickLink href="/grocery-list" icon={ShoppingCart} label="Grocery list" detail={`${groceryCount.n} item${groceryCount.n === 1 ? '' : 's'} to buy`} />
          <QuickLink href="/grocery-wishlist" icon={ListChecks} label="Wishlist" detail={wishCount.n ? `${wishCount.n} waiting for a parent` : 'No open requests'} />
          <QuickLink href="/pantry" icon={Package} label="Pantry" detail={lowPantry.length ? `Low or out: ${lowPantry.map((p) => p.name).join(', ')}` : 'Everything stocked'} />
        </nav>
      </div>
    </div>
  )
}

function QuickLink({ href, icon: Icon, label, detail }: { href: string; icon: React.ElementType; label: string; detail: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl bg-card border border-border/50 p-4 hover:border-primary/50">
      <Icon className="w-6 h-6 shrink-0 text-primary" aria-hidden />
      <span className="min-w-0">
        <span className="block font-bold text-foreground">{label}</span>
        <span className="block truncate text-sm text-muted-foreground">{detail}</span>
      </span>
    </Link>
  )
}
