'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { and, eq, gt, inArray, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import {
  displayDevices,
  displayPairings,
  householdInvites,
  householdMembers,
  households,
  session as sessionTable,
} from '@/lib/db/schema';
import { getSessionUser, requireActor, requireParent } from '@/lib/household';
import { PROFILE_COOKIE, findProfile } from '@/lib/family';
import { DISPLAY_COOKIE, cookieSecurity, hashSecret, newHumanCode, newSecret, normalizeCode } from '@/lib/tokens';
import { US_TIMEZONES } from '@/lib/time';

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const fail = (error: string) => ({ ok: false as const, error });

const nameSchema = z.string().trim().min(1).max(60);

/** First account with no household creates one and becomes a parent. */
export async function createHousehold(input: { householdName: string; displayName: string; timezone: string }): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return fail('Please sign in again.');
  const parsed = z
    .object({ householdName: nameSchema, displayName: nameSchema, timezone: z.enum(US_TIMEZONES) })
    .safeParse(input);
  if (!parsed.success) return fail('Please fill in every field.');

  const [existing] = await db.select({ id: householdMembers.id }).from(householdMembers).where(eq(householdMembers.userId, user.id));
  if (existing) return { ok: true };

  await db.transaction(async (tx) => {
    const [h] = await tx
      .insert(households)
      .values({ name: parsed.data.householdName, timezone: parsed.data.timezone })
      .returning({ id: households.id });
    await tx
      .insert(householdMembers)
      .values({ householdId: h.id, userId: user.id, role: 'parent', displayName: parsed.data.displayName })
      .onConflictDoNothing();
  });
  return { ok: true };
}

export async function joinHousehold(input: { code: string; displayName: string }): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return fail('Please sign in again.');
  const displayName = nameSchema.safeParse(input.displayName);
  if (!displayName.success) return fail('Enter your name.');
  const code = normalizeCode(input.code);

  return db.transaction(async (tx) => {
    // Claim the invite atomically so it can only be used once.
    const [invite] = await tx
      .update(householdInvites)
      .set({ usedAt: sql`now()`, usedBy: user.id })
      .where(and(eq(householdInvites.code, code), isNull(householdInvites.usedAt), gt(householdInvites.expiresAt, sql`now()`)))
      .returning();
    if (!invite) return fail('That invite code is invalid or has expired.');
    const inserted = await tx
      .insert(householdMembers)
      .values({ householdId: invite.householdId, userId: user.id, role: invite.role === 'parent' ? 'parent' : 'member', displayName: displayName.data })
      .onConflictDoNothing()
      .returning({ id: householdMembers.id });
    if (inserted.length === 0) {
      tx.rollback();
    }
    return { ok: true as const };
  }).catch(() => fail('This account already belongs to a household.'));
}

export async function createInvite(role: 'parent' | 'member'): Promise<ActionResult<{ code: string; expiresAt: string }>> {
  const parent = await requireParent();
  const code = newHumanCode(8);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(householdInvites).values({
    householdId: parent.householdId,
    code,
    role: role === 'parent' ? 'parent' : 'member',
    createdBy: parent.userId,
    expiresAt,
  });
  revalidatePath('/settings');
  return { ok: true, data: { code, expiresAt: expiresAt.toISOString() } };
}

export async function updateMemberRole(memberId: number, role: 'parent' | 'member'): Promise<ActionResult> {
  const parent = await requireParent();
  const members = await db.select().from(householdMembers).where(eq(householdMembers.householdId, parent.householdId));
  const target = members.find((m) => m.id === memberId);
  if (!target) return fail('Member not found.');
  if (role === 'member' && target.role === 'parent' && members.filter((m) => m.role === 'parent').length <= 1) {
    return fail('The household needs at least one parent.');
  }
  await db
    .update(householdMembers)
    .set({ role })
    .where(and(eq(householdMembers.id, memberId), eq(householdMembers.householdId, parent.householdId)));
  revalidatePath('/settings');
  return { ok: true };
}

