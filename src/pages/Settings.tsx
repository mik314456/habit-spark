import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { getHabitIconByTitle } from '@/lib/habitIcons';
import { useApp } from '@/contexts/AppContext';
import TabBar from '@/components/TabBar';
import { Moon, Sun, AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
  const { state, resetApp, updateHabit, updateIdentityStatement, setSoundEnabled } = useApp();
  const { theme, setTheme } = useTheme();
  const { userId } = useAuth();
  const [identityDraft, setIdentityDraft] = useState(state.identityStatement ?? '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const activeHabits = useMemo(
    () => state.habits.filter(h => !h.archived),
    [state.habits],
  );

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen pb-24 bg-page">
      <div className="max-w-md mx-auto px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl mb-1 font-body font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mb-7 font-body">
            Tune how the app looks, feels, and nudges you.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Appearance */}
          <section>
            <p className="text-[11px] font-body uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Appearance
            </p>
            <div className="rounded-[20px] border border-border-strong bg-card-surface px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="w-5 h-5 text-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium font-body text-foreground">
                      {isDark ? 'Dark mode' : 'Light mode'}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-body">
                      {isDark ? 'Switch to light theme.' : 'Switch to dark theme.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                    isDark ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-primary-foreground shadow-sm transform transition-transform ${
                      isDark ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Identity */}
          <section>
            <p className="text-[11px] font-body uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Identity
            </p>
            <div className="rounded-[20px] border border-border-strong bg-card-surface px-4 py-4 space-y-3">
              <div>
                <p className="text-sm font-medium font-body text-foreground">Who you&apos;re becoming</p>
                <p className="text-[11px] text-muted-foreground font-body">
                  Shows on Today and pre-fills your habit &ldquo;why&rdquo; text.
                </p>
              </div>
              <input
                type="text"
                value={identityDraft}
                onChange={e => setIdentityDraft(e.target.value.slice(0, 60))}
                onBlur={() => updateIdentityStatement(identityDraft.trim())}
                placeholder="e.g. A healthy person"
                className="w-full rounded-xl border border-border bg-card-surface-deep px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </section>

          {/* Stats */}
          <section>
            <p className="text-[11px] font-body uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Stats
            </p>
            <div className="rounded-[20px] border border-border-strong bg-card-surface px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl border border-border bg-card-surface-deep">
                  <p className="text-[11px] text-muted-foreground font-body mb-1">Active habits</p>
                  <p className="text-2xl font-body font-semibold tabular-nums text-foreground">
                    {activeHabits.length}
                  </p>
                </div>
                <div className="p-3 rounded-2xl border border-border bg-card-surface-deep">
                  <p className="text-[11px] text-muted-foreground font-body mb-1">
                    Total completions
                  </p>
                  <p className="text-2xl font-body font-semibold tabular-nums text-foreground">
                    {state.habitLogs.filter(l => l.completed).length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <p className="text-[11px] font-body uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Preferences
            </p>
            <div className="space-y-3">
              {activeHabits.length > 0 && (
                <div className="rounded-[20px] border border-border-strong bg-card-surface px-4 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium font-body text-foreground">Smart reminders</p>
                      <p className="text-[11px] text-muted-foreground font-body">
                        Gentle nudges at the right time.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {activeHabits.map(habit => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card-surface-deep px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          {(() => {
                            const Icon = getHabitIconByTitle(habit.title);
                            return <Icon className="w-5 h-5 text-muted-foreground" />;
                          })()}
                          <div>
                            <p className="text-sm font-medium font-body text-foreground">{habit.title}</p>
                            <p className="text-[11px] text-muted-foreground font-body">
                              {habit.smartReminderEnabled
                                ? 'Smart reminders on'
                                : 'Smart reminders off'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {habit.smartReminderEnabled && (
                            <input
                              type="time"
                              className="rounded-xl border border-border bg-card-surface px-2 py-1 text-xs font-body text-foreground"
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
                              className={`w-5 h-5 rounded-full bg-primary-foreground shadow-sm transform transition-transform ${
                                habit.smartReminderEnabled ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-[20px] border border-border-strong bg-card-surface px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium font-body text-foreground">Sound effects</p>
                    <p className="text-[11px] text-muted-foreground font-body">
                      Tick on hold, chime on completion.
                    </p>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!state.soundEnabled)}
                    className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                      state.soundEnabled ? 'bg-primary' : 'bg-muted'
                    }`}
                    aria-label="Toggle sound effects"
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-primary-foreground shadow-sm transform transition-transform ${
                        state.soundEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Reset */}
          <section className="pt-4">
            <p className="text-[11px] font-body uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Danger zone
            </p>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-3 rounded-2xl bg-destructive/10 text-destructive font-medium text-sm font-body"
            >
              Reset all data
            </button>
          </section>
        </div>
      </div>
      <TabBar />

      {/* Premium reset confirmation overlay */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm mx-5 rounded-3xl border border-border-strong bg-card-surface px-5 py-6 shadow-elevated"
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-semibold font-body text-foreground">
                    Reset everything?
                  </p>
                  <p className="text-[11px] text-muted-foreground font-body">
                    This clears habits, history, identity, and your cloud backup.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-card-surface-deep border border-border px-4 py-3 mb-4">
                <p className="text-[11px] text-muted-foreground font-body">
                  You&apos;ll be signed out and taken back to onboarding. This can&apos;t be undone.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 h-10 rounded-2xl border border-border bg-card text-sm font-medium font-body text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 h-10 rounded-2xl bg-destructive text-destructive-foreground text-sm font-medium font-body shadow-card"
                  onClick={async () => {
                    // 1. Delete Supabase data for this user (if configured)
                    if (isSupabaseConfigured() && supabase && userId) {
                      try {
                        await supabase.from('habit_completions').delete().eq('user_id', userId);
                        await supabase.from('habits').delete().eq('user_id', userId);
                        await supabase.from('users').delete().eq('id', userId);
                        await supabase.auth.signOut();
                      } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error('[settings] Supabase reset failed:', err);
                      }
                    }

                    // 2. Clear all localStorage keys for this origin
                    try {
                      window.localStorage.clear();
                    } catch {
                      // ignore
                    }

                    // 3. Reset in-memory app state
                    resetApp();

                    // 4. Hide modal and redirect to onboarding
                    setShowResetConfirm(false);
                    window.location.href = '/';
                  }}
                >
                  Yes, reset everything
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
