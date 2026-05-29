import type {
  Child,
  Parent,
  ChildId,
  Chore,
  BehaviorNote,
  CalendarEvent,
  Grade,
  AllowanceTransaction,
  Reward,
  RewardRedemption,
  SummerTask,
  RewardUnlock,
  Grounding,
  EarnBackPlan,
  ApprovalItem,
  GroceryItem,
  WishlistItem,
  MealIdea,
  MealPlan,
  PantryItem,
  GoogleAccount,
  ParentNote,
  AppSettings,
  QuickRequestPreset,
  ChatMessage,
} from './types';

// Helper to get dates relative to today
const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// ---------------- People ----------------
export const children: Child[] = [
  {
    id: 'alex',
    name: 'Alex',
    role: 'Child',
    color: 'alex',
    avatar: 'A',
    age: 12,
    birthday: '2014-05-07',
    grade: '6th Grade',
  },
  {
    id: 'jaxon',
    name: 'Jaxon',
    role: 'Child',
    color: 'jaxon',
    avatar: 'J',
    age: 8,
    birthday: '2017-11-22',
    grade: '2nd Grade',
  },
  {
    id: 'carson',
    name: 'Carson',
    role: 'Child',
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
    role: 'Parent',
    color: 'mom',
    avatar: 'M',
    permissions: [
      'settings',
      'kids',
      'tasks',
      'allowance',
      'meals',
      'groceries',
      'calendars',
      'rewards',
      'grounding',
      'approvals',
    ],
  },
  {
    id: 'dad',
    name: 'Dad',
    role: 'Parent',
    color: 'dad',
    avatar: 'D',
    permissions: [
      'dashboard',
      'calendars',
      'tasks-view',
      'rewards',
      'meals',
      'groceries',
      'notes',
    ],
  },
];

// ---------------- Chores ----------------
export const chores: Chore[] = [
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
    needsApproval: true,
    approvalStatus: 'pending',
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

// ---------------- Behavior ----------------
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

// ---------------- Calendar ----------------
export const calendarEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'Math Test',
    description: 'Chapter 5 test',
    date: formatDate(today),
    time: '10:00 AM',
    startTime: '10:00',
    endTime: '11:00',
    childId: 'alex',
    person: 'alex',
    calendar: 'shared',
    category: 'school',
    location: 'Lincoln Middle School',
  },
  {
    id: 'event-2',
    title: 'Soccer Practice',
    date: formatDate(today),
    time: '4:00 PM',
    startTime: '16:00',
    endTime: '17:30',
    childId: 'jaxon',
    person: 'jaxon',
    calendar: 'shared',
    category: 'sports',
    location: 'Community Field',
  },
  {
    id: 'event-3',
    title: 'Family Movie Night',
    description: 'Watching the new Marvel movie',
    date: formatDate(addDays(today, 1)),
    time: '7:00 PM',
    startTime: '19:00',
    allChildren: true,
    person: 'all',
    calendar: 'shared',
    category: 'family',
    location: 'Living Room',
  },
  {
    id: 'event-4',
    title: 'Dentist Appointment',
    date: formatDate(addDays(today, 2)),
    time: '2:30 PM',
    startTime: '14:30',
    childId: 'carson',
    person: 'carson',
    calendar: 'shared',
    category: 'appointment',
    location: 'Bright Smiles Dental',
  },
  {
    id: 'event-5',
    title: 'Work Call - Q3 Review',
    date: formatDate(today),
    time: '1:00 PM',
    startTime: '13:00',
    endTime: '14:00',
    person: 'mom',
    calendar: 'mom',
    category: 'work',
    notes: 'Quiet time block for kids',
  },
  {
    id: 'event-6',
    title: 'Gym',
    date: formatDate(today),
    time: '6:00 AM',
    startTime: '06:00',
    endTime: '07:00',
    person: 'dad',
    calendar: 'dad',
    category: 'other',
  },
  {
    id: 'event-7',
    title: 'Piano Lesson',
    date: formatDate(addDays(today, 2)),
    time: '5:00 PM',
    startTime: '17:00',
    childId: 'alex',
    person: 'alex',
    calendar: 'shared',
    category: 'other',
  },
  {
    id: 'event-8',
    title: 'Grocery Run',
    date: formatDate(addDays(today, 1)),
    time: '5:30 PM',
    person: 'mom',
    calendar: 'mom',
    category: 'reminder',
  },
  {
    id: 'event-9',
    title: 'Basketball Game',
    date: formatDate(addDays(today, 3)),
    time: '3:00 PM',
    childId: 'alex',
    person: 'alex',
    calendar: 'shared',
    category: 'sports',
  },
  {
    id: 'event-10',
    title: 'Dad Work Trip',
    date: formatDate(addDays(today, 4)),
    person: 'dad',
    calendar: 'dad',
    category: 'work',
    notes: 'Out of town overnight',
  },
];

