import { ListChecks } from 'lucide-react';
import { Wishlist } from '@/components/groceries/wishlist';
import { getGrocerySnapshot } from '@/lib/groceries';
import { requireActorPage } from '@/lib/household';

export const metadata = { title: 'Grocery Wishlist | Theveny Family Command Center' };

export default async function GroceryWishlistPage() {
  const actor = await requireActorPage();
  const initial = await getGrocerySnapshot(actor);
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-md">
          <ListChecks className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground text-balance">Grocery Wishlist</h1>
          <p className="text-muted-foreground">
            Ask for something. When a parent approves it, it goes straight onto the grocery list.
          </p>
        </div>
      </header>
      <Wishlist initial={initial} />
    </div>
  );
}
