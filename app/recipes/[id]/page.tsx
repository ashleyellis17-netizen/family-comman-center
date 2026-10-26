import { notFound } from 'next/navigation'
import { requirePageContext } from '@/lib/household'
import { RecipeDetail } from '@/components/food/recipe-detail'

export const metadata = { title: 'Recipe' }

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageContext()
  const { id } = await params
  const recipeId = Number(id)
  if (!Number.isInteger(recipeId) || recipeId <= 0) notFound()
  return <RecipeDetail id={recipeId} />
}
