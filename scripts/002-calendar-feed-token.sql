-- Private per-household calendar feed token (replaces the previously public /api/calendar feed).
ALTER TABLE households ADD COLUMN IF NOT EXISTS "calendarToken" text;
CREATE UNIQUE INDEX IF NOT EXISTS households_calendar_token_uq ON households("calendarToken");
