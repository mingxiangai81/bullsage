-- Fixes "Database error saving new user" on every registration.
--
-- Root cause (confirmed against live schema): handle_new_user() inserts
-- plan = 'trial' for new signups, but profiles_plan_check only allowed
-- 'free' | 'single' | 'pro' | 'lifetime' — so every signup's profile
-- insert violated the CHECK constraint inside the AFTER INSERT trigger,
-- which Supabase Auth surfaces as the generic "Database error saving
-- new user".
alter table public.profiles drop constraint profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check
  check (plan in ('trial', 'free', 'single', 'pro', 'lifetime'));

-- Defensive hardening: never let a future profile-row failure block
-- account creation. If something else about this insert breaks later,
-- log a warning instead of aborting the signup transaction.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  insert into public.profiles (
    id,
    display_name,
    full_name,
    country,
    date_of_birth,
    plan,
    trial_reports_used,
    trial_expires_at,
    is_trial
  )
  values (
    new.id,
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'country',
    (new.raw_user_meta_data->>'date_of_birth')::date,
    'trial',
    0,
    now() + interval '7 days',
    true
  );
  return new;
exception when others then
  raise warning 'handle_new_user failed for user %: %', new.id, sqlerrm;
  return new;
end;
$function$;
