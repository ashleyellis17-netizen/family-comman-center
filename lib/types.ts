// Types for the Theveny Family Command Center

export type ChildId = 'alex' | 'jaxon' | 'carson';
export type ParentId = 'mom' | 'dad';
export type PersonId = ChildId | ParentId;
// Who an item can be assigned to (people + everyone)
export type AssigneeId = PersonId | 'all';

export type Role = 'Parent' | 'Child';

export interface Child {
  id: ChildId;
  name: string;
  role: 'Child';
  color: string;
  avatar: string;
  age: number;
  birthday: string; // ISO date
  grade: string;
}

export interface Parent {
  id: ParentId;
  name: string;
  role: 'Parent';
  color: string;
  avatar: string;
  permissions: string[];
}

export type FamilyMember = Child | Parent;

// ---------------- Chores ----------------
export interface Chore {
  id: string;
  title: string;
  description?: string;
  assignedTo: ChildId;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  points: number;
  recurring?: 'daily' | 'weekly' | 'monthly';
  needsApproval?: boolean;
  approvalStatus?: ApprovalStatus;
}

// ---------------- Behavior ----------------
export interface BehaviorNote {
  id: string;
  childId: ChildId;
  type: 'positive' | 'negative';
  description: string;
  points: number;
  createdAt: string;
  createdBy: string;
}

// ---------------- Calendar ----------------
export type CalendarId = 'shared' | 'mom' | 'dad';

export type EventCategory =
  | 'school'
  | 'sports'
  | 'appointment'
  | 'family'
  | 'work'
  | 'reminder'
  | 'meal'
  | 'chore'
  | 'other';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string; // legacy start time label
  startTime?: string;
  endTime?: string;
  // legacy single child link
  childId?: ChildId;
  allChildren?: boolean;
  // new richer model
  person?: AssigneeId;
  calendar?: CalendarId;
  category: EventCategory;
  location?: string;
  notes?: string;
}

// ---------------- Grades ----------------
export interface Grade {
  id: string;
  childId: ChildId;
  subject: string;
  grade: number;
  letterGrade: string;
  date: string;
  assignment?: string;
}

// ---------------- Allowance ----------------
export type AllowanceType =
  | 'add'
  | 'subtract'
  | 'chore'
  | 'reward'
  | 'bonus'
  | 'deduction'
  | 'payout';

export interface AllowanceTransaction {
  id: string;
  childId: ChildId;
  amount: number;
  type: AllowanceType;
  description: string;
  date: string;
}

// ---------------- Rewards ----------------
export type RewardCategory =
  | 'outside'
  | 'inflatable'
  | 'game'
  | 'tablet'
  | 'tv'
  | 'snack'
  | 'friend'
  | 'screen'
  | 'dinner'
  | 'stayup';

export interface Reward {
  id: string;
  title: string;
  description?: string;
  cost: number;
  available: boolean;
  category?: RewardCategory;
  imageUrl?: string;
}

export interface RewardRedemption {
  id: string;
  childId: ChildId;
  rewardId: string;
  redeemedAt: string;
  fulfilled: boolean;
}

// ---------------- Summer Tasks ----------------
export type SummerTaskCategory =
  | 'learning'
  | 'reading'
  | 'home'
  | 'personal'
  | 'behavior'
  | 'quiet'
  | 'outdoor'
  | 'creative';

export type SummerTaskStatus =
  | 'not-started'
  | 'in-progress'
  | 'needs-check'
  | 'approved'
  | 'redo'
  | 'missed'
  | 'excused';

export interface SummerTask {
  id: string;
  title: string;
  description?: string;
  childId: ChildId;
  category: SummerTaskCategory;
  status: SummerTaskStatus;
  dueDate: string;
  required: boolean;
  completedAt?: string;
}

// ---------------- Reward Unlock ----------------
export type UnlockState =
  | 'locked'
  | 'in-progress'
  | 'needs-approval'
  | 'unlocked'
  | 'used-today'
  | 'limit-reached';

