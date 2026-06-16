-- Feedback table for the /feedback page
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  rating int not null,
  category text,
  message text not null,
  email text,
  language text default 'zh',
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "Anyone can submit feedback" on public.feedback;
create policy "Anyone can submit feedback" on public.feedback
  for insert with check (true);

drop policy if exists "Users can view own feedback" on public.feedback;
create policy "Users can view own feedback" on public.feedback
  for select using (auth.uid() = user_id);
