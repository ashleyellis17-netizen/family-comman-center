'use server'

import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { and, eq, gt, isNull, sql, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { events, householdInvites, householdMembers, households, type Role } from '@/lib/db/schema'
import { getSessionUser, requireHousehold, requireParent } from '@/lib/household'
import { run, requireText, UserError, cleanText } from '@/lib/action'
import { isValidTimezone } from '@/lib/dates'

const ROLES: Role[] = ['parent', 'member', 'display']

function code(len = 8) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(len)
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

export async function createHousehold(input: { name: string; displayName: string; timezone: string }) {
  return run('household.create', async () => {
    const user = await getSessionUser()
    if (!user) throw new UserError('Please sign in again.')
    const name = requireText(input.name, 'Household name', 80)
    const displayName = requireText(input.displayName, 'Your name', 40)
    const timezone = isValidTimezone(input.timezone) ? input.timezone : 'America/New_York'

    return db.transaction(async (tx) => {
      const [existing] = await tx.select().from(householdMembers).where(eq(householdMembers.userId, user.id))
      if (existing) return { householdId: existing.householdId }
      // Serialize household creation so only the very first household adopts the pre-existing family calendar.
      await tx.execute(sql`select pg_advisory_xact_lock(4242001)`)
      const [{ count }] = await tx.select({ count: sql<number>`count(*)::int` }).from(households)
      const [household] = await tx
        .insert(households)
        .values({ name, timezone, calendarToken: randomBytes(24).toString('base64url') })
        .returning()
      await tx.insert(householdMembers).values({ householdId: household.id, userId: user.id, role: 'parent', displayName })
      if (count === 0) {
        await tx.update(events).set({ householdId: household.id }).where(isNull(events.householdId))
      }
      return { householdId: household.id }
    })
  })
}

export async function joinHousehold(input: { code: string; displayName: string }) {
  return run('household.join', async () => {
    const user = await getSessionUser()
    if (!user) throw new UserError('Please sign in again.')
    const inviteCode = requireText(input.code, 'Invite code', 20).toUpperCase().replace(/[^A-Z0-9]/g, '')
    const displayName = requireText(input.displayName, 'Your name', 40)

    return db.transaction(async (tx) => {
      const [existing] = await tx.select().from(householdMembers).where(eq(householdMembers.userId, user.id))
      if (existing) throw new UserError('This account already belongs to a household.')
      // Atomically claim the invite so it can only be used once.
      const [invite] = await tx
        .update(householdInvites)
        .set({ usedAt: new Date(), usedBy: user.id })
        .where(and(eq(householdInvites.code, inviteCode), isNull(householdInvites.usedAt), gt(householdInvites.expiresAt, new Date())))
        .returning()
      if (!invite) throw new UserError('That invite code is invalid, expired, or already used.')
      await tx.insert(householdMembers).values({ householdId: invite.householdId, userId: user.id, role: invite.role, displayName })
      return { householdId: invite.householdId }
    })
  })
}

export async function getHouseholdSettings() {
  return run('household.settings', async () => {
    const ctx = await requireParent()
    const [household] = await db.select().from(households).where(eq(households.id, ctx.householdId))
    const members = await db
      .select({ id: householdMembers.id, userId: householdMembers.userId, role: householdMembers.role, displayName: householdMembers.displayName, createdAt: householdMembers.createdAt })
      .from(householdMembers)
      .where(eq(householdMembers.householdId, ctx.householdId))
      .orderBy(householdMembers.createdAt)
    const invites = await db
      .select()
      .from(householdInvites)
      .where(and(eq(householdInvites.householdId, ctx.householdId), isNull(householdInvites.usedAt), gt(householdInvites.expiresAt, new Date())))
      .orderBy(desc(householdInvites.createdAt))
    return {
      household: { id: household.id, name: household.name, timezone: household.timezone, calendarToken: household.calendarToken },
      members,
      invites: invites.map((i) => ({ id: i.id, code: i.code, role: i.role, expiresAt: i.expiresAt })),
      me: ctx.userId,
    }
  })
}

export async function updateHousehold(input: { name: string; timezone: string }) {
  return run('household.update', async () => {
    const ctx = await requireParent()
    const name = requireText(input.name, 'Household name', 80)
    if (!isValidTimezone(input.timezone)) throw new UserError('Choose a valid timezone.')
    await db.update(households).set({ name, timezone: input.timezone }).where(eq(households.id, ctx.householdId))
    revalidatePath('/', 'layout')
    return true
  })
}

export async function createInvite(input: { role: Role }) {
  return run('household.invite', async () => {
    const ctx = await requireParent()
    const role = input.role === 'parent' ? 'parent' : 'member'
    const [invite] = await db
      .insert(householdInvites)
      .values({ householdId: ctx.householdId, code: code(), role, createdBy: ctx.userId, expiresAt: new Date(Date.now() + 7 * 86400000) })
      .returning()
    return { code: invite.code, role: invite.role, expiresAt: invite.expiresAt }
  })
}

export async function revokeInvite(id: number) {
  return run('household.revokeInvite', async () => {
    const ctx = await requireParent()
    await db.delete(householdInvites).where(and(eq(householdInvites.id, id), eq(householdInvites.householdId, ctx.householdId)))
    return true
  })
}

async function parentCount(householdId: number) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(householdMembers)
    .where(and(eq(householdMembers.householdId, householdId), eq(householdMembers.role, 'parent')))
  return count
}

