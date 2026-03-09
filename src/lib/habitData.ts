export type HabitColor = 'coral' | 'sage' | 'sky' | 'amber' | 'violet' | 'rose' | 'teal' | 'slate';

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
  why: string;
}

export interface Habit {
  id: string;
  title: string;
  action: string;
  icon: string;
  color: HabitColor;
  timeOfDay: string;
  location: string;
  why?: string;
  createdAt: string;
  archived: boolean;
  smartReminderEnabled?: boolean;
  reminderTime?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  skipped: boolean;
  completedAt: string;
}

export interface MilestoneCelebration {
  habitId: string;
  milestone: number;
}

export interface AppState {
  onboardingComplete: boolean;
  identityStatement: string;
  soundEnabled: boolean;
  habits: Habit[];
  habitLogs: HabitLog[];
  milestoneCelebrations: MilestoneCelebration[];
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: '1',
    title: 'Drink water',
    icon: '💧',
    category: 'Health',
    suggestion: 'Drink a glass of water',
    smallVersion: 'Fill a glass of water',
    defaultTime: '07:00',
    defaultLocation: 'in the kitchen',
    color: 'sky',
    why: 'someone who takes care of their body',
  },
  {
    id: '2',
    title: 'Meditate',
    icon: '🧘',
    category: 'Mind',
    suggestion: 'Meditate for 10 minutes',
    smallVersion: 'Sit and take 3 deep breaths',
    defaultTime: '06:30',
    defaultLocation: 'in my bedroom',
    color: 'violet',
    why: 'someone who is calm and present',
  },
  {
    id: '3',
    title: 'Read',
    icon: '📖',
    category: 'Mind',
    suggestion: 'Read for 20 minutes',
    smallVersion: 'Read one page',
    defaultTime: '21:00',
    defaultLocation: 'in bed',
    color: 'sage',
    why: 'someone who never stops learning',
  },
  {
    id: '4',
    title: 'Exercise',
    icon: '🏃',
    category: 'Body',
    suggestion: 'Work out for 30 minutes',
    smallVersion: 'Put on workout clothes',
    defaultTime: '07:00',
    defaultLocation: 'at the gym',
    color: 'coral',
    why: 'a healthy person',
  },
  {
    id: '5',
    title: 'Journal',
    icon: '✍️',
    category: 'Mind',
    suggestion: 'Write in my journal',
    smallVersion: 'Write one sentence',
    defaultTime: '21:30',
    defaultLocation: 'at my desk',
    color: 'amber',
    why: 'someone who knows themselves',
  },
  {
    id: '6',
    title: 'Walk',
    icon: '🚶',
    category: 'Body',
    suggestion: 'Go for a 20-minute walk',
    smallVersion: 'Step outside for 2 minutes',
    defaultTime: '12:00',
    defaultLocation: 'around the block',
    color: 'sage',
    why: 'someone who moves through the world slowly',
  },
  {
    id: '7',
    title: 'Stretch',
    icon: '🤸',
    category: 'Body',
    suggestion: 'Stretch for 10 minutes',
    smallVersion: 'Do one stretch',
    defaultTime: '07:15',
    defaultLocation: 'in my living room',
    color: 'rose',
    why: 'someone who lives in their body',
  },
  {
    id: '8',
    title: 'Call someone',
    icon: '📞',
    category: 'Relationships',
    suggestion: 'Call a friend or family member',
    smallVersion: 'Send a quick text',
    defaultTime: '18:00',
    defaultLocation: 'at home',
    color: 'coral',
    why: 'someone who invests in relationships',
  },
  {
    id: '9',
    title: 'Deep work',
    icon: '🎯',
    category: 'Work',
    suggestion: 'Do 1 hour of focused work',
    smallVersion: 'Work for 2 minutes with no distractions',
    defaultTime: '09:00',
    defaultLocation: 'at my desk',
    color: 'sky',
    why: 'someone who does meaningful work',
  },
  {
    id: '10',
    title: 'Eat vegetables',
    icon: '🥗',
    category: 'Health',
    suggestion: 'Eat a serving of vegetables',
    smallVersion: 'Put one vegetable on my plate',
    defaultTime: '12:30',
    defaultLocation: 'at lunch',
    color: 'sage',
    why: 'someone who fuels themselves well',
  },
  {
    id: '11',
    title: 'Sleep on time',
    icon: '🛏️',
    category: 'Health',
    suggestion: 'Go to bed at a consistent hour',
    smallVersion: 'Get in bed at my target time',
    defaultTime: '22:30',
    defaultLocation: 'in my bedroom',
    color: 'slate',
    why: 'someone who protects their energy',
  },
  {
    id: '12',
    title: 'Gratitude note',
    icon: '🙏',
    category: 'Mind',
    suggestion: 'Write three things I’m grateful for',
    smallVersion: 'Write one thing I’m grateful for',
    defaultTime: '21:00',
    defaultLocation: 'at my desk',
    color: 'rose',
    why: 'someone who notices the good',
  },
  {
    id: '13',
    title: 'Send a check‑in',
    icon: '💬',
    category: 'Relationships',
    suggestion: 'Reach out to someone I care about',
    smallVersion: 'Send one “how are you?” message',
    defaultTime: '19:30',
    defaultLocation: 'on my phone',
    color: 'violet',
    why: 'someone who shows up for people',
  },
  {
    id: '14',
    title: 'Plan tomorrow',
    icon: '🗓️',
    category: 'Work',
    suggestion: 'Plan my top tasks for tomorrow',
    smallVersion: 'Write one must‑do for tomorrow',
    defaultTime: '20:30',
    defaultLocation: 'at my desk',
    color: 'amber',
    why: 'someone who works with intention',
  },
];

export const HABIT_CATEGORIES = ['Health', 'Mind', 'Body', 'Relationships', 'Work'] as const;

export const HABIT_COLOR_MAP: Record<HabitColor, string> = {
  amber: 'var(--habit-amber)',
  sage: 'var(--habit-sage)',
  coral: 'var(--habit-coral)',
  sky: 'var(--habit-sky)',
  violet: 'var(--habit-violet)',
  rose: 'var(--habit-rose)',
  teal: 'var(--habit-teal)',
  slate: 'var(--habit-slate)',
};

const STORAGE_KEY = 'atoms-app-state';

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      return {
        onboardingComplete: parsed.onboardingComplete ?? false,
        identityStatement: parsed.identityStatement ?? '',
        soundEnabled: parsed.soundEnabled ?? true,
        habits: (parsed.habits ?? []).map(habit => ({
          ...habit,
          smartReminderEnabled: habit.smartReminderEnabled ?? false,
          reminderTime: habit.reminderTime ?? habit.timeOfDay ?? '09:00',
          why: habit.why ?? '',
        })),
        habitLogs: parsed.habitLogs ?? [],
        milestoneCelebrations: parsed.milestoneCelebrations ?? [],
      };
    }
  } catch {
    // ignore malformed storage
  }
  return {
    onboardingComplete: false,
    identityStatement: '',
    soundEnabled: true,
    habits: [],
    habitLogs: [],
    milestoneCelebrations: [],
  };
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Returns today's date in local time as yyyy-MM-dd (for consistent comparisons). */
export function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Formats a Date as local yyyy-MM-dd. */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
  const [y, m, d] = today.split('-').map(Number);
  const checkDate = new Date(y, m - 1, d);

  // If today is not logged, start from yesterday
  if (!habitLogs.includes(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = toLocalDateString(checkDate);
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
