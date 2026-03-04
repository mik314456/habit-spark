import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AppState, Habit, HabitLog, loadState, saveState, getToday, generateId, MilestoneCelebration } from '@/lib/habitData';

interface AppContextType {
  state: AppState;
  completeOnboarding: (identity: string) => void;
  updateIdentityStatement: (identity: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
  updateHabit: (habitId: string, updates: Partial<Habit>) => void;
  toggleHabitCompletion: (habitId: string) => void;
  skipHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  isHabitCompletedToday: (habitId: string) => boolean;
  isHabitSkippedToday: (habitId: string) => boolean;
  getHabitStreak: (habitId: string) => number;
  markMilestoneCelebrated: (habitId: string, milestone: number) => void;
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  const reminderSentRef = React.useRef<Record<string, string>>({});
  const dontMissTwiceSentRef = React.useRef<Record<string, string>>({});
  const notificationPermissionRequestedRef = React.useRef(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const completeOnboarding = useCallback((identity: string) => {
    setState(prev => ({ ...prev, onboardingComplete: true, identityStatement: identity }));
  }, []);

  const updateIdentityStatement = useCallback((identity: string) => {
    setState(prev => ({ ...prev, identityStatement: identity }));
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, soundEnabled: enabled }));
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdAt: new Date().toISOString(),
      archived: false,
      smartReminderEnabled: habit.smartReminderEnabled ?? false,
      reminderTime: habit.reminderTime ?? habit.timeOfDay,
    };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  }, []);

  const updateHabit = useCallback((habitId: string, updates: Partial<Habit>) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => (h.id === habitId ? { ...h, ...updates } : h)),
    }));
  }, []);

  const toggleHabitCompletion = useCallback((habitId: string) => {
    const today = getToday();
    setState(prev => {
      const existingLog = prev.habitLogs.find(l => l.habitId === habitId && l.date === today && l.completed);
      if (existingLog) {
        return { ...prev, habitLogs: prev.habitLogs.filter(l => l.id !== existingLog.id) };
      }
      // Remove any skip log for today first
      const filtered = prev.habitLogs.filter(l => !(l.habitId === habitId && l.date === today));
      const newLog: HabitLog = {
        id: generateId(),
        habitId,
        date: today,
        completed: true,
        skipped: false,
        completedAt: new Date().toISOString(),
      };
      return { ...prev, habitLogs: [...filtered, newLog] };
    });
  }, []);

  const skipHabit = useCallback((habitId: string) => {
    const today = getToday();
    setState(prev => {
      const filtered = prev.habitLogs.filter(l => !(l.habitId === habitId && l.date === today));
      const newLog: HabitLog = {
        id: generateId(),
        habitId,
        date: today,
        completed: false,
        skipped: true,
        completedAt: new Date().toISOString(),
      };
      return { ...prev, habitLogs: [...filtered, newLog] };
    });
  }, []);

  const deleteHabit = useCallback((habitId: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === habitId ? { ...h, archived: true } : h),
    }));
  }, []);

  const isHabitCompletedToday = useCallback((habitId: string) => {
    const today = getToday();
    return state.habitLogs.some(l => l.habitId === habitId && l.date === today && l.completed);
  }, [state.habitLogs]);

  const isHabitSkippedToday = useCallback((habitId: string) => {
    const today = getToday();
    return state.habitLogs.some(l => l.habitId === habitId && l.date === today && l.skipped);
  }, [state.habitLogs]);

  const getHabitStreak = useCallback((habitId: string) => {
    const relevantLogs = state.habitLogs
      .filter(l => l.habitId === habitId && (l.completed || l.skipped))
      .map(l => l.date)
      .sort();

    if (relevantLogs.length === 0) return 0;

    const today = getToday();
    const completedDates = new Set(
      state.habitLogs
        .filter(l => l.habitId === habitId && l.completed)
        .map(l => l.date),
    );

    let streak = 0;
    let graceUsed = false;

    const cursor = new Date(today + 'T12:00:00');

    // If today is not logged at all, treat it as a potential miss; we start from today
    // and walk backwards applying the "don't miss twice" rule.
    while (true) {
      const dateStr = cursor.toISOString().split('T')[0];

      if (completedDates.has(dateStr)) {
        streak += 1;
      } else {
        if (!graceUsed) {
          graceUsed = true;
        } else {
          break;
        }
      }

      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  }, [state.habitLogs]);

  const markMilestoneCelebrated = useCallback((habitId: string, milestone: number) => {
    setState(prev => {
      const existing: MilestoneCelebration[] = prev.milestoneCelebrations ?? [];
      if (existing.some(m => m.habitId === habitId && m.milestone === milestone)) {
        return prev;
      }
      return {
        ...prev,
        milestoneCelebrations: [...existing, { habitId, milestone }],
      };
    });
  }, []);

  const resetApp = useCallback(() => {
    setState({
      onboardingComplete: false,
      identityStatement: '',
      soundEnabled: true,
      habits: [],
      habitLogs: [],
    });
  }, []);

  // Smart reminder & "Don't miss twice" browser notifications
  useEffect(() => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return;

    const ensurePermission = async () => {
      if (Notification.permission === 'default' && !notificationPermissionRequestedRef.current) {
        notificationPermissionRequestedRef.current = true;
        try {
          await Notification.requestPermission();
        } catch {
          // ignore
        }
      }
    };

    const interval = window.setInterval(async () => {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 5); // HH:MM
      const todayStr = getToday();

      if (Notification.permission === 'default') {
        await ensurePermission();
      }
      if (Notification.permission !== 'granted') return;

      const activeHabits = state.habits.filter(h => !h.archived);

      for (const habit of activeHabits) {
        const reminderTime = habit.reminderTime ?? habit.timeOfDay;

        // Smart reminder at preferred time
        if (habit.smartReminderEnabled && reminderTime && timeStr === reminderTime) {
          const lastSent = reminderSentRef.current[habit.id];
          if (lastSent !== todayStr && !isHabitCompletedToday(habit.id)) {
            new Notification('Time for your habit', {
              body: `“${habit.title}” is waiting. Take 2 minutes now.`,
            });
            reminderSentRef.current[habit.id] = todayStr;
          }
        }

        // 9pm "Don't miss twice" notification if still incomplete
        if (timeStr === '21:00') {
          const lastSent = dontMissTwiceSentRef.current[habit.id];
          if (lastSent !== todayStr && !isHabitCompletedToday(habit.id)) {
            new Notification("Don't miss twice", {
              body: `You haven't completed “${habit.title}” today. A tiny action keeps your streak alive.`,
            });
            dontMissTwiceSentRef.current[habit.id] = todayStr;
          }
        }
      }
    }, 60 * 1000); // check every minute

    return () => window.clearInterval(interval);
  }, [state.habits, isHabitCompletedToday]);

  return (
    <AppContext.Provider value={{
      state,
      completeOnboarding,
      updateIdentityStatement,
      setSoundEnabled,
      addHabit,
      updateHabit,
      toggleHabitCompletion,
      skipHabit,
      deleteHabit,
      isHabitCompletedToday,
      isHabitSkippedToday,
      getHabitStreak,
      markMilestoneCelebrated,
      resetApp,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
