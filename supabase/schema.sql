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