export interface RewardUnlock {
  id: string;
  childId: ChildId;
  rewardCategory: RewardCategory;
  label: string;
  state: UnlockState;
  requiredTasks: number;
  completedTasks: number;
  dailyLimitMinutes?: number;
  usedMinutes?: number;
}

// ---------------- Grounding ----------------
export type GroundingStatus = 'active' | 'completed' | 'canceled';

export interface Grounding {
  id: string;
  childId: ChildId;
  startDate: string;
  endDate: string;
  reason: string;
  allowanceEligible: boolean;
  electronicsAllowed: boolean;
  rewardsAllowed: boolean;
  earnBackAvailable: boolean;
  parentNotes?: string;
  status: GroundingStatus;
}

// ---------------- Earn Back ----------------
export interface EarnBackTask {
  id: string;
  label: string;
  type: 'learning' | 'home' | 'reflection' | 'quiet' | 'behavior' | 'approval';
  complete: boolean;
}

export interface EarnBackPlan {
  id: string;
  childId: ChildId;
  groundingId: string;
  tasks: EarnBackTask[];
  readyForReview: boolean;
}

// ---------------- Parent Approval Queue ----------------
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalType =
  | 'chore'
  | 'summer-task'
  | 'reward'
  | 'wishlist'
  | 'earn-back';

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  childId: ChildId;
  title: string;
  detail?: string;
  submittedAt: string;
  status: ApprovalStatus;
}

// ---------------- Grocery ----------------
export type GroceryCategory =
  | 'produce'
  | 'meat'
  | 'dairy'
  | 'frozen'
  | 'pantry'
  | 'snacks'
  | 'drinks'
  | 'household'
  | 'toiletries'
  | 'school'
  | 'other';

export type Priority = 'low' | 'medium' | 'high';

export interface GroceryItem {
  id: string;
  item: string;
  category: GroceryCategory;
  quantity: string;
  neededBy?: string;
  addedBy: string;
  store?: string;
  priority: Priority;
  purchased: boolean;
  notes?: string;
}

export interface WishlistItem {
  id: string;
  item: string;
  requestedBy: string;
  category: GroceryCategory;
  reason?: string;
  approved: boolean;
  addedToList: boolean;
  notes?: string;
}

// ---------------- Meals ----------------
export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';

export interface MealIdea {
  id: string;
  name: string;
  category: MealCategory;
  protein?: string;
  kidFriendly: boolean;
  quick: boolean;
  ingredients: string[];
  notes?: string;
  rating: number; // 0-5
  lastMade?: string;
}

export interface MealPlanDay {
  day: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snack?: string;
  cook?: string;
  notes?: string;
}

export interface MealPlan {
  weekOf: string;
  days: MealPlanDay[];
}

// ---------------- Pantry ----------------
export interface PantryItem {
  id: string;
  item: string;
  category: GroceryCategory;
  haveIt: boolean;
  quantity: string;
  lowStock: boolean;
  lastChecked?: string;
  notes?: string;
}

// ---------------- Google Accounts ----------------
export interface GoogleAccount {
  id: string;
  name: string;
  role: string;
  personId?: PersonId | 'shared';
  email: string;
  calendarId: string;
  connected: boolean;
  syncCalendar: boolean;
  syncTasks: boolean;
  syncTasksAvailable: boolean;
  lastSynced?: string;
}

// ---------------- Parent Notes ----------------
export interface ParentNote {
  id: string;
  author: ParentId;
  text: string;
  createdAt: string;
}

// ---------------- Settings ----------------
export interface AppSettings {
  webAppUrl: string;
  apiToken: string;
  sheetId: string;
  oauthClientId: string;
  connected: boolean;
  lastSync?: string;
  calendarApiStatus: 'not-configured' | 'configured';
}

export interface ChildStats {
  choresDueToday: number;
  choresCompletedToday: number;
  behaviorPoints: number;
  gradeAverage: number;
  allowanceBalance: number;
  rewardsRedeemed: number;
}

// For Google Sheets API integration later
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