// ---------------- Grades ----------------
export const grades: Grade[] = [
  { id: 'grade-1', childId: 'alex', subject: 'Math', grade: 92, letterGrade: 'A-', date: formatDate(addDays(today, -3)), assignment: 'Chapter 4 Test' },
  { id: 'grade-2', childId: 'alex', subject: 'English', grade: 88, letterGrade: 'B+', date: formatDate(addDays(today, -5)), assignment: 'Essay' },
  { id: 'grade-3', childId: 'alex', subject: 'Science', grade: 95, letterGrade: 'A', date: formatDate(addDays(today, -7)), assignment: 'Lab Report' },
  { id: 'grade-4', childId: 'jaxon', subject: 'Math', grade: 85, letterGrade: 'B', date: formatDate(addDays(today, -2)), assignment: 'Quiz' },
  { id: 'grade-5', childId: 'jaxon', subject: 'Reading', grade: 90, letterGrade: 'A-', date: formatDate(addDays(today, -4)), assignment: 'Book Report' },
  { id: 'grade-6', childId: 'jaxon', subject: 'Science', grade: 88, letterGrade: 'B+', date: formatDate(addDays(today, -6)) },
  { id: 'grade-7', childId: 'carson', subject: 'Math', grade: 82, letterGrade: 'B-', date: formatDate(addDays(today, -1)), assignment: 'Worksheet' },
  { id: 'grade-8', childId: 'carson', subject: 'Reading', grade: 95, letterGrade: 'A', date: formatDate(addDays(today, -3)) },
  { id: 'grade-9', childId: 'carson', subject: 'Art', grade: 100, letterGrade: 'A+', date: formatDate(addDays(today, -5)), assignment: 'Drawing Project' },
];

// ---------------- Allowance ----------------
export const allowanceTransactions: AllowanceTransaction[] = [
  { id: 'allowance-1', childId: 'alex', amount: 10, type: 'add', description: 'Weekly allowance', date: formatDate(addDays(today, -7)) },
  { id: 'allowance-2', childId: 'alex', amount: 5, type: 'chore', description: 'Mowed lawn', date: formatDate(addDays(today, -5)) },
  { id: 'allowance-3', childId: 'alex', amount: -8, type: 'reward', description: 'Redeemed: Extra Screen Time', date: formatDate(addDays(today, -3)) },
  { id: 'allowance-4', childId: 'jaxon', amount: 8, type: 'add', description: 'Weekly allowance', date: formatDate(addDays(today, -7)) },
  { id: 'allowance-5', childId: 'jaxon', amount: 3, type: 'chore', description: 'Fed dog all week', date: formatDate(addDays(today, -2)) },
  { id: 'allowance-6', childId: 'carson', amount: 5, type: 'add', description: 'Weekly allowance', date: formatDate(addDays(today, -7)) },
  { id: 'allowance-7', childId: 'carson', amount: 2, type: 'chore', description: 'Picked up toys', date: formatDate(addDays(today, -4)) },
  { id: 'allowance-8', childId: 'carson', amount: -5, type: 'reward', description: 'Redeemed: Ice Cream Trip', date: formatDate(addDays(today, -1)) },
];

// ---------------- Rewards ----------------
export const rewards: Reward[] = [
  { id: 'reward-1', title: 'Extra Screen Time', description: '30 minutes of extra screen time', cost: 8, available: true, category: 'screen' },
  { id: 'reward-2', title: 'Ice Cream Trip', description: 'Trip to the ice cream shop', cost: 5, available: true, category: 'snack' },
  { id: 'reward-3', title: 'Movie Night Pick', description: 'Choose the family movie', cost: 10, available: true, category: 'tv' },
  { id: 'reward-4', title: 'Stay Up Late', description: '15 minutes past bedtime', cost: 12, available: true, category: 'stayup' },
  { id: 'reward-5', title: 'Friend Time', description: 'Have a friend over', cost: 25, available: true, category: 'friend' },
  { id: 'reward-6', title: 'Game Time', description: '30 minutes of video games', cost: 8, available: true, category: 'game' },
  { id: 'reward-7', title: 'Pick Dinner', description: 'Choose tonight\'s dinner', cost: 15, available: true, category: 'dinner' },
  { id: 'reward-8', title: 'Inflatable Time', description: 'Time on the backyard inflatable', cost: 6, available: true, category: 'inflatable' },
];

