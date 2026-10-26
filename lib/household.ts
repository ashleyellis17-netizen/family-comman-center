import 'server-only'
import { cache } from 'react'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { householdMembers, households, type Role } from '@/lib/db/schema'

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
  if (!user) return null
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
  const user = await getSessionUser()
  if (!user) throw new AuthError('Please sign in again.', 'UNAUTHENTICATED')
  const ctx = await getHouseholdContext()
  if (!ctx) throw new AuthError('Join or create a household first.', 'NO_HOUSEHOLD')
  return ctx
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
  const user = await getSessionUser()
  if (!user) redirect('/sign-in')
  const ctx = await getHouseholdContext()
  if (!ctx) redirect('/onboarding')
  if (opts?.parentOnly && ctx.role !== 'parent') redirect('/')
  return ctx
}
