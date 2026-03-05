import { useEffect, useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Plus, Sprout } from 'lucide-react';
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

  const todayKey = `dontMiss-${format(new Date(), 'yyyy-MM-dd')}`;
  const [showDontMissBanner, setShowDontMissBanner] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem(todayKey)) {
      return false;
    }

    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const yesterdayLogs = state.habitLogs?.filter(l => l.date === yesterday) ?? [];
    return activeHabits.length > 0 && yesterdayLogs.length === 0;
  });
  const completedCount = activeHabits.filter(h => isHabitCompletedToday(h.id)).length;

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 5
      ? 'Still up?'
      : hour < 12
        ? 'Good morning'
        : hour < 17
          ? 'Good afternoon'
          : hour < 21
            ? 'Good evening'
            : 'Good night';

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
        <AnimatePresence>
          {showDontMissBanner && (
            <motion.div
              className="fixed top-0 left-0 right-0 z-40 flex justify-center pointer-events-none"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-foreground/90 text-background px-3 py-1 text-xs pointer-events-auto">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Don&apos;t miss twice. Yesterday wasn&apos;t logged.</span>
                <button
                  type="button"
                  className="ml-1 text-[10px] text-background/80 hover:text-background"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem(todayKey, 'true');
                    }
                    setShowDontMissBanner(false);
                  }}
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-[11px] text-muted-foreground/80 tracking-[0.12em] uppercase font-body">
            {format(now, 'EEEE, MMMM d')}
          </p>
          <h1 className="mt-2 font-body font-semibold text-[2.6rem] leading-tight text-foreground">
            {greeting}
          </h1>
          {activeHabits.length > 0 && (
            completedCount === activeHabits.length ? (
              <div className="flex items-center gap-2 mt-3">
                <CheckCircle2 className="w-4 h-4 text-[color:var(--accent-color)]" />
                <p className="text-sm font-body text-[color:var(--accent-color)]">
                  All done. You showed up today.
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm mt-3 font-body">
                {completedCount} of {activeHabits.length} habits done today
              </p>
            )
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
          <div className="today-habit-list">
            {activeHabits.map(habit => {
              const rawIdentity = habit.why?.trim() || '';
              const cleanedIdentity = rawIdentity.toLowerCase().startsWith('to become ')
                ? rawIdentity.slice('to become '.length).trim()
                : rawIdentity;

              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  streak={getHabitStreak(habit.id)}
                  completed={isHabitCompletedToday(habit.id)}
                  skipped={isHabitSkippedToday(habit.id)}
                  showIdentityWhisper={!!habit.why}
                  identityStatement={cleanedIdentity}
                  onComplete={() => {
                    if (typeof window !== 'undefined') {
                      window.localStorage.setItem(todayKey, 'true');
                    }
                    setShowDontMissBanner(false);
                    toggleHabitCompletion(habit.id);
                  }}
                  onSkip={() => skipHabit(habit.id)}
                  onDelete={() => deleteHabit(habit.id)}
                  onOpenDetails={() => setDetailHabitId(habit.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      {activeHabits.length > 0 && (
        <motion.button
          onClick={() => setShowAddHabit(true)}
          className="fixed bottom-20 right-5 w-[52px] h-[52px] rounded-full bg-[color:var(--accent-color)] text-white shadow-card flex items-center justify-center z-40 transition-transform duration-150"
          whileTap={{ scale: 0.95 }}
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
