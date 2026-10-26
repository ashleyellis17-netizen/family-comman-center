-- Shared wall displays (e.g. Cozyla) pair with a short code instead of an account.
-- Only SHA-256 hashes of device tokens and pairing secrets are stored.

create table if not exists display_devices (
  id serial primary key,
  "householdId" integer not null,
  name text not null,
  "tokenHash" text not null unique,
  "pairedByUserId" text not null,
  "createdAt" timestamptz not null default now(),
  "lastSeenAt" timestamptz not null default now(),
  "revokedAt" timestamptz
);

create index if not exists display_devices_household_idx on display_devices ("householdId");

create table if not exists display_pairings (
  id serial primary key,
  code text not null,
  "secretHash" text not null unique,
  "householdId" integer,
  "deviceName" text,
  "approvedByUserId" text,
  "approvedAt" timestamptz,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now()
);

create index if not exists display_pairings_code_idx on display_pairings (code);
