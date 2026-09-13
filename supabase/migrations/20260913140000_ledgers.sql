-- Dedicated Zenith ledger. Apply only on a Zenith Supabase project.
-- Do not run this against FarmOps, Kanoz Daily Report, or PelletTrade.

create table if not exists public.ledgers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  store jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.ledgers enable row level security;

drop policy if exists ledgers_select_own on public.ledgers;
create policy ledgers_select_own
  on public.ledgers
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists ledgers_insert_own on public.ledgers;
create policy ledgers_insert_own
  on public.ledgers
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists ledgers_update_own on public.ledgers;
create policy ledgers_update_own
  on public.ledgers
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on table public.ledgers from anon;
grant select, insert, update on table public.ledgers to authenticated;
