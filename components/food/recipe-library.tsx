'use client';

import { useMemo, useState } from 'react';
import { Archive, CalendarPlus, ChefHat, Clock, Heart, Pencil, Plus, Search, ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { archiveRecipe, planMeal, rateRecipe, setRecipeFavorite, shopForRecipe } from '@/app/actions/food';
import { MEAL_SLOTS, MEAL_SLOT_LABELS, type FoodSnapshot, type Recipe, type ShoppingResult } from '@/lib/food-types';
import { newBatchKey, useFood } from '@/hooks/use-food';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RecipeFormDialog } from '@/components/food/recipe-form-dialog';
import { cn } from '@/lib/utils';

const FILTERS = [
  ['all', 'All'],
  ['favorites', 'Favorites'],
  ['kid', 'Kid friendly'],
  ['quick', '30 min or less'],
  ['try', 'Want to try'],
] as const;
type Filter = (typeof FILTERS)[number][0];

export function shoppingToast(result: ShoppingResult) {
  if (result.added.length === 0) {
    toast.info('Everything is already on the list or in the pantry.');
    return;
  }
  const extra = result.skipped.length ? ` Skipped ${result.skipped.length} already on hand.` : '';
  toast.success(`Added ${result.added.length} to the grocery list.${extra}`);
}

function totalMinutes(r: Recipe) {
  const t = (r.prepMinutes ?? 0) + (r.cookMinutes ?? 0);
  return t > 0 ? t : null;
}

function shortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RecipeLibrary({ initial }: { initial: FoodSnapshot }) {
  const { data, mutate } = useFood(initial);
  const snapshot = data ?? initial;
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [planning, setPlanning] = useState<Recipe | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return snapshot.recipes
      .filter((r) => {
        if (filter === 'favorites') return r.favorite;
        if (filter === 'kid') return r.kidFriendly;
        if (filter === 'try') return r.wantToTry;
        if (filter === 'quick') return (totalMinutes(r) ?? Infinity) <= 30;
        return true;
      })
      .filter((r) =>
        !q
          ? true
          : r.title.toLowerCase().includes(q) ||
            (r.mainIngredient ?? '').toLowerCase().includes(q) ||
            r.ingredients.some((i) => i.name.toLowerCase().includes(q))
      )
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || (b.avgRating ?? 0) - (a.avgRating ?? 0) || a.title.localeCompare(b.title));
  }, [snapshot.recipes, filter, query]);

  function patchRecipe(recipeId: number, patch: Partial<Recipe>) {
    mutate((cur) => (cur ? { ...cur, recipes: cur.recipes.map((r) => (r.id === recipeId ? { ...r, ...patch } : r)) } : cur), { revalidate: false });
  }

  async function run<T>(key: string, action: () => Promise<{ ok: true; data?: T } | { ok: false; error: string }>, onOk?: (data: T) => void) {
    setBusy(key);
    const result = await action();
    setBusy(null);
    if (!result.ok) toast.error(result.error);
    else onOk?.(result.data as T);
    mutate();
    return result.ok;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes or ingredients"
            aria-label="Search recipes"
            className="h-12 rounded-2xl pl-9"
          />
        </div>
        <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="h-12 rounded-2xl px-5">
          <Plus className="h-5 w-5" aria-hidden="true" /> New recipe
        </Button>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter recipes">
        {FILTERS.map(([f, label]) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              'touch-target rounded-2xl px-4 py-2 text-sm font-bold transition-colors',
              filter === f ? 'bg-primary text-primary-foreground shadow-sm' : 'border border-border/60 bg-card text-muted-foreground hover:bg-accent'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {snapshot.recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <ChefHat className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-bold text-foreground">No recipes saved yet</h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Save the meals your family makes. Then you can plan them on the calendar and send their ingredients to the grocery list in one tap.
          </p>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="mt-2 h-11 rounded-2xl">
            <Plus className="h-4 w-4" aria-hidden="true" /> Add your first recipe
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <p className="rounded-3xl border border-border/50 bg-card px-6 py-10 text-center text-muted-foreground">No recipes match. Try a different filter or search.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visible.map((r) => {
            const minutes = totalMinutes(r);
            return (
              <li key={r.id} className="flex flex-col gap-3 rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-foreground text-balance">{r.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {[r.mainIngredient, r.cuisine, minutes ? `${minutes} min` : null, r.servings ? `serves ${r.servings}` : null].filter(Boolean).join(' · ') || 'No details yet'}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={r.favorite}
                    aria-label={r.favorite ? `Remove ${r.title} from favorites` : `Mark ${r.title} as a favorite`}
                    onClick={() => {
                      patchRecipe(r.id, { favorite: !r.favorite });
                      run(`fav-${r.id}`, () => setRecipeFavorite(r.id, !r.favorite));
                    }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl hover:bg-accent"
                  >
                    <Heart className={cn('h-5 w-5', r.favorite ? 'fill-destructive text-destructive' : 'text-muted-foreground')} aria-hidden="true" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <div className="flex items-center" role="group" aria-label={`Your rating for ${r.title}`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-label={`${n} star${n > 1 ? 's' : ''}${r.myRating === n ? ' (tap to clear)' : ''}`}
                        aria-pressed={(r.myRating ?? 0) >= n}
                        onClick={() => {
                          const next = r.myRating === n ? 0 : n;
                          patchRecipe(r.id, { myRating: next || null });
                          run(`rate-${r.id}`, () => rateRecipe(r.id, next));
                        }}
                        className="flex h-9 w-8 items-center justify-center"
                      >
                        <Star className={cn('h-5 w-5', (r.myRating ?? 0) >= n ? 'fill-warning text-warning' : 'text-muted-foreground/40')} aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {r.ratingCount ? `Family avg ${r.avgRating} (${r.ratingCount})` : 'Not rated yet'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {r.kidFriendly && <span className="rounded-full bg-jaxon/10 px-2.5 py-1 text-xs font-semibold text-jaxon">Kid friendly</span>}
                  {r.budgetFriendly && <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">Budget</span>}
                  {r.wantToTry && <span className="rounded-full bg-carson/10 px-2.5 py-1 text-xs font-semibold text-carson">Want to try</span>}
                  {minutes !== null && minutes <= 30 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-alex/10 px-2.5 py-1 text-xs font-semibold text-alex">
                      <Clock className="h-3 w-3" aria-hidden="true" /> Quick
                    </span>
                  )}
                </div>

                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {r.ingredients.length ? r.ingredients.map((i) => i.name).join(', ') : 'No ingredients listed.'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {r.lastPlanned ? `Last on the menu ${shortDate(r.lastPlanned)}` : 'Not on the menu yet'}
                  {r.timesCooked ? ` · cooked ${r.timesCooked}×` : ''}
                </p>

                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <Button size="sm" className="h-10 rounded-xl" onClick={() => setPlanning(r)}>
                    <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Plan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10 rounded-xl"
                    disabled={busy === `shop-${r.id}`}
                    onClick={() => run<ShoppingResult>(`shop-${r.id}`, () => shopForRecipe(r.id, newBatchKey()), shoppingToast)}
                  >
                    <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Shop ingredients
                  </Button>
                  <Button size="sm" variant="ghost" className="h-10 rounded-xl" onClick={() => { setEditing(r); setFormOpen(true); }}>
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit
                  </Button>
                  {snapshot.viewer.canManage && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 rounded-xl text-muted-foreground"
                      onClick={() => {
                        if (!window.confirm(`Archive “${r.title}”? Past meal plans keep their history.`)) return;
                        run(`archive-${r.id}`, () => archiveRecipe(r.id), () => toast.success('Recipe archived'));
                      }}
                    >
                      <Archive className="h-4 w-4" aria-hidden="true" />
                      <span className="sr-only">Archive {r.title}</span>
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <RecipeFormDialog open={formOpen} onOpenChange={setFormOpen} recipe={editing} onSaved={() => mutate()} />
      <PlanRecipeDialog recipe={planning} today={snapshot.today} onClose={() => setPlanning(null)} onPlanned={() => mutate()} />
    </div>
  );
}

function PlanRecipeDialog({ recipe, today, onClose, onPlanned }: { recipe: Recipe | null; today: string; onClose: () => void; onPlanned: () => void }) {
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recipe) return;
    const form = new FormData(e.currentTarget);
    setSaving(true);
    const result = await planMeal({ recipeId: recipe.id, date: form.get('date'), slot: form.get('slot') });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${recipe.title} added to the meal plan`);
    onPlanned();
    onClose();
  }

  return (
    <Dialog open={recipe !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Plan {recipe?.title}</DialogTitle>
          <DialogDescription>Pick the day and meal.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="plan-date">Day</Label>
            <Input id="plan-date" name="date" type="date" required defaultValue={today} className="h-11" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="plan-slot">Meal</Label>
            <select id="plan-slot" name="slot" defaultValue="dinner" className="h-11 rounded-md border border-input bg-background px-3 text-foreground">
              {MEAL_SLOTS.map((s) => (
                <option key={s} value={s}>{MEAL_SLOT_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving} className="h-11">Add to plan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
