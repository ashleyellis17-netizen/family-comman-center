import type {
  Child,
  Parent,
  Chore,
  BehaviorNote,
  CalendarEvent,
  Grade,
  AllowanceTransaction,
  Reward,
  RewardRedemption,
  SummerTask,
  UnlockReward,
  Grounding,
  EarnBackTask,
  ApprovalItem,
  GroceryItem,
  WishlistItem,
  MealIdea,
  MealPlanDay,
  PantryItem,
  GoogleAccount,
  DataConnectionSettings,
  ParentNote,
  ParentReminder,
  WorkStatus,
  AskMomLaterItem,
  ChildId,
} from './types';

// Helper to get dates relative to today
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const children: Child[] = [
  {
    id: 'alex',
    name: 'Alex',
    color: 'alex',
    avatar: 'A',
    age: 12,
    birthday: '2014-05-07',
    grade: '6th Grade',
  },
  {
    id: 'jaxon',
    name: 'Jaxon',
    color: 'jaxon',
    avatar: 'J',
    age: 8,
    birthday: '2017-11-22',
    grade: '2nd Grade',
  },
  {
    id: 'carson',
    name: 'Carson',
    color: 'carson',
    avatar: 'C',
    age: 5,
    birthday: '2020-06-26',
    grade: 'Kindergarten',
  },
];

export const parents: Parent[] = [
  {
    id: 'mom',
    name: 'Mom',
    role: 'Parent / Household Manager',
    color: 'primary',
    avatar: 'M',
    email: 'mom@example.com',
  },
  {
    id: 'dad',
    name: 'Dad',
    role: 'Parent / Co-Manager',
    color: 'alex',
    avatar: 'D',
    email: 'dad@example.com',
  },
];

export const chores: Chore[] = [
  // Today's chores
  {
    id: 'chore-1',
    title: 'Make Bed',
    description: 'Make bed neatly with pillows arranged',
    assignedTo: 'alex',
    dueDate: formatDate(today),
    completed: true,
    completedAt: formatDate(today),
    points: 5,
    recurring: 'daily',
  },
  {
    id: 'chore-2',
    title: 'Clean Room',
    description: 'Pick up clothes and toys, vacuum floor',
    assignedTo: 'alex',
    dueDate: formatDate(today),
    completed: false,
    points: 10,
    recurring: 'weekly',
  },
  {
    id: 'chore-3',
    title: 'Make Bed',
    assignedTo: 'jaxon',
    dueDate: formatDate(today),
    completed: true,
    completedAt: formatDate(today),
    points: 5,
    recurring: 'daily',
  },
  {
    id: 'chore-4',
    title: 'Feed Dog',
    description: 'Feed Max breakfast and dinner',
    assignedTo: 'jaxon',
    dueDate: formatDate(today),
    completed: false,
    points: 5,
    recurring: 'daily',
  },
  {
    id: 'chore-5',
    title: 'Set Table',
    description: 'Set table for dinner',
    assignedTo: 'jaxon',
    dueDate: formatDate(today),
    completed: false,
    points: 5,
    recurring: 'daily',
  },
  {
    id: 'chore-6',
    title: 'Make Bed',
    assignedTo: 'carson',
    dueDate: formatDate(today),
    completed: false,
    points: 5,
    recurring: 'daily',
  },
  {
    id: 'chore-7',
    title: 'Pick Up Toys',
    description: 'Put toys back in toy bins',
    assignedTo: 'carson',
    dueDate: formatDate(today),
    completed: true,
    completedAt: formatDate(today),
    points: 5,
    recurring: 'daily',
  },
  // Tomorrow's chores
  {
    id: 'chore-8',
    title: 'Take Out Trash',
    assignedTo: 'alex',
    dueDate: formatDate(addDays(today, 1)),
    completed: false,
    points: 5,
    recurring: 'weekly',
  },
  {
    id: 'chore-9',
    title: 'Mow Lawn',
    description: 'Mow front and back yard',
    assignedTo: 'alex',
    dueDate: formatDate(addDays(today, 2)),
    completed: false,
    points: 20,
    recurring: 'weekly',
  },
];

