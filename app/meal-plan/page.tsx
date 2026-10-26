import { requirePageContext } from '@/lib/household'
import { MealPlan } from '@/components/food/meal-plan'

export const metadata = { title: 'Weekly Meal Plan' }

export default async function MealPlanPage() {
  await requirePageContext()
  return <MealPlan />
}
