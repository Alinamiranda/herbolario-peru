export type Role = 'buyer' | 'seller' | 'admin';
export type Profile = { id: string; full_name: string; email: string; role: Role; created_at: string };
export function hasRole(role: unknown, allowed: readonly Role[]): boolean {
  return (role === 'buyer' || role === 'seller' || role === 'admin') && allowed.includes(role);
}
export function validateProfileForm(form: FormData): { name?: string; error?: string } {
  // Server Actions may contain framework-generated $ACTION_ fields.
  for (const key of form.keys()) if (key !== 'full_name' && !key.startsWith('$ACTION_')) return { error: 'La solicitud contiene campos no permitidos.' };
  const values = form.getAll('full_name');
  if (values.length !== 1 || typeof values[0] !== 'string') return { error: 'Ingresa tu nombre completo.' };
  const name = values[0].trim();
  if (Array.from(name).length < 2 || Array.from(name).length > 100 || /[\u0000-\u001f\u007f]/.test(name)) return { error: 'El nombre debe tener entre 2 y 100 caracteres válidos.' };
  return { name };
}

export type ProfileStore = {
  user(): Promise<{ id: string } | null>;
  read(id: string): Promise<Profile | null>;
  updateName(id: string, name: string): Promise<boolean>;
};
export async function loadProfile(store: ProfileStore) {
  const user = await store.user();
  if (!user) return { status: 'unauthenticated' as const };
  const profile = await store.read(user.id);
  if (!profile || profile.id !== user.id || !hasRole(profile.role, ['buyer', 'seller', 'admin'])) return { status: 'unavailable' as const };
  return { status: 'ok' as const, profile };
}
export async function changeProfileName(store: ProfileStore, form: FormData) {
  const user = await store.user();
  if (!user) return { status: 'unauthenticated' as const };
  const input = validateProfileForm(form);
  if (!input.name) return { status: 'invalid' as const, error: input.error };
  const updated = await store.updateName(user.id, input.name);
  return updated ? { status: 'ok' as const } : { status: 'unavailable' as const };
}
