-- RetroOS 98 Supabase schema
-- Defines user profile and notes tables. Run in Supabase SQL Editor or add to a migration.

-- Ensure UUID generation is available for default values
create extension if not exists "pgcrypto";

-- Profiles table keeps a lightweight user profile linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  username text,
  created_at timestamptz default now()
);

-- Notes table stores user-owned notes (used by the Win98 Notes app)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Keep updated_at fresh on changes (optional, helpful for sorting)
create or replace function public.handle_notes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists notes_updated_at on public.notes;
create trigger notes_updated_at
before update on public.notes
for each row
execute procedure public.handle_notes_updated_at();
