export type HabitColor = 'amber' | 'sage' | 'coral' | 'sky' | 'violet' | 'rose';

export interface HabitTemplate {
  id: string;
  title: string;
  icon: string;
  category: 'Health' | 'Mind' | 'Body' | 'Relationships' | 'Work';
  suggestion: string;
  smallVersion: string;
  defaultTime: string;
  defaultLocation: string;
  color: HabitColor;
}

export interface Habit {
  id: string;
  title: string;
  action: string;
  icon: string;
  color: HabitColor;
  timeOfDay: string;
  location: string;
  createdAt: string;
  archived: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  skipped: boolean;
  completedAt: string;
}

export interface AppState {
  onboardingComplete: boolean;
  identityStatement: string;
  habits: Habit[];
  habitLogs: HabitLog[];
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  { id: '1', title: 'Drink water', icon: '💧', category: 'Health', suggestion: 'Drink a glass of water', smallVersion: 'Fill a glass of water', defaultTime: '07:00', defaultLocation: 'in the kitchen', color: 'sky' },
  { id: '2', title: 'Meditate', icon: '🧘', category: 'Mind', suggestion: 'Meditate for 10 minutes', smallVersion: 'Sit and take 3 deep breaths', defaultTime: '06:30', defaultLocation: 'in my bedroom', color: 'violet' },
  { id: '3', title: 'Read', icon: '📖', category: 'Mind', suggestion: 'Read for 20 minutes', smallVersion: 'Read one page', defaultTime: '21:00', defaultLocation: 'in bed', color: 'sage' },
  { id: '4', title: 'Exercise', icon: '🏃', category: 'Body', suggestion: 'Work out for 30 minutes', smallVersion: 'Put on workout clothes', defaultTime: '07:00', defaultLocation: 'at the gym', color: 'coral' },
  { id: '5', title: 'Journal', icon: '✍️', category: 'Mind', suggestion: 'Write in my journal', smallVersion: 'Write one sentence', defaultTime: '21:30', defaultLocation: 'at my desk', color: 'amber' },
  { id: '6', title: 'Walk', icon: '🚶', category: 'Body', suggestion: 'Go for a 20-minute walk', smallVersion: 'Step outside for 2 minutes', defaultTime: '12:00', defaultLocation: 'around the block', color: 'sage' },
  { id: '7', title: 'Stretch', icon: '🤸', category: 'Body', suggestion: 'Stretch for 10 minutes', smallVersion: 'Do one stretch', defaultTime: '07:15', defaultLocation: 'in my living room', color: 'rose' },
  { id: '8', title: 'Call someone', icon: '📞', category: 'Relationships', suggestion: 'Call a friend or family member', smallVersion: 'Send a quick text', defaultTime: '18:00', defaultLocation: 'at home', color: 'coral' },
  { id: '9', title: 'Deep work', icon: '🎯', category: 'Work', suggestion: 'Do 1 hour of focused work', smallVersion: 'Work for 2 minutes with no distractions', defaultTime: '09:00', defaultLocation: 'at my desk', color: 'sky' },
  { id: '10', title: 'Eat vegetables', icon: '🥗', category: 'Health', suggestion: 'Eat a serving of vegetables', smallVersion: 'Put one vegetable on my plate', defaultTime: '12:30', defaultLocation: 'at lunch', color: 'sage' },
];

export const HABIT_CATEGORIES = ['Health', 'Mind', 'Body', 'Relationships', 'Work'] as const;

export const HABIT_COLOR_MAP: Record<HabitColor, string> = {
  amber: 'var(--habit-amber)',
  sage: 'var(--habit-sage)',
  coral: 'var(--habit-coral)',
  sky: 'var(--habit-sky)',
  violet: 'var(--habit-violet)',
  rose: 'var(--habit-rose)',
};

const STORAGE_KEY = 'atoms-app-state';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    onboardingComplete: false,
    identityStatement: '',
    habits: [],
    habitLogs: [],
  };
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getStreak(habitId: string, logs: HabitLog[]): number {
  const habitLogs = logs
    .filter(l => l.habitId === habitId && (l.completed || l.skipped))
    .map(l => l.date)
    .sort()
    .reverse();

  if (habitLogs.length === 0) return 0;

  let streak = 0;
  const today = getToday();
  let checkDate = new Date(today);

  // If today is not logged, start from yesterday
  if (!habitLogs.includes(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (habitLogs.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
