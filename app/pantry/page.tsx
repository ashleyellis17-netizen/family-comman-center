import { Package } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { PantryManager } from '@/components/food/pantry-manager';
import { getFoodSnapshot } from '@/lib/food';
import { requireActorPage } from '@/lib/household';

export const metadata = { title: 'Pantry | Theveny Family Command Center' };

export default async function PantryPage() {
  const actor = await requireActorPage();
  const initial = await getFoodSnapshot(actor);
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Pantry" description="What's at home, and what's running low" icon={Package} />
      <PantryManager initial={initial} />
    </div>
  );
}
