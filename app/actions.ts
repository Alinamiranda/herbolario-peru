'use server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { validateAuth } from '@/lib/validation';
export type AuthState = { error?: string; message?: string };
export async function login(_: AuthState, form: FormData): Promise<AuthState> {
 const error = validateAuth(form, false); if (error) return { error };
 const client = await createClient(); if (!client) return { error: 'El servicio de autenticación aún no está configurado.' };
 const result = await client.auth.signInWithPassword({ email: String(form.get('email')).trim(), password: String(form.get('password')) });
 if (result.error) return { error: 'No se pudo iniciar sesión. Revisa tus credenciales o confirma tu correo.' }; redirect('/cuenta');
}
export async function register(_: AuthState, form: FormData): Promise<AuthState> {
 const error = validateAuth(form, true); if (error) return { error };
 const client = await createClient(); const origin = process.env.NEXT_PUBLIC_SITE_URL; if (!client || !origin) return { error: 'El servicio de autenticación aún no está configurado.' };
 const result = await client.auth.signUp({ email: String(form.get('email')).trim(), password: String(form.get('password')), options: { emailRedirectTo: `${origin}/auth/callback`, data: { full_name: String(form.get('name')).trim(), role: String(form.get('role')) } } });
 if (result.error) {
  // Temporary server-side diagnostics. Emit one string so Next's log preserves it.
  // Only inspect known error fields and redact submitted values and secrets.
  const providerError = result.error as typeof result.error & { details?: unknown; hint?: unknown };
  const secrets = [String(form.get('email') || ''), String(form.get('password') || ''), String(form.get('name') || ''), process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''].filter(Boolean);
  const safe = (value: unknown) => {
   if (value == null) return '(no disponible)';
   let text: string;
   try { text = typeof value === 'string' ? value : JSON.stringify(value) ?? String(value); } catch { return '(no serializable)'; }
   for (const secret of secrets) text = text.split(secret).join('[REDACTADO]');
   return text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[CORREO]').replace(/https?:\/\/[^\s"']+/gi, '[URL]').replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[TOKEN]').replace(/\b(?:sb_publishable|sb_secret)_[A-Za-z0-9_-]+\b/g, '[CLAVE]');
  };
  console.error(`Supabase signUp failed: name=${safe(providerError.name)}; message=${safe(providerError.message)}; status=${safe(providerError.status)}; code=${safe(providerError.code)}; details=${safe(providerError.details)}; hint=${safe(providerError.hint)}`);
  return { error: 'No se pudo crear la cuenta. Inténtalo nuevamente más tarde.' };
 } if (result.data.session) redirect('/cuenta');
 return { message: 'Si el correo puede registrarse, recibirás un enlace de confirmación. Revisa tu bandeja de entrada.' };
}
export async function signOut() { const client = await createClient(); if (client) await client.auth.signOut(); redirect('/'); }
export async function resetPassword(_: AuthState, form: FormData): Promise<AuthState> {
 const email = String(form.get('email') || '').trim(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Ingresa un correo electrónico válido.' };
 const client = await createClient(); const origin = process.env.NEXT_PUBLIC_SITE_URL; if (!client || !origin) return { error: 'El servicio de autenticación aún no está configurado.' };
 await client.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=/restablecer` }); return { message: 'Si existe una cuenta con ese correo, recibirás instrucciones para recuperar tu contraseña.' };
}
export async function updatePassword(_: AuthState, form: FormData): Promise<AuthState> {
 const password = String(form.get('password') || ''); if (password.length < 8 || password.length > 72 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return { error: 'La contraseña debe tener entre 8 y 72 caracteres, con al menos una letra y un número.' };
 if (password !== form.get('confirmPassword')) return { error: 'Las contraseñas no coinciden.' }; const client = await createClient(); if (!client) return { error: 'El servicio de autenticación aún no está configurado.' };
 const { data: { user } } = await client.auth.getUser(); if (!user) return { error: 'El enlace ha expirado. Solicita uno nuevo.' };
 const { error } = await client.auth.updateUser({ password }); if (error) return { error: 'No se pudo actualizar la contraseña. Solicita un nuevo enlace.' }; await client.auth.signOut(); redirect('/login');
}