export const behaviorNotes: BehaviorNote[] = [
  {
    id: 'behavior-1',
    childId: 'alex',
    type: 'positive',
    description: 'Helped younger brother with homework',
    points: 10,
    createdAt: formatDate(today),
    createdBy: 'Mom',
  },
  {
    id: 'behavior-2',
    childId: 'alex',
    type: 'negative',
    description: 'Forgot to do homework',
    points: -5,
    createdAt: formatDate(addDays(today, -1)),
    createdBy: 'Dad',
  },
  {
    id: 'behavior-3',
    childId: 'jaxon',
    type: 'positive',
    description: 'Shared toys with Carson without being asked',
    points: 10,
    createdAt: formatDate(today),
    createdBy: 'Mom',
  },
  {
    id: 'behavior-4',
    childId: 'jaxon',
    type: 'positive',
    description: 'Great attitude at soccer practice',
    points: 5,
    createdAt: formatDate(addDays(today, -2)),
    createdBy: 'Dad',
  },
  {
    id: 'behavior-5',
    childId: 'carson',
    type: 'positive',
    description: 'Said please and thank you all day',
    points: 5,
    createdAt: formatDate(today),
    createdBy: 'Mom',
  },
  {
    id: 'behavior-6',
    childId: 'carson',
    type: 'negative',
    description: 'Threw a tantrum at bedtime',
    points: -10,
    createdAt: formatDate(addDays(today, -1)),
    createdBy: 'Dad',
  },
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Math Test',
    description: 'Chapter 5 test',
    date: formatDate(today),
    time: '10:00 AM',
    childId: 'alex',
    category: 'school',
  },
  {
    id: 'event-2',
    title: 'Soccer Practice',
    date: formatDate(today),
    time: '4:00 PM',
    childId: 'jaxon',
    category: 'sports',
  },
  {
    id: 'event-3',
    title: 'Family Movie Night',
    description: 'Watching the new Marvel movie',
    date: formatDate(addDays(today, 1)),
    time: '7:00 PM',
    allChildren: true,
    category: 'family',
  },
  {
    id: 'event-4',
    title: 'Dentist Appointment',
    date: formatDate(addDays(today, 2)),
    time: '2:30 PM',
    childId: 'carson',
    category: 'appointment',
  },
  {
    id: 'event-5',
    title: 'Piano Lesson',
    date: formatDate(addDays(today, 2)),
    time: '5:00 PM',
    childId: 'alex',
    category: 'other',
  },
  {
    id: 'event-6',
    title: 'School Play',
    description: 'Carson is playing the lead role!',
    date: formatDate(addDays(today, 5)),
    time: '6:00 PM',
    childId: 'carson',
    category: 'school',
  },
  {
    id: 'event-7',
    title: 'Basketball Game',
    date: formatDate(addDays(today, 3)),
    time: '3:00 PM',
    childId: 'alex',
    category: 'sports',
  },
];

export const grades: Grade[] = [
  {
    id: 'grade-1',
    childId: 'alex',
    subject: 'Math',
    grade: 92,
    letterGrade: 'A-',
    date: formatDate(addDays(today, -3)),
    assignment: 'Chapter 4 Test',
  },
  {
    id: 'grade-2',
    childId: 'alex',
    subject: 'English',
    grade: 88,
    letterGrade: 'B+',
    date: formatDate(addDays(today, -5)),
    assignment: 'Essay',
  },
  {
    id: 'grade-3',
    childId: 'alex',
    subject: 'Science',
    grade: 95,
    letterGrade: 'A',
    date: formatDate(addDays(today, -7)),
    assignment: 'Lab Report',
  },
  {
    id: 'grade-4',
    childId: 'jaxon',
    subject: 'Math',
    grade: 85,
    letterGrade: 'B',
    date: formatDate(addDays(today, -2)),
    assignment: 'Quiz',
  },
  {
    id: 'grade-5',
    childId: 'jaxon',
    subject: 'Reading',
    grade: 90,
    letterGrade: 'A-',
    date: formatDate(addDays(today, -4)),
    assignment: 'Book Report',
  },
  {
    id: 'grade-6',
    childId: 'jaxon',
    subject: 'Science',
    grade: 88,
    letterGrade: 'B+',
    date: formatDate(addDays(today, -6)),
  },
  {
    id: 'grade-7',
    childId: 'carson',
    subject: 'Math',
    grade: 82,
    letterGrade: 'B-',
    date: formatDate(addDays(today, -1)),
    assignment: 'Worksheet',
  },
  {
    id: 'grade-8',
    childId: 'carson',
    subject: 'Reading',
    grade: 95,
    letterGrade: 'A',
    date: formatDate(addDays(today, -3)),
  },
  {
    id: 'grade-9',
    childId: 'carson',
    subject: 'Art',
    grade: 100,
    letterGrade: 'A+',
    date: formatDate(addDays(today, -5)),
    assignment: 'Drawing Project',
  },
];

