'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { changeProfileName } from '@/lib/profile';
import { profileStore } from '@/lib/profile-server';
export type ProfileState = { error?: string; message?: string };
export async function saveProfile(_: ProfileState, form: FormData): Promise<ProfileState> {
 const store = await profileStore(); if (!store) return { error: 'No se pudo conectar con el servicio de perfiles.' };
 const result = await changeProfileName(store, form);
 if (result.status === 'unauthenticated') redirect('/login');
 if (result.status === 'invalid') return { error: result.error };
 if (result.status !== 'ok') return { error: 'No se pudo guardar el perfil. Inténtalo nuevamente.' };
 revalidatePath('/cuenta/perfil'); revalidatePath('/cuenta');
 return { message: 'Tus cambios se guardaron correctamente.' };
}
