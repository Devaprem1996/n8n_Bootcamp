-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text default 'intern' check (role in ('intern', 'admin')),
  resume_url text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Policies for profiles (drop existing to avoid errors if re-running)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'intern');
  return new;
end;
$$;

-- Drop trigger if exists to avoid duplication error (or replace handles function, but trigger needs care)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Update Intern Progress Table
-- Create table if it doesn't exist
create table if not exists public.intern_progress (
  id uuid default uuid_generate_v4() primary key,
  intern_id uuid references auth.users(id) not null,
  user_email text,
  completed_tasks boolean[] default '{}',
  task_notes jsonb default '{}'::jsonb,
  progress_percent integer default 0,
  cohort text default 'default',
  last_updated timestamp with time zone default timezone('utc'::text, now())
);

-- SAFELY ADD CATEGORY COLUMN
-- This block checks if the column exists, and adds it if it doesn't.
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'intern_progress' and column_name = 'category') then
        alter table public.intern_progress add column category text default 'n8n' not null;
    end if;
end $$;

-- Add unique constraint so a user has one row per category
-- Drop first to allow re-running
alter table public.intern_progress 
  drop constraint if exists unique_user_category;

alter table public.intern_progress 
  add constraint unique_user_category unique (intern_id, category);

-- RLS for progress
alter table public.intern_progress enable row level security;

drop policy if exists "Users can view own progress" on intern_progress;
create policy "Users can view own progress"
  on intern_progress for select
  using ( auth.uid() = intern_id );

drop policy if exists "Users can update own progress" on intern_progress;
create policy "Users can update own progress"
  on intern_progress for insert
  with check ( auth.uid() = intern_id );

drop policy if exists "Users can update own progress rows" on intern_progress;
create policy "Users can update own progress rows"
  on intern_progress for update
  using ( auth.uid() = intern_id );

-- Admin policies
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles"
  on profiles for select
  using ( 
    auth.uid() in (select id from profiles where role = 'admin')
  );

drop policy if exists "Admins can view all progress" on intern_progress;
create policy "Admins can view all progress"
  on intern_progress for select
  using ( 
    auth.uid() in (select id from profiles where role = 'admin')
  );
