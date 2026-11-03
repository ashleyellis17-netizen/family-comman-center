export const GROCERY_CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Meat & Seafood',
  'Bakery',
  'Pantry',
  'Frozen',
  'Snacks',
  'Drinks',
  'Household',
  'Personal Care',
  'Other',
] as const;

export type GroceryCategory = (typeof GROCERY_CATEGORIES)[number];

export type GroceryItem = {
  id: number;
  clientKey: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  category: string;
  store: string | null;
  notes: string | null;
  requestedBy: string | null;
  neededBy: string | null;
  source: string;
  checked: boolean;
  checkedBy: string | null;
  version: number;
  updatedAt: string;
  /** Client-only: optimistic row not yet confirmed by the server. */
  pending?: boolean;
};

export type WishlistItem = {
  id: number;
  clientKey: string;
  name: string;
  quantity: string | null;
  reason: string | null;
  requesterName: string;
  status: 'pending' | 'approved' | 'declined' | 'deferred';
  decisionNote: string | null;
  decidedAt: string | null;
  groceryItemId: number | null;
  createdAt: string;
  mine: boolean;
  pending?: boolean;
};

export type GrocerySnapshot = {
  items: GroceryItem[];
  wishlist: WishlistItem[];
  viewer: { name: string; canDecide: boolean };
  serverTime: string;
};

export type MutationResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; conflict?: GroceryItem };