export const allowanceTransactions: AllowanceTransaction[] = [
  {
    id: 'allowance-1',
    childId: 'alex',
    amount: 10,
    type: 'add',
    description: 'Weekly allowance',
    date: formatDate(addDays(today, -7)),
  },
  {
    id: 'allowance-2',
    childId: 'alex',
    amount: 5,
    type: 'chore',
    description: 'Mowed lawn',
    date: formatDate(addDays(today, -5)),
  },
  {
    id: 'allowance-3',
    childId: 'alex',
    amount: -8,
    type: 'reward',
    description: 'Redeemed: Extra Screen Time',
    date: formatDate(addDays(today, -3)),
  },
  {
    id: 'allowance-4',
    childId: 'jaxon',
    amount: 8,
    type: 'add',
    description: 'Weekly allowance',
    date: formatDate(addDays(today, -7)),
  },
  {
    id: 'allowance-5',
    childId: 'jaxon',
    amount: 3,
    type: 'chore',
    description: 'Fed dog all week',
    date: formatDate(addDays(today, -2)),
  },
  {
    id: 'allowance-6',
    childId: 'carson',
    amount: 5,
    type: 'add',
    description: 'Weekly allowance',
    date: formatDate(addDays(today, -7)),
  },
  {
    id: 'allowance-7',
    childId: 'carson',
    amount: 2,
    type: 'chore',
    description: 'Picked up toys',
    date: formatDate(addDays(today, -4)),
  },
  {
    id: 'allowance-8',
    childId: 'carson',
    amount: -5,
    type: 'reward',
    description: 'Redeemed: Ice Cream Trip',
    date: formatDate(addDays(today, -1)),
  },
];

export const rewards: Reward[] = [
  {
    id: 'reward-1',
    title: 'Extra Screen Time',
    description: '30 minutes of extra screen time',
    cost: 8,
    available: true,
  },
  {
    id: 'reward-2',
    title: 'Ice Cream Trip',
    description: 'Trip to the ice cream shop',
    cost: 5,
    available: true,
  },
  {
    id: 'reward-3',
    title: 'Movie Night Pick',
    description: 'Choose the family movie',
    cost: 10,
    available: true,
  },
  {
    id: 'reward-4',
    title: 'Stay Up Late',
    description: '30 minutes past bedtime',
    cost: 12,
    available: true,
  },
  {
    id: 'reward-5',
    title: 'Friend Sleepover',
    description: 'Have a friend sleep over',
    cost: 25,
    available: true,
  },
  {
    id: 'reward-6',
    title: 'Video Game',
    description: 'New video game of your choice (up to $20)',
    cost: 50,
    available: true,
  },
  {
    id: 'reward-7',
    title: 'Skip Chores Day',
    description: 'Skip all chores for one day',
    cost: 15,
    available: true,
  },
  {
    id: 'reward-8',
    title: 'Lunch Out',
    description: 'Pick a restaurant for lunch',
    cost: 20,
    available: true,
  },
];

export const rewardRedemptions: RewardRedemption[] = [
  {
    id: 'redemption-1',
    childId: 'alex',
    rewardId: 'reward-1',
    redeemedAt: formatDate(addDays(today, -3)),
    fulfilled: true,
  },
  {
    id: 'redemption-2',
    childId: 'carson',
    rewardId: 'reward-2',
    redeemedAt: formatDate(addDays(today, -1)),
    fulfilled: false,
  },
];

// Helper functions to calculate stats
export function getChildStats(childId: string) {
  const todayStr = formatDate(today);
  
  const childChores = chores.filter(c => c.assignedTo === childId);
  const todayChores = childChores.filter(c => c.dueDate === todayStr);
  const completedTodayChores = todayChores.filter(c => c.completed);
  
  const childBehavior = behaviorNotes.filter(b => b.childId === childId);
  const behaviorPoints = childBehavior.reduce((sum, b) => sum + b.points, 0);
  
  const childGrades = grades.filter(g => g.childId === childId);
  const gradeAverage = childGrades.length > 0
    ? Math.round(childGrades.reduce((sum, g) => sum + g.grade, 0) / childGrades.length)
    : 0;
  
  const childTransactions = allowanceTransactions.filter(t => t.childId === childId);
  const allowanceBalance = childTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const childRedemptions = rewardRedemptions.filter(r => r.childId === childId);
  
  return {
    choresDueToday: todayChores.length,
    choresCompletedToday: completedTodayChores.length,
    behaviorPoints,
    gradeAverage,
    allowanceBalance,
    rewardsRedeemed: childRedemptions.length,
  };
}

export function getWeekDates() {
  const dates = [];
  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    dates.push({
      date: formatDate(date),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: formatDate(date) === formatDate(today),
    });
  }
  
  return dates;
}

export function getEventsForDate(dateStr: string) {
  return calendarEvents.filter(e => e.date === dateStr);
}

export function getChoresForChild(childId: string) {
  return chores.filter(c => c.assignedTo === childId);
}

export function getTodayChoresForChild(childId: string) {
  const todayStr = formatDate(today);
  return chores.filter(c => c.assignedTo === childId && c.dueDate === todayStr);
}

export function getBehaviorForChild(childId: string) {
  return behaviorNotes.filter(b => b.childId === childId);
}

export function getGradesForChild(childId: string) {
  return grades.filter(g => g.childId === childId);
}

