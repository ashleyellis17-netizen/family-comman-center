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

- [ ] Move Chores, Rewards, and School pages from demo data to household-scoped tables
- [ ] Weekly reset routine (clear checked items, roll the meal plan forward)
- [ ] Cozyla display pairing flow (a one-time code instead of signing in with a display account)
- [ ] Push / email notifications for reminders and wishlist approvals

## Phase 3: Integrations

- [ ] Google Calendar two-way sync (the current Google accounts page is demo only)
- [ ] Account disconnection and data deletion flows
- [ ] Optional AI recipe parsing for pages without structured data
