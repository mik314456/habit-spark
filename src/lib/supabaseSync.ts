import { supabase } from '@/lib/supabase';
import type { Habit, HabitLog, AppState } from '@/lib/habitData';
import type { HabitColor } from '@/lib/habitData';

const DEFAULT_COLOR: HabitColor = 'coral';

/** DB row shape for habits table */
interface DbHabit {
  id: string;
  user_id: string;
  title: string;
  icon: string | null;
  time: string | null;
  location: string | null;
  tiny_version: string | null;
  identity: string | null;
  is_active: boolean;
  color: string | null;
  reminder_time: string | null;
  created_at: string;
}

/** DB row shape for habit_completions table */
interface DbCompletion {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  skipped: boolean;
  completed_at: string;
}

function dbHabitToHabit(row: DbHabit): Habit {
  return {
    id: row.id,
    title: row.title,
    action: row.tiny_version ?? row.title,
    icon: row.icon ?? '',
    color: (row.color as HabitColor) ?? DEFAULT_COLOR,
    timeOfDay: row.time ?? '09:00',
    location: row.location ?? '',
    why: row.identity ?? undefined,
    createdAt: row.created_at,
    archived: !row.is_active,
    smartReminderEnabled: !!row.reminder_time,
    reminderTime: row.reminder_time ?? row.time ?? '09:00',
  };
}

function habitToDbRow(habit: Omit<Habit, 'id' | 'createdAt' | 'archived'> & { id?: string; createdAt?: string }, userId: string) {
  return {
    user_id: userId,
    title: habit.title,
    icon: habit.icon || null,
    time: habit.timeOfDay || null,
    location: habit.location || null,
    tiny_version: habit.action || null,
    identity: habit.why || null,
    is_active: true,
    color: habit.color || null,
    reminder_time: habit.reminderTime ?? habit.timeOfDay ?? null,
  };
}

/**
 * Fetch user's identity from users table.
 */
export async function fetchUserIdentity(userId: string): Promise<string> {
  if (!supabase) return '';
  const { data, error } = await supabase.from('users').select('identity').eq('id', userId).single();
  if (error || !data) return '';
  return (data.identity as string) ?? '';
}

/**
 * Upsert user row (identity). Called on onboarding complete.
 */
export async function upsertUserIdentity(userId: string, identity: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('users').upsert(
    { id: userId, identity: identity || null },
    { onConflict: 'id' },
  );
}

/**
 * Fetch all habits for a user and convert to app Habit[].
 */
export async function fetchHabits(userId: string): Promise<Habit[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data as DbHabit[]).map(dbHabitToHabit);
}

/**
 * Fetch all habit_completions for a user and convert to HabitLog[].
 */
export async function fetchCompletions(userId: string): Promise<HabitLog[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .eq('user_id', userId);
  if (error) return [];
  return (data as DbCompletion[]).map(row => ({
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    completed: row.completed,
    skipped: row.skipped,
    completedAt: row.completed_at,
  }));
}

/**
 * Load full app state from Supabase (habits + completions + user identity).
 * Use local state for onboardingComplete, soundEnabled, milestoneCelebrations (not in DB yet).
 */
export async function fetchAppStateFromSupabase(userId: string): Promise<Partial<AppState>> {
  if (!supabase) return {};
  const [identity, habits, habitLogs] = await Promise.all([
    fetchUserIdentity(userId),
    fetchHabits(userId),
    fetchCompletions(userId),
  ]);
  return {
    identityStatement: identity,
    habits,
    habitLogs,
  };
}

/**
 * Insert a new habit and return the created Habit (with Supabase id).
 */
export async function insertHabit(
  userId: string,
  habit: Omit<Habit, 'id' | 'createdAt' | 'archived'>,
): Promise<Habit | null> {
  if (!supabase) return null;
  const row = habitToDbRow(habit, userId);
  const { data, error } = await supabase.from('habits').insert(row).select().single();
  if (error) return null;
  return dbHabitToHabit(data as DbHabit);
}

/**
 * Update habit (e.g. archive).
 */
export async function updateHabitInSupabase(
  userId: string,
  habitId: string,
  updates: { is_active?: boolean; title?: string; time?: string; location?: string; identity?: string },
): Promise<void> {
  if (!supabase) return;
  const payload: Record<string, unknown> = {};
  if (updates.is_active !== undefined) payload.is_active = updates.is_active;
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.time !== undefined) payload.time = updates.time;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.identity !== undefined) payload.identity = updates.identity;
  if (Object.keys(payload).length === 0) return;
  await supabase.from('habits').update(payload).eq('id', habitId).eq('user_id', userId);
}

/**
 * Insert or replace completion/skip for a habit on a date.
 */
export async function setCompletionInSupabase(
  userId: string,
  habitId: string,
  date: string,
  type: 'completed' | 'skipped' | null,
): Promise<void> {
  if (!supabase) return;
  const { data: existing } = await supabase
    .from('habit_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('habit_id', habitId)
    .eq('date', date)
    .maybeSingle();

  if (existing) {
    await supabase.from('habit_completions').delete().eq('id', existing.id);
  }
  if (type === 'completed') {
    await supabase.from('habit_completions').insert({
      user_id: userId,
      habit_id: habitId,
      date,
      completed: true,
      skipped: false,
    });
  } else if (type === 'skipped') {
    await supabase.from('habit_completions').insert({
      user_id: userId,
      habit_id: habitId,
      date,
      completed: false,
      skipped: true,
    });
  }
}
