import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { type ProfileStore, type Profile, type Role, hasRole } from '@/lib/profile';

export async function profileStore(): Promise<ProfileStore | null> {
 const client = await createClient(); if (!client) return null;
 return {
  async user() { const { data, error } = await client.auth.getUser(); return error ? null : data.user; },
  async read(id) { const { data, error } = await client.from('profiles').select('id, full_name, email, role, created_at').eq('id', id).maybeSingle(); return error ? null : data as Profile | null; },
  async updateName(id, name) { const { data, error } = await client.from('profiles').update({ full_name: name }).eq('id', id).select('id').maybeSingle(); return !error && data?.id === id; },
 };
}
// Call on the server for every role-restricted action or resource; never trust user metadata.
export async function authorizeRoles(allowed: readonly Role[]) {
 const store = await profileStore(); if (!store) return null;
 const user = await store.user(); if (!user) return null;
 const profile = await store.read(user.id);
 return profile && profile.id === user.id && hasRole(profile.role, allowed) ? profile : null;
}
