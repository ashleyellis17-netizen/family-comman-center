# Family Command Center: Implementation Checklist

## Phase 1: Foundation + Food & Home (built)

- [x] Email + password auth (Better Auth on Neon), server-checked sessions, proxy redirect for signed-out users
- [x] Households: create/join with invite code, roles (parent / member / display), household timezone
- [x] Every data query scoped by household id on the server; existing calendar events claimed by the first household
- [x] Calendar ICS feed protected by a per-household token
- [x] Grocery list: add/parse multiple items, check off, soft delete with undo, duplicate hints, idempotent submits, shopping mode
- [x] Grocery wishlist: requests, parent approve/decline/defer, approved items move to the list exactly once
- [x] Pantry: in stock / low / out, staples
- [x] Recipes: library, online search (TheMealDB), URL import (SSRF-safe fetch + schema.org parsing), manual entry, ratings, favorites
- [x] Weekly meal plan: slots, leftovers/eating out, copy-week preview, mark cooked
- [x] Ingredient review before adding a meal or week to the grocery list (pantry + already-on-list aware)
- [x] Rule-based meal suggestions (not recently cooked, favorites, dislikes, busy-day quick meals)
- [x] Voice capture (browser speech recognition) with an editable review step before saving
- [x] Today dashboard and reminders (private reminders hidden from the display role)
- [x] Household settings: members, invites, preferences, JSON data export
- [x] Multi-device sync through SWR polling and revalidate-on-focus

## Phase 2: Next

- [x] Chores: daily / weekly / one-time chores per kid, check off for today, points ledger (scripts/003)
- [x] Rewards: parent-managed catalog, redemptions under a per-kid lock (no double-spending), cancel refunds points
- [x] School tables scoped by household and claimed by the first household along with calendar events
- [x] School Center removed from the app (nav, page, dashboard card, assignment due dates in the calendar feed). The school tables and their data are still in the database.
- [x] Today shows real chores; the old home page no longer shows demo chores or points
- [x] Weekly reset in Household Settings (clears checked groceries and finished reminders)
- [x] Grounding & Eligibility: per-child groundings that pause electronics, allowance, and/or rewards; reward redemptions and allowance payouts are blocked server-side while one is active
- [x] Earn Back Plan: tasks attached to a grounding; when all are done, a parent approves an early end from the queue
- [x] Behavior log: positive/negative notes with optional points that feed the shared points balance
- [x] Allowance: weekly rate per child, payouts, bonuses and spending in a ledger (tracking only, no money movement)
- [x] Parent Approval Queue: earn-back requests, reward hand-outs, and grocery wishlist requests in one place (parents only)
- [ ] Grades page still uses demo data
- [x] Cozyla display pairing flow: the screen opens `/pair` and shows a 10-minute code, a parent enters it in Settings → Shared displays, and the screen stays connected with no account. Parents can rename or unpair a screen there, and a revoked screen goes back to showing a code
- [ ] Push / email notifications for reminders and wishlist approvals

## Phase 3: Integrations

- [ ] Google Calendar two-way sync (the current Google accounts page is demo only)
- [ ] Account disconnection and data deletion flows
- [ ] Optional AI recipe parsing for pages without structured data
