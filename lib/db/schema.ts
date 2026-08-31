import { pgTable, text, boolean, timestamp, serial } from 'drizzle-orm/pg-core';

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
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
