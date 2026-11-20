-- Limit updates to the name even for direct requests to the Supabase API.
-- Review any additional grants and RLS policies already present in the project.
revoke update on public.profiles from public, anon, authenticated;
revoke update (id, full_name, email, role, created_at) on public.profiles from public, anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

create policy "Users can update their own name"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);
