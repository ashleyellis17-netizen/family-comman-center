import { and, asc, eq, gte, lte, ne } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events, mealPlanEntries, pantryItems } from '@/lib/db/schema';
import { requireActorPage } from '@/lib/household';
import { getGroceryCounts } from '@/lib/groceries';
import { addDaysToDateString, dateInTz, formatDateLabel, hourInTz, longDateLabel, timeToMinutes } from '@/lib/time';
import { TodaySummary } from '@/components/today/today-summary';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const actor = await requireActorPage();
  const today = dateInTz(actor.timezone);
  const weekEnd = addDaysToDateString(today, 6);
  const hour = hourInTz(actor.timezone);

  const [upcoming, dinners, lowPantry, counts] = await Promise.all([
    db
      .select()
      .from(events)
      .where(and(eq(events.householdId, actor.householdId), gte(events.date, today), lte(events.date, weekEnd)))
      .orderBy(asc(events.date)),
    db
      .select()
      .from(mealPlanEntries)
      .where(
        and(
          eq(mealPlanEntries.householdId, actor.householdId),
          eq(mealPlanEntries.date, today),
          eq(mealPlanEntries.slot, 'dinner'),
        ),
      ),
    db
      .select({ id: pantryItems.id, name: pantryItems.name, status: pantryItems.status })
      .from(pantryItems)
      .where(and(eq(pantryItems.householdId, actor.householdId), ne(pantryItems.status, 'in_stock')))
      .limit(6),
    getGroceryCounts(actor.householdId),
  ]);

  const sorted = upcoming
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date) || timeToMinutes(a.time) - timeToMinutes(b.time));

  return (
    <TodaySummary
      greeting={hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}
      name={actor.kind === 'user' ? actor.name.split(' ')[0] : actor.householdName}
      dateLabel={longDateLabel(today)}
      todayEvents={sorted
        .filter((e) => e.date === today)
        .map((e) => ({ id: e.id, title: e.title, time: e.time, category: e.category }))}
      laterEvents={sorted
        .filter((e) => e.date !== today)
        .slice(0, 5)
        .map((e) => ({ id: e.id, title: e.title, time: e.time, category: e.category, label: formatDateLabel(e.date, today) }))}
      dinner={dinners.map((d) => d.title)}
      lowPantry={lowPantry}
      counts={counts}
    />
  );
}
