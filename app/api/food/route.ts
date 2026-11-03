import { getActor } from '@/lib/household';
import { getFoodSnapshot } from '@/lib/food';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const actor = await getActor();
  if (!actor) return Response.json({ error: 'unauthenticated' }, { status: 401 });
  const week = new URL(request.url).searchParams.get('week') ?? undefined;
  const snapshot = await getFoodSnapshot(actor, week);
  return Response.json(snapshot, { headers: { 'Cache-Control': 'no-store' } });
}
