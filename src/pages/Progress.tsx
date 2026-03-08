import { useMemo, type ComponentType, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2,
  Flame,
  Dumbbell,
  Brain,
  BookOpen,
  Droplets,
  Heart,
  Moon,
  Pencil,
  Music,
  Phone,
  Apple,
  Bike,
} from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import {
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { useApp } from '@/contexts/AppContext';
import { Habit } from '@/lib/habitData';
import { getHabitIconByTitle } from '@/lib/habitIcons';
import TabBar from '@/components/TabBar';

const GRAPH_DAYS = 21;

const explicitIconMap: Record<string, ComponentType<{ className?: string; style?: CSSProperties }>> = {
  dumbbell: Dumbbell,
  brain: Brain,
  book: BookOpen,
  droplets: Droplets,
  heart: Heart,
  moon: Moon,
  pencil: Pencil,
  music: Music,
  phone: Phone,
  apple: Apple,
  bike: Bike,
};

export default function Progress() {
  const { state, getHabitStreak, getGlobalStreak } = useApp();

  const activeHabits = state.habits.filter(h => !h.archived);
  const today = new Date();

  // Global streak: consecutive days where ALL habits completed
  const currentStreak = useMemo(() => getGlobalStreak(), [getGlobalStreak]);
  const bestStreak = currentStreak;

  // Weekly dots
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const totalHabits = activeHabits.length;
      const completedHabits = (state.habitLogs ?? []).filter(
        l => l.date === dateStr && l.completed
      ).length;
      return {
        date,
        dateStr,
        label: format(date, 'EEE'),
        isToday: isSameDay(date, today),
        ratio: totalHabits > 0 ? completedHabits / totalHabits : 0,
      };
    });
  }, [activeHabits, state.habitLogs, today]);

  // Completion rates (only count logs for active habits)
  const completionRate = (days: number): number => {
    const logs = state.habitLogs ?? [];
    const activeIds = new Set(activeHabits.map(h => h.id));
    let total = 0;
    let completed = 0;
    for (let i = 0; i < days; i++) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
      total += activeHabits.length;
      completed += logs.filter(
        l => l.date === dateStr && l.completed && activeIds.has(l.habitId)
      ).length;
    }
    if (total === 0) return 0;
    const pct = Math.round((completed / total) * 100);
    return Number.isFinite(pct) ? pct : 0;
  };

  const rate7 = (() => {
    const n = completionRate(7);
    return typeof n === 'number' && Number.isFinite(n) ? n : 0;
  })();
  const rate30 = (() => {
    const n = completionRate(30);
    return typeof n === 'number' && Number.isFinite(n) ? n : 0;
  })();

  const totalHabitsCount = activeHabits.length;

  const perHabitRate30 = (habitId: string): number => {
    const logs = state.habitLogs ?? [];
    let completedDays = 0;
    const windowDays = 30;
    for (let i = 0; i < windowDays; i++) {
      const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
      const hasCompleted = logs.some(
        l => l.habitId === habitId && l.date === dateStr && l.completed,
      );
      if (hasCompleted) completedDays += 1;
    }
    if (windowDays === 0) return 0;
    return Math.round((completedDays / windowDays) * 100);
  };

  // Graph data: last N days — rate %, count, and day metadata
  const graphData = useMemo(() => {
    return Array.from({ length: GRAPH_DAYS }, (_, i) => {
      const date = subDays(today, GRAPH_DAYS - 1 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const totalHabits = activeHabits.length;
      const completed = (state.habitLogs ?? []).filter(
        l => l.date === dateStr && l.completed
      ).length;
      const rate = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
      return {
        dateStr,
        label: format(date, 'EEE, MMM d'),
        shortLabel: format(date, 'd'),
        weekDay: format(date, 'EEE'),
        rate,
        count: completed,
        total: totalHabits,
        isToday: isSameDay(date, today),
      };
    });
  }, [activeHabits, state.habitLogs, today]);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#080808' }}>
      <div className="max-w-md mx-auto px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-body text-2xl font-semibold text-white mb-8">Progress</h1>
        </motion.div>

        {activeHabits.length === 0 ? (
          <div className="text-center py-16 font-body" style={{ color: '#666666' }}>
            <p className="mb-4 flex justify-center">
              <BarChart2 className="w-10 h-10" style={{ color: '#666666' }} />
            </p>
            <p>Complete some habits to see your progress</p>
          </div>
        ) : (
          <>
            {/* Current streak — dark card, orange number, no solid orange bg */}
            <motion.div
              className="relative overflow-hidden rounded-[20px] mb-6 border px-6 py-7"
              style={{ backgroundColor: '#111111', borderColor: '#222222', borderWidth: 1 }}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex flex-col items-start">
                  <p className="text-xs uppercase tracking-[0.16em] font-body mb-1" style={{ color: '#666666' }}>
                    Current streak
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p
                      className="text-6xl font-body font-semibold tabular-nums leading-none"
                      style={{ color: 'var(--accent-color)' }}
                    >
                      {currentStreak}
                    </p>
                    <span className="text-sm font-body text-white mt-1">days</span>
                  </div>
                  <p className="text-sm mt-2 font-body text-white">day streak</p>
                </div>
                <div className="relative flex flex-col items-end justify-between h-full">
                  <button
                    type="button"
                    className="bg-transparent border rounded-full py-1.5 px-4 text-[11px] font-body uppercase tracking-[0.1em] transition-colors border-[#333333] text-[#666666] hover:border-[#555555] hover:text-[#999999]"
                  >
                    Keep the chain alive
                  </button>
                  <p className="mt-6 text-xs font-body" style={{ color: '#666666' }}>
                    Best: <span className="font-semibold text-[#666666]">{bestStreak}</span> days
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Week date row — 36px circles; completed #1a1a1a/#333; today transparent + orange; future #0d0d0d/#1a1a1a/#333 */}
            <div className="grid grid-cols-7 gap-2 mb-6 place-items-center">
              {weekDays.map(day => {
                const isCompleted = day.ratio > 0 && !day.isToday;
                const isFuture = !day.isToday && !isCompleted;
                return (
                  <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                    <span
                      className="text-[10px] font-medium font-body"
                      style={{
                        color: day.isToday ? 'var(--accent-color)' : isFuture ? '#333333' : '#ffffff',
                      }}
                    >
                      {day.label}
                    </span>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-body tabular-nums border transition-colors"
                      style={{
                        backgroundColor: day.isToday ? 'transparent' : isFuture ? '#0d0d0d' : '#1a1a1a',
                        borderWidth: day.isToday ? 2 : 1,
                        borderColor: day.isToday ? 'var(--accent-color)' : isFuture ? '#1a1a1a' : '#333333',
                        color: day.isToday ? 'var(--accent-color)' : isFuture ? '#333333' : '#ffffff',
                        fontWeight: day.isToday ? 600 : 500,
                      }}
                    >
                      {format(day.date, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats — #111111 bg, percentage white, label #666666 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div
                className="p-4 rounded-[20px] border"
                style={{ backgroundColor: '#111111', borderColor: '#222222', borderWidth: 1 }}
              >
                <p className="text-2xl font-body font-semibold min-h-[2.5rem] flex items-center text-white tabular-nums">
                  {String(rate7)}%
                </p>
                <p className="text-xs mt-1 font-body" style={{ color: '#666666' }}>
                  Last 7 days
                </p>
              </div>
              <div
                className="p-4 rounded-[20px] border"
                style={{ backgroundColor: '#111111', borderColor: '#222222', borderWidth: 1 }}
              >
                <p className="text-2xl font-body font-semibold min-h-[2.5rem] flex items-center text-white tabular-nums">
                  {String(rate30)}%
                </p>
                <p className="text-xs mt-1 font-body" style={{ color: '#666666' }}>
                  Last 30 days
                </p>
              </div>
            </div>

            {/* By habit — ring track #1a1a1a, fill white; habit name white */}
            <div className="space-y-3">
              <h3 className="font-body font-semibold text-lg text-white">By habit</h3>
              <p className="text-xs font-body" style={{ color: '#666666' }}>
                30-day completion, one ring per habit
              </p>
              <div className="grid grid-cols-2 gap-4">
                {activeHabits.map((habit, index) => {
                  const pct = perHabitRate30(habit.id);
                  const radius = 54;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference * (1 - pct / 100);

                  const explicitKey = habit.icon?.startsWith('lucide:')
                    ? habit.icon.slice(7)
                    : undefined;
                  const ExplicitIcon = explicitKey ? explicitIconMap[explicitKey] : undefined;
                  const HabitIcon = (ExplicitIcon ??
                    getHabitIconByTitle(habit.title)) as ComponentType<{
                    className?: string;
                    style?: CSSProperties;
                  }>;

                  return (
                    <div
                      key={habit.id}
                      className="p-4 rounded-[20px] border flex flex-col items-center"
                      style={{
                        backgroundColor: '#111111',
                        borderColor: '#222222',
                        borderWidth: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <div
                        className="relative"
                        style={{ width: 120, height: 120 }}
                      >
                        <motion.svg
                          viewBox="0 0 120 120"
                          className="absolute inset-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                          initial={false}
                        >
                          {/* Track */}
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#1a1a1a"
                            strokeWidth={12}
                            strokeLinecap="round"
                          />
                          {/* Fill — white only */}
                          <motion.circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth={12}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference}
                            transform="rotate(-90 60 60)"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset: offset }}
                            transition={{
                              duration: 1,
                              delay: 0.04 * index,
                              ease: 'easeOut',
                            }}
                          />
                        </motion.svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-1">
                            <HabitIcon className="w-5 h-5 text-white" />
                            <span className="text-sm font-semibold font-body tabular-nums text-white">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium font-body text-center line-clamp-2 text-white">
                        {habit.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      <TabBar />
    </div>
  );
}