export const rewardRedemptions: RewardRedemption[] = [
  { id: 'redemption-1', childId: 'alex', rewardId: 'reward-1', redeemedAt: formatDate(addDays(today, -3)), fulfilled: true },
  { id: 'redemption-2', childId: 'carson', rewardId: 'reward-2', redeemedAt: formatDate(addDays(today, -1)), fulfilled: false },
];

// ---------------- Summer Tasks ----------------
export const summerTasks: SummerTask[] = [
  { id: 'st-1', title: 'Handwriting Sheet', childId: 'alex', category: 'learning', status: 'approved', dueDate: formatDate(today), required: true, completedAt: formatDate(today) },
  { id: 'st-2', title: 'Math Sheet', childId: 'alex', category: 'learning', status: 'needs-check', dueDate: formatDate(today), required: true },
  { id: 'st-3', title: 'Read for 15 Minutes', childId: 'alex', category: 'reading', status: 'in-progress', dueDate: formatDate(today), required: true },
  { id: 'st-4', title: 'Clean Bedroom', childId: 'alex', category: 'home', status: 'not-started', dueDate: formatDate(today), required: true },
  { id: 'st-5', title: 'Journal Entry', childId: 'alex', category: 'creative', status: 'not-started', dueDate: formatDate(today), required: false },
  { id: 'st-6', title: 'Math Sheet', childId: 'jaxon', category: 'learning', status: 'approved', dueDate: formatDate(today), required: true, completedAt: formatDate(today) },
  { id: 'st-7', title: 'Read for 15 Minutes', childId: 'jaxon', category: 'reading', status: 'needs-check', dueDate: formatDate(today), required: true },
  { id: 'st-8', title: 'Make Bed', childId: 'jaxon', category: 'home', status: 'approved', dueDate: formatDate(today), required: true, completedAt: formatDate(today) },
  { id: 'st-9', title: 'Quiet Time Block', childId: 'jaxon', category: 'quiet', status: 'in-progress', dueDate: formatDate(today), required: true },
  { id: 'st-10', title: 'Outdoor Play', childId: 'jaxon', category: 'outdoor', status: 'not-started', dueDate: formatDate(today), required: false },
  { id: 'st-11', title: 'Get Dressed', childId: 'carson', category: 'personal', status: 'approved', dueDate: formatDate(today), required: true, completedAt: formatDate(today) },
  { id: 'st-12', title: 'Brush Teeth', childId: 'carson', category: 'personal', status: 'approved', dueDate: formatDate(today), required: true, completedAt: formatDate(today) },
  { id: 'st-13', title: 'Pick Up Toys', childId: 'carson', category: 'home', status: 'needs-check', dueDate: formatDate(today), required: true },
  { id: 'st-14', title: 'Use Respectful Words', childId: 'carson', category: 'behavior', status: 'in-progress', dueDate: formatDate(today), required: true },
  { id: 'st-15', title: 'Wipe Table', childId: 'carson', category: 'home', status: 'not-started', dueDate: formatDate(today), required: false },
];

export const summerTaskLibrary: { title: string; category: SummerTask['category'] }[] = [
  { title: 'Handwriting Sheet', category: 'learning' },
  { title: 'Math Sheet', category: 'learning' },
  { title: 'Science Sheet', category: 'learning' },
  { title: 'Social Studies Sheet', category: 'learning' },
  { title: 'Read for 15 Minutes', category: 'reading' },
  { title: 'Journal Entry', category: 'creative' },
  { title: 'Sweep Floor', category: 'home' },
  { title: 'Empty Trash', category: 'home' },
  { title: 'Clean Living Room', category: 'home' },
  { title: 'Clean Bedroom', category: 'home' },
  { title: 'Put Laundry Away', category: 'home' },
  { title: 'Make Bed', category: 'home' },
  { title: 'Brush Teeth', category: 'personal' },
  { title: 'Get Dressed', category: 'personal' },
  { title: 'Clean Up Dishes', category: 'home' },
  { title: 'Use Respectful Words', category: 'behavior' },
  { title: 'Do Not Interrupt Mom During Calls', category: 'behavior' },
  { title: 'Complete Quiet Time Block', category: 'quiet' },
  { title: 'Help a Sibling', category: 'behavior' },
  { title: 'Pick Up Toys', category: 'home' },
  { title: 'Wipe Table', category: 'home' },
];

