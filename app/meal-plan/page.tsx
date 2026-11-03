import { CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { MealPlanner } from '@/components/food/meal-planner';
import { getFoodSnapshot } from '@/lib/food';
import { requireActorPage } from '@/lib/household';

export const metadata = { title: 'Weekly Meal Plan | Theveny Family Command Center' };

export default async function MealPlanPage() {
  const actor = await requireActorPage();
  const initial = await getFoodSnapshot(actor);
  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Weekly Meal Plan" description="Plan the week, then shop for it in one tap" icon={CalendarDays} />
      <MealPlanner initial={initial} />
    </div>
  );
}
