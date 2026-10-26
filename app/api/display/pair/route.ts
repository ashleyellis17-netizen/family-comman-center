import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { and, eq, gt, isNotNull, lt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { displayDevices, displayPairings } from '@/lib/db/schema'
import {
  DISPLAY_COOKIE,
  DISPLAY_COOKIE_MAX_AGE,
  PAIR_COOKIE,
  PAIRING_TTL_MS,
  cookieOptions,
  getDisplayDevice,
  hashSecret,
  newPairingCode,
  newSecret,
} from '@/lib/display-device'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

/** Starts pairing: the display gets a short code to show and a secret cookie only it holds. */
export async function POST() {
  try {
    await db.delete(displayPairings).where(lt(displayPairings.expiresAt, new Date()))
    const expiresAt = new Date(Date.now() + PAIRING_TTL_MS)
    const secret = newSecret()
    let code = ''
    for (let attempt = 0; attempt < 5 && !code; attempt++) {
      const candidate = newPairingCode()
      const [taken] = await db
        .select({ id: displayPairings.id })
        .from(displayPairings)
        .where(and(eq(displayPairings.code, candidate), gt(displayPairings.expiresAt, new Date())))
        .limit(1)
      if (!taken) code = candidate
    }
    if (!code) return NextResponse.json({ error: 'Could not create a code. Try again.' }, { status: 503, headers: noStore })
    await db.insert(displayPairings).values({ code, secretHash: hashSecret(secret), expiresAt })
    ;(await cookies()).set(PAIR_COOKIE, secret, cookieOptions(PAIRING_TTL_MS / 1000))
    return NextResponse.json({ code, expiresAt: expiresAt.toISOString() }, { headers: noStore })
  } catch (error) {
    console.error('[display.pair.start]', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ error: 'Could not start pairing. Check the connection and try again.' }, { status: 500, headers: noStore })
  }
}

/** Polled by the display. Once a parent approves the code, exchanges the pairing for a long-lived device cookie. */
export async function GET() {
  try {
    const store = await cookies()
    if (await getDisplayDevice()) return NextResponse.json({ status: 'paired' }, { headers: noStore })
    const secret = store.get(PAIR_COOKIE)?.value
    if (!secret) return NextResponse.json({ status: 'expired' }, { headers: noStore })

    const [pairing] = await db.select().from(displayPairings).where(eq(displayPairings.secretHash, hashSecret(secret))).limit(1)
    if (!pairing || pairing.expiresAt < new Date()) return NextResponse.json({ status: 'expired' }, { headers: noStore })
    if (!pairing.approvedAt || !pairing.householdId) return NextResponse.json({ status: 'pending' }, { headers: noStore })

    // Deleting with a guard makes the exchange single-use even if two polls race.
    const [claimed] = await db
      .delete(displayPairings)
      .where(and(eq(displayPairings.id, pairing.id), isNotNull(displayPairings.approvedAt)))
      .returning()
    if (!claimed?.householdId) return NextResponse.json({ status: 'pending' }, { headers: noStore })

    const token = newSecret()
    await db.insert(displayDevices).values({
      householdId: claimed.householdId,
      name: claimed.deviceName ?? 'Shared display',
      tokenHash: hashSecret(token),
      pairedByUserId: claimed.approvedByUserId ?? 'unknown',
    })
    store.set(DISPLAY_COOKIE, token, cookieOptions(DISPLAY_COOKIE_MAX_AGE))
    store.delete(PAIR_COOKIE)
    return NextResponse.json({ status: 'paired' }, { headers: noStore })
  } catch (error) {
    console.error('[display.pair.status]', error instanceof Error ? error.message : 'unknown error')
    return NextResponse.json({ status: 'error' }, { status: 500, headers: noStore })
  }
}
