import { cookies } from 'next/headers';
import { and, eq, gt, isNotNull, lt, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { displayDevices, displayPairings } from '@/lib/db/schema';
import {
  DISPLAY_COOKIE,
  DISPLAY_COOKIE_MAX_AGE,
  PAIRING_COOKIE,
  cookieSecurity,
  hashSecret,
  newHumanCode,
  newSecret,
} from '@/lib/tokens';

export const dynamic = 'force-dynamic';

const PAIRING_TTL_MS = 10 * 60 * 1000;

/**
 * Display pairing, step 1: the display asks for a short code. The matching
 * secret lives only in an HttpOnly cookie on this device, so reading the code
 * off the screen is not enough to claim the session elsewhere.
 */
export async function POST() {
  const jar = await cookies();
  const secret = newSecret();
  const code = newHumanCode(6);
  await db.delete(displayPairings).where(lt(displayPairings.expiresAt, sql`now() - interval '1 day'`));
  const [row] = await db
    .insert(displayPairings)
    .values({ code, secretHash: hashSecret(secret), expiresAt: new Date(Date.now() + PAIRING_TTL_MS) })
    .returning({ expiresAt: displayPairings.expiresAt });
  jar.set(PAIRING_COOKIE, secret, { httpOnly: true, path: '/', maxAge: PAIRING_TTL_MS / 1000, ...cookieSecurity() });
  return Response.json({ code, expiresAt: row.expiresAt.toISOString() });
}

/** Step 2: the display polls until a parent approves the code on their phone. */
export async function GET() {
  const jar = await cookies();
  const secret = jar.get(PAIRING_COOKIE)?.value;
  if (!secret) return Response.json({ status: 'none' });

  const secretHash = hashSecret(secret);
  const [pairing] = await db
    .select()
    .from(displayPairings)
    .where(and(eq(displayPairings.secretHash, secretHash), gt(displayPairings.expiresAt, sql`now()`)))
    .limit(1);
  if (!pairing) return Response.json({ status: 'expired' });
  if (!pairing.approvedAt || !pairing.householdId) {
    return Response.json({ status: 'pending', code: pairing.code, expiresAt: pairing.expiresAt.toISOString() });
  }

  // Consume the approved pairing exactly once.
  const [claimed] = await db
    .delete(displayPairings)
    .where(and(eq(displayPairings.id, pairing.id), isNotNull(displayPairings.approvedAt)))
    .returning();
  if (!claimed?.householdId) return Response.json({ status: 'expired' });

  const token = newSecret();
  await db.insert(displayDevices).values({
    householdId: claimed.householdId,
    name: claimed.deviceName ?? 'Family display',
    tokenHash: hashSecret(token),
    pairedByUserId: claimed.approvedByUserId ?? 'unknown',
  });
  jar.set(DISPLAY_COOKIE, token, { httpOnly: true, path: '/', maxAge: DISPLAY_COOKIE_MAX_AGE, ...cookieSecurity() });
  jar.delete(PAIRING_COOKIE);
  return Response.json({ status: 'paired' });
}
