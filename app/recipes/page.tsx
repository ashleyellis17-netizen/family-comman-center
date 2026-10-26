import { requirePageContext } from '@/lib/household'
import { RecipeLibrary } from '@/components/food/recipe-library'

export const metadata = { title: 'Recipes' }

export default async function RecipesPage() {
  const ctx = await requirePageContext()
  return <RecipeLibrary canEdit={ctx.role !== 'display'} />
}
