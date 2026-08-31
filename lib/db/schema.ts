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
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type SchoolBehaviorRow = typeof schoolBehavior.$inferSelect;
export type NewSchoolBehaviorRow = typeof schoolBehavior.$inferInsert;