export function getTransactionsForChild(childId: string) {
  return allowanceTransactions.filter(t => t.childId === childId);
}

export function getEventsForChild(childId: string) {
  return calendarEvents.filter(e => e.childId === childId || e.allChildren);
}

export function getRedemptionsForChild(childId: string) {
  return rewardRedemptions.filter(r => r.childId === childId);
}

export function getChildById(id: string) {
  return children.find(c => c.id === id);
}

export function getParentById(id: string) {
  return parents.find(p => p.id === id);
}

// ---------------------------------------------------------------------------
// EXTENDED FAMILY COMMAND CENTER DATA
// All mock data lives here. Swap these arrays for Google Sheets API later.
// ---------------------------------------------------------------------------

// Parent & family calendar events
export const parentEvents: CalendarEvent[] = [
  {
    id: 'pevent-1',
    title: 'Work Call - Client Review',
    date: formatDate(today),
    time: '11:00 AM',
    parentId: 'mom',
    category: 'work',
  },
  {
    id: 'pevent-2',
    title: 'Grocery Run',
    date: formatDate(today),
    time: '5:30 PM',
    parentId: 'mom',
    category: 'other',
  },
  {
    id: 'pevent-3',
    title: 'Dentist (Dad)',
    date: formatDate(addDays(today, 1)),
    time: '9:00 AM',
    parentId: 'dad',
    category: 'appointment',
  },
  {
    id: 'pevent-4',
    title: 'Coach Jaxon Soccer',
    date: formatDate(addDays(today, 2)),
    time: '4:00 PM',
    parentId: 'dad',
    category: 'sports',
  },
];

export const familyEvents: CalendarEvent[] = [
  {
    id: 'fevent-1',
    title: 'Family Movie Night',
    description: 'Pizza and a movie',
    date: formatDate(addDays(today, 1)),
    time: '7:00 PM',
    family: true,
    category: 'family',
  },
  {
    id: 'fevent-2',
    title: 'Carson turns 6!',
    description: "Carson's birthday celebration",
    date: '2026-06-26',
    family: true,
    category: 'family',
  },
  {
    id: 'fevent-3',
    title: 'Grandma Visit',
    date: formatDate(addDays(today, 4)),
    time: '2:00 PM',
    family: true,
    category: 'family',
  },
];

// Parent reminders
export const parentReminders: ParentReminder[] = [
  { id: 'rem-1', parentId: 'mom', text: 'Sign Alex permission slip', dueDate: formatDate(addDays(today, 1)), done: false },
  { id: 'rem-2', parentId: 'mom', text: 'Refill Carson vitamins', done: false },
  { id: 'rem-3', parentId: 'dad', text: 'Fix back gate latch', done: false },
  { id: 'rem-4', parentId: 'dad', text: 'Schedule oil change', dueDate: formatDate(addDays(today, 3)), done: true },
];

// Family / parent notes
export const parentNotes: ParentNote[] = [
  { id: 'note-1', author: 'Mom', text: 'Jaxon has a half day Friday - pickup at noon.', createdAt: formatDate(today) },
  { id: 'note-2', author: 'Dad', text: 'Sprinkler guy coming Tuesday morning.', createdAt: formatDate(addDays(today, -1)) },
  { id: 'note-3', author: 'Mom', text: 'Need to plan Carson birthday party for the 26th.', createdAt: formatDate(addDays(today, -2)) },
];

// Summer tasks
const summerCategories = [
  'Learning', 'Reading', 'Home Responsibility', 'Personal Responsibility',
  'Behavior / Attitude', 'Quiet Time', 'Outdoor / Physical Activity', 'Creative',
] as const;