// ---------------- Reward Unlocks ----------------
export const rewardUnlocks: RewardUnlock[] = [
  { id: 'ru-1', childId: 'alex', rewardCategory: 'tablet', label: 'Tablet Time', state: 'locked', requiredTasks: 4, completedTasks: 2, dailyLimitMinutes: 60, usedMinutes: 0 },
  { id: 'ru-2', childId: 'alex', rewardCategory: 'outside', label: 'Go Outside', state: 'unlocked', requiredTasks: 2, completedTasks: 2 },
  { id: 'ru-3', childId: 'alex', rewardCategory: 'game', label: 'Game Time', state: 'needs-approval', requiredTasks: 4, completedTasks: 4, dailyLimitMinutes: 45, usedMinutes: 0 },
  { id: 'ru-4', childId: 'jaxon', rewardCategory: 'tablet', label: 'Tablet Time', state: 'in-progress', requiredTasks: 4, completedTasks: 3, dailyLimitMinutes: 45, usedMinutes: 15 },
  { id: 'ru-5', childId: 'jaxon', rewardCategory: 'outside', label: 'Go Outside', state: 'unlocked', requiredTasks: 2, completedTasks: 2 },
  { id: 'ru-6', childId: 'jaxon', rewardCategory: 'tv', label: 'TV Time', state: 'used-today', requiredTasks: 3, completedTasks: 3, dailyLimitMinutes: 30, usedMinutes: 30 },
  { id: 'ru-7', childId: 'carson', rewardCategory: 'tablet', label: 'Tablet Time', state: 'locked', requiredTasks: 3, completedTasks: 1, dailyLimitMinutes: 30, usedMinutes: 0 },
  { id: 'ru-8', childId: 'carson', rewardCategory: 'inflatable', label: 'Inflatable Time', state: 'unlocked', requiredTasks: 2, completedTasks: 2 },
  { id: 'ru-9', childId: 'carson', rewardCategory: 'snack', label: 'Special Snack', state: 'in-progress', requiredTasks: 3, completedTasks: 2 },
];

// ---------------- Grounding ----------------
export const groundings: Grounding[] = [
  {
    id: 'ground-1',
    childId: 'alex',
    startDate: formatDate(addDays(today, -2)),
    endDate: formatDate(addDays(today, 3)),
    reason: 'Did not complete homework and was disrespectful',
    allowanceEligible: false,
    electronicsAllowed: false,
    rewardsAllowed: false,
    earnBackAvailable: true,
    parentNotes: 'Can earn back early with the restore plan.',
    status: 'active',
  },
  {
    id: 'ground-2',
    childId: 'jaxon',
    startDate: formatDate(addDays(today, -10)),
    endDate: formatDate(addDays(today, -5)),
    reason: 'Hitting during an argument',
    allowanceEligible: false,
    electronicsAllowed: false,
    rewardsAllowed: true,
    earnBackAvailable: false,
    status: 'completed',
  },
];

// ---------------- Earn Back ----------------
export const earnBackPlans: EarnBackPlan[] = [
  {
    id: 'eb-1',
    childId: 'alex',
    groundingId: 'ground-1',
    readyForReview: false,
    tasks: [
      { id: 'ebt-1', label: 'Complete all required learning tasks', type: 'learning', complete: true },
      { id: 'ebt-2', label: 'Complete required home tasks', type: 'home', complete: true },
      { id: 'ebt-3', label: 'Write a reflection / apology note', type: 'reflection', complete: true },
      { id: 'ebt-4', label: 'Successful quiet work block', type: 'quiet', complete: false },
      { id: 'ebt-5', label: 'Respectful behavior all day', type: 'behavior', complete: false },
    ],
  },
];

