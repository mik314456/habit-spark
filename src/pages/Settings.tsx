import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getHabitIconByTitle } from '@/lib/habitIcons';
import { useApp } from '@/contexts/AppContext';
import TabBar from '@/components/TabBar';

export default function Settings() {
  const { state, resetApp, updateHabit, updateIdentityStatement, setSoundEnabled } = useApp();
  const [identityDraft, setIdentityDraft] = useState(state.identityStatement ?? '');

  const activeHabits = useMemo(
    () => state.habits.filter(h => !h.archived),
    [state.habits],
  );

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#080808' }}>
      <div className="max-w-md mx-auto px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl mb-1 font-body font-semibold text-white">Settings</h1>
          <p className="text-sm text-white/60 mb-7 font-body">
            Tune how the app looks, feels, and nudges you.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Appearance */}
          <section>
            <p className="text-[11px] font-body uppercase tracking-[0.18em] text-white/50 mb-2">
              Appearance
            </p>
            <div className="rounded-[20px] border px-4 py-4" style={{ backgroundColor: '#111111', borderColor: '#222222' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium font-body">Dark mode</p>
                  <p className="text-[11px] text-muted-foreground font-body">
                    Always on. The app uses a dark theme.
                  </p>
                </div>
                <div
                  className="w-11 h-6 rounded-full flex items-center px-0.5 bg-primary cursor-default"
                  aria-label="Dark mode always on"
                >
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm transform translate-x-5" />
                </div>
              </div>
            </div>
          </section>

          {/* Identity */}
          <section>
            <p className="text-[11px] font-body uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Identity
            </p>
            <div className="rounded-[20px] border px-4 py-4 space-y-3" style={{ backgroundColor: '#111111', borderColor: '#222222' }}>
              <div>
                <p className="text-sm font-medium font-body text-white">Who you&apos;re becoming</p>
                <p className="text-[11px] text-white/60 font-body">
                  Shows on Today and pre-fills your habit &ldquo;why&rdquo; text.
                </p>
              </div>
              <input
                type="text"
                value={identityDraft}
                onChange={e => setIdentityDraft(e.target.value.slice(0, 60))}
                onBlur={() => updateIdentityStatement(identityDraft.trim())}
                placeholder="e.g. A healthy person"
                className="w-full rounded-xl border px-3 py-2 text-sm font-body text-white placeholder:text-white/40"
                style={{ backgroundColor: '#0d0d0d', borderColor: '#222222' }}
              />
            </div>
          </section>

          {/* Stats */}
          <section>
            <p className="text-[11px] font-body uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Stats
            </p>
            <div className="rounded-[20px] border px-4 py-4" style={{ backgroundColor: '#111111', borderColor: '#222222' }}>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl border" style={{ backgroundColor: '#0d0d0d', borderColor: '#222222' }}>
                  <p className="text-[11px] text-white/60 font-body mb-1">Active habits</p>
                  <p className="text-2xl font-body font-semibold tabular-nums text-white">
                    {activeHabits.length}
                  </p>
                </div>
                <div className="p-3 rounded-2xl border" style={{ backgroundColor: '#0d0d0d', borderColor: '#222222' }}>
                  <p className="text-[11px] text-white/60 font-body mb-1">
                    Total completions
                  </p>
                  <p className="text-2xl font-body font-semibold tabular-nums text-white">
                    {state.habitLogs.filter(l => l.completed).length}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <p className="text-[11px] font-body uppercase tracking-[0.18em] text-white/50 mb-2">
              Preferences
            </p>
            <div className="space-y-3">
              {activeHabits.length > 0 && (
                <div className="rounded-[20px] border px-4 py-4 space-y-3" style={{ backgroundColor: '#111111', borderColor: '#222222' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium font-body text-white">Smart reminders</p>
                      <p className="text-[11px] text-white/60 font-body">
                        Gentle nudges at the right time.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {activeHabits.map(habit => (
                      <div
                        key={habit.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border px-3 py-2"
                        style={{ backgroundColor: '#0d0d0d', borderColor: '#222222' }}
                      >
                        <div className="flex items-center gap-3">
                          {(() => {
                            const Icon = getHabitIconByTitle(habit.title);
                            return <Icon className="w-5 h-5 text-white/60" />;
                          })()}
                          <div>
                            <p className="text-sm font-medium font-body text-white">{habit.title}</p>
                            <p className="text-[11px] text-white/60 font-body">
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
                              className="rounded-xl border px-2 py-1 text-xs font-body text-white"
                              style={{ backgroundColor: '#111111', borderColor: '#222222' }}
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
                              habit.smartReminderEnabled ? 'bg-primary' : 'bg-white/10'
                            }`}
                            aria-label="Toggle smart reminders"
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
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

              <div className="rounded-[20px] border px-4 py-4" style={{ backgroundColor: '#111111', borderColor: '#222222' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium font-body text-white">Sound effects</p>
                    <p className="text-[11px] text-white/60 font-body">
                      Tick on hold, chime on completion.
                    </p>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!state.soundEnabled)}
                    className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-colors ${
                      state.soundEnabled ? 'bg-primary' : 'bg-white/10'
                    }`}
                    aria-label="Toggle sound effects"
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                        state.soundEnabled ? 'translate-x-5' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Reset */}
          <section className="pt-4">
            <p className="text-[11px] font-body uppercase tracking-[0.18em] text-white/50 mb-2">
              Danger zone
            </p>
            <button
              onClick={() => {
                if (window.confirm('This will reset all your data. Are you sure?')) {
                  resetApp();
                  window.location.href = '/';
                }
              }}
              className="w-full py-3 rounded-2xl bg-destructive/10 text-destructive font-medium text-sm font-body"
            >
              Reset all data
            </button>
          </section>
        </div>
      </div>
      <TabBar />
    </div>
  );
}