export const summerTasks: SummerTask[] = [
  { id: 'st-1', title: 'Handwriting sheet', category: 'Learning', childId: 'alex', status: 'Approved', points: 10, date: formatDate(today), required: true },
  { id: 'st-2', title: 'Math sheet', category: 'Learning', childId: 'alex', status: 'Needs Parent Check', points: 10, date: formatDate(today), required: true },
  { id: 'st-3', title: 'Science sheet', category: 'Learning', childId: 'alex', status: 'In Progress', points: 10, date: formatDate(today) },
  { id: 'st-4', title: 'Read for 15 minutes', category: 'Reading', childId: 'alex', status: 'Approved', points: 5, date: formatDate(today), required: true },
  { id: 'st-5', title: 'Clean living room', category: 'Home Responsibility', childId: 'alex', status: 'Not Started', points: 10, date: formatDate(today) },
  { id: 'st-6', title: 'Complete quiet time block', category: 'Quiet Time', childId: 'alex', status: 'Approved', points: 5, date: formatDate(today) },

  { id: 'st-7', title: 'Handwriting sheet', category: 'Learning', childId: 'jaxon', status: 'Approved', points: 10, date: formatDate(today), required: true },
  { id: 'st-8', title: 'Math sheet', category: 'Learning', childId: 'jaxon', status: 'In Progress', points: 10, date: formatDate(today), required: true },
  { id: 'st-9', title: 'Read for 15 minutes', category: 'Reading', childId: 'jaxon', status: 'Needs Parent Check', points: 5, date: formatDate(today), required: true },
  { id: 'st-10', title: 'Sweep floor', category: 'Home Responsibility', childId: 'jaxon', status: 'Not Started', points: 5, date: formatDate(today) },
  { id: 'st-11', title: 'Make bed', category: 'Personal Responsibility', childId: 'jaxon', status: 'Approved', points: 5, date: formatDate(today) },
  { id: 'st-12', title: 'Do not interrupt Mom during work calls', category: 'Behavior / Attitude', childId: 'jaxon', status: 'In Progress', points: 5, date: formatDate(today) },

  { id: 'st-13', title: 'Social studies/culture sheet', category: 'Learning', childId: 'carson', status: 'Not Started', points: 10, date: formatDate(today), required: true },
  { id: 'st-14', title: 'Read for 15 minutes', category: 'Reading', childId: 'carson', status: 'Approved', points: 5, date: formatDate(today), required: true },
  { id: 'st-15', title: 'Brush teeth', category: 'Personal Responsibility', childId: 'carson', status: 'Approved', points: 5, date: formatDate(today) },
  { id: 'st-16', title: 'Get dressed', category: 'Personal Responsibility', childId: 'carson', status: 'Approved', points: 5, date: formatDate(today) },
  { id: 'st-17', title: 'Empty trash', category: 'Home Responsibility', childId: 'carson', status: 'Rejected / Redo', points: 5, date: formatDate(today) },
  { id: 'st-18', title: 'Outside play 30 minutes', category: 'Outdoor / Physical Activity', childId: 'carson', status: 'Approved', points: 5, date: formatDate(today) },
];

// Reward unlock center
export const unlockRewards: UnlockReward[] = [
  { id: 'ur-1', title: 'Game Time', description: '30 min of video games', childId: 'alex', state: 'In Progress', requiredTasks: 4, completedTasks: 3, dailyLimit: 2, usedToday: 0 },
  { id: 'ur-2', title: 'Tablet/Electronics Time', childId: 'alex', state: 'Needs Parent Approval', requiredTasks: 4, completedTasks: 4, dailyLimit: 1, usedToday: 0 },
  { id: 'ur-3', title: 'Go Outside', childId: 'alex', state: 'Unlocked', requiredTasks: 2, completedTasks: 2 },
  { id: 'ur-4', title: 'Game Time', childId: 'jaxon', state: 'Locked', requiredTasks: 4, completedTasks: 1, dailyLimit: 2, usedToday: 0 },
  { id: 'ur-5', title: 'Inflatable Time', childId: 'jaxon', state: 'In Progress', requiredTasks: 3, completedTasks: 2 },
  { id: 'ur-6', title: 'TV/Movie Time', childId: 'jaxon', state: 'Used Today', requiredTasks: 2, completedTasks: 2, dailyLimit: 1, usedToday: 1 },
  { id: 'ur-7', title: 'Special Snack', childId: 'carson', state: 'Unlocked', requiredTasks: 2, completedTasks: 2 },
  { id: 'ur-8', title: 'Tablet/Electronics Time', childId: 'carson', state: 'Locked', requiredTasks: 4, completedTasks: 1 },
  { id: 'ur-9', title: 'Stay Up 15 Minutes Later', childId: 'carson', state: 'Daily Limit Reached', requiredTasks: 3, completedTasks: 3, dailyLimit: 1, usedToday: 1 },
];

// Grounding log
export const groundings: Grounding[] = [
  {
    id: 'gr-1',
    childId: 'jaxon',
    startDate: formatDate(addDays(today, -2)),
    endDate: formatDate(addDays(today, 2)),
    reason: 'Did not listen and threw toys',
    allowanceEligible: false,
    electronicsAllowed: false,
    rewardsAllowed: false,
    earnBackAvailable: true,
    status: 'Earn Back Available',
  },
];

export const earnBackTasks: EarnBackTask[] = [
  { id: 'eb-1', groundingId: 'gr-1', childId: 'jaxon', title: 'Apologize to brother', completed: true },
  { id: 'eb-2', groundingId: 'gr-1', childId: 'jaxon', title: 'Clean up the playroom', completed: true },
  { id: 'eb-3', groundingId: 'gr-1', childId: 'jaxon', title: 'Two days of no warnings', completed: true },
  { id: 'eb-4', groundingId: 'gr-1', childId: 'jaxon', title: 'Help with dishes', completed: false },
  { id: 'eb-5', groundingId: 'gr-1', childId: 'jaxon', title: 'Write a "what I learned" note', completed: false },
];

