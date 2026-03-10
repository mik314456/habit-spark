-- Habit Spark – Supabase schema
-- Run this in the Supabase SQL editor to create tables.
--
-- Before using: enable Anonymous sign-in in Supabase Dashboard
-- (Authentication → Providers → Anonymous → Enable).

create table users (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  name text,
  identity text
);

create table habits (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references users(id),
  title text not null,
  icon text,
  time text,
  location text,
  tiny_version text,
  identity text,
  is_active boolean default true,
  color text,
  reminder_time text
);

create table habit_completions (
  id uuid default gen_random_uuid() primary key,
  completed_at timestamp with time zone default now(),
  user_id uuid references users(id),
  habit_id uuid references habits(id),
  date text not null,
  completed boolean default true,
  skipped boolean default false
);

create table user_streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id),
  current_streak integer default 0,
  longest_streak integer default 0,
  last_completed_date text
);

-- RLS: one policy per table so authenticated users can do all operations on their own rows
alter table users enable row level security;
alter table habits enable row level security;
alter table habit_completions enable row level security;
alter table user_streaks enable row level security;

-- Drop any existing policies (names may vary from earlier versions)
drop policy if exists "Users can read own row" on users;
drop policy if exists "Users can update own row" on users;
drop policy if exists "Users can insert own row" on users;
drop policy if exists "Users can view own data" on users;
drop policy if exists "Users can insert own data" on users;
drop policy if exists "Users can update own data" on users;

drop policy if exists "Users can read own habits" on habits;
drop policy if exists "Users can insert own habits" on habits;
drop policy if exists "Users can update own habits" on habits;
drop policy if exists "Users can view own habits" on habits;

drop policy if exists "Users can read own completions" on habit_completions;
drop policy if exists "Users can insert own completions" on habit_completions;
drop policy if exists "Users can delete own completions" on habit_completions;
drop policy if exists "Users can view own completions" on habit_completions;

drop policy if exists "Users can read own streaks" on user_streaks;
drop policy if exists "Users can insert own streaks" on user_streaks;
drop policy if exists "Users can update own streaks" on user_streaks;
drop policy if exists "Users can view own streaks" on user_streaks;

create policy "Enable all for authenticated users" on users for all using (auth.uid() = id);
create policy "Enable all for authenticated users" on habits for all using (auth.uid() = user_id);
create policy "Enable all for authenticated users" on habit_completions for all using (auth.uid() = user_id);
create policy "Enable all for authenticated users" on user_streaks for all using (auth.uid() = user_id);
