'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { saveRecipe } from '@/app/actions/food';
import { ingredientToLine } from '@/lib/ingredients';
import type { Recipe } from '@/lib/food-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VoiceButton } from '@/components/food/voice-button';

export function RecipeFormDialog({
  open,
  onOpenChange,
  recipe,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Recipe | null;
  onSaved: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{recipe ? 'Edit recipe' : 'New recipe'}</DialogTitle>
          <DialogDescription>Saved for the whole family. Put one ingredient on each line, like “2 lb chicken thighs”.</DialogDescription>
        </DialogHeader>
        {/* Keyed so reopening for a different recipe resets the fields. */}
        <RecipeForm key={recipe?.id ?? 'new'} recipe={recipe} onDone={() => { onOpenChange(false); onSaved(); }} />
      </DialogContent>
    </Dialog>
  );
}

function RecipeForm({ recipe, onDone }: { recipe: Recipe | null; onDone: () => void }) {
  const [title, setTitle] = useState(recipe?.title ?? '');
  const [ingredients, setIngredients] = useState(recipe?.ingredients.map(ingredientToLine).join('\n') ?? '');
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    const result = await saveRecipe({
      id: recipe?.id,
      title,
      ingredientsText: ingredients,
      instructions: form.get('instructions'),
      servings: form.get('servings'),
      prepMinutes: form.get('prepMinutes'),
      cookMinutes: form.get('cookMinutes'),
      cuisine: form.get('cuisine'),
      mainIngredient: form.get('mainIngredient'),
      sourceUrl: form.get('sourceUrl'),
      kidFriendly: form.get('kidFriendly') === 'on',
      budgetFriendly: form.get('budgetFriendly') === 'on',
      wantToTry: form.get('wantToTry') === 'on',
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(recipe ? 'Recipe updated' : 'Recipe saved');
    onDone();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="recipe-title">Name</Label>
        <div className="flex gap-2">
          <Input id="recipe-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} className="h-11" placeholder="Chicken tacos" />
          <VoiceButton label="Say the recipe name" onResult={setTitle} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="recipe-ingredients">Ingredients</Label>
        <div className="flex gap-2">
          <Textarea
            id="recipe-ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            rows={6}
            maxLength={4000}
            placeholder={'2 lb chicken thighs\n8 tortillas\n1 cup shredded cheese'}
          />
          <VoiceButton
            label="Say an ingredient to add a line"
            onResult={(text) => setIngredients((cur) => (cur.trim() ? `${cur.replace(/\s+$/, '')}\n${text}` : text))}
            className="self-start"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="servings">Serves</Label>
          <Input id="servings" name="servings" type="number" inputMode="numeric" min={0} max={100} defaultValue={recipe?.servings ?? ''} className="h-11" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="prepMinutes">Prep min</Label>
          <Input id="prepMinutes" name="prepMinutes" type="number" inputMode="numeric" min={0} max={1440} defaultValue={recipe?.prepMinutes ?? ''} className="h-11" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cookMinutes">Cook min</Label>
          <Input id="cookMinutes" name="cookMinutes" type="number" inputMode="numeric" min={0} max={1440} defaultValue={recipe?.cookMinutes ?? ''} className="h-11" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="mainIngredient">Main ingredient</Label>
          <Input id="mainIngredient" name="mainIngredient" maxLength={40} defaultValue={recipe?.mainIngredient ?? ''} className="h-11" placeholder="Chicken" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="cuisine">Cuisine</Label>
          <Input id="cuisine" name="cuisine" maxLength={40} defaultValue={recipe?.cuisine ?? ''} className="h-11" placeholder="Mexican" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="instructions">Steps</Label>
        <Textarea id="instructions" name="instructions" rows={4} maxLength={6000} defaultValue={recipe?.instructions ?? ''} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="sourceUrl">Recipe link</Label>
        <Input id="sourceUrl" name="sourceUrl" type="url" maxLength={500} defaultValue={recipe?.sourceUrl ?? ''} className="h-11" placeholder="https://" />
      </div>

      <fieldset className="flex flex-wrap gap-x-5 gap-y-2">
        <legend className="sr-only">Tags</legend>
        {(
          [
            ['kidFriendly', 'Kid friendly', recipe?.kidFriendly],
            ['budgetFriendly', 'Budget friendly', recipe?.budgetFriendly],
            ['wantToTry', 'Want to try', recipe?.wantToTry ?? !recipe],
          ] as const
        ).map(([name, label, checked]) => (
          <label key={name} className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" name={name} defaultChecked={Boolean(checked)} className="h-5 w-5 accent-primary" />
            {label}
          </label>
        ))}
      </fieldset>

      <DialogFooter>
        <Button type="submit" disabled={saving || !title.trim()} className="h-11 min-w-32">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {recipe ? 'Save changes' : 'Save recipe'}
        </Button>
      </DialogFooter>
    </form>
  );
}
