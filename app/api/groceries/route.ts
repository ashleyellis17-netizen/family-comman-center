import { getActor } from '@/lib/household';
import { getGrocerySnapshot } from '@/lib/groceries';

export const dynamic = 'force-dynamic';

export async function GET() {
  const actor = await getActor();
  if (!actor) return Response.json({ error: 'unauthenticated' }, { status: 401 });
  const snapshot = await getGrocerySnapshot(actor);
  return Response.json(snapshot, { headers: { 'Cache-Control': 'no-store' } });
}
