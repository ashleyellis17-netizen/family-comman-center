import { ShoppingCart } from 'lucide-react';
import { GroceryList } from '@/components/groceries/grocery-list';
import { getGrocerySnapshot } from '@/lib/groceries';
import { requireActorPage } from '@/lib/household';

export const metadata = { title: 'Grocery List | Theveny Family Command Center' };

export default async function GroceryListPage() {
  const actor = await requireActorPage();
  const initial = await getGrocerySnapshot(actor);
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
          <ShoppingCart className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground text-balance">Grocery List</h1>
          <p className="text-muted-foreground">One shared list for the whole house.</p>
        </div>
      </header>
      <GroceryList initial={initial} />
    </div>
  );
}