export async function updateHousehold(input: { name: string; timezone: string }): Promise<ActionResult> {
  const parent = await requireParent();
  const parsed = z.object({ name: nameSchema, timezone: z.enum(US_TIMEZONES) }).safeParse(input);
  if (!parsed.success) return fail('Enter a name and choose a timezone.');
  await db.update(households).set(parsed.data).where(eq(households.id, parent.householdId));
  revalidatePath('/', 'layout');
  return { ok: true };
}

/** Which family member is using this screen. Attribution only — never grants permissions. */
export async function setActiveProfile(profileId: string | null): Promise<ActionResult> {
  await requireActor();
  const jar = await cookies();
  const profile = findProfile(profileId);
  if (!profile) {
    jar.delete(PROFILE_COOKIE);
  } else {
    jar.set(PROFILE_COOKIE, profile.id, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 400,
      ...cookieSecurity(),
    });
  }
  revalidatePath('/', 'layout');
  return { ok: true };
}

/** Parent-only: ends every account session and unpairs every display in the household. */
export async function signOutAllDevices(): Promise<ActionResult> {
  const parent = await requireParent();
  const members = await db
    .select({ userId: householdMembers.userId })
    .from(householdMembers)
    .where(eq(householdMembers.householdId, parent.householdId));
  const userIds = members.map((m) => m.userId);
  await db.transaction(async (tx) => {
    if (userIds.length) await tx.delete(sessionTable).where(inArray(sessionTable.userId, userIds));
    await tx
      .update(displayDevices)
      .set({ revokedAt: sql`now()` })
      .where(and(eq(displayDevices.householdId, parent.householdId), isNull(displayDevices.revokedAt)));
  });
  const jar = await cookies();
  jar.delete(DISPLAY_COOKIE);
  return { ok: true };
}

// ---- Display devices (Cozyla) ----

export async function approveDisplayPairing(input: { code: string; deviceName: string }): Promise<ActionResult> {
  const parent = await requireParent();
  const deviceName = nameSchema.safeParse(input.deviceName);
  if (!deviceName.success) return fail('Give this display a name.');
  const code = normalizeCode(input.code);
  const [row] = await db
    .update(displayPairings)
    .set({
      householdId: parent.householdId,
      deviceName: deviceName.data,
      approvedByUserId: parent.userId,
      approvedAt: sql`now()`,
    })
    .where(and(eq(displayPairings.code, code), isNull(displayPairings.approvedAt), gt(displayPairings.expiresAt, sql`now()`)))
    .returning({ id: displayPairings.id });
  if (!row) return fail('That code was not found or has expired. Refresh the code on the display and try again.');
  revalidatePath('/settings');
  return { ok: true };
}

export async function revokeDisplay(deviceId: number): Promise<ActionResult> {
  const parent = await requireParent();
  await db
    .update(displayDevices)
    .set({ revokedAt: sql`now()` })
    .where(and(eq(displayDevices.id, deviceId), eq(displayDevices.householdId, parent.householdId)));
  revalidatePath('/settings');
  return { ok: true };
}

/** "Log out this device" for a paired display. */
export async function unpairThisDisplay(): Promise<ActionResult> {
  const jar = await cookies();
  const token = jar.get(DISPLAY_COOKIE)?.value;
  if (token) {
    await db.update(displayDevices).set({ revokedAt: sql`now()` }).where(eq(displayDevices.tokenHash, hashSecret(token)));
  }
  jar.delete(DISPLAY_COOKIE);
  jar.delete(PROFILE_COOKIE);
  return { ok: true };
}

export async function getOrCreateCalendarToken(): Promise<ActionResult<{ token: string }>> {
  const parent = await requireParent();
  const [h] = await db.select({ token: households.calendarToken }).from(households).where(eq(households.id, parent.householdId));
  if (h?.token) return { ok: true, data: { token: h.token } };
  const token = newSecret(24);
  await db.update(households).set({ calendarToken: token }).where(eq(households.id, parent.householdId));
  return { ok: true, data: { token } };
}

export async function rotateCalendarToken(): Promise<ActionResult<{ token: string }>> {
  const parent = await requireParent();
  const token = newSecret(24);
  await db.update(households).set({ calendarToken: token }).where(eq(households.id, parent.householdId));
  revalidatePath('/settings');
  return { ok: true, data: { token } };
}
