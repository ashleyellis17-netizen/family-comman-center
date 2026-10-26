-- Additive, idempotent. Grounding + earn back, behavior notes (signed points), and an allowance ledger.

-- status: active | review (all earn-back tasks done, waiting on a parent) | resolved.
-- A grounding also stops applying once endDate has passed, even if nobody resolved it.
CREATE TABLE IF NOT EXISTS groundings (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "assignee" text NOT NULL,
  "reason" text NOT NULL,
  "startDate" text NOT NULL,
  "endDate" text NOT NULL,
  "blocksAllowance" boolean NOT NULL DEFAULT true,
  "blocksElectronics" boolean NOT NULL DEFAULT true,
  "blocksRewards" boolean NOT NULL DEFAULT true,
  "earnBackEnabled" boolean NOT NULL DEFAULT false,
  "status" text NOT NULL DEFAULT 'active',
  "resolution" text,
  "resolvedAt" timestamp,
  "resolvedByUserId" text,
  "createdByUserId" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS groundings_household_idx ON groundings("householdId", "assignee");

CREATE TABLE IF NOT EXISTS earn_back_tasks (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "groundingId" integer NOT NULL,
  "title" text NOT NULL,
  "position" integer NOT NULL DEFAULT 0,
  "doneAt" timestamp,
  "doneByUserId" text
);
CREATE INDEX IF NOT EXISTS earn_back_tasks_grounding_idx ON earn_back_tasks("householdId", "groundingId");

-- kind: positive | concern | note. points is signed and counts toward the shared points balance.
CREATE TABLE IF NOT EXISTS behavior_notes (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "assignee" text NOT NULL,
  "kind" text NOT NULL DEFAULT 'note',
  "note" text NOT NULL,
  "points" integer NOT NULL DEFAULT 0,
  "date" text NOT NULL,
  "clientKey" text NOT NULL,
  "createdByUserId" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS behavior_notes_key ON behavior_notes("householdId", "clientKey");
CREATE INDEX IF NOT EXISTS behavior_notes_household_idx ON behavior_notes("householdId", "date");

-- Money is stored in whole cents. kind: allowance | bonus | spend | deduction (amount is signed).
CREATE TABLE IF NOT EXISTS allowance_entries (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "assignee" text NOT NULL,
  "kind" text NOT NULL,
  "amountCents" integer NOT NULL,
  "note" text,
  "weekOf" text,
  "clientKey" text NOT NULL,
  "createdByUserId" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS allowance_entries_key ON allowance_entries("householdId", "clientKey");
-- A kid can only be paid their weekly allowance once per week.
CREATE UNIQUE INDEX IF NOT EXISTS allowance_entries_week ON allowance_entries("householdId", "assignee", "weekOf") WHERE "kind" = 'allowance';
CREATE INDEX IF NOT EXISTS allowance_entries_household_idx ON allowance_entries("householdId", "assignee");

CREATE TABLE IF NOT EXISTS allowance_rates (
  "householdId" integer NOT NULL,
  "assignee" text NOT NULL,
  "weeklyCents" integer NOT NULL DEFAULT 0,
  PRIMARY KEY ("householdId", "assignee")
);
