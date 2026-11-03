/**
 * Screens that still render placeholder data from lib/mock-data.ts. They are
 * labelled "Sample" in navigation and show a banner so nobody mistakes them for
 * live household data. Remove a route from this set when it is connected.
 */
export const SAMPLE_ROUTES = new Set<string>([
  '/family-hub',
  '/meal-plan',
  '/meal-ideas',
  '/pantry',
  '/alex',
  '/jaxon',
  '/carson',
  '/chores',
  '/behavior',
  '/allowance',
  '/rewards',
  '/reward-unlock',
  '/grounding',
  '/earn-back',
  '/approvals',
  '/mom',
  '/dad',
  '/google-accounts',
  '/data-connection',
  '/admin',
]);
