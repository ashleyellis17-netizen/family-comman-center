// Types for Boys Command Center

export type ChildId = 'alex' | 'jaxon' | 'carson';

export interface Child {
  id: ChildId;
  name: string;
  color: string;
  avatar: string;
  age: number;
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
  allChildren?: boolean;
  category: 'school' | 'sports' | 'appointment' | 'family' | 'other';
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

// For Google Sheets API integration later
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
