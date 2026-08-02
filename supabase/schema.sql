-- Supabase Database Schema for CodeLens

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  code text not null,
  mode text not null,
  result jsonb not null,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.analyses enable row level security;

-- RLS Policies
create policy "Users can read own analyses" 
  on public.analyses for select 
  using (auth.uid() = user_id);

create policy "Users can insert own analyses" 
  on public.analyses for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete own analyses" 
  on public.analyses for delete 
  using (auth.uid() = user_id);

-- Index for fast user_id & created_at queries
create index if not exists idx_analyses_user_created 
  on public.analyses (user_id, created_at desc);