// ---------------- Approval Queue ----------------
export const approvalQueue: ApprovalItem[] = [
  { id: 'ap-1', type: 'chore', childId: 'alex', title: 'Clean Room', detail: 'Vacuumed and organized', submittedAt: formatDate(today), status: 'pending' },
  { id: 'ap-2', type: 'summer-task', childId: 'alex', title: 'Math Sheet', detail: 'Completed all 20 problems', submittedAt: formatDate(today), status: 'pending' },
  { id: 'ap-3', type: 'summer-task', childId: 'jaxon', title: 'Read for 15 Minutes', detail: 'Read 3 chapters', submittedAt: formatDate(today), status: 'pending' },
  { id: 'ap-4', type: 'summer-task', childId: 'carson', title: 'Pick Up Toys', submittedAt: formatDate(today), status: 'pending' },
  { id: 'ap-5', type: 'reward', childId: 'alex', title: 'Game Time', detail: 'Wants to redeem 45 min game time', submittedAt: formatDate(today), status: 'pending' },
  { id: 'ap-6', type: 'wishlist', childId: 'jaxon', title: 'Fruit Snacks', detail: 'Add to grocery list', submittedAt: formatDate(addDays(today, -1)), status: 'pending' },
];

// ---------------- Grocery ----------------
export const groceryItems: GroceryItem[] = [
  { id: 'gr-1', item: 'Bananas', category: 'produce', quantity: '1 bunch', addedBy: 'Mom', store: 'Kroger', priority: 'medium', purchased: false },
  { id: 'gr-2', item: 'Chicken Breast', category: 'meat', quantity: '2 lbs', neededBy: formatDate(addDays(today, 1)), addedBy: 'Mom', store: 'Kroger', priority: 'high', purchased: false },
  { id: 'gr-3', item: 'Milk', category: 'dairy', quantity: '1 gallon', addedBy: 'Dad', store: 'Kroger', priority: 'high', purchased: true },
  { id: 'gr-4', item: 'Frozen Pizza', category: 'frozen', quantity: '2', addedBy: 'Mom', store: 'Costco', priority: 'low', purchased: false },
  { id: 'gr-5', item: 'Goldfish Crackers', category: 'snacks', quantity: '1 box', addedBy: 'Jaxon', store: 'Kroger', priority: 'low', purchased: false, notes: 'For lunches' },
  { id: 'gr-6', item: 'Paper Towels', category: 'household', quantity: '1 pack', addedBy: 'Dad', store: 'Costco', priority: 'medium', purchased: false },
  { id: 'gr-7', item: 'Apples', category: 'produce', quantity: '6', addedBy: 'Mom', store: 'Kroger', priority: 'medium', purchased: true },
  { id: 'gr-8', item: 'Toothpaste', category: 'toiletries', quantity: '2', addedBy: 'Mom', store: 'Target', priority: 'low', purchased: false },
];

export const wishlistItems: WishlistItem[] = [
  { id: 'wl-1', item: 'Fruit Snacks', requestedBy: 'Jaxon', category: 'snacks', reason: 'For summer lunches', approved: false, addedToList: false },
  { id: 'wl-2', item: 'Chocolate Chip Cookies', requestedBy: 'Carson', category: 'snacks', reason: 'Treat', approved: false, addedToList: false },
  { id: 'wl-3', item: 'Gatorade', requestedBy: 'Alex', category: 'drinks', reason: 'For soccer', approved: true, addedToList: true },
  { id: 'wl-4', item: 'Sparkling Water', requestedBy: 'Dad', category: 'drinks', approved: true, addedToList: false },
];

