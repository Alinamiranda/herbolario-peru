-- Review existing grants and policies in the live database before applying.
-- Remove table-wide reads so the owner identifier and timestamps remain private.
revoke select on public.establishments from public, anon, authenticated;
revoke select (id, owner_id, name, description, address, department, province, district, phone, created_at, updated_at) on public.establishments from public, anon, authenticated;
grant select (id, name, description, address, department, province, district, phone) on public.establishments to authenticated;

create policy "Authenticated users can view directory establishments"
on public.establishments for select to authenticated using (true);

-- One JSON value avoids PostgREST's row limit truncating the location hierarchy.
-- SECURITY INVOKER keeps the caller's RLS and column privileges in force.
create function public.directory_locations() returns jsonb
language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object('department', department, 'province', province, 'district', district) order by department, province, district), '[]'::jsonb)
  from (select distinct department, province, district from public.establishments) locations;
$$;
revoke all on function public.directory_locations() from public, anon;
grant execute on function public.directory_locations() to authenticated;
