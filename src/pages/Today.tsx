import { useApp } from '@/contexts/AppContext';
import HabitCard from '@/components/HabitCard';
import TabBar from '@/components/TabBar';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import AddHabitModal from '@/components/AddHabitModal';

export default function Today() {
  const { state, isHabitCompletedToday, isHabitSkippedToday, toggleHabitCompletion, skipHabit, deleteHabit, getHabitStreak } = useApp();
  const [showAddHabit, setShowAddHabit] = useState(false);

  const activeHabits = state.habits.filter(h => !h.archived);
  const completedCount = activeHabits.filter(h => isHabitCompletedToday(h.id)).length;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-muted-foreground text-sm font-medium">{format(now, 'EEEE, MMMM d')}</p>
          <h1 className="text-2xl mt-1">{greeting}</h1>
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
            <p className="text-4xl mb-4">🌱</p>
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
    </div>
  );
}
