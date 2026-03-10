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

-- Optional: RLS policies so each user only sees their own data
alter table users enable row level security;
alter table habits enable row level security;
alter table habit_completions enable row level security;
alter table user_streaks enable row level security;

create policy "Users can read own row" on users for select using (auth.uid() = id);
create policy "Users can update own row" on users for update using (auth.uid() = id);
create policy "Users can insert own row" on users for insert with check (auth.uid() = id);

create policy "Users can read own habits" on habits for select using (auth.uid() = user_id);
create policy "Users can insert own habits" on habits for insert with check (auth.uid() = user_id);
create policy "Users can update own habits" on habits for update using (auth.uid() = user_id);

create policy "Users can read own completions" on habit_completions for select using (auth.uid() = user_id);
create policy "Users can insert own completions" on habit_completions for insert with check (auth.uid() = user_id);
create policy "Users can delete own completions" on habit_completions for delete using (auth.uid() = user_id);

create policy "Users can read own streaks" on user_streaks for select using (auth.uid() = user_id);
create policy "Users can insert own streaks" on user_streaks for insert with check (auth.uid() = user_id);
create policy "Users can update own streaks" on user_streaks for update using (auth.uid() = user_id);
