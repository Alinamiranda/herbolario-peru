-- Review the live schema before applying. This intentionally fails if the table already exists.
create table public.establishments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  name text not null check (char_length(trim(name)) between 3 and 120),
  description text not null check (char_length(trim(description)) between 20 and 2000),
  address text not null check (char_length(trim(address)) between 5 and 200),
  department text not null check (char_length(trim(department)) between 2 and 100),
  province text not null check (char_length(trim(province)) between 2 and 100),
  district text not null check (char_length(trim(district)) between 2 and 100),
  phone text not null check (phone ~ '^(9[0-9]{8}|[1-8][0-9]{7,8})$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index establishments_owner_location_name_unique on public.establishments (owner_id, lower(trim(name)), lower(trim(address)), lower(trim(department)), lower(trim(province)), lower(trim(district)));
alter table public.establishments enable row level security;
revoke all on public.establishments from public, anon, authenticated;
grant select on public.establishments to authenticated;
grant insert (owner_id, name, description, address, department, province, district, phone) on public.establishments to authenticated;
create policy "Owners can view establishments" on public.establishments for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Sellers and admins can create own establishments" on public.establishments for insert to authenticated with check (
  owner_id = (select auth.uid()) and exists (select 1 from public.profiles where id = (select auth.uid()) and role in ('seller', 'admin'))
);
