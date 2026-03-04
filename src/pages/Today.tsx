import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { Plus, Sprout } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useApp } from '@/contexts/AppContext';
import HabitCard from '@/components/HabitCard';
import TabBar from '@/components/TabBar';
import AddHabitModal from '@/components/AddHabitModal';
import MilestoneCelebrationModal from '@/components/MilestoneCelebrationModal';
import HabitDetailSheet from '@/components/HabitDetailSheet';

export default function Today() {
  const {
    state,
    isHabitCompletedToday,
    isHabitSkippedToday,
    toggleHabitCompletion,
    skipHabit,
    deleteHabit,
    getHabitStreak,
    markMilestoneCelebrated,
  } = useApp();
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [milestoneHabitId, setMilestoneHabitId] = useState<string | null>(null);
  const [milestoneValue, setMilestoneValue] = useState<number | null>(null);
  const [detailHabitId, setDetailHabitId] = useState<string | null>(null);

  const activeHabits = useMemo(
    () => state.habits.filter(h => !h.archived),
    [state.habits],
  );
  const completedCount = activeHabits.filter(h => isHabitCompletedToday(h.id)).length;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // End-of-day "Don't miss twice" reminder
  useEffect(() => {
    const todayStr = format(now, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(now, 1), 'yyyy-MM-dd');

    if (activeHabits.length === 0) return;

    const hadMissYesterday = activeHabits.some(habit => {
      const logs = state.habitLogs.filter(l => l.habitId === habit.id && l.date === yesterdayStr);
      const completed = logs.some(l => l.completed);
      return !completed;
    });

    if (!hadMissYesterday) return;

    const hasCompletedToday = activeHabits.some(habit =>
      state.habitLogs.some(l => l.habitId === habit.id && l.date === todayStr && l.completed),
    );

    if (hasCompletedToday) return;

    toast.warning("Don't miss twice.", {
      description: 'You skipped yesterday. Complete at least one habit today to keep your streak alive.',
    });
  }, [now, activeHabits, state.habitLogs]);

  // Milestone celebrations (3, 7, 14, 21, 30, 50, 100)
  useEffect(() => {
    if (activeHabits.length === 0) return;
    if (milestoneHabitId) return; // already showing one

    const milestones = [3, 7, 14, 21, 30, 50, 100];

    for (const habit of activeHabits) {
      const streak = getHabitStreak(habit.id);
      if (streak <= 0) continue;

      const already = (state.milestoneCelebrations ?? []).filter(
        m => m.habitId === habit.id,
      );

      const next = milestones.find(
        m => streak >= m && !already.some(a => a.milestone === m),
      );

      if (next != null) {
        markMilestoneCelebrated(habit.id, next);
        setMilestoneHabitId(habit.id);
        setMilestoneValue(next);
        break;
      }
    }
  }, [activeHabits, getHabitStreak, markMilestoneCelebrated, milestoneHabitId, state.milestoneCelebrations]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-muted-foreground text-sm font-medium">{format(now, 'EEEE, MMMM d')}</p>
          <h1 className="text-2xl mt-1">{greeting}</h1>
          {state.identityStatement?.trim() && (
            <p className="text-muted-foreground text-sm mt-2">
              Every rep counts toward becoming <span className="text-foreground font-medium">{state.identityStatement.trim()}</span>.
            </p>
          )}
          {activeHabits.length > 0 && (
            <p className="text-muted-foreground text-sm mt-2">
              {completedCount} of {activeHabits.length} habits done today
            </p>
          )}
        </motion.div>

        {/* Habits */}
        {activeHabits.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="mb-4 flex justify-center">
              <Sprout className="w-10 h-10 text-primary" />
            </p>
            <h2 className="text-xl mb-2">No habits yet</h2>
            <p className="text-muted-foreground text-sm mb-6">Start with one tiny habit.</p>
            <button
              onClick={() => setShowAddHabit(true)}
              className="px-6 py-3 rounded-2xl gradient-warm text-primary-foreground font-semibold shadow-elevated"
            >
              Add your first habit
            </button>
          </motion.div>
        ) : (
          <div>
            {activeHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                streak={getHabitStreak(habit.id)}
                completed={isHabitCompletedToday(habit.id)}
                skipped={isHabitSkippedToday(habit.id)}
                onComplete={() => toggleHabitCompletion(habit.id)}
                onSkip={() => skipHabit(habit.id)}
                onDelete={() => deleteHabit(habit.id)}
                onOpenDetails={() => setDetailHabitId(habit.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {activeHabits.length > 0 && (
        <motion.button
          onClick={() => setShowAddHabit(true)}
          className="fixed bottom-20 right-5 w-14 h-14 rounded-full gradient-warm text-primary-foreground shadow-elevated flex items-center justify-center z-40"
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
        >
          <Plus size={24} />
        </motion.button>
      )}

      <TabBar />
      {showAddHabit && <AddHabitModal onClose={() => setShowAddHabit(false)} />}
      <MilestoneCelebrationModal
        open={!!milestoneHabitId && milestoneValue != null}
        habit={milestoneHabitId ? activeHabits.find(h => h.id === milestoneHabitId) ?? null : null}
        milestone={milestoneValue}
        onClose={() => {
          setMilestoneHabitId(null);
          setMilestoneValue(null);
        }}
      />
      <HabitDetailSheet
        open={!!detailHabitId}
        habit={detailHabitId ? activeHabits.find(h => h.id === detailHabitId) ?? null : null}
        onClose={() => setDetailHabitId(null)}
      />
    </div>
  );
}
