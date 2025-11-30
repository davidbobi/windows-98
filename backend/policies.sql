-- Row Level Security policies for RetroOS 98
-- Enforces per-user access on profiles and notes

alter table public.profiles enable row level security;
alter table public.notes enable row level security;

-- Profiles: users can see only their own profile row
create policy "Profiles: select own" on public.profiles
  for select using (id = auth.uid());

-- Profiles: users can insert only their own profile row
create policy "Profiles: insert own" on public.profiles
  for insert with check (id = auth.uid());

-- Profiles: users can update only their own profile row
create policy "Profiles: update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Profiles: users can delete only their own profile row
create policy "Profiles: delete own" on public.profiles
  for delete using (id = auth.uid());

-- Notes: users can read only their own notes
create policy "Notes: select own" on public.notes
  for select using (user_id = auth.uid());

-- Notes: users can insert notes owned by themselves
create policy "Notes: insert own" on public.notes
  for insert with check (user_id = auth.uid());

-- Notes: users can update only their own notes
create policy "Notes: update own" on public.notes
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Notes: users can delete only their own notes
create policy "Notes: delete own" on public.notes
  for delete using (user_id = auth.uid());
