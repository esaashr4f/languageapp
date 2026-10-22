-- One save per signed-in player. Run in the Supabase SQL editor.
create table if not exists public.saves (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.saves enable row level security;

create policy "Players can read their own save"
  on public.saves for select using (auth.uid() = user_id);

create policy "Players can create their own save"
  on public.saves for insert with check (auth.uid() = user_id);

create policy "Players can update their own save"
  on public.saves for update using (auth.uid() = user_id);

-- Conversation allowance per player. Only the server (service-role key) writes here;
-- players can read their own row to see their plan and what's left.
create table if not exists public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'plus')),
  period_start timestamptz not null default now(),
  replies_used integer not null default 0,
  credits integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

create policy "Players can read their own allowance"
  on public.entitlements for select using (auth.uid() = user_id);
