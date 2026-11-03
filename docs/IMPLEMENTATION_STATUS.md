# Family Command Center — Implementation Status

Legend: **Real** = backed by Neon, scoped to the signed-in household, verified in the browser. **Sample** = still renders `lib/mock-data.ts`; it is labelled "SAMPLE" in the nav and shows a banner on the page.

## Phase A — Audit (done)
- [x] Live DB already had households, members, invites, display devices, groceries, wishlist, meals, pantry, chores tables.
- [x] `main` code used none of them: no auth, a hardcoded client-side admin PIN, and mock data on almost every screen.
- [x] Existing household, parent account, and 24 calendar events were preserved untouched.

## Phase B — Accounts, households, devices (done)
- [x] Email + password sign-in / sign-up (Better Auth on Neon), persistent sessions.
- [x] Onboarding: create a household or join with a one-time invite code (atomic claim, 7-day expiry).
- [x] Roles: `parent` and `member`. Parent-only routes (`/admin`, `/settings`, approval screens) are enforced on the server.
- [x] Removed the hardcoded `1234` PIN gate.
- [x] Shared display devices: the wall screen shows a pairing code, a parent approves it in Settings; displays never get parent rights and can be revoked.
- [x] Sign out of this device, sign out of all devices.
- [x] Calendar `.ics` feed now requires a per-household secret token (rotatable in Settings).

## Phase C — Remove School Center (done)
- [x] Removed `/school`, `/grades`, school views/actions, and the school/assignment entries in the calendar feed.
- [x] School tables in the DB were left in place (no data deleted).

## Phase D — Real shared features
- [x] **Grocery List**: add / edit / check off / remove / clear checked, with undo. Idempotent adds (client keys), version checks against conflicting edits, live sync across devices (4s polling plus refresh on focus or reconnect).
- [x] **Grocery Wishlist**: anyone can request; parents approve or decline; approval moves the item onto the grocery list exactly once.
- [x] **Calendar**: events scoped to the household.
- [x] **Today**: today's events, grocery count, pending wishlist requests, tonight's dinner, low pantry items, all from live data.
- [ ] Weekly Meal Plan, Meal Ideas, Pantry & Staples: tables exist, UI still on sample data.
- [ ] Chores, Behavior, Allowance, Rewards, Grounding, Earn Back, Approval Queue: sample data.
- [ ] Kid and parent profile pages, Family Hub: sample data.
- [ ] Google Accounts, Data Connection: not connected.

## Verified this pass
- Typecheck clean.
- Browser: sign-up → onboarding → Today; add a grocery item on device A, it appears on device B; check-off on B updates A; sign-out redirects protected routes to sign-in.
- QA test account and household were deleted afterwards.
