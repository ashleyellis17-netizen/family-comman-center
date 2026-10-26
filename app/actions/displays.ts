'use server'

import { cookies } from 'next/headers'
import { and, desc, eq, gt, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import { displayDevices, displayPairings } from '@/lib/db/schema'
import { requireHousehold, requireParent } from '@/lib/household'
import { UserError, cleanText, run } from '@/lib/action'
import { DISPLAY_COOKIE, normalizePairingCode } from '@/lib/display-device'

export async function approveDisplayPairing(input: { code: string; name: string }) {
  return run('display.approve', async () => {
    const ctx = await requireParent()
    const code = normalizePairingCode(input.code ?? '')
    if (code.length !== 6) throw new UserError('Enter the 6-character code shown on the display.')
    const name = cleanText(input.name, 40) ?? 'Shared display'
    const [approved] = await db
      .update(displayPairings)
      .set({ householdId: ctx.householdId, deviceName: name, approvedByUserId: ctx.userId, approvedAt: new Date() })
      .where(and(eq(displayPairings.code, code), isNull(displayPairings.approvedAt), gt(displayPairings.expiresAt, new Date())))
      .returning({ id: displayPairings.id })
    if (!approved) throw new UserError('That code is expired or not recognized. Check the display for the current code.')
    return { name }
  })
}

export async function listDisplayDevices() {
  return run('display.list', async () => {
    const ctx = await requireParent()
    return db
      .select({ id: displayDevices.id, name: displayDevices.name, createdAt: displayDevices.createdAt, lastSeenAt: displayDevices.lastSeenAt })
      .from(displayDevices)
      .where(and(eq(displayDevices.householdId, ctx.householdId), isNull(displayDevices.revokedAt)))
      .orderBy(desc(displayDevices.createdAt))
  })
}

export async function revokeDisplayDevice(id: number) {
  return run('display.revoke', async () => {
    const ctx = await requireParent()
    const [row] = await db
      .update(displayDevices)
      .set({ revokedAt: new Date() })
      .where(and(eq(displayDevices.id, id), eq(displayDevices.householdId, ctx.householdId), isNull(displayDevices.revokedAt)))
      .returning({ id: displayDevices.id })
    if (!row) throw new UserError('That display is already unpaired.')
    return true
  })
}

/** Run on the display itself: forgets this screen so it needs a new code. */
export async function unpairThisDisplay() {
  return run('display.unpairSelf', async () => {
    const ctx = await requireHousehold()
    if (ctx.deviceId) {
      await db
        .update(displayDevices)
        .set({ revokedAt: new Date() })
        .where(and(eq(displayDevices.id, ctx.deviceId), eq(displayDevices.householdId, ctx.householdId)))
    }
    ;(await cookies()).delete(DISPLAY_COOKIE)
    return true
  })
}
