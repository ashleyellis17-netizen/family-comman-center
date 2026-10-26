-- Additive, idempotent. Chores + rewards become household data; school tables gain household scoping.

ALTER TABLE assignments ADD COLUMN IF NOT EXISTS "householdId" integer;
ALTER TABLE school_behavior ADD COLUMN IF NOT EXISTS "householdId" integer;
CREATE INDEX IF NOT EXISTS assignments_household_idx ON assignments("householdId");
CREATE INDEX IF NOT EXISTS school_behavior_household_idx ON school_behavior("householdId");

-- A chore is a template: one-off (dueDate), daily, or weekly (weekday 0=Sun..6=Sat).
CREATE TABLE IF NOT EXISTS chores (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "assignee" text NOT NULL,
  "points" integer NOT NULL DEFAULT 0,
  "recurrence" text NOT NULL DEFAULT 'once',
  "weekday" integer,
  "dueDate" text,
  "archived" boolean NOT NULL DEFAULT false,
  "createdByUserId" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chores_household_idx ON chores("householdId");

-- One row per chore per day completed. The unique index makes double taps and retries harmless.
CREATE TABLE IF NOT EXISTS chore_completions (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "choreId" integer NOT NULL,
  "date" text NOT NULL,
  "assignee" text NOT NULL,
  "points" integer NOT NULL DEFAULT 0,
  "completedByUserId" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS chore_completions_unique ON chore_completions("choreId", "date");
CREATE INDEX IF NOT EXISTS chore_completions_household_idx ON chore_completions("householdId", "assignee");

CREATE TABLE IF NOT EXISTS reward_items (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "cost" integer NOT NULL,
  "available" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reward_items_household_idx ON reward_items("householdId");

-- status: pending | fulfilled | cancelled. cost is snapshotted so later price edits never change history.
CREATE TABLE IF NOT EXISTS reward_redemptions (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "rewardId" integer NOT NULL,
  "rewardTitle" text NOT NULL,
  "assignee" text NOT NULL,
  "cost" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "clientKey" text NOT NULL,
  "requestedByUserId" text,
  "decidedByUserId" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "decidedAt" timestamp
);
CREATE UNIQUE INDEX IF NOT EXISTS reward_redemptions_key ON reward_redemptions("householdId", "clientKey");
CREATE INDEX IF NOT EXISTS reward_redemptions_household_idx ON reward_redemptions("householdId", "assignee");
