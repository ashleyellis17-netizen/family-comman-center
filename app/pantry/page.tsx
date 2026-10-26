import { requirePageContext } from '@/lib/household'
import { Pantry } from '@/components/food/pantry'

export const metadata = { title: 'Pantry & Staples' }

export default async function PantryPage() {
  const ctx = await requirePageContext()
  return <Pantry canEditPreferences={ctx.role !== 'display'} />
}
