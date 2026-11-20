create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
-- Profiles are created only by this trigger. Client roles have no INSERT, UPDATE or DELETE policy.
create function public.create_profile_for_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, left(coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'Usuario'), 100), coalesce(new.email, ''), case when new.raw_user_meta_data->>'role' = 'seller' then 'seller' else 'buyer' end);
  return new;
end;
$$;
revoke all on function public.create_profile_for_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.create_profile_for_user();
