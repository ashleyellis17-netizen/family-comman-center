'use client';

import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Loader2, Plus, ShoppingCart, Trash2, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { planMeal, removeMeal, setMealCooked, shopForWeek } from '@/app/actions/food';
import { MEAL_SLOTS, MEAL_SLOT_LABELS, type FoodSnapshot, type MealEntry, type MealSlot } from '@/lib/food-types';
import { addDaysToDateString } from '@/lib/time';
import { newBatchKey, useFood } from '@/hooks/use-food';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VoiceButton } from '@/components/food/voice-button';
import { shoppingToast } from '@/components/food/recipe-library';
import { cn } from '@/lib/utils';

function dayLabel(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  };
}

export function MealPlanner({ initial }: { initial: FoodSnapshot }) {
  const [week, setWeek] = useState(initial.weekStart);
  const { data, mutate, isLoading } = useFood(initial, week);
  const snapshot = data;
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [shopping, setShopping] = useState(false);

  const days = Array.from({ length: 7 }, (_, i) => addDaysToDateString(week, i));
  const thisWeek = initial.weekStart;
  const weekEnd = days[6];

  async function onShopWeek() {
    setShopping(true);
    const result = await shopForWeek(week, newBatchKey());
    setShopping(false);
    if (!result.ok) toast.error(result.error);
    else shoppingToast(result.data!);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={() => setWeek(addDaysToDateString(week, -7))} aria-label="Previous week">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
          <p className="min-w-44 text-center font-bold text-foreground" aria-live="polite">
            {dayLabel(week).day} – {dayLabel(weekEnd).day}
          </p>
          <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl" onClick={() => setWeek(addDaysToDateString(week, 7))} aria-label="Next week">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Button>
          {week !== thisWeek && (
            <Button variant="ghost" className="h-11 rounded-xl" onClick={() => setWeek(thisWeek)}>This week</Button>
          )}
        </div>
        <Button onClick={onShopWeek} disabled={shopping || !snapshot} className="h-11 rounded-xl">
          {shopping ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShoppingCart className="h-4 w-4" aria-hidden="true" />}
          Shop this week&apos;s ingredients
        </Button>
      </div>

      {!snapshot ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-border/50 bg-card py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> {isLoading ? 'Loading week' : 'Could not load this week'}
        </div>
      ) : (
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {days.map((date) => {
            const meals = snapshot.meals.filter((m) => m.date === date);
            const { weekday, day } = dayLabel(date);
            const isToday = date === snapshot.today;
            return (
              <li
                key={date}
                className={cn('flex flex-col gap-2 rounded-3xl border bg-card p-4 shadow-sm', isToday ? 'border-primary ring-2 ring-primary/20' : 'border-border/50')}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-extrabold text-foreground">{weekday}</h3>
                  <span className={cn('text-xs font-semibold', isToday ? 'text-primary' : 'text-muted-foreground')}>{isToday ? 'Today' : day}</span>
                </div>
                {meals.length === 0 && addingTo !== date && <p className="py-2 text-sm text-muted-foreground">Nothing planned</p>}
                <ul className="flex flex-col gap-2">
                  {MEAL_SLOTS.flatMap((slot) => meals.filter((m) => m.slot === slot)).map((m) => (
                    <MealRow key={m.id} meal={m} onChanged={() => mutate()} />
                  ))}
                </ul>
                {addingTo === date ? (
                  <AddMealForm
                    date={date}
                    recipes={snapshot.recipes.map((r) => ({ id: r.id, title: r.title }))}
                    onDone={() => { setAddingTo(null); mutate(); }}
                    onCancel={() => setAddingTo(null)}
                  />
                ) : (
                  <Button variant="ghost" size="sm" className="mt-auto h-10 justify-start rounded-xl text-muted-foreground" onClick={() => setAddingTo(date)}>
                    <Plus className="h-4 w-4" aria-hidden="true" /> Add meal
                  </Button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function MealRow({ meal, onChanged }: { meal: MealEntry; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  async function act(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    const result = await fn();
    setBusy(false);
    if (!result.ok) toast.error(result.error ?? 'Could not update that meal.');
    onChanged();
  }
  return (
    <li className={cn('flex items-center gap-2 rounded-2xl bg-muted/60 p-2 pl-3', meal.cooked && 'opacity-60')}>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{MEAL_SLOT_LABELS[meal.slot]}</p>
        <p className={cn('truncate text-sm font-semibold text-foreground', meal.cooked && 'line-through')}>
          {meal.kind === 'custom' && <Utensils className="mr-1 inline h-3 w-3 text-muted-foreground" aria-label="Not from a saved recipe" />}
          {meal.title}
        </p>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => act(() => setMealCooked(meal.id, !meal.cooked))}
        aria-pressed={meal.cooked}
        aria-label={meal.cooked ? `Mark ${meal.title} as not cooked` : `Mark ${meal.title} as cooked`}
        className={cn('flex h-9 w-9 items-center justify-center rounded-xl', meal.cooked ? 'bg-success text-success-foreground' : 'text-muted-foreground hover:bg-background')}
      >
        <Check className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => act(() => removeMeal(meal.id))}
        aria-label={`Remove ${meal.title} from the plan`}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-background hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}

function AddMealForm({
  date,
  recipes,
  onDone,
  onCancel,
}: {
  date: string;
  recipes: { id: number; title: string }[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [slot, setSlot] = useState<MealSlot>('dinner');
  const [recipeId, setRecipeId] = useState<string>(recipes[0] ? String(recipes[0].id) : 'custom');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await planMeal(
      recipeId === 'custom' ? { date, slot, title } : { date, slot, recipeId: Number(recipeId) }
    );
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background p-3">
      <label className="sr-only" htmlFor={`slot-${date}`}>Meal</label>
      <select id={`slot-${date}`} value={slot} onChange={(e) => setSlot(e.target.value as MealSlot)} className="h-10 rounded-lg border border-input bg-background px-2 text-sm text-foreground">
        {MEAL_SLOTS.map((s) => <option key={s} value={s}>{MEAL_SLOT_LABELS[s]}</option>)}
      </select>
      <label className="sr-only" htmlFor={`recipe-${date}`}>Recipe</label>
      <select id={`recipe-${date}`} value={recipeId} onChange={(e) => setRecipeId(e.target.value)} className="h-10 rounded-lg border border-input bg-background px-2 text-sm text-foreground">
        {recipes.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
        <option value="custom">Something else…</option>
      </select>
      {recipeId === 'custom' && (
        <div className="flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Leftovers, pizza night…" aria-label="Meal name" maxLength={120} className="h-10" required autoFocus />
          <VoiceButton label="Say the meal" onResult={setTitle} className="h-10 w-10" />
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving} className="h-9 flex-1 rounded-lg">Add</Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="h-9 rounded-lg">Cancel</Button>
      </div>
    </form>
  );
}
