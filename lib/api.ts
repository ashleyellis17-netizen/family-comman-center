/**
 * API layer for the Theveny Family Command Center.
 *
 * Right now every function returns mock data so the app works fully offline.
 * Later, each function can be swapped to call the Google Apps Script Web App
 * (see lib/google-sheets.ts). The function signatures are designed to stay the
 * same so pages and components do not need to change when the backend is wired.
 */

import * as data from './mock-data';
import type {
  AssigneeId,
  CalendarEvent,
  Chore,
  BehaviorNote,
  Grade,
  AllowanceTransaction,
  SummerTask,
  Grounding,
  EarnBackPlan,
  GroceryItem,
  WishlistItem,
  MealIdea,
  MealPlan,
  PantryItem,
} from './types';

// Simulate async so swapping to real fetch() later is seamless.
function ok<T>(value: T): Promise<T> {
  return Promise.resolve(value);
}

// People
export const getFamilyMembers = () => ok([...data.parents, ...data.children]);
export const getKids = () => ok(data.children);
export const getParents = () => ok(data.parents);
export const getGoogleAccounts = () => ok(data.googleAccounts);

// Calendars
export const getSharedCalendar = () => ok(data.getEventsForCalendar('shared'));
export const getMomCalendar = () => ok(data.getEventsForCalendar('mom'));
export const getDadCalendar = () => ok(data.getEventsForCalendar('dad'));
export const addCalendarEvent = (_event: Omit<CalendarEvent, 'id'>) => ok({ success: true });

// Chores
export const getChores = () => ok(data.chores);
export const addChore = (_chore: Omit<Chore, 'id'>) => ok({ success: true });
export const completeChore = (_id: string) => ok({ success: true });

// Summer tasks
export const getSummerTasks = () => ok(data.summerTasks);
export const addSummerTask = (_task: Omit<SummerTask, 'id'>) => ok({ success: true });
export const completeSummerTask = (_id: string) => ok({ success: true });
export const approveTask = (_id: string) => ok({ success: true });
export const rejectTask = (_id: string) => ok({ success: true });

// Behavior
export const getBehavior = () => ok(data.behaviorNotes);
export const addBehavior = (_note: Omit<BehaviorNote, 'id'>) => ok({ success: true });

// Grades
export const getGrades = () => ok(data.grades);
export const addGrade = (_grade: Omit<Grade, 'id'>) => ok({ success: true });

// Allowance
export const getAllowance = () => ok(data.allowanceTransactions);
export const addAllowance = (_tx: Omit<AllowanceTransaction, 'id'>) => ok({ success: true });

// Grounding
export const getGrounding = () => ok(data.groundings);
export const addGrounding = (_g: Omit<Grounding, 'id'>) => ok({ success: true });
export const endGrounding = (_id: string) => ok({ success: true });

// Earn back
export const getEarnBackPlan = (childId: string) => ok(data.getEarnBackForChild(childId));
export const saveEarnBackPlan = (_plan: EarnBackPlan) => ok({ success: true });

// Rewards
export const getRewards = () => ok(data.rewards);
export const redeemReward = (_childId: string, _rewardId: string) => ok({ success: true });

// Groceries
export const getGroceries = () => ok(data.groceryItems);
export const addGroceryItem = (_item: Omit<GroceryItem, 'id'>) => ok({ success: true });
export const updateGroceryItem = (_item: GroceryItem) => ok({ success: true });

// Wishlist
export const getGroceryWishlist = () => ok(data.wishlistItems);
export const addWishlistItem = (_item: Omit<WishlistItem, 'id'>) => ok({ success: true });
export const approveWishlistItem = (_id: string) => ok({ success: true });

// Meals
export const getMealIdeas = () => ok(data.mealIdeas);
export const addMealIdea = (_idea: Omit<MealIdea, 'id'>) => ok({ success: true });
export const getMealPlan = () => ok(data.mealPlan);
export const saveMealPlan = (_plan: MealPlan) => ok({ success: true });

// Pantry
export const getPantryStaples = () => ok(data.pantryItems);
export const updatePantryStaple = (_item: PantryItem) => ok({ success: true });

// Settings
export const getSettings = () => ok(data.appSettings);

/**
 * Returns the active data source: 'live' once a Google Sheets backend is
 * connected, otherwise 'mock'. Pages can use this to surface a banner.
 */
export function getDataSourceMode(): 'live' | 'mock' {
  return data.appSettings.connected ? 'live' : 'mock';
}

/**
 * Test the connection to the Google Apps Script Web App.
 * Returns a mock failure until a real Web App URL + token are configured.
 */
export async function testConnection(webAppUrl?: string): Promise<{
  success: boolean;
  message: string;
}> {
  await new Promise((r) => setTimeout(r, 900));
  if (!webAppUrl) {
    return {
      success: false,
      message: 'No Web App URL configured yet. Add your Google Apps Script URL to connect.',
    };
  }
  return {
    success: false,
    message: 'Google Sheets connection will be enabled in a later step.',
  };
}

// Re-export the assignee helper type for convenience
export type { AssigneeId };