// Parent approval queue
export const approvalQueue: ApprovalItem[] = [
  { id: 'aq-1', childId: 'alex', type: 'Summer Task', title: 'Math sheet', detail: 'Completed all 20 problems', submittedAt: formatDate(today), submittedTime: '9:15 AM', status: 'Pending' },
  { id: 'aq-2', childId: 'alex', type: 'Reward', title: 'Tablet/Electronics Time', detail: 'Requesting unlock', submittedAt: formatDate(today), submittedTime: '10:02 AM', status: 'Pending' },
  { id: 'aq-3', childId: 'jaxon', type: 'Summer Task', title: 'Read for 15 minutes', detail: 'Read a chapter book', submittedAt: formatDate(today), submittedTime: '8:40 AM', status: 'Pending' },
  { id: 'aq-4', childId: 'jaxon', type: 'Earn Back', title: 'Earn back review', detail: '3 of 5 restore tasks complete', submittedAt: formatDate(today), submittedTime: '11:20 AM', status: 'Pending' },
  { id: 'aq-5', childId: 'carson', type: 'Wishlist', title: 'Dinosaur fruit snacks', detail: 'Requested at the store', submittedAt: formatDate(addDays(today, -1)), submittedTime: '4:30 PM', status: 'Pending' },
];

// Grocery list
export const groceryItems: GroceryItem[] = [
  { id: 'g-1', item: 'Milk', category: 'Dairy', quantity: '2 gal', neededBy: formatDate(addDays(today, 1)), addedBy: 'Mom', priority: 'High', purchased: false },
  { id: 'g-2', item: 'Eggs', category: 'Dairy', quantity: '1 dozen', addedBy: 'Mom', priority: 'Medium', purchased: false },
  { id: 'g-3', item: 'Bananas', category: 'Produce', quantity: '1 bunch', addedBy: 'Dad', priority: 'Low', purchased: true },
  { id: 'g-4', item: 'Chicken breast', category: 'Meat', quantity: '3 lb', neededBy: formatDate(addDays(today, 2)), addedBy: 'Mom', priority: 'High', purchased: false, notes: 'For taco night' },
  { id: 'g-5', item: 'Bread', category: 'Bakery', quantity: '2 loaves', addedBy: 'Dad', priority: 'Medium', purchased: false },
  { id: 'g-6', item: 'Apple juice', category: 'Beverages', quantity: '2', addedBy: 'Alex', priority: 'Low', purchased: false },
];

// Grocery wishlist
export const wishlistItems: WishlistItem[] = [
  { id: 'w-1', item: 'Cookie dough ice cream', requestedBy: 'Alex', category: 'Frozen', reason: 'Treat for good grades', approved: false, addedToList: false },
  { id: 'w-2', item: 'Dinosaur fruit snacks', requestedBy: 'Carson', category: 'Snacks', reason: 'Saw at the store', approved: true, addedToList: false },
  { id: 'w-3', item: 'Sparkling water', requestedBy: 'Mom', category: 'Beverages', approved: true, addedToList: true },
  { id: 'w-4', item: 'Hot wings', requestedBy: 'Dad', category: 'Frozen', reason: 'Game day', approved: false, addedToList: false },
];

// Meal ideas
export const mealIdeas: MealIdea[] = [
  { id: 'm-1', name: 'Taco Night', category: 'Dinner', protein: 'Chicken', kidFriendly: true, quickMeal: true, ingredients: ['Tortillas', 'Chicken', 'Cheese', 'Lettuce', 'Salsa'], rating: 5, lastMade: formatDate(addDays(today, -7)) },
  { id: 'm-2', name: 'Spaghetti & Meatballs', category: 'Dinner', protein: 'Beef', kidFriendly: true, quickMeal: false, ingredients: ['Pasta', 'Ground beef', 'Marinara', 'Parmesan'], rating: 5, lastMade: formatDate(addDays(today, -4)) },
  { id: 'm-3', name: 'Sheet Pan Salmon', category: 'Dinner', protein: 'Salmon', kidFriendly: false, quickMeal: true, ingredients: ['Salmon', 'Broccoli', 'Olive oil', 'Lemon'], rating: 4 },
  { id: 'm-4', name: 'Breakfast for Dinner', category: 'Dinner', protein: 'Eggs', kidFriendly: true, quickMeal: true, ingredients: ['Eggs', 'Bacon', 'Pancake mix', 'Syrup'], rating: 5, lastMade: formatDate(addDays(today, -10)) },
  { id: 'm-5', name: 'Homemade Pizza', category: 'Dinner', protein: 'Pepperoni', kidFriendly: true, quickMeal: false, ingredients: ['Dough', 'Sauce', 'Mozzarella', 'Pepperoni'], rating: 5 },
];

