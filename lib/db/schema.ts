import {
  pgTable,
  text,
  boolean,
  timestamp,
  serial,
  integer,
  numeric,
} from 'drizzle-orm/pg-core';

// Mirrors the live Neon database. DDL is applied through migrations in
// scripts/migrations — keep this file in sync with the database, not the
// other way around.

// ----- Better Auth -----

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
});

// ----- Household -----

export const households = pgTable('households', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  timezone: text('timezone').notNull(),
  calendarToken: text('calendarToken'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const householdMembers = pgTable('household_members', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  userId: text('userId').notNull(),
  role: text('role').notNull().default('member'), // parent | member
  displayName: text('displayName').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const householdInvites = pgTable('household_invites', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  code: text('code').notNull(),
  role: text('role').notNull(),
  createdBy: text('createdBy').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  usedAt: timestamp('usedAt'),
  usedBy: text('usedBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

// Shared wall displays (the Cozyla). A paired device holds an opaque
// long-lived token in an HttpOnly cookie; only its SHA-256 hash is stored.
export const displayDevices = pgTable('display_devices', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  name: text('name').notNull(),
  tokenHash: text('tokenHash').notNull(),
  pairedByUserId: text('pairedByUserId').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('lastSeenAt', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revokedAt', { withTimezone: true }),
});

export const displayPairings = pgTable('display_pairings', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  secretHash: text('secretHash').notNull(),
  householdId: integer('householdId'),
  deviceName: text('deviceName'),
  approvedByUserId: text('approvedByUserId'),
  approvedAt: timestamp('approvedAt', { withTimezone: true }),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
});

// ----- Calendar -----

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId'),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(), // YYYY-MM-DD in household timezone
  time: text('time'), // e.g. "3:00 PM"
  childId: text('childId'),
  allChildren: boolean('allChildren').notNull().default(false),
  category: text('category').notNull().default('other'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;

// ----- Groceries -----

export const groceryItems = pgTable('grocery_items', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  clientKey: text('clientKey').notNull(),
  name: text('name').notNull(),
  quantity: numeric('quantity'),
  unit: text('unit'),
  category: text('category').notNull().default('Other'),
  store: text('store'),
  notes: text('notes'),
  requestedBy: text('requestedBy'),
  neededBy: text('neededBy'),
  isStaple: boolean('isStaple').notNull().default(false),
  source: text('source').notNull().default('manual'), // manual | wishlist | staple | again | recipe
  checked: boolean('checked').notNull().default(false),
  checkedAt: timestamp('checkedAt'),
  checkedBy: text('checkedBy'),
  deletedAt: timestamp('deletedAt'),
  addedBy: text('addedBy'),
  updatedBy: text('updatedBy'),
  version: integer('version').notNull().default(1),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type GroceryRow = typeof groceryItems.$inferSelect;

export const wishlistRequests = pgTable('wishlist_requests', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  clientKey: text('clientKey').notNull(),
  name: text('name').notNull(),
  quantity: text('quantity'),
  reason: text('reason'),
  requesterName: text('requesterName').notNull(),
  requesterUserId: text('requesterUserId').notNull(),
  status: text('status').notNull().default('pending'), // pending | approved | declined | deferred
  decisionNote: text('decisionNote'),
  decidedBy: text('decidedBy'),
  decidedAt: timestamp('decidedAt'),
  groceryItemId: integer('groceryItemId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type WishlistRow = typeof wishlistRequests.$inferSelect;

// ----- Meals (read by Today; planner UI is a later phase) -----

export const mealPlanEntries = pgTable('meal_plan_entries', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  date: text('date').notNull(),
  slot: text('slot').notNull(), // breakfast | lunch | dinner | snack
  kind: text('kind').notNull(),
  recipeId: integer('recipeId'),
  title: text('title').notNull(),
  servings: integer('servings'),
  notes: text('notes'),
  cookedAt: timestamp('cookedAt'),
  createdBy: text('createdBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const pantryItems = pgTable('pantry_items', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  name: text('name').notNull(),
  quantity: numeric('quantity'),
  unit: text('unit'),
  status: text('status').notNull(), // in_stock | low | out
  category: text('category').notNull(),
  expiresOn: text('expiresOn'),
  isStaple: boolean('isStaple').notNull(),
  updatedBy: text('updatedBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// The `assignments` and `school_behavior` tables still exist in the database
// (data preserved) but the School Center was removed, so they are not mapped.
