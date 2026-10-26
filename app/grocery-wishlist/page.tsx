import { requirePageContext } from '@/lib/household'
import { Wishlist } from '@/components/food/wishlist'

export const metadata = { title: 'Grocery Wishlist' }

export default async function GroceryWishlistPage() {
  await requirePageContext()
  return <Wishlist />
}