// Weekly meal plan
const weekOf = (() => {
  const d = new Date(today);
  d.setDate(d.getDate() - d.getDay());
  return formatDate(d);
})();

export const mealPlan: MealPlanDay[] = [
  { id: 'mp-1', weekOf, day: 'Monday', breakfast: 'Oatmeal', lunch: 'PB&J', dinner: 'Taco Night', snack: 'Apples', helper: 'Alex', groceryNeeded: ['Tortillas', 'Chicken'] },
  { id: 'mp-2', weekOf, day: 'Tuesday', breakfast: 'Cereal', lunch: 'Leftovers', dinner: 'Spaghetti & Meatballs', snack: 'Yogurt', helper: 'Jaxon', groceryNeeded: ['Pasta', 'Ground beef'] },
  { id: 'mp-3', weekOf, day: 'Wednesday', breakfast: 'Pancakes', lunch: 'Turkey wraps', dinner: 'Sheet Pan Salmon', snack: 'Crackers', helper: 'Mom' },
  { id: 'mp-4', weekOf, day: 'Thursday', breakfast: 'Eggs', lunch: 'Mac & cheese', dinner: 'Homemade Pizza', snack: 'Fruit', helper: 'Carson', groceryNeeded: ['Dough', 'Mozzarella'] },
  { id: 'mp-5', weekOf, day: 'Friday', breakfast: 'Toast', lunch: 'Quesadillas', dinner: 'Breakfast for Dinner', snack: 'Popcorn', helper: 'Dad' },
  { id: 'mp-6', weekOf, day: 'Saturday', breakfast: 'Waffles', lunch: 'Hot dogs', dinner: 'Grill out', snack: 'Chips', helper: 'Alex' },
  { id: 'mp-7', weekOf, day: 'Sunday', breakfast: 'Cinnamon rolls', lunch: 'Sandwiches', dinner: 'Roast chicken', snack: 'Veggies & dip', helper: 'Mom' },
];

// Pantry & staples
export const pantryItems: PantryItem[] = [
  { id: 'p-1', item: 'Flour', category: 'Baking', haveIt: true, quantity: '1 bag', lowStock: false, lastChecked: formatDate(addDays(today, -3)) },
  { id: 'p-2', item: 'Sugar', category: 'Baking', haveIt: true, quantity: 'Half bag', lowStock: true, lastChecked: formatDate(addDays(today, -3)) },
  { id: 'p-3', item: 'Pasta', category: 'Dry Goods', haveIt: true, quantity: '4 boxes', lowStock: false, lastChecked: formatDate(addDays(today, -1)) },
  { id: 'p-4', item: 'Olive oil', category: 'Oils', haveIt: false, quantity: 'Empty', lowStock: true, lastChecked: formatDate(today) },
  { id: 'p-5', item: 'Cereal', category: 'Breakfast', haveIt: true, quantity: '2 boxes', lowStock: false, lastChecked: formatDate(addDays(today, -2)) },
  { id: 'p-6', item: 'Peanut butter', category: 'Spreads', haveIt: true, quantity: 'Almost out', lowStock: true, lastChecked: formatDate(addDays(today, -1)) },
  { id: 'p-7', item: 'Canned beans', category: 'Canned', haveIt: true, quantity: '6 cans', lowStock: false, lastChecked: formatDate(addDays(today, -5)) },
];

// Google accounts
export const googleAccounts: GoogleAccount[] = [
  { id: 'ga-mom', name: 'Mom', role: 'Parent', gmail: 'mom@gmail.com', calendarId: 'mom@group.calendar.google.com', connected: false, syncEnabled: false },
  { id: 'ga-dad', name: 'Dad', role: 'Parent', gmail: 'dad@gmail.com', calendarId: 'dad@group.calendar.google.com', connected: false, syncEnabled: false },
  { id: 'ga-alex', name: 'Alex', role: 'Child', gmail: 'alex@gmail.com', calendarId: '', connected: false, syncEnabled: false },
  { id: 'ga-jaxon', name: 'Jaxon', role: 'Child', gmail: 'jaxon@gmail.com', calendarId: '', connected: false, syncEnabled: false },
  { id: 'ga-carson', name: 'Carson', role: 'Child', gmail: 'carson@gmail.com', calendarId: '', connected: false, syncEnabled: false },
  { id: 'ga-family', name: 'Shared Family Calendar', role: 'Shared', gmail: 'theveny.family@gmail.com', calendarId: 'family@group.calendar.google.com', connected: false, syncEnabled: false },
];

// Data connection settings
export const dataConnectionSettings: DataConnectionSettings = {
  webAppUrl: '',
  apiToken: '',
  sheetId: '',
  connected: false,
};

