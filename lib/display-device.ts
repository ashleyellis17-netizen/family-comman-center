import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { createHash, randomBytes, randomInt } from 'node:crypto'
import { and, eq, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { displayDevices, households } from '@/lib/db/schema'

export const DISPLAY_COOKIE = 'fcc-display'
export const PAIR_COOKIE = 'fcc-pair'
export const PAIRING_TTL_MS = 10 * 60 * 1000

// No 0/O, 1/I/L — the code is read off a wall screen and typed on a phone.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function newPairingCode() {
  return Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('')
}

export function normalizePairingCode(input: string) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function newSecret() {
  return randomBytes(32).toString('base64url')
}

export function hashSecret(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function cookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: true,
    // The v0 preview is a cross-site iframe in development; production stays first-party.
    sameSite: process.env.NODE_ENV === 'development' ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

/** Browsers cap cookie lifetime at 400 days; the display re-extends it on every visit. */
export const DISPLAY_COOKIE_MAX_AGE = 400 * 24 * 60 * 60

export const getDisplayDevice = cache(async () => {
  const token = (await cookies()).get(DISPLAY_COOKIE)?.value
  if (!token) return null
  const [row] = await db
    .select({ device: displayDevices, household: households })
    .from(displayDevices)
    .innerJoin(households, eq(households.id, displayDevices.householdId))
    .where(and(eq(displayDevices.tokenHash, hashSecret(token)), isNull(displayDevices.revokedAt)))
    .limit(1)
  if (!row) return null
  if (Date.now() - row.device.lastSeenAt.getTime() > 60 * 60 * 1000) {
    await db.update(displayDevices).set({ lastSeenAt: new Date() }).where(eq(displayDevices.id, row.device.id))
  }
  return row
})
