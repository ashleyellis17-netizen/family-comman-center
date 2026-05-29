import type {
  Child,
  Chore,
  BehaviorNote,
  CalendarEvent,
  Grade,
  AllowanceTransaction,
  Reward,
  RewardRedemption,
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
  },
  {
    id: 'jaxon',
    name: 'Jaxon',
    color: 'jaxon',
    avatar: 'J',
    age: 10,
  },
  {
    id: 'carson',
    name: 'Carson',
    color: 'carson',
    avatar: 'C',
    age: 8,
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
