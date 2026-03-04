import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getHabitIconByTitle } from '@/lib/habitIcons';
import { useTheme } from 'next-themes';
import { useApp } from '@/contexts/AppContext';
import TabBar from '@/components/TabBar';

export default function Settings() {
  const { state, resetApp, updateHabit, updateIdentityStatement, setSoundEnabled } = useApp();
  const { theme, setTheme } = useTheme();
  const [identityDraft, setIdentityDraft] = useState(state.identityStatement ?? '');

  const activeHabits = useMemo(
    () => state.habits.filter(h => !h.archived),
    [state.habits],
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl mb-8">Settings</h1>
        </motion.div>

        <div className="space-y-3">
          {/* Appearance */}
          <div className="p-4 rounded-2xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1 font-body">Appearance</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Dark mode</p>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                  theme === 'dark' ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label="Toggle dark mode"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-background shadow-sm transform transition-transform ${
                    theme === 'dark' ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Identity */}
          <div className="p-4 rounded-2xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1 font-body">Your Identity</p>
            <input
              type="text"
              value={identityDraft}
              onChange={e => setIdentityDraft(e.target.value.slice(0, 60))}
              onBlur={() => updateIdentityStatement(identityDraft.trim())}
              placeholder="e.g. A healthy person"
              className="w-full mt-1 rounded-xl bg-background border border-border px-3 py-2 text-sm"
            />
            <p className="text-[11px] text-muted-foreground mt-2">
              This shows on Today and pre-fills your habit “why”.
            </p>
          </div>

          {/* Stats */}
          <div className="p-4 rounded-2xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1 font-body">Active Habits</p>
            <p className="font-medium">{activeHabits.length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1 font-body">Total Completions</p>
            <p className="font-medium">{state.habitLogs.filter(l => l.completed).length}</p>
          </div>

          {/* Habit reminders */}
          {activeHabits.length > 0 && (
            <div className="p-4 rounded-2xl bg-card shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-body">Smart reminders</p>
                  <p className="text-sm font-medium">Stay on track with gentle nudges</p>
                </div>
              </div>
              <div className="space-y-3">
                {activeHabits.map(habit => (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = getHabitIconByTitle(habit.title);
                        return <Icon className="w-5 h-5 text-muted-foreground" />;
                      })()}
                      <div>
                        <p className="text-sm font-medium">{habit.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {habit.smartReminderEnabled ? 'Smart reminders on' : 'Smart reminders off'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {habit.smartReminderEnabled && (
                        <input
                          type="time"
                          className="rounded-xl bg-background border border-border px-2 py-1 text-xs"
                          value={habit.reminderTime ?? habit.timeOfDay}
                          onChange={e =>
                            updateHabit(habit.id, {
                              reminderTime: e.target.value,
                            })
                          }
                        />
                      )}
                      <button
                        onClick={() =>
                          updateHabit(habit.id, {
                            smartReminderEnabled: !habit.smartReminderEnabled,
                          })
                        }
                        className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                          habit.smartReminderEnabled ? 'bg-primary' : 'bg-muted'
                        }`}
                        aria-label="Toggle smart reminders"
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-background shadow-sm transform transition-transform ${
                            habit.smartReminderEnabled ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sound */}
          <div className="p-4 rounded-2xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1 font-body">Feedback</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sound effects</p>
                <p className="text-[11px] text-muted-foreground">Tick on hold, chime on completion</p>
              </div>
              <button
                onClick={() => setSoundEnabled(!state.soundEnabled)}
                className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                  state.soundEnabled ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label="Toggle sound effects"
              >
                <div
                  className={`w-5 h-5 rounded-full bg-background shadow-sm transform transition-transform ${
                    state.soundEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset */}
          <div className="pt-8">
            <button
              onClick={() => {
                if (window.confirm('This will reset all your data. Are you sure?')) {
                  resetApp();
                  window.location.href = '/';
                }
              }}
              className="w-full py-3 rounded-2xl bg-destructive/10 text-destructive font-medium text-sm"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>
      <TabBar />
    </div>
  );
}
