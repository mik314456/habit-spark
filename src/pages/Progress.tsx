import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Flame } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import TabBar from '@/components/TabBar';

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

  // Calendar
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

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
              className="text-center p-8 rounded-3xl mb-6 shadow-card border border-[color:var(--accent-color)]/30"
              style={{
                background: 'linear-gradient(135deg, #b85a2a 0%, #c96a3a 40%, #d4845a 100%)',
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame className="w-6 h-6 text-white" />
                <p className="text-5xl font-body font-semibold text-white tabular-nums">
                  {currentStreak}
                </p>
              </div>
              <p className="text-sm mt-1 font-body font-medium text-white/95">
                day streak
              </p>
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

            {/* Calendar */}
            <div className="p-5 rounded-2xl bg-card shadow-card mb-6">
              <h3 className="font-body font-semibold text-lg mb-4">{format(today, 'MMMM yyyy')}</h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <span key={i} className="text-[10px] text-muted-foreground font-medium font-body py-1">{d}</span>
                ))}
                {Array.from({ length: startPadding }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {calendarDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const totalHabits = activeHabits.length;
                  const completedHabits = (state.habitLogs ?? []).filter(l => l.date === dateStr && l.completed).length;
                  const ratio = totalHabits > 0 ? completedHabits / totalHabits : 0;
                  const isToday = isSameDay(day, today);

                  return (
                    <div
                      key={dateStr}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-body tabular-nums transition-colors ${
                        isToday
                          ? 'ring-1 ring-primary ' + (ratio >= 1 ? 'bg-primary text-primary-foreground' : ratio > 0 ? 'bg-primary/20 text-foreground' : 'bg-muted text-foreground')
                          : ratio >= 1
                            ? 'bg-primary text-primary-foreground'
                            : ratio > 0
                              ? 'bg-primary/20 text-foreground'
                              : 'bg-muted text-foreground'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-habit breakdown */}
            <div className="space-y-3">
              <h3 className="font-body font-semibold text-lg">By Habit</h3>
              {activeHabits.map(habit => {
                const streak = getHabitStreak(habit.id);
                const rate = completionRate(7); // simplified
                return (
                  <div key={habit.id} className="flex items-center gap-3 p-4 rounded-2xl bg-card shadow-card">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-xs font-semibold font-body">
                      {habit.title.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium font-body">{habit.title}</p>
                      <p className="text-xs text-muted-foreground font-body">{streak} day streak</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary font-body">{rate}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <TabBar />
    </div>
  );
}
