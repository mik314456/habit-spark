import { useEffect, useMemo, useState } from 'react';
import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth, subDays, isSameDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Save, Flame } from 'lucide-react';
import { Habit, HABIT_COLOR_MAP } from '@/lib/habitData';
import { useApp } from '@/contexts/AppContext';

interface HabitDetailSheetProps {
  open: boolean;
  habit: Habit | null;
  onClose: () => void;
}

export default function HabitDetailSheet({ open, habit, onClose }: HabitDetailSheetProps) {
  const { state, getHabitStreak, updateHabit, deleteHabit } = useApp();

  const logsForHabit = useMemo(
    () => state.habitLogs.filter(l => habit && l.habitId === habit.id),
    [state.habitLogs, habit],
  );

  const today = new Date();

  const currentStreak = habit ? getHabitStreak(habit.id) : 0;

  const bestStreak = useMemo(() => {
    if (!habit) return 0;
    const days = Array.from(
      new Set(
        logsForHabit
          .filter(l => l.completed || l.skipped)
          .map(l => l.date),
      ),
    )
      .map(d => new Date(d + 'T12:00:00'))
      .sort((a, b) => a.getTime() - b.getTime());

    if (days.length === 0) return 0;

    let best = 1;
    let streak = 1;

    for (let i = 1; i < days.length; i++) {
      const prev = days[i - 1];
      const curr = days[i];
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        streak += 1;
      } else {
        streak = 1;
      }
      best = Math.max(best, streak);
    }
    return best;
  }, [habit, logsForHabit]);

  const completionRate30 = useMemo(() => {
    if (!habit) return 0;
    let completedDays = 0;
    for (let i = 0; i < 30; i++) {
      const day = subDays(today, i);
      const dateStr = format(day, 'yyyy-MM-dd');
      const hasCompleted = logsForHabit.some(l => l.date === dateStr && l.completed);
      if (hasCompleted) completedDays += 1;
    }
    return Math.round((completedDays / 30) * 100);
  }, [habit, logsForHabit, today]);

  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);

  const [title, setTitle] = useState<string>(habit?.title ?? '');
  const [timeOfDay, setTimeOfDay] = useState<string>(habit?.timeOfDay ?? '07:00');
  const [location, setLocation] = useState<string>(habit?.location ?? '');
  const [why, setWhy] = useState<string>(habit?.why ?? '');

  useEffect(() => {
    if (!habit) return;
    setTitle(habit.title ?? '');
    setTimeOfDay(habit.timeOfDay ?? '07:00');
    setLocation(habit.location ?? '');
    setWhy(habit.why ?? '');
  }, [habit?.id]);

  if (!habit) return null;

  const handleSave = () => {
    updateHabit(habit.id, { title, timeOfDay, location, why });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Delete this habit? This will remove it from Today, but history stays.')) {
      deleteHabit(habit.id);
      onClose();
    }
  };

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const clampedRate = Math.max(0, Math.min(100, completionRate30));
  const offset = circumference * (1 - clampedRate / 100);

  const statusForDate = (date: Date): 'completed' | 'skipped' | 'none' => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const logs = logsForHabit.filter(l => l.date === dateStr);
    if (logs.some(l => l.completed)) return 'completed';
    if (logs.some(l => l.skipped)) return 'skipped';
    return 'none';
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-md mx-auto bg-card rounded-t-[24px] max-h-[92vh] overflow-y-auto shadow-2xl border border-border"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle + close */}
            <div className="relative px-5 pt-4 pb-2">
              <div className="h-1 w-10 rounded-full bg-border/80 mx-auto mb-3" />
              <button
                onClick={onClose}
                className="absolute right-5 top-4 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
              <h2 className="font-display text-xl mb-1 pr-8 truncate">{habit.title}</h2>
            </div>

            <div className="px-5 pb-6 space-y-6">
              {/* Top stats: streak + 30-day rate */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/80 bg-background/40 px-3 py-3 space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-body">
                    Streak
                  </p>
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-primary" />
                    <span className="text-2xl font-display">{currentStreak}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    day streak · best {bestStreak}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-background/40 px-3 py-3 flex flex-col items-center justify-center">
                  <div className="relative w-16 h-16 mb-1">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-semibold">{clampedRate}%</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Last 30 days</p>
                </div>
              </div>

              {/* Calendar */}
              <div className="rounded-2xl border border-border/80 bg-background/40 px-4 py-4">
                <p className="text-[11px] text-muted-foreground mb-2 font-body uppercase tracking-[0.16em]">
                  History
                </p>
                <p className="text-sm font-medium mb-3">{format(today, 'MMMM yyyy')}</p>
                <div className="grid grid-cols-7 gap-2 text-center text-[11px]">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-[10px] text-muted-foreground font-medium">
                      {d}
                    </span>
                  ))}
                  {Array.from({ length: startPadding }).map((_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                  {calendarDays.map(day => {
                    const status = statusForDate(day);
                    const isToday = isSameDay(day, today);
                    const baseColor = HABIT_COLOR_MAP[habit.color];
                    let style: React.CSSProperties = {};
                    let className =
                      'w-7 h-7 flex items-center justify-center rounded-full mx-auto';

                    if (status === 'completed') {
                      style.backgroundColor = `hsl(${baseColor})`;
                      className += ' text-primary-foreground';
                    } else if (status === 'skipped') {
                      style.borderColor = `hsl(${baseColor})`;
                      style.borderWidth = 1;
                      className += ' text-muted-foreground border';
                    } else {
                      className += ' text-muted-foreground';
                    }

                    if (isToday) {
                      className += ' ring-1 ring-white';
                    }

                    return (
                      <div key={format(day, 'yyyy-MM-dd')} className="flex items-center justify-center">
                        <div className={className} style={style}>
                          {format(day, 'd')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Edit form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] text-muted-foreground font-body">Name</label>
                  <input
                    type="text"
                    className="w-full rounded-xl bg-background border border-border/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground font-body">Time</label>
                    <input
                      type="time"
                      className="w-full rounded-xl bg-background border border-border/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={timeOfDay}
                      onChange={e => setTimeOfDay(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] text-muted-foreground font-body">Location</label>
                    <input
                      type="text"
                      className="w-full rounded-xl bg-background border border-border/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] text-muted-foreground font-body">Why</label>
                  <input
                    type="text"
                    className="w-full rounded-xl bg-background border border-border/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    value={why}
                    onChange={e => setWhy(e.target.value)}
                    placeholder="e.g. To become my best self"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-muted-foreground border border-border/60 hover:bg-muted/40"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 ml-3 py-2.5 rounded-2xl gradient-warm text-primary-foreground text-sm font-semibold shadow-elevated"
                  >
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

