import { pgTable, text, boolean, timestamp, serial, integer, numeric, jsonb, primaryKey } from 'drizzle-orm/pg-core';

// Shared family calendar events. No auth / per-user scoping:
// this is a single shared family dataset.
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(), // ISO date: YYYY-MM-DD
  time: text('time'), // optional display time, e.g. "3:00 PM"
  childId: text('childId'), // 'alex' | 'jaxon' | 'carson' | null
  allChildren: boolean('allChildren').notNull().default(false),
  category: text('category').notNull().default('other'), // school | sports | appointment | family | work | other
  householdId: integer('householdId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;

// School assignments per child. Shared family dataset (no per-user scoping).
export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  childId: text('childId').notNull(), // 'alex' | 'jaxon' | 'carson'
  title: text('title').notNull(),
  subject: text('subject').notNull().default(''),
  dueDate: text('dueDate'), // ISO date: YYYY-MM-DD (optional)
  status: text('status').notNull().default('Not Started'), // Not Started | In Progress | Turned In | Graded | Missing
  grade: text('grade'),
  notes: text('notes'),
  householdId: integer('householdId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type AssignmentRow = typeof assignments.$inferSelect;
export type NewAssignmentRow = typeof assignments.$inferInsert;

// Daily school-day behavior entries per child.
export const schoolBehavior = pgTable('school_behavior', {
  id: serial('id').primaryKey(),
  childId: text('childId').notNull(),
  date: text('date').notNull(), // ISO date: YYYY-MM-DD
  rating: text('rating').notNull(), // Great Day | Good Day | Okay Day | Rough Day
  note: text('note'),
  loggedBy: text('loggedBy'),
  householdId: integer('householdId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type SchoolBehaviorRow = typeof schoolBehavior.$inferSelect;
export type NewSchoolBehaviorRow = typeof schoolBehavior.$inferInsert;

export type ChoreRecurrence = 'once' | 'daily' | 'weekly';

export const chores = pgTable('chores', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  assignee: text('assignee').notNull(),
  points: integer('points').notNull().default(0),
  recurrence: text('recurrence').$type<ChoreRecurrence>().notNull().default('once'),
  weekday: integer('weekday'),
  dueDate: text('dueDate'),
  archived: boolean('archived').notNull().default(false),
  createdByUserId: text('createdByUserId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
export type ChoreRow = typeof chores.$inferSelect;

export const choreCompletions = pgTable('chore_completions', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  choreId: integer('choreId').notNull(),
  date: text('date').notNull(),
  assignee: text('assignee').notNull(),
  points: integer('points').notNull().default(0),
  completedByUserId: text('completedByUserId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const rewardItems = pgTable('reward_items', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  cost: integer('cost').notNull(),
  available: boolean('available').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
export type RewardItemRow = typeof rewardItems.$inferSelect;

export type RedemptionStatus = 'pending' | 'fulfilled' | 'cancelled';

export const rewardRedemptions = pgTable('reward_redemptions', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  rewardId: integer('rewardId').notNull(),
  rewardTitle: text('rewardTitle').notNull(),
  assignee: text('assignee').notNull(),
  cost: integer('cost').notNull(),
  status: text('status').$type<RedemptionStatus>().notNull().default('pending'),
  clientKey: text('clientKey').notNull(),
  requestedByUserId: text('requestedByUserId'),
  decidedByUserId: text('decidedByUserId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  decidedAt: timestamp('decidedAt'),
});
export type RedemptionRow = typeof rewardRedemptions.$inferSelect;

// ---------------------------------------------------------------------------
// Better Auth tables (camelCase column names match Better Auth defaults)
// ---------------------------------------------------------------------------
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Household foundation (see scripts/001-household-foundation.sql)
// ---------------------------------------------------------------------------
export const households = pgTable('households', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  timezone: text('timezone').notNull().default('America/New_York'),
  calendarToken: text('calendarToken'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type Role = 'parent' | 'member' | 'display';

export const householdMembers = pgTable('household_members', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  userId: text('userId').notNull().unique(),
  role: text('role').$type<Role>().notNull().default('member'),
  displayName: text('displayName').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export const householdInvites = pgTable('household_invites', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  code: text('code').notNull().unique(),
  role: text('role').$type<Role>().notNull().default('member'),
  createdBy: text('createdBy').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  usedAt: timestamp('usedAt'),
  usedBy: text('usedBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

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
  source: text('source').notNull().default('manual'),
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

export type WishlistStatus = 'pending' | 'approved' | 'declined' | 'deferred';

export const wishlistRequests = pgTable('wishlist_requests', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  clientKey: text('clientKey').notNull(),
  name: text('name').notNull(),
  quantity: text('quantity'),
  reason: text('reason'),
  requesterName: text('requesterName').notNull(),
  requesterUserId: text('requesterUserId').notNull(),
  status: text('status').$type<WishlistStatus>().notNull().default('pending'),
  decisionNote: text('decisionNote'),
  decidedBy: text('decidedBy'),
  decidedAt: timestamp('decidedAt'),
  groceryItemId: integer('groceryItemId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
export type WishlistRow = typeof wishlistRequests.$inferSelect;

export type Ingredient = { name: string; quantity: number | null; unit: string | null; note?: string | null };

export const recipes = pgTable('recipes', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  title: text('title').notNull(),
  sourceUrl: text('sourceUrl'),
  sourceName: text('sourceName'),
  externalId: text('externalId'),
  imageUrl: text('imageUrl'),
  servings: integer('servings'),
  prepMinutes: integer('prepMinutes'),
  cookMinutes: integer('cookMinutes'),
  ingredients: jsonb('ingredients').$type<Ingredient[]>().notNull().default([]),
  instructions: text('instructions'),
  tags: text('tags').array().notNull().default([]),
  cuisine: text('cuisine'),
  mainIngredient: text('mainIngredient'),
  kidFriendly: boolean('kidFriendly').notNull().default(false),
  budgetFriendly: boolean('budgetFriendly').notNull().default(false),
  wantToTry: boolean('wantToTry').notNull().default(false),
  favorite: boolean('favorite').notNull().default(false),
  archived: boolean('archived').notNull().default(false),
  createdBy: text('createdBy'),
  updatedBy: text('updatedBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
export type RecipeRow = typeof recipes.$inferSelect;

export const recipeRatings = pgTable('recipe_ratings', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  recipeId: integer('recipeId').notNull(),
  userId: text('userId').notNull(),
  raterName: text('raterName').notNull(),
  stars: integer('stars').notNull(),
  note: text('note'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MealKind = 'recipe' | 'custom' | 'leftovers' | 'eating_out' | 'flexible';

export const mealPlanEntries = pgTable('meal_plan_entries', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  date: text('date').notNull(),
  slot: text('slot').$type<MealSlot>().notNull(),
  kind: text('kind').$type<MealKind>().notNull().default('recipe'),
  recipeId: integer('recipeId'),
  title: text('title').notNull(),
  servings: integer('servings'),
  notes: text('notes'),
  cookedAt: timestamp('cookedAt'),
  createdBy: text('createdBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
export type MealEntryRow = typeof mealPlanEntries.$inferSelect;

export type PantryStatus = 'in_stock' | 'low' | 'out';

export const pantryItems = pgTable('pantry_items', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  name: text('name').notNull(),
  quantity: numeric('quantity'),
  unit: text('unit'),
  status: text('status').$type<PantryStatus>().notNull().default('in_stock'),
  category: text('category').notNull().default('Other'),
  expiresOn: text('expiresOn'),
  isStaple: boolean('isStaple').notNull().default(false),
  updatedBy: text('updatedBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
export type PantryRow = typeof pantryItems.$inferSelect;

export const foodPreferences = pgTable('food_preferences', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  person: text('person').notNull(),
  kind: text('kind').$type<'dislike' | 'restriction' | 'like'>().notNull(),
  value: text('value').notNull(),
  createdBy: text('createdBy'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
export type PreferenceRow = typeof foodPreferences.$inferSelect;

export const householdReminders = pgTable('household_reminders', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  clientKey: text('clientKey').notNull(),
  text: text('text').notNull(),
  dueDate: text('dueDate'),
  isPrivate: boolean('isPrivate').notNull().default(false),
  done: boolean('done').notNull().default(false),
  doneAt: timestamp('doneAt'),
  doneBy: text('doneBy'),
  createdBy: text('createdBy'),
  createdByUserId: text('createdByUserId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
export type ReminderRow = typeof householdReminders.$inferSelect;

export type GroundingStatus = 'active' | 'review' | 'resolved';
export const groundings = pgTable('groundings', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  assignee: text('assignee').notNull(),
  reason: text('reason').notNull(),
  startDate: text('startDate').notNull(),
  endDate: text('endDate').notNull(),
  blocksAllowance: boolean('blocksAllowance').notNull().default(true),
  blocksElectronics: boolean('blocksElectronics').notNull().default(true),
  blocksRewards: boolean('blocksRewards').notNull().default(true),
  earnBackEnabled: boolean('earnBackEnabled').notNull().default(false),
  status: text('status').$type<GroundingStatus>().notNull().default('active'),
  resolution: text('resolution').$type<'earned_back' | 'override' | null>(),
  resolvedAt: timestamp('resolvedAt'),
  resolvedByUserId: text('resolvedByUserId'),
  createdByUserId: text('createdByUserId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
export type GroundingRow = typeof groundings.$inferSelect;

export const earnBackTasks = pgTable('earn_back_tasks', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  groundingId: integer('groundingId').notNull(),
  title: text('title').notNull(),
  position: integer('position').notNull().default(0),
  doneAt: timestamp('doneAt'),
  doneByUserId: text('doneByUserId'),
});
export type EarnBackTaskRow = typeof earnBackTasks.$inferSelect;

export type BehaviorKind = 'positive' | 'concern' | 'note';
export const behaviorNotes = pgTable('behavior_notes', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  assignee: text('assignee').notNull(),
  kind: text('kind').$type<BehaviorKind>().notNull().default('note'),
  note: text('note').notNull(),
  points: integer('points').notNull().default(0),
  date: text('date').notNull(),
  clientKey: text('clientKey').notNull(),
  createdByUserId: text('createdByUserId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
export type BehaviorNoteRow = typeof behaviorNotes.$inferSelect;

export type AllowanceKind = 'allowance' | 'bonus' | 'spend' | 'deduction';
export const allowanceEntries = pgTable('allowance_entries', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  assignee: text('assignee').notNull(),
  kind: text('kind').$type<AllowanceKind>().notNull(),
  amountCents: integer('amountCents').notNull(),
  note: text('note'),
  weekOf: text('weekOf'),
  clientKey: text('clientKey').notNull(),
  createdByUserId: text('createdByUserId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});
export type AllowanceEntryRow = typeof allowanceEntries.$inferSelect;

export const allowanceRates = pgTable(
  'allowance_rates',
  {
    householdId: integer('householdId').notNull(),
    assignee: text('assignee').notNull(),
    weeklyCents: integer('weeklyCents').notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.householdId, t.assignee] })],
);

export const displayDevices = pgTable('display_devices', {
  id: serial('id').primaryKey(),
  householdId: integer('householdId').notNull(),
  name: text('name').notNull(),
  tokenHash: text('tokenHash').notNull().unique(),
  pairedByUserId: text('pairedByUserId').notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('lastSeenAt', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revokedAt', { withTimezone: true }),
});

export const displayPairings = pgTable('display_pairings', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  secretHash: text('secretHash').notNull().unique(),
  householdId: integer('householdId'),
  deviceName: text('deviceName'),
  approvedByUserId: text('approvedByUserId'),
  approvedAt: timestamp('approvedAt', { withTimezone: true }),
  expiresAt: timestamp('expiresAt', { withTimezone: true }).notNull(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
});