export async function updateMember(input: { memberId: number; role: Role; displayName?: string }) {
  return run('household.updateMember', async () => {
    const ctx = await requireParent()
    if (!ROLES.includes(input.role)) throw new UserError('Unknown role.')
    const [member] = await db
      .select()
      .from(householdMembers)
      .where(and(eq(householdMembers.id, input.memberId), eq(householdMembers.householdId, ctx.householdId)))
    if (!member) throw new UserError('Member not found.')
    if (member.role === 'parent' && input.role !== 'parent' && (await parentCount(ctx.householdId)) <= 1) {
      throw new UserError('A household needs at least one parent.')
    }
    const displayName = cleanText(input.displayName, 40) ?? member.displayName
    await db.update(householdMembers).set({ role: input.role, displayName }).where(eq(householdMembers.id, member.id))
    return true
  })
}

export async function removeMember(memberId: number) {
  return run('household.removeMember', async () => {
    const ctx = await requireParent()
    const [member] = await db
      .select()
      .from(householdMembers)
      .where(and(eq(householdMembers.id, memberId), eq(householdMembers.householdId, ctx.householdId)))
    if (!member) throw new UserError('Member not found.')
    if (member.role === 'parent' && (await parentCount(ctx.householdId)) <= 1) {
      throw new UserError('A household needs at least one parent.')
    }
    // Removing membership revokes household access; the person's sessions are also ended.
    await db.delete(householdMembers).where(eq(householdMembers.id, member.id))
    await db.execute(sql`delete from "session" where "userId" = ${member.userId}`)
    return true
  })
}

/** Creates a dedicated sign-in for a shared wall screen. Credentials are shown once and never stored in plain text. */
export async function createDisplayAccount(input: { label: string }) {
  return run('household.displayAccount', async () => {
    const ctx = await requireParent()
    const label = requireText(input.label, 'Display name', 40)
    const email = `display-${ctx.householdId}-${code(6).toLowerCase()}@display.family-command-center.app`
    const password = `${code(6)}-${code(6)}-${code(6)}`
    const result = await auth.api.signUpEmail({ body: { email, password, name: label } })
    await db.insert(householdMembers).values({ householdId: ctx.householdId, userId: result.user.id, role: 'display', displayName: label })
    return { email, password }
  })
}

export async function setDisplayMode(on: boolean) {
  return run('household.displayMode', async () => {
    await requireHousehold()
    const store = await cookies()
    if (on) {
      store.set('display-mode', 'public', { httpOnly: true, sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax', secure: true, path: '/', maxAge: 60 * 60 * 24 * 365 })
    } else {
      store.delete('display-mode')
    }
    revalidatePath('/', 'layout')
    return on
  })
}

export async function rotateCalendarToken() {
  return run('household.rotateCalendar', async () => {
    const ctx = await requireParent()
    const token = randomBytes(24).toString('base64url')
    await db.update(households).set({ calendarToken: token }).where(eq(households.id, ctx.householdId))
    return token
  })
}

export async function leaveHousehold() {
  return run('household.leave', async () => {
    const ctx = await requireHousehold()
    if (ctx.role === 'parent' && (await parentCount(ctx.householdId)) <= 1) {
      throw new UserError('You are the only parent. Promote another parent before leaving.')
    }
    await db.delete(householdMembers).where(eq(householdMembers.userId, ctx.userId))
    return true
  })
}