// ---------------- Meals ----------------
export const mealIdeas: MealIdea[] = [
  { id: 'mi-1', name: 'Spaghetti & Meatballs', category: 'dinner', protein: 'Beef', kidFriendly: true, quick: false, ingredients: ['Pasta', 'Ground beef', 'Marinara', 'Parmesan'], rating: 5, lastMade: formatDate(addDays(today, -6)) },
  { id: 'mi-2', name: 'Chicken Tacos', category: 'dinner', protein: 'Chicken', kidFriendly: true, quick: true, ingredients: ['Chicken', 'Tortillas', 'Cheese', 'Lettuce', 'Salsa'], rating: 5, lastMade: formatDate(addDays(today, -3)) },
  { id: 'mi-3', name: 'Pancakes', category: 'breakfast', kidFriendly: true, quick: true, ingredients: ['Flour', 'Eggs', 'Milk', 'Syrup'], rating: 4, lastMade: formatDate(addDays(today, -1)) },
  { id: 'mi-4', name: 'Grilled Cheese & Tomato Soup', category: 'lunch', kidFriendly: true, quick: true, ingredients: ['Bread', 'Cheese', 'Tomato soup'], rating: 4 },
  { id: 'mi-5', name: 'Baked Salmon & Rice', category: 'dinner', protein: 'Salmon', kidFriendly: false, quick: false, ingredients: ['Salmon', 'Rice', 'Broccoli'], rating: 3 },
  { id: 'mi-6', name: 'Apple Slices & Peanut Butter', category: 'snack', kidFriendly: true, quick: true, ingredients: ['Apples', 'Peanut butter'], rating: 4 },
];

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const mealPlan: MealPlan = {
  weekOf: formatDate(today),
  days: [
    { day: 'Monday', breakfast: 'Pancakes', lunch: 'Grilled Cheese', dinner: 'Chicken Tacos', snack: 'Apple Slices', cook: 'Mom' },
    { day: 'Tuesday', breakfast: 'Cereal', lunch: 'PB&J', dinner: 'Spaghetti & Meatballs', snack: 'Goldfish', cook: 'Mom' },
    { day: 'Wednesday', breakfast: 'Eggs & Toast', lunch: 'Leftovers', dinner: 'Baked Salmon & Rice', snack: 'Yogurt', cook: 'Dad' },
    { day: 'Thursday', breakfast: 'Oatmeal', lunch: 'Grilled Cheese', dinner: 'Breakfast for Dinner', snack: 'Crackers', cook: 'Mom' },
    { day: 'Friday', breakfast: 'Pancakes', lunch: 'Mac & Cheese', dinner: 'Pizza Night', snack: 'Popcorn', cook: 'Family' },
    { day: 'Saturday', breakfast: 'Waffles', lunch: 'Hot Dogs', dinner: 'Tacos', snack: 'Fruit', cook: 'Dad' },
    { day: 'Sunday', breakfast: 'Donuts', lunch: 'Sandwiches', dinner: 'Roast Chicken', snack: 'Veggies', cook: 'Mom' },
  ],
};

// ---------------- Pantry ----------------
export const pantryItems: PantryItem[] = [
  { id: 'p-1', item: 'Flour', category: 'pantry', haveIt: true, quantity: '5 lbs', lowStock: false, lastChecked: formatDate(addDays(today, -2)) },
  { id: 'p-2', item: 'Sugar', category: 'pantry', haveIt: true, quantity: '2 lbs', lowStock: true, lastChecked: formatDate(addDays(today, -2)) },
  { id: 'p-3', item: 'Pasta', category: 'pantry', haveIt: true, quantity: '4 boxes', lowStock: false, lastChecked: formatDate(addDays(today, -5)) },
  { id: 'p-4', item: 'Peanut Butter', category: 'pantry', haveIt: false, quantity: '0', lowStock: true, lastChecked: formatDate(today) },
  { id: 'p-5', item: 'Olive Oil', category: 'pantry', haveIt: true, quantity: '1 bottle', lowStock: false },
  { id: 'p-6', item: 'Cereal', category: 'pantry', haveIt: true, quantity: '2 boxes', lowStock: true, lastChecked: formatDate(addDays(today, -1)) },
];

// ---------------- Google Accounts ----------------
export const googleAccounts: GoogleAccount[] = [
  { id: 'ga-mom', name: 'Mom', role: 'Parent', personId: 'mom', email: '', calendarId: '', connected: false, syncCalendar: true, syncTasks: true, syncTasksAvailable: true },
  { id: 'ga-dad', name: 'Dad', role: 'Parent', personId: 'dad', email: '', calendarId: '', connected: false, syncCalendar: true, syncTasks: false, syncTasksAvailable: true },
  { id: 'ga-alex', name: 'Alex', role: 'Child', personId: 'alex', email: '', calendarId: '', connected: false, syncCalendar: true, syncTasks: true, syncTasksAvailable: true },
  { id: 'ga-jaxon', name: 'Jaxon', role: 'Child', personId: 'jaxon', email: '', calendarId: '', connected: false, syncCalendar: true, syncTasks: false, syncTasksAvailable: false },
  { id: 'ga-carson', name: 'Carson', role: 'Child', personId: 'carson', email: '', calendarId: '', connected: false, syncCalendar: true, syncTasks: false, syncTasksAvailable: false },
  { id: 'ga-shared', name: 'Shared Family Calendar', role: 'Family', personId: 'shared', email: '', calendarId: '', connected: false, syncCalendar: true, syncTasks: false, syncTasksAvailable: false },
];

