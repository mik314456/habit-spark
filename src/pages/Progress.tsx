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
import { Habit, HABIT_COLOR_MAP } from '@/lib/habitData';
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
  const { state, getHabitStreak } = useApp();

  const activeHabits = state.habits.filter(h => !h.archived);
  const today = new Date();

  // Best streak across all habits
  const bestStreak = useMemo(() => {
    return Math.max(0, ...activeHabits.map(h => getHabitStreak(h.id)));
  }, [activeHabits, getHabitStreak]);

  const currentStreak = bestStreak;

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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-body text-2xl mb-8">Progress</h1>
        </motion.div>

        {activeHabits.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-body">
            <p className="mb-4 flex justify-center">
              <BarChart2 className="w-10 h-10" />
            </p>
            <p>Complete some habits to see your progress</p>
          </div>
        ) : (
          <>
            {/* Streak hero */}
            <motion.div
              className="relative overflow-hidden rounded-3xl mb-6 shadow-card border border-[color:var(--accent-color)]/40 px-6 py-7"
              style={{
                background:
                  'linear-gradient(135deg, #8a3a10 0%, #b85a2a 35%, #d87b3b 70%, #f0a15a 100%)',
              }}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              {/* Flame watermark */}
              <Flame
                className="absolute -right-6 -top-4 w-28 h-28 text-black/10"
                strokeWidth={1}
              />

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex flex-col items-start">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/70 font-body mb-1">
                    Current streak
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-6xl font-body font-semibold text-white tabular-nums leading-none">
                      {currentStreak}
                    </p>
                    <span className="text-sm font-body text-white/80 mt-1">days</span>
                  </div>
                  <p className="text-sm mt-2 font-body text-white/90">
                    day streak
                  </p>
                </div>
                <div className="relative flex flex-col items-end justify-between h-full">
                  <div className="px-3 py-1.5 rounded-full bg-black/15 border border-white/15 text-[11px] font-body text-white/90 backdrop-blur-sm">
                    Keep the chain alive
                  </div>
                  <p className="mt-6 text-xs font-body text-white/80">
                    Best: <span className="font-semibold">{bestStreak}</span> days
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Weekly strip — today stays orange; past dates use theme-aware colors for dark mode */}
            <div className="flex justify-between mb-6 px-2">
              {weekDays.map(day => (
                <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground font-medium font-body">{day.label}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium font-body tabular-nums transition-colors ${
                      day.isToday
                        ? ''
                        : day.ratio > 0
                          ? 'bg-primary/20 text-foreground'
                          : 'bg-muted text-foreground'
                    }`}
                    style={
                      day.isToday
                        ? { backgroundColor: 'var(--accent-color)', color: '#ffffff' }
                        : undefined
                    }
                  >
                    {format(day.date, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-card shadow-card border border-border">
                <p className="text-2xl font-body font-semibold min-h-[2.5rem] flex items-center text-foreground tabular-nums">
                  {String(rate7)}%
                </p>
                <p className="text-xs mt-1 font-body text-muted-foreground">
                  Last 7 days
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-card shadow-card border border-border">
                <p className="text-2xl font-body font-semibold min-h-[2.5rem] flex items-center text-foreground tabular-nums">
                  {String(rate30)}%
                </p>
                <p className="text-xs mt-1 font-body text-muted-foreground">
                  Last 30 days
                </p>
              </div>
            </div>

            {/* Per-habit rings — 30-day completion rate */}
            <div className="space-y-3">
              <h3 className="font-body font-semibold text-lg">By habit</h3>
              <p className="text-xs text-muted-foreground font-body">
                30-day completion, one ring per habit
              </p>
              <div className="grid grid-cols-2 gap-4">
                {activeHabits.map((habit, index) => {
                  const pct = perHabitRate30(habit.id);
                  const radius = 54;
                  const circumference = 2 * Math.PI * radius;
                  const offset = circumference * (1 - pct / 100);
                  const colorToken = HABIT_COLOR_MAP[habit.color];
                  const strokeColor = `hsl(${colorToken})`;

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
                      className="p-4 rounded-2xl bg-card shadow-card border border-border flex flex-col items-center"
                    >
                      <div
                        className="relative"
                        style={{ width: 120, height: 120 }}
                      >
                        <motion.svg
                          viewBox="0 0 120 120"
                          className="absolute inset-0"
                          initial={false}
                        >
                          <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke={strokeColor}
                            strokeOpacity={0.1}
                            strokeWidth={12}
                            strokeLinecap="round"
                          />
                          <motion.circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke={strokeColor}
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
                            <HabitIcon className="w-5 h-5" style={{ color: strokeColor }} />
                            <span className="text-sm font-semibold font-body tabular-nums">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium font-body text-center line-clamp-2">
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
