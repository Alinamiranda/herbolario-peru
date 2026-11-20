-- Review live policies, inherited roles and grants before applying.
alter table public.establishments
  add column is_active boolean not null default true;

-- The application may read the state but cannot set it during insert or update.
revoke insert (is_active), update (is_active) on public.establishments from public, anon, authenticated;
revoke update on public.establishments from public, anon, authenticated;
grant select (is_active) on public.establishments to authenticated;

alter policy "Authenticated users can view directory establishments"
  on public.establishments using (is_active = true);

-- Restrictive SELECT policies are ANDed with all permissive SELECT policies.
-- Owners can still access their own inactive rows; other users cannot.
create policy "Inactive establishments are visible only to owners"
  on public.establishments as restrictive for select to authenticated
  using (is_active = true or owner_id = (select auth.uid()));

-- Exclude inactive locations even for their owner, whose RLS permits reading them.
create or replace function public.directory_locations() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('department', department, 'province', province, 'district', district) order by department, province, district), '[]'::jsonb)
  from (select distinct department, province, district
        from public.establishments where is_active = true) locations;
$$;
