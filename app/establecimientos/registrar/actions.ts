'use server';
import { createClient } from '@/lib/supabase/server';
import { registerEstablishment, type FieldErrors } from '@/lib/establishments';
export type RegistrationState = { error?: string; errors?: FieldErrors; success?: boolean };
export async function saveEstablishment(_: RegistrationState, form: FormData): Promise<RegistrationState> {
 const client = await createClient(); if (!client) return { error: 'El servicio no está configurado.' };
 const result = await registerEstablishment({
  async identity() { const { data, error } = await client.auth.getUser(); if (error || !data.user) return null; const { data: profile, error: profileError } = await client.from('profiles').select('id, role').eq('id', data.user.id).maybeSingle(); return profileError || !profile || profile.id !== data.user.id ? null : { id: data.user.id, role: profile.role }; },
  async insert(owner, data) { const { error } = await client.from('establishments').insert({ owner_id: owner, ...data }); return !error ? 'ok' : error.code === '23505' ? 'duplicate' : 'error'; },
 }, form);
 if (result.status === 'unauthenticated') return { error: 'Tu sesión ha terminado. Inicia sesión nuevamente.' };
 if (result.status === 'forbidden') return { error: 'Tu cuenta no tiene permiso para registrar establecimientos.' };
 if (result.status === 'invalid') return { error: result.error || 'Revisa los campos indicados.', errors: result.errors };
 if (result.status === 'duplicate') return { error: 'Ya registraste un establecimiento con ese nombre y ubicación.' };
 if (result.status === 'error') return { error: 'No se pudo registrar el establecimiento. Inténtalo nuevamente.' };
 return { success: true };
}
