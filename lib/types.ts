// Types for Theveny Family Command Center

export type ChildId = 'alex' | 'jaxon' | 'carson';
export type ParentId = 'mom' | 'dad';

export interface Child {
  id: ChildId;
  name: string;
  color: string;
  avatar: string;
  age: number;
  birthday: string; // ISO date
  grade: string;
}

export interface Parent {
  id: ParentId;
  name: string;
  role: string;
  color: string;
  avatar: string;
  email?: string;
}

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
}

export interface BehaviorNote {
  id: string;
  childId: ChildId;
  type: 'positive' | 'negative';
  description: string;
  points: number;
  createdAt: string;
  createdBy: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  childId?: ChildId;
  parentId?: ParentId;
  allChildren?: boolean;
  family?: boolean;
  category: 'school' | 'sports' | 'appointment' | 'family' | 'work' | 'other';
}

export interface Grade {
  id: string;
  childId: ChildId;
  subject: string;
  grade: number;
  letterGrade: string;
  date: string;
  assignment?: string;
}

export interface AllowanceTransaction {
  id: string;
  childId: ChildId;
  amount: number;
  type: 'add' | 'subtract' | 'chore' | 'reward';
  description: string;
  date: string;
}

export interface Reward {
  id: string;
  title: string;
  description?: string;
  cost: number;
  available: boolean;
  imageUrl?: string;
}

export interface RewardRedemption {
  id: string;
  childId: ChildId;
  rewardId: string;
  redeemedAt: string;
  fulfilled: boolean;
}

export interface ChildStats {
  choresDueToday: number;
  choresCompletedToday: number;
  behaviorPoints: number;
  gradeAverage: number;
  allowanceBalance: number;
  rewardsRedeemed: number;
}

// ----- Summer Task System -----

export type SummerTaskCategory =
  | 'Learning'
  | 'Reading'
  | 'Home Responsibility'
  | 'Personal Responsibility'
  | 'Behavior / Attitude'
  | 'Quiet Time'
  | 'Outdoor / Physical Activity'
  | 'Creative';

export type SummerTaskStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Needs Parent Check'
  | 'Approved'
  | 'Rejected / Redo'
  | 'Missed'
  | 'Excused';

export interface SummerTask {
  id: string;
  title: string;
  category: SummerTaskCategory;
  childId: ChildId;
  status: SummerTaskStatus;
  points: number;
  date: string;
  required?: boolean;
  notes?: string;
}

// ----- Reward Unlock System -----

export type RewardUnlockState =
  | 'Locked'
  | 'In Progress'
  | 'Needs Parent Approval'
  | 'Unlocked'
  | 'Used Today'
  | 'Daily Limit Reached';

export interface UnlockReward {
  id: string;
  title: string;
  description?: string;
  childId: ChildId;
  state: RewardUnlockState;
  requiredTasks: number;
  completedTasks: number;
  dailyLimit?: number;
  usedToday?: number;
}

// ----- Grounding System -----

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
  status: 'Active' | 'Earn Back Available' | 'Ready for Review' | 'Resolved';
}

export interface EarnBackTask {
  id: string;
  groundingId: string;
  childId: ChildId;
  title: string;
  completed: boolean;
}

// ----- Parent Approval Queue -----

export interface ApprovalItem {
  id: string;
  childId: ChildId;
  type: 'Summer Task' | 'Reward' | 'Chore' | 'Earn Back' | 'Wishlist';
  title: string;
  detail?: string;
  submittedAt: string;
  submittedTime?: string;
  status: 'Pending' | 'Approved' | 'Redo' | 'Excused';
}

// ----- Grocery & Meals -----

export interface GroceryItem {
  id: string;
  item: string;
  category: string;
  quantity: string;
  neededBy?: string;
  addedBy: string;
  priority: 'Low' | 'Medium' | 'High';
  purchased: boolean;
  notes?: string;
}

export interface WishlistItem {
  id: string;
  item: string;
  requestedBy: string;
  category: string;
  reason?: string;
  approved: boolean;
  addedToList: boolean;
}

export interface MealIdea {
  id: string;
  name: string;
  category: string;
  protein: string;
  kidFriendly: boolean;
  quickMeal: boolean;
  ingredients: string[];
  rating: number;
  lastMade?: string;
}

export interface MealPlanDay {
  id: string;
  weekOf: string;
  day: string;
  breakfast?: string;
  lunch?: string;
  dinner?: string;
  snack?: string;
  helper?: string;
  groceryNeeded?: string[];
}

export interface PantryItem {
  id: string;
  item: string;
  category: string;
  haveIt: boolean;
  quantity: string;
  lowStock: boolean;
  lastChecked: string;
}

// ----- Google Accounts & Data Connection -----

export interface GoogleAccount {
  id: string;
  name: string;
  role: string;
  gmail: string;
  calendarId: string;
  connected: boolean;
  syncEnabled: boolean;
  lastSynced?: string;
}

export interface DataConnectionSettings {
  webAppUrl: string;
  apiToken: string;
  sheetId: string;
  connected: boolean;
  lastSync?: string;
}

export interface ParentNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface ParentReminder {
  id: string;
  parentId: ParentId;
  text: string;
  dueDate?: string;
  done: boolean;
}

// ----- Mom Work Mode -----

export type WorkMode =
  | 'Available'
  | 'Quiet Time'
  | 'Do Not Interrupt'
  | 'Lunch Break'
  | 'Done Working';

export interface WorkStatus {
  mode: WorkMode;
  until?: string; // human-readable e.g. "1:00 PM"
  note?: string;
}

export interface AskMomLaterItem {
  id: string;
  childId: ChildId;
  question: string;
  createdAt: string;
  answered: boolean;
}

// For Google Sheets API integration later
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
