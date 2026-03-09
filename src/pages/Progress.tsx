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
  Trophy,
  Check,
} from 'lucide-react';
import { format, subDays, isSameDay, getISOWeek } from 'date-fns';
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

type MilestoneType = 'streak' | 'completions' | 'perfect_week';
const MILESTONES: { id: string; type: MilestoneType; threshold: number; label: string }[] = [
  { id: 'streak-7', type: 'streak', threshold: 7, label: 'First week' },
  { id: 'completions-50', type: 'completions', threshold: 50, label: '50 done' },
  { id: 'perfect-week', type: 'perfect_week', threshold: 1, label: 'Perfect week' },
  { id: 'streak-14', type: 'streak', threshold: 14, label: 'On fire' },
  { id: 'completions-100', type: 'completions', threshold: 100, label: 'Century' },
  { id: 'streak-30', type: 'streak', threshold: 30, label: 'Unstoppable' },
  { id: 'completions-250', type: 'completions', threshold: 250, label: 'Dedicated' },
];

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

  const totalCompletions = useMemo(() => {
    const logs = state.habitLogs ?? [];
    const activeIds = new Set(activeHabits.map(h => h.id));
    return logs.filter(l => l.completed && activeIds.has(l.habitId)).length;
  }, [activeHabits, state.habitLogs]);

  const achievedMilestoneIds = useMemo(() => {
    const achieved = new Set<string>();
    for (const m of MILESTONES) {
      if (m.type === 'streak' && bestStreak >= m.threshold) achieved.add(m.id);
      if (m.type === 'completions' && totalCompletions >= m.threshold) achieved.add(m.id);
      if (m.type === 'perfect_week' && activeHabits.length > 0 && rate7 === 100) achieved.add(m.id);
    }
    return achieved;
  }, [bestStreak, totalCompletions, rate7, activeHabits.length]);

  return (
    <div className="min-h-screen pb-24 font-body bg-page">
      <div className="max-w-md mx-auto px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold text-foreground mb-5">Progress</h1>
        </motion.div>

        {activeHabits.length === 0 ? (
          <div className="text-center py-16">
            <p className="mb-4 flex justify-center">
              <BarChart2 className="w-10 h-10 text-muted-foreground" />
            </p>
            <p className="text-muted-foreground text-sm">Complete some habits to see your progress</p>
          </div>
        ) : (
          <>
            {/* Current streak — premium, motivating */}
            <motion.div
              className="relative overflow-hidden rounded-2xl mb-5 border border-border-strong bg-card-surface p-5"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full opacity-90"
                style={{ background: 'var(--accent-color)' }}
                aria-hidden
              />
              <div className="relative pl-2">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border border-border bg-card-surface-deep" style={{ color: 'var(--accent-color)' }}>
                      <Flame className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wide font-body">
                      Current streak
                    </span>
                  </div>
                  <span className="text-[11px] font-body text-muted-foreground tabular-nums shrink-0">
                    Best: <span className="font-semibold text-foreground/80">{bestStreak}</span> day{bestStreak !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <motion.span
                    className="font-body tabular-nums leading-none"
                    style={{ color: 'var(--accent-color)', fontSize: 'clamp(2.75rem, 11vw, 4rem)', fontWeight: 600, letterSpacing: '-0.03em' }}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {currentStreak}
                  </motion.span>
                  <span className="text-sm font-body text-muted-foreground pb-0.5">days in a row</span>
                </div>
                <motion.p
                  className="mt-2 text-[13px] font-body text-muted-foreground leading-snug max-w-[85%]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.35 }}
                >
                  {currentStreak === 0 && 'Complete all habits today to start your streak.'}
                  {currentStreak >= 1 && currentStreak < 7 && 'You\'re showing up. Keep it going.'}
                  {currentStreak >= 7 && currentStreak < 14 && 'First week done. You\'re on a roll.'}
                  {currentStreak >= 14 && currentStreak < 30 && 'Strong. Don\'t break the chain.'}
                  {currentStreak >= 30 && 'Thirty days. You\'re unstoppable.'}
                </motion.p>
                {currentStreak >= 30 ? (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card-surface-deep px-4 py-2.5">
                    <span className="text-sm font-body font-semibold" style={{ color: 'var(--accent-color)' }}>Unstoppable</span>
                    <span className="text-[11px] font-body text-muted-foreground">30-day milestone</span>
                  </div>
                ) : (() => {
                  const next = [7, 14, 30].find(n => n > currentStreak) ?? 30;
                  const from = next === 7 ? 0 : next === 14 ? 7 : 14;
                  const pct = Math.min(100, ((currentStreak - from) / (next - from)) * 100);
                  const label = next === 7 ? 'First week' : next === 14 ? 'On fire' : 'Unstoppable';
                  const daysLeft = next - currentStreak;
                  return (
                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-body text-muted-foreground">Next: {label}</span>
                        <span className="text-[11px] font-body tabular-nums text-muted-foreground">{currentStreak}/{next}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'var(--accent-color)', width: `${Math.min(100, pct)}%` }}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, pct)}%` }}
                          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <p className="text-[11px] font-body mt-1.5 text-muted-foreground">
                        {daysLeft === 0 ? 'Milestone reached.' : daysLeft === 1 ? '1 day to go. You\'ve got this.' : `${daysLeft} days to go. Almost there.`}
                      </p>
                    </div>
                  );
                })()}
                <div className="border-t border-border mt-5 pt-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-body text-muted-foreground">day streak</p>
                  <p className="text-[11px] font-body text-muted-foreground tabular-nums">
                    Best: <span className="font-semibold text-foreground/80">{bestStreak}</span> day{bestStreak !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* This week — in card */}
            <motion.div
              className="mb-5 rounded-2xl border border-border-strong bg-card-surface p-4"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-baseline justify-between gap-3 mb-4">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-body">
                  This week
                </p>
                <p className="text-[11px] text-muted-foreground font-body shrink-0 uppercase">
                  Week {getISOWeek(today)} · {format(today, 'MMMM')}
                </p>
              </div>
              <div className="grid grid-cols-7 gap-2 place-items-center">
                {weekDays.map(day => {
                  const isCompleted = day.ratio > 0 && !day.isToday;
                  const isFuture = !day.isToday && !isCompleted;
                  return (
                    <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                      <span
                        className={`text-[10px] font-medium font-body ${
                          day.isToday ? 'text-[color:var(--accent-color)]' : isFuture ? 'text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {day.label}
                      </span>
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-body tabular-nums border transition-colors ${
                          day.isToday
                            ? 'border-2 border-[color:var(--accent-color)] text-[color:var(--accent-color)] font-semibold bg-transparent'
                            : isFuture
                              ? 'border border-border bg-card-surface-deep text-muted-foreground'
                              : 'border border-border bg-card text-foreground'
                        }`}
                      >
                        {format(day.date, 'd')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Completion rate */}
            <motion.div
              className="mb-5 rounded-2xl border border-border-strong bg-card-surface p-4"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
            >
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-body mb-3">
                Completion rate
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-card-surface-deep p-4">
                  <p className="text-2xl font-body font-semibold tabular-nums text-foreground">
                    {String(rate7)}%
                  </p>
                  <p className="text-xs mt-1 font-body text-muted-foreground">
                    Last 7 days
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-card-surface-deep p-4">
                  <p className="text-2xl font-body font-semibold tabular-nums text-foreground">
                    {String(rate30)}%
                  </p>
                  <p className="text-xs mt-1 font-body text-muted-foreground">
                    Last 30 days
                  </p>
                </div>
              </div>
            </motion.div>

            {/* By habit — habit-colored rings */}
            <motion.div
              className="mb-5 rounded-2xl border border-border-strong bg-card-surface p-4"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-body mb-1">
                By habit
              </p>
              <p className="text-xs font-body text-muted-foreground mb-4">
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
                      className="p-4 rounded-2xl border border-border bg-card-surface-deep flex flex-col items-center"
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
                            className="stroke-muted stroke-black/5"
                            strokeWidth={12}
                            strokeLinecap="round"
                          />
                          <motion.circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="none"
                            stroke={habit.color ? `hsl(var(--habit-${habit.color}))` : '#ffffff'}
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
                            <HabitIcon className="w-5 h-5 text-foreground" />
                            <span className="text-sm font-semibold font-body tabular-nums text-foreground">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium font-body text-center line-clamp-2 text-foreground">
                        {habit.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Milestones */}
            <motion.div
              className="mb-5 rounded-2xl border border-border-strong bg-card-surface p-4"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-body mb-1">
                Milestones
              </p>
              <p className="text-xs font-body text-muted-foreground mb-4">
                Streaks, completions & perfect weeks
              </p>
              <div className="divide-y divide-border">
                {MILESTONES.map((m) => {
                  const achieved = achievedMilestoneIds.has(m.id);
                  const displayValue =
                    m.type === 'streak'
                      ? `${bestStreak} day${bestStreak !== 1 ? 's' : ''}`
                      : m.type === 'completions'
                        ? `${totalCompletions} done`
                        : rate7 === 100
                          ? 'Done'
                          : '—';
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          achieved
                            ? 'bg-[color:var(--accent-color)] text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {achieved ? (
                          <Check className="w-4 h-4" strokeWidth={2.5} />
                        ) : (
                          <Trophy className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-body font-medium text-sm ${
                            achieved ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {m.label}
                        </p>
                        <p className="text-xs font-body text-muted-foreground">
                          {m.type === 'streak' && `Reach ${m.threshold} day streak`}
                          {m.type === 'completions' && `${m.threshold} completions`}
                          {m.type === 'perfect_week' && '100% completion in a week'}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-body tabular-nums shrink-0 ${
                          achieved ? 'text-[var(--accent-color)]' : 'text-muted-foreground'
                        }`}
                      >
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </div>
      <TabBar />
    </div>
  );
}