// ---------------- Parent Notes ----------------
export const parentNotes: ParentNote[] = [
  { id: 'pn-1', author: 'mom', text: 'Alex has a dentist follow-up next week, need to schedule.', createdAt: formatDate(today) },
  { id: 'pn-2', author: 'dad', text: 'Jaxon needs new soccer cleats before the season starts.', createdAt: formatDate(addDays(today, -1)) },
  { id: 'pn-3', author: 'mom', text: 'Quiet time is 1-2pm daily while I am on work calls.', createdAt: formatDate(addDays(today, -2)) },
];

// ---------------- Settings ----------------
export const appSettings: AppSettings = {
  webAppUrl: '',
  apiToken: '',
  sheetId: '',
  oauthClientId: '',
  connected: false,
  calendarApiStatus: 'not-configured',
};

export const expectedSheetTabs: string[] = [
  'START HERE',
  '00 Dashboard',
  '01 Weekly View',
  '02 Calendar',
  '03 Summer Dashboard',
  '04 Family Hub',
  '05 Google Accounts',
  '06 Shared Family Calendar',
  '07 Mom Calendar',
  '08 Dad Calendar',
  '10 Kids',
  '11 Parents',
  '20 Chore Setup',
  '21 Chore Log',
  '30 Behavior',
  '40 Grades',
  '50 Allowance',
  '60 Rewards',
  '61 Reward Log',
  '70 Summer Tasks',
  '71 Summer Task Log',
  '72 Reward Unlock Rules',
  '73 Grounding Log',
  '74 Quiet Time Blocks',
  '75 Parent Approval Queue',
  '76 Summer Schedule Templates',
  '80 Settings',
  '90 Lists',
  '95 API Map',
  '100 Grocery List',
  '101 Grocery Wishlist',
  '102 Meal Ideas',
  '103 Meal Plan',
  '104 Pantry Staples',
];

// ===================================================================
// Helper functions (used across components and pages)
// ===================================================================
export function getChildStats(childId: string) {
  const todayStr = formatDate(today);

  const childChores = chores.filter((c) => c.assignedTo === childId);
  const todayChores = childChores.filter((c) => c.dueDate === todayStr);
  const completedTodayChores = todayChores.filter((c) => c.completed);

  const childBehavior = behaviorNotes.filter((b) => b.childId === childId);
  const behaviorPoints = childBehavior.reduce((sum, b) => sum + b.points, 0);

  const childGrades = grades.filter((g) => g.childId === childId);
  const gradeAverage =
    childGrades.length > 0
      ? Math.round(childGrades.reduce((sum, g) => sum + g.grade, 0) / childGrades.length)
      : 0;

  const childTransactions = allowanceTransactions.filter((t) => t.childId === childId);
  const allowanceBalance = childTransactions.reduce((sum, t) => sum + t.amount, 0);

  const childRedemptions = rewardRedemptions.filter((r) => r.childId === childId);

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

export function getMonthDates(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const days: { date: string; dayNumber: number; isToday: boolean; inMonth: boolean }[] = [];

  // padding from previous month
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: formatDate(d), dayNumber: d.getDate(), isToday: formatDate(d) === formatDate(today), inMonth: false });
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: formatDate(d), dayNumber: i, isToday: formatDate(d) === formatDate(today), inMonth: true });
  }
  // trailing padding to fill 6 rows
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: formatDate(d), dayNumber: d.getDate(), isToday: formatDate(d) === formatDate(today), inMonth: false });
  }
  return days;
}

export function getEventsForDate(dateStr: string) {
  return calendarEvents.filter((e) => e.date === dateStr);
}

export function getEventsForCalendar(calendar: 'shared' | 'mom' | 'dad') {
  return calendarEvents.filter((e) => (e.calendar ?? 'shared') === calendar);
}

export function getChoresForChild(childId: string) {
  return chores.filter((c) => c.assignedTo === childId);
}

export function getTodayChoresForChild(childId: string) {
  const todayStr = formatDate(today);
  return chores.filter((c) => c.assignedTo === childId && c.dueDate === todayStr);
}

export function getBehaviorForChild(childId: string) {
  return behaviorNotes.filter((b) => b.childId === childId);
}

export function getGradesForChild(childId: string) {
  return grades.filter((g) => g.childId === childId);
}

export function getTransactionsForChild(childId: string) {
  return allowanceTransactions.filter((t) => t.childId === childId);
}

export function getEventsForChild(childId: string) {
  return calendarEvents.filter((e) => e.childId === childId || e.person === childId || e.allChildren || e.person === 'all');
}

