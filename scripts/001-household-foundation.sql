-- Additive, idempotent migration. Existing tables (events, assignments, school_*) are preserved.

CREATE TABLE IF NOT EXISTS "user" ("id" text PRIMARY KEY, "name" text NOT NULL, "email" text NOT NULL UNIQUE, "emailVerified" boolean NOT NULL DEFAULT false, "image" text, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS "session" ("id" text PRIMARY KEY, "expiresAt" timestamp NOT NULL, "token" text NOT NULL UNIQUE, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now(), "ipAddress" text, "userAgent" text, "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS "account" ("id" text PRIMARY KEY, "accountId" text NOT NULL, "providerId" text NOT NULL, "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" timestamp, "refreshTokenExpiresAt" timestamp, "scope" text, "password" text, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS "verification" ("id" text PRIMARY KEY, "identifier" text NOT NULL, "value" text NOT NULL, "expiresAt" timestamp NOT NULL, "createdAt" timestamp NOT NULL DEFAULT now(), "updatedAt" timestamp NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS session_userId_idx ON "session"("userId");
CREATE INDEX IF NOT EXISTS account_userId_idx ON "account"("userId");

CREATE TABLE IF NOT EXISTS households (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "timezone" text NOT NULL DEFAULT 'America/New_York',
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS household_members (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "userId" text NOT NULL UNIQUE,
  "role" text NOT NULL DEFAULT 'member', -- parent | member | display
  "displayName" text NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS household_members_household_idx ON household_members("householdId");

CREATE TABLE IF NOT EXISTS household_invites (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "code" text NOT NULL UNIQUE,
  "role" text NOT NULL DEFAULT 'member',
  "createdBy" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "usedAt" timestamp,
  "usedBy" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grocery_items (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "clientKey" text NOT NULL,
  "name" text NOT NULL,
  "quantity" numeric,
  "unit" text,
  "category" text NOT NULL DEFAULT 'Other',
  "store" text,
  "notes" text,
  "requestedBy" text,
  "neededBy" text,
  "isStaple" boolean NOT NULL DEFAULT false,
  "source" text NOT NULL DEFAULT 'manual', -- manual | voice | wishlist | recipe | staple
  "checked" boolean NOT NULL DEFAULT false,
  "checkedAt" timestamp,
  "checkedBy" text,
  "deletedAt" timestamp,
  "addedBy" text,
  "updatedBy" text,
  "version" integer NOT NULL DEFAULT 1,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS grocery_items_client_key_uq ON grocery_items("householdId", "clientKey");
CREATE INDEX IF NOT EXISTS grocery_items_household_idx ON grocery_items("householdId");

CREATE TABLE IF NOT EXISTS wishlist_requests (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "clientKey" text NOT NULL,
  "name" text NOT NULL,
  "quantity" text,
  "reason" text,
  "requesterName" text NOT NULL,
  "requesterUserId" text NOT NULL,
  "status" text NOT NULL DEFAULT 'pending', -- pending | approved | declined | deferred
  "decisionNote" text,
  "decidedBy" text,
  "decidedAt" timestamp,
  "groceryItemId" integer,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS wishlist_client_key_uq ON wishlist_requests("householdId", "clientKey");

CREATE TABLE IF NOT EXISTS recipes (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "title" text NOT NULL,
  "sourceUrl" text,
  "sourceName" text,
  "externalId" text,
  "imageUrl" text,
  "servings" integer,
  "prepMinutes" integer,
  "cookMinutes" integer,
  "ingredients" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "instructions" text,
  "tags" text[] NOT NULL DEFAULT '{}',
  "cuisine" text,
  "mainIngredient" text,
  "kidFriendly" boolean NOT NULL DEFAULT false,
  "budgetFriendly" boolean NOT NULL DEFAULT false,
  "wantToTry" boolean NOT NULL DEFAULT false,
  "favorite" boolean NOT NULL DEFAULT false,
  "archived" boolean NOT NULL DEFAULT false,
  "createdBy" text,
  "updatedBy" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS recipes_household_idx ON recipes("householdId");

CREATE TABLE IF NOT EXISTS recipe_ratings (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "recipeId" integer NOT NULL,
  "userId" text NOT NULL,
  "raterName" text NOT NULL,
  "stars" integer NOT NULL CHECK ("stars" BETWEEN 1 AND 5),
  "note" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS recipe_ratings_user_uq ON recipe_ratings("recipeId", "userId");

CREATE TABLE IF NOT EXISTS meal_plan_entries (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "date" text NOT NULL, -- YYYY-MM-DD in household timezone
  "slot" text NOT NULL, -- breakfast | lunch | dinner | snack
  "kind" text NOT NULL DEFAULT 'recipe', -- recipe | custom | leftovers | eating_out | flexible
  "recipeId" integer,
  "title" text NOT NULL,
  "servings" integer,
  "notes" text,
  "cookedAt" timestamp,
  "createdBy" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS meal_plan_household_date_idx ON meal_plan_entries("householdId", "date");

CREATE TABLE IF NOT EXISTS pantry_items (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "name" text NOT NULL,
  "quantity" numeric,
  "unit" text,
  "status" text NOT NULL DEFAULT 'in_stock', -- in_stock | low | out
  "category" text NOT NULL DEFAULT 'Other',
  "expiresOn" text,
  "isStaple" boolean NOT NULL DEFAULT false,
  "updatedBy" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pantry_household_idx ON pantry_items("householdId");

CREATE TABLE IF NOT EXISTS food_preferences (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "person" text NOT NULL, -- 'Everyone' or a family member name
  "kind" text NOT NULL, -- dislike | restriction | like
  "value" text NOT NULL,
  "createdBy" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS household_reminders (
  "id" serial PRIMARY KEY,
  "householdId" integer NOT NULL,
  "clientKey" text NOT NULL,
  "text" text NOT NULL,
  "dueDate" text,
  "isPrivate" boolean NOT NULL DEFAULT false,
  "done" boolean NOT NULL DEFAULT false,
  "doneAt" timestamp,
  "doneBy" text,
  "createdBy" text,
  "createdByUserId" text,
  "createdAt" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS reminders_client_key_uq ON household_reminders("householdId", "clientKey");

ALTER TABLE events ADD COLUMN IF NOT EXISTS "householdId" integer;
