'use server';

import { createHmac, randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { events, groceryItems, householdMembers, households, user as userTable } from '@/lib/db/schema';
import { DEMO_EMAIL, isDemoEnabled } from '@/lib/demo';

const DEMO_TIMEZONE = 'America/Chicago';

// Derived from the server secret so the demo password is never stored in code
// or sent to the browser, yet stays stable across restarts.
function demoPassword() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error('BETTER_AUTH_SECRET is not set');
  return createHmac('sha256', secret).update('family-command-center-demo').digest('base64url');
}

function localDate(offsetDays: number) {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: DEMO_TIMEZONE }).format(d);
}

async function ensureDemoHousehold(userId: string) {
  const [member] = await db
    .select({ id: householdMembers.id })
    .from(householdMembers)
    .where(eq(householdMembers.userId, userId));
  if (member) return;

  await db.transaction(async (tx) => {
    const [h] = await tx
      .insert(households)
      .values({ name: 'Demo Household', timezone: DEMO_TIMEZONE })
      .returning({ id: households.id });

    await tx.insert(householdMembers).values({
      householdId: h.id,
      userId,
      role: 'parent',
      displayName: 'Demo Parent',
    });

    const groceries = [
      { name: 'Milk', quantity: '1', unit: 'gal', category: 'Dairy', isStaple: true },
      { name: 'Bananas', quantity: '6', unit: null, category: 'Produce', isStaple: false },
      { name: 'Eggs', quantity: '12', unit: null, category: 'Dairy', isStaple: true },
      { name: 'Bread', quantity: '1', unit: 'loaf', category: 'Bakery', isStaple: false },
      { name: 'Chicken thighs', quantity: '2', unit: 'lb', category: 'Meat', isStaple: false },
    ];
    await tx.insert(groceryItems).values(
      groceries.map((g) => ({
        ...g,
        householdId: h.id,
        clientKey: `demo-${randomUUID()}`,
        addedBy: 'Demo Parent',
        updatedBy: 'Demo Parent',
      }))
    );

    await tx.insert(events).values([
      { householdId: h.id, title: 'Soccer practice', date: localDate(0), time: '4:30 PM', allChildren: true, category: 'sports' },
      { householdId: h.id, title: 'Dentist appointment', date: localDate(1), time: '10:00 AM', allChildren: false, category: 'medical' },
      { householdId: h.id, title: 'Family movie night', date: localDate(2), time: '7:00 PM', allChildren: true, category: 'family' },
    ]);
  });
}

export async function startDemo() {
  if (!isDemoEnabled()) throw new Error('Demo mode is disabled');

  const password = demoPassword();
  const [existing] = await db.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, DEMO_EMAIL));

  if (!existing) {
    await auth.api.signUpEmail({ body: { email: DEMO_EMAIL, password, name: 'Demo Parent' } });
  }
  const result = await auth.api.signInEmail({
    body: { email: DEMO_EMAIL, password, rememberMe: true },
    headers: await headers(),
  });

  await ensureDemoHousehold(result.user.id);
  redirect('/');
}
