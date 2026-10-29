-- Tracker schema (Phase 1.2). Run in the Supabase SQL Editor.
-- Rows are tied to auth.users so Row Level Security (1.4) can scope them to one user.

create table if not exists public.entries (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entry_date          date not null,
  period              text not null check (period in ('AM', 'PM')),

  -- Morning fields
  waking_pain         smallint check (waking_pain between 0 and 10),
  sleep_hours         numeric(3, 1) check (sleep_hours between 0 and 24),
  sleep_quality       smallint check (sleep_quality between 1 and 5),
  starting_capacity   smallint check (starting_capacity between 0 and 100),

  -- Evening fields
  end_pain            smallint check (end_pain between 0 and 10),
  -- { type, minutes, effort }. type is the label of an 'exercise_type' custom option.
  exercise            jsonb,
  activities          text[] not null default '{}',
  symptoms            text[] not null default '{}',
  stress              smallint check (stress between 0 and 10),
  remaining_capacity  smallint check (remaining_capacity between 0 and 100),

  note                text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- One AM and one PM entry per day. Saving again edits the existing row (upsert on this key).
  constraint entries_user_date_period_key unique (user_id, entry_date, period)
);

create table if not exists public.custom_options (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind        text not null check (kind in ('symptom', 'activity', 'exercise_type')),
  label       text not null check (length(trim(label)) > 0),
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- RLS is on from the start. With no policies yet, anon and authenticated keys can read
-- and write nothing. The owner-only policies are added in step 1.4.
alter table public.entries enable row level security;
alter table public.custom_options enable row level security;

-- Owner-only policies (step 1.4). A signed-in user can read and write only rows whose
-- user_id matches their own auth id. Signups are turned off in the dashboard, so that
-- account is the only one that exists. Anon (signed-out) requests match no policy and are refused.
drop policy if exists "entries: owner only" on public.entries;
create policy "entries: owner only" on public.entries
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "custom_options: owner only" on public.custom_options;
create policy "custom_options: owner only" on public.custom_options
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
