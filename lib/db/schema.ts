import { pgTable, text, boolean, timestamp, serial, integer } from 'drizzle-orm/pg-core';

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
  type: text('type').notNull().default('homework'), // homework | test | quiz | project | reading | worksheet | other
  teacher: text('teacher'),
  dueDate: text('dueDate'), // ISO date: YYYY-MM-DD (optional)
  dueTime: text('dueTime'), // optional display time
  // Not Started | In Progress | Turned In | Graded | Missing | Waiting for confirmation
  status: text('status').notNull().default('Not Started'),
  priority: text('priority').notNull().default('normal'), // low | normal | high
  effort: text('effort'), // quick | medium | long
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

// Age-based skill / behavior check-ins (replaces the uniform school-day tracker).
// One row per skill rated on a given day, per child.
export const skillCheckins = pgTable('skill_checkins', {
  id: serial('id').primaryKey(),
  childId: text('childId').notNull(),
  date: text('date').notNull(), // ISO date: YYYY-MM-DD
  skill: text('skill').notNull(), // the skill/area name (age-appropriate)
  rating: text('rating').notNull(), // stored label, e.g. "Nailed It" / "Needed Help" / "Awesome"
  note: text('note'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type SkillCheckinRow = typeof skillCheckins.$inferSelect;
export type NewSkillCheckinRow = typeof skillCheckins.$inferInsert;

// Multi-step school projects.
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  childId: text('childId').notNull(),
  title: text('title').notNull(),
  subject: text('subject'),
  dueDate: text('dueDate'),
  status: text('status').notNull().default('active'), // active | done
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;

export const projectMilestones = pgTable('project_milestones', {
  id: serial('id').primaryKey(),
  projectId: integer('projectId').notNull(),
  title: text('title').notNull(),
  done: boolean('done').notNull().default(false),
  dueDate: text('dueDate'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type ProjectMilestoneRow = typeof projectMilestones.$inferSelect;
export type NewProjectMilestoneRow = typeof projectMilestones.$inferInsert;

// Frictionless one-line capture ("Don't Forget!").
export const brainDump = pgTable('brain_dump', {
  id: serial('id').primaryKey(),
  childId: text('childId').notNull(),
  content: text('content').notNull(),
  status: text('status').notNull().default('open'), // open | converted | done
  convertedTo: text('convertedTo'), // reminder | prep | task | assignment | project | question
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type BrainDumpRow = typeof brainDump.$inferSelect;
export type NewBrainDumpRow = typeof brainDump.$inferInsert;

// "Ask a Parent" inbox.
export const parentRequests = pgTable('parent_requests', {
  id: serial('id').primaryKey(),
  childId: text('childId').notNull(),
  content: text('content').notNull(),
  category: text('category').notNull().default('question'), // permission | supplies | help | question | other
  status: text('status').notNull().default('new'), // new | seen | handling | done
  response: text('response'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
});

export type ParentRequestRow = typeof parentRequests.$inferSelect;
export type NewParentRequestRow = typeof parentRequests.$inferInsert;
