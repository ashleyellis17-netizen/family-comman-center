'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  Child,
  ChildId,
  Chore,
  BehaviorNote,
  CalendarEvent,
  Grade,
  AllowanceTransaction,
  Reward,
  RewardRedemption,
  ChildStats,
  AppSettings,
  DataState,
} from './types';
import * as mockData from './mock-data';

// Context type
interface DataContextType {
  // Children
  children: Child[];
  getChild: (id: ChildId) => Child | undefined;
  getChildStats: (id: ChildId) => ChildStats;
  
  // Chores
  chores: Chore[];
  getChoresForChild: (id: ChildId) => Chore[];
  getTodayChoresForChild: (id: ChildId) => Chore[];
  addChore: (chore: Omit<Chore, 'id'>) => void;
  completeChore: (choreId: string) => void;
  
  // Behavior
  behaviorNotes: BehaviorNote[];
  getBehaviorForChild: (id: ChildId) => BehaviorNote[];
  addBehavior: (note: Omit<BehaviorNote, 'id'>) => void;
  
  // Events
  events: CalendarEvent[];
  getEventsForChild: (id: ChildId) => CalendarEvent[];
  getEventsForDate: (date: string) => CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  
  // Grades
  grades: Grade[];
  getGradesForChild: (id: ChildId) => Grade[];
  addGrade: (grade: Omit<Grade, 'id'>) => void;
  
  // Allowance
  allowanceTransactions: AllowanceTransaction[];
  getAllowanceForChild: (id: ChildId) => AllowanceTransaction[];
  getAllowanceBalance: (id: ChildId) => number;
  addAllowance: (transaction: Omit<AllowanceTransaction, 'id'>) => void;
  
  // Rewards
  rewards: Reward[];
  redemptions: RewardRedemption[];
  getActiveRewards: () => Reward[];
  getRedemptionsForChild: (id: ChildId) => RewardRedemption[];
  redeemReward: (childId: ChildId, rewardId: string) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  testConnection: () => Promise<{ success: boolean; message: string }>;
  
  // Helpers
  getWeekDates: () => ReturnType<typeof mockData.getWeekDates>;
  getMonthDates: (year: number, month: number) => ReturnType<typeof mockData.getMonthDates>;
  getWeeklyProgress: () => ReturnType<typeof mockData.getWeeklyProgress>;
  
  // State
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children: childrenProp }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // This will eventually be replaced with API calls
  const refreshData = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);
  
  const value: DataContextType = {
    // Children
    children: mockData.getChildren(),
    getChild: mockData.getChildById,
    getChildStats: mockData.getChildStats,
    
    // Chores
    chores: mockData.getChores(),
    getChoresForChild: mockData.getChoresForChild,
    getTodayChoresForChild: mockData.getTodayChoresForChild,
    addChore: (chore) => {
      mockData.addChore(chore);
      refreshData();
    },
    completeChore: (choreId) => {
      mockData.completeChore(choreId);
      refreshData();
    },
    
    // Behavior
    behaviorNotes: mockData.getBehavior(),
    getBehaviorForChild: mockData.getBehaviorForChild,
    addBehavior: (note) => {
      mockData.addBehavior(note);
      refreshData();
    },
    
    // Events
    events: mockData.getEvents(),
    getEventsForChild: mockData.getEventsForChild,
    getEventsForDate: mockData.getEventsForDate,
    addEvent: (event) => {
      mockData.addEvent(event);
      refreshData();
    },
    
    // Grades
    grades: mockData.getGrades(),
    getGradesForChild: mockData.getGradesForChild,
    addGrade: (grade) => {
      mockData.addGrade(grade);
      refreshData();
    },
    
    // Allowance
    allowanceTransactions: mockData.getAllowance(),
    getAllowanceForChild: mockData.getAllowanceForChild,
    getAllowanceBalance: mockData.getAllowanceBalance,
    addAllowance: (transaction) => {
      mockData.addAllowance(transaction);
      refreshData();
    },
    
    // Rewards
    rewards: mockData.getRewards(),
    redemptions: mockData.rewardRedemptions,
    getActiveRewards: mockData.getActiveRewards,
    getRedemptionsForChild: mockData.getRedemptionsForChild,
    redeemReward: (childId, rewardId) => {
      mockData.redeemReward(childId, rewardId);
      refreshData();
    },
    
    // Settings
    settings: mockData.getSettings(),
    updateSettings: (settings) => {
      mockData.updateSettings(settings);
      refreshData();
    },
    testConnection: mockData.testConnection,
    
    // Helpers
    getWeekDates: mockData.getWeekDates,
    getMonthDates: mockData.getMonthDates,
    getWeeklyProgress: mockData.getWeeklyProgress,
    
    // State
    loading,
    error,
    refreshData,
  };
  
  return (
    <DataContext.Provider value={value}>
      {childrenProp}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

// Individual hooks for specific data
export function useChildren() {
  const { children, getChild, getChildStats } = useData();
  return { children, getChild, getChildStats };
}

export function useChores() {
  const { chores, getChoresForChild, getTodayChoresForChild, addChore, completeChore } = useData();
  return { chores, getChoresForChild, getTodayChoresForChild, addChore, completeChore };
}

export function useBehavior() {
  const { behaviorNotes, getBehaviorForChild, addBehavior } = useData();
  return { behaviorNotes, getBehaviorForChild, addBehavior };
}

export function useEvents() {
  const { events, getEventsForChild, getEventsForDate, addEvent } = useData();
  return { events, getEventsForChild, getEventsForDate, addEvent };
}

export function useGrades() {
  const { grades, getGradesForChild, addGrade } = useData();
  return { grades, getGradesForChild, addGrade };
}

export function useAllowance() {
  const { allowanceTransactions, getAllowanceForChild, getAllowanceBalance, addAllowance } = useData();
  return { allowanceTransactions, getAllowanceForChild, getAllowanceBalance, addAllowance };
}

export function useRewards() {
  const { rewards, redemptions, getActiveRewards, getRedemptionsForChild, redeemReward } = useData();
  return { rewards, redemptions, getActiveRewards, getRedemptionsForChild, redeemReward };
}

export function useSettings() {
  const { settings, updateSettings, testConnection } = useData();
  return { settings, updateSettings, testConnection };
}
