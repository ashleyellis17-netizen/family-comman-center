import { requirePageContext } from '@/lib/household'
import { GroceryList } from '@/components/food/grocery-list'

export const metadata = { title: 'Grocery List' }

export default async function GroceryListPage() {
  const ctx = await requirePageContext()
  return <GroceryList displayName={ctx.displayName} />
}
