import { ChefHat } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { RecipeLibrary } from '@/components/food/recipe-library';
import { getFoodSnapshot } from '@/lib/food';
import { requireActorPage } from '@/lib/household';

export const metadata = { title: 'Meal Ideas | Theveny Family Command Center' };

export default async function MealIdeasPage() {
  const actor = await requireActorPage();
  const initial = await getFoodSnapshot(actor);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Meal Ideas" description="Your family's saved recipes, ratings, and favorites" icon={ChefHat} />
      <RecipeLibrary initial={initial} />
    </div>
  );
}