export function getRedemptionsForChild(childId: string) {
  return rewardRedemptions.filter((r) => r.childId === childId);
}

export function getSummerTasksForChild(childId: string) {
  return summerTasks.filter((t) => t.childId === childId);
}

export function getRewardUnlocksForChild(childId: string) {
  return rewardUnlocks.filter((u) => u.childId === childId);
}

export function getActiveGroundingForChild(childId: string) {
  return groundings.find((g) => g.childId === childId && g.status === 'active');
}

export function getEarnBackForChild(childId: string) {
  return earnBackPlans.find((p) => p.childId === childId);
}

export function getAllowanceBalance(childId: string) {
  return allowanceTransactions
    .filter((t) => t.childId === childId)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getNextBirthday(birthday: string) {
  const bd = new Date(birthday);
  const now = new Date();
  const next = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
  if (next < now) {
    next.setFullYear(now.getFullYear() + 1);
  }
  const days = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return {
    date: next,
    daysUntil: days,
    label: next.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
  };
}

export function getChildById(id: ChildId) {
  return children.find((c) => c.id === id);
}

export function getParentById(id: 'mom' | 'dad') {
  return parents.find((p) => p.id === id);
}

// ---------------- Messages & Quick Requests ----------------
// Tappable requests the kids can send to a parent in one touch.
export const quickRequestPresets: QuickRequestPreset[] = [
  { kind: 'snack', label: 'Snack', message: 'Can I have a snack, please?', icon: 'cookie', color: 'carson' },
  { kind: 'juice', label: 'Juice', message: 'Can I have some juice, please?', icon: 'cup-soda', color: 'jaxon' },
  { kind: 'water', label: 'Water', message: 'Can I have some water, please?', icon: 'glass-water', color: 'alex' },
  { kind: 'hungry', label: "I'm hungry", message: "I'm hungry. When can we eat?", icon: 'utensils', color: 'carson' },
  { kind: 'game-time', label: 'Game time', message: 'Can I play video games?', icon: 'gamepad-2', color: 'alex' },
  { kind: 'tv-time', label: 'TV time', message: 'Can I watch TV?', icon: 'tv', color: 'jaxon' },
  { kind: 'tablet-time', label: 'Tablet', message: 'Can I use the tablet?', icon: 'tablet', color: 'mom' },
  { kind: 'outside', label: 'Go outside', message: 'Can I go play outside?', icon: 'tree-pine', color: 'jaxon' },
  { kind: 'friend', label: 'Friend over', message: 'Can a friend come over?', icon: 'user-round-plus', color: 'alex' },
  { kind: 'help', label: 'Need help', message: 'I need your help with something.', icon: 'hand', color: 'dad' },
  { kind: 'done', label: 'All done!', message: 'I finished my chores. Can you check?', icon: 'check-check', color: 'jaxon' },
  { kind: 'love', label: 'Love you', message: 'Love you!', icon: 'heart', color: 'mom' },
];

export function getQuickRequestPreset(kind: string) {
  return quickRequestPresets.find((p) => p.kind === kind);
}

const minutesAgo = (mins: number) => new Date(today.getTime() - mins * 60000).toISOString();

// Seed conversation history so the inbox is not empty on first load.
export const seedMessages: ChatMessage[] = [
  {
    id: 'm1',
    from: 'alex',
    to: 'mom',
    text: 'Can I have a snack, please?',
    createdAt: minutesAgo(38),
    read: true,
    kind: 'request',
    request: { kind: 'snack', status: 'approved' },
  },
  {
    id: 'm2',
    from: 'mom',
    to: 'alex',
    text: 'Yes! Grab some crackers, not candy.',
    createdAt: minutesAgo(36),
    read: true,
    kind: 'text',
  },
  {
    id: 'm3',
    from: 'jaxon',
    to: 'mom',
    text: 'Can I play video games?',
    createdAt: minutesAgo(14),
    read: false,
    kind: 'request',
    request: { kind: 'game-time', status: 'pending' },
  },
  {
    id: 'm4',
    from: 'carson',
    to: 'mom',
    text: 'Can I have some juice, please?',
    createdAt: minutesAgo(6),
    read: false,
    kind: 'request',
    request: { kind: 'juice', status: 'pending' },
  },
  {
    id: 'm5',
    from: 'dad',
    to: 'mom',
    text: "Running 15 min late picking up Jaxon — heads up!",
    createdAt: minutesAgo(3),
    read: false,
    kind: 'text',
  },
];
