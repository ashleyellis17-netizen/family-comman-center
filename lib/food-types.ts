export const MEAL_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const PANTRY_STATUSES = ['in_stock', 'low', 'out'] as const;
export type PantryStatus = (typeof PANTRY_STATUSES)[number];

export const PANTRY_STATUS_LABELS: Record<PantryStatus, string> = {
  in_stock: 'In stock',
  low: 'Running low',
  out: 'Out',
};

export type Ingredient = { name: string; quantity: string | null; unit: string | null };

export type Recipe = {
  id: number;
  title: string;
  servings: number | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  ingredients: Ingredient[];
  instructions: string | null;
  cuisine: string | null;
  mainIngredient: string | null;
  sourceUrl: string | null;
  kidFriendly: boolean;
  budgetFriendly: boolean;
  wantToTry: boolean;
  favorite: boolean;
  avgRating: number | null;
  ratingCount: number;
  myRating: number | null;
  lastPlanned: string | null;
  timesCooked: number;
};

export type MealEntry = {
  id: number;
  date: string;
  slot: MealSlot;
  kind: 'recipe' | 'custom';
  recipeId: number | null;
  title: string;
  servings: number | null;
  notes: string | null;
  cooked: boolean;
};

export type PantryEntry = {
  id: number;
  name: string;
  quantity: string | null;
  unit: string | null;
  status: PantryStatus;
  category: string;
  expiresOn: string | null;
  isStaple: boolean;
};

export type FoodSnapshot = {
  today: string;
  weekStart: string;
  viewer: { name: string; canManage: boolean };
  recipes: Recipe[];
  meals: MealEntry[];
  pantry: PantryEntry[];
};

export type ShoppingResult = { added: string[]; skipped: string[] };
