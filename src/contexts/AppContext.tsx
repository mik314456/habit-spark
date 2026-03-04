import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AppState, Habit, HabitLog, loadState, saveState, getToday, generateId } from '@/lib/habitData';

interface AppContextType {
  state: AppState;
  completeOnboarding: (identity: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void;
  toggleHabitCompletion: (habitId: string) => void;
  skipHabit: (habitId: string) => void;
  deleteHabit: (habitId: string) => void;
  isHabitCompletedToday: (habitId: string) => boolean;
  isHabitSkippedToday: (habitId: string) => boolean;
  getHabitStreak: (habitId: string) => number;
  resetApp: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const completeOnboarding = useCallback((identity: string) => {
    setState(prev => ({ ...prev, onboardingComplete: true, identityStatement: identity }));
  }, []);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
    const newHabit: Habit = {
      ...habit,
      id: generateId(),
      createdAt: new Date().toISOString(),
      archived: false,
    };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
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
    const habitLogs = state.habitLogs
      .filter(l => l.habitId === habitId && (l.completed || l.skipped))
      .map(l => l.date)
      .sort()
      .reverse();

    if (habitLogs.length === 0) return 0;

    let streak = 0;
    const today = getToday();
    let checkDate = new Date(today + 'T12:00:00');

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
  }, [state.habitLogs]);

  const resetApp = useCallback(() => {
    setState({
      onboardingComplete: false,
      identityStatement: '',
      habits: [],
      habitLogs: [],
    });
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      completeOnboarding,
      addHabit,
      toggleHabitCompletion,
      skipHabit,
      deleteHabit,
      isHabitCompletedToday,
      isHabitSkippedToday,
      getHabitStreak,
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
