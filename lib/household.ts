import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { and, asc, eq, isNull, lt, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { displayDevices, householdMembers, households, user } from '@/lib/db/schema';
import { OPEN_ACCESS } from '@/lib/access';
import { DISPLAY_COOKIE, hashSecret } from '@/lib/tokens';
import { PROFILE_COOKIE, findProfile } from '@/lib/family';

type HouseholdInfo = { householdId: number; householdName: string; timezone: string };

export type UserActor = HouseholdInfo & {
  kind: 'user';
  userId: string;
  email: string;
  role: 'parent' | 'member';
  name: string;
};

export type DisplayActor = HouseholdInfo & {
  kind: 'display';
  deviceId: number;
  deviceName: string;
  role: 'display';
  /** Attribution only — the profile chosen on the shared screen. */
  name: string;
};

export type Actor = UserActor | DisplayActor;

export class AuthError extends Error {
  constructor(public code: 'unauthenticated' | 'forbidden' | 'no-household') {
    super(code);
  }
}

export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
});

async function getDisplayActor(): Promise<DisplayActor | null> {
  const jar = await cookies();
  const token = jar.get(DISPLAY_COOKIE)?.value;
  if (!token) return null;

  const [row] = await db
    .select({
      deviceId: displayDevices.id,
      deviceName: displayDevices.name,
      lastSeenAt: displayDevices.lastSeenAt,
      householdId: households.id,
      householdName: households.name,
      timezone: households.timezone,
    })
    .from(displayDevices)
    .innerJoin(households, eq(households.id, displayDevices.householdId))
    .where(and(eq(displayDevices.tokenHash, hashSecret(token)), isNull(displayDevices.revokedAt)))
    .limit(1);
  if (!row) return null;

  // Throttled heartbeat so parents can see when a display was last active.
  if (Date.now() - row.lastSeenAt.getTime() > 15 * 60 * 1000) {
    await db
      .update(displayDevices)
      .set({ lastSeenAt: sql`now()` })
      .where(and(eq(displayDevices.id, row.deviceId), lt(displayDevices.lastSeenAt, sql`now() - interval '15 minutes'`)));
  }

  const profile = findProfile(jar.get(PROFILE_COOKIE)?.value);
  return {
    kind: 'display',
    role: 'display',
    deviceId: row.deviceId,
    deviceName: row.deviceName,
    householdId: row.householdId,
    householdName: row.householdName,
    timezone: row.timezone,
    name: profile?.name ?? row.deviceName,
  };
}

/**
 * Resolves who is making this request. A signed-in account always wins over a
 * display-device cookie, so a parent signing in on the Cozyla gets their own
 * permissions and signing out returns it to display mode.
 */
export const getActor = cache(async (): Promise<Actor | null> => {
  const user = await getSessionUser();
  if (user) {
    const [m] = await db
      .select({
        role: householdMembers.role,
        displayName: householdMembers.displayName,
        householdId: households.id,
        householdName: households.name,
        timezone: households.timezone,
      })
      .from(householdMembers)
      .innerJoin(households, eq(households.id, householdMembers.householdId))
      .where(eq(householdMembers.userId, user.id))
      .limit(1);
    if (!m) return null;
    return {
      kind: 'user',
      userId: user.id,
      email: user.email,
      role: m.role === 'parent' ? 'parent' : 'member',
      name: m.displayName,
      householdId: m.householdId,
      householdName: m.householdName,
      timezone: m.timezone,
    };
  }
  const display = await getDisplayActor();
  if (display) return display;
  return OPEN_ACCESS ? getGuestActor() : null;
});

async function getGuestActor(): Promise<UserActor | null> {
  const [m] = await db
    .select({
      userId: householdMembers.userId,
      displayName: householdMembers.displayName,
      email: user.email,
      householdId: households.id,
      householdName: households.name,
      timezone: households.timezone,
    })
    .from(householdMembers)
    .innerJoin(households, eq(households.id, householdMembers.householdId))
    .innerJoin(user, eq(user.id, householdMembers.userId))
    .where(eq(householdMembers.role, 'parent'))
    .orderBy(asc(households.id), asc(householdMembers.id))
    .limit(1);
  if (!m) return null;
  return {
    kind: 'user',
    userId: m.userId,
    email: m.email,
    role: 'parent',
    name: m.displayName,
    householdId: m.householdId,
    householdName: m.householdName,
    timezone: m.timezone,
  };
}

/** For server actions / route handlers: throws instead of redirecting. */
export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (actor) return actor;
  const user = await getSessionUser();
  throw new AuthError(user ? 'no-household' : 'unauthenticated');
}

export async function requireParent(): Promise<UserActor> {
  const actor = await requireActor();
  if (actor.kind !== 'user' || actor.role !== 'parent') throw new AuthError('forbidden');
  return actor;
}

/** For pages: redirects to the right entry point. */
export async function requireActorPage(): Promise<Actor> {
  const actor = await getActor();
  if (actor) return actor;
  const user = await getSessionUser();
  redirect(user ? '/onboarding' : '/sign-in');
}

export async function requireParentPage(): Promise<UserActor> {
  const actor = await requireActorPage();
  if (actor.kind !== 'user' || actor.role !== 'parent') redirect('/');
  return actor;
}

/** Stable identifier stored on rows for "who did this". */
export function actorRef(actor: Actor): string {
  return actor.kind === 'user' ? actor.userId : `display:${actor.deviceId}`;
}
