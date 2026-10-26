import 'server-only'
import { cache } from 'react'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { householdMembers, households, type Role } from '@/lib/db/schema'
import { DISPLAY_COOKIE, getDisplayDevice } from '@/lib/display-device'

export type HouseholdContext = {
  userId: string
  email: string
  householdId: number
  householdName: string
  timezone: string
  role: Role
  displayName: string
  /** True when private items must be hidden (display account, or a parent who turned on display mode). */
  publicMode: boolean
  /** Set when the request comes from a code-paired wall display rather than a signed-in person. */
  deviceId?: number
}

export class AuthError extends Error {
  constructor(message: string, public code: 'UNAUTHENTICATED' | 'NO_HOUSEHOLD' | 'FORBIDDEN') {
    super(message)
  }
}

export const getSessionUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
})

export const getHouseholdContext = cache(async (): Promise<HouseholdContext | null> => {
  const user = await getSessionUser()
  if (!user) {
    const paired = await getDisplayDevice()
    if (!paired) return null
    return {
      // Synthetic id: lets "added by" / "completed by" columns attribute actions to the screen.
      userId: `display:${paired.device.id}`,
      email: '',
      householdId: paired.household.id,
      householdName: paired.household.name,
      timezone: paired.household.timezone,
      role: 'display',
      displayName: paired.device.name,
      publicMode: true,
      deviceId: paired.device.id,
    }
  }
  const [row] = await db
    .select({ member: householdMembers, household: households })
    .from(householdMembers)
    .innerJoin(households, eq(households.id, householdMembers.householdId))
    .where(eq(householdMembers.userId, user.id))
    .limit(1)
  if (!row) return null
  const displayCookie = (await cookies()).get('display-mode')?.value === 'public'
  return {
    userId: user.id,
    email: user.email,
    householdId: row.household.id,
    householdName: row.household.name,
    timezone: row.household.timezone,
    role: row.member.role,
    displayName: row.member.displayName,
    publicMode: row.member.role === 'display' || displayCookie,
  }
})

/** For server actions: throws instead of redirecting. */
export async function requireHousehold(): Promise<HouseholdContext> {
  const ctx = await getHouseholdContext()
  if (ctx) return ctx
  if (!(await getSessionUser())) throw new AuthError('Please sign in again.', 'UNAUTHENTICATED')
  throw new AuthError('Join or create a household first.', 'NO_HOUSEHOLD')
}

export async function requireParent(): Promise<HouseholdContext> {
  const ctx = await requireHousehold()
  if (ctx.role !== 'parent') throw new AuthError('Only a parent can do that.', 'FORBIDDEN')
  return ctx
}

/** Display accounts are shared wall screens; they may add and check things off but not edit records broadly. */
export async function requireEditor(): Promise<HouseholdContext> {
  return requireHousehold()
}

/** For server-rendered pages: redirects to the right place. */
export async function requirePageContext(opts?: { parentOnly?: boolean }): Promise<HouseholdContext> {
  const ctx = await getHouseholdContext()
  if (!ctx) {
    if (await getSessionUser()) redirect('/onboarding')
    // A wall screen whose pairing was revoked should show a fresh code, not an account login.
    redirect((await cookies()).has(DISPLAY_COOKIE) ? '/pair' : '/sign-in')
  }
  if (opts?.parentOnly && ctx.role !== 'parent') redirect('/')
  return ctx
}