export const expectedSheetTabs: string[] = [
  'START HERE', '00 Dashboard', '01 Weekly View', '02 Calendar', '03 Summer Dashboard',
  '04 Family Hub', '05 Google Accounts', '06 Shared Family Calendar', '07 Mom Calendar',
  '08 Dad Calendar', '10 Kids', '11 Parents', '20 Chore Setup', '21 Chore Log', '30 Behavior',
  '40 Grades', '50 Allowance', '60 Rewards', '61 Reward Log', '70 Summer Tasks',
  '71 Summer Task Log', '72 Reward Unlock Rules', '73 Grounding Log', '74 Quiet Time Blocks',
  '75 Parent Approval Queue', '76 Summer Schedule Templates', '80 Settings', '90 Lists',
  '95 API Map', '100 Grocery List', '101 Grocery Wishlist', '102 Meal Ideas', '103 Meal Plan',
  '104 Pantry Staples',
];

// ---------- Helper accessors for new data ----------

export function getSummerTasksForChild(childId: string) {
  return summerTasks.filter(t => t.childId === childId);
}

export function getSummerCategories() {
  return summerCategories;
}

export function getUnlockRewardsForChild(childId: string) {
  return unlockRewards.filter(r => r.childId === childId);
}

export function getActiveGroundingForChild(childId: string) {
  return groundings.find(g => g.childId === childId && g.status !== 'Resolved');
}

export function isChildGrounded(childId: string) {
  return !!getActiveGroundingForChild(childId);
}

export function getEarnBackForGrounding(groundingId: string) {
  return earnBackTasks.filter(t => t.groundingId === groundingId);
}

export function getPendingApprovals() {
  return approvalQueue.filter(a => a.status === 'Pending');
}

export function getParentEvents(parentId: string) {
  return parentEvents.filter(e => e.parentId === parentId);
}

export function getRemindersForParent(parentId: string) {
  return parentReminders.filter(r => r.parentId === parentId);
}

export function getMealForToday() {
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  return mealPlan.find(m => m.day === dayName);
}

export function getSummerProgressForChild(childId: string) {
  const tasks = getSummerTasksForChild(childId);
  const approved = tasks.filter(t => t.status === 'Approved').length;
  return { approved, total: tasks.length, percent: tasks.length ? Math.round((approved / tasks.length) * 100) : 0 };
}

// ---------------------------------------------------------------------------
// MOM WORK MODE
// ---------------------------------------------------------------------------

export const momWorkStatus: WorkStatus = {
  mode: 'Do Not Interrupt',
  until: '1:00 PM',
  note: 'On a client call - emergencies only',
};

export const momWorkRules: string[] = [
  'Use your inside voice',
  'Do not interrupt during calls unless it is an emergency',
  'Complete your independent tasks first',
  'Add non-urgent questions to Ask Mom Later',
];

export const askMomLater: AskMomLaterItem[] = [
  { id: 'aml-1', childId: 'alex', question: 'Can I have a friend over this weekend?', createdAt: formatDate(today), answered: false },
  { id: 'aml-2', childId: 'jaxon', question: 'Where are my soccer cleats?', createdAt: formatDate(today), answered: false },
  { id: 'aml-3', childId: 'carson', question: 'Can we get ice cream after dinner?', createdAt: formatDate(today), answered: false },
];

export function getAskMomLater() {
  return askMomLater.filter(q => !q.answered);
}

// ---------------------------------------------------------------------------
// REWARD UNLOCK PATH (per child, the reward currently being worked toward)
// ---------------------------------------------------------------------------

const unlockStateRank: Record<string, number> = {
  'In Progress': 0,
  'Needs Parent Approval': 1,
  Locked: 2,
  Unlocked: 3,
  'Used Today': 4,
  'Daily Limit Reached': 5,
};

export function getUnlockPathForChild(childId: string) {
  const rewards = getUnlockRewardsForChild(childId);
  if (rewards.length === 0) return null;
  // Surface the most "actionable" reward: in-progress / needs approval first.
  const sorted = [...rewards].sort(
    (a, b) => (unlockStateRank[a.state] ?? 9) - (unlockStateRank[b.state] ?? 9)
  );
  const focus = sorted[0];
  return {
    reward: focus,
    title: focus.title,
    state: focus.state,
    completedTasks: focus.completedTasks,
    requiredTasks: focus.requiredTasks,
    percent: focus.requiredTasks
      ? Math.round((focus.completedTasks / focus.requiredTasks) * 100)
      : 0,
  };
}

// Grounding allowance status label
export function getAllowanceStatusForChild(childId: string): 'Eligible' | 'Allowance Locked' | 'Parent Override' {
  const g = getActiveGroundingForChild(childId);
  if (!g) return 'Eligible';
  if (g.allowanceEligible) return 'Parent Override';
  return 'Allowance Locked';
}

