import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EstablishmentForm } from './registration-form';
import './registration.css';
export const instant = false;
export default async function RegisterEstablishmentPage() {
 const client = await createClient();
 if (!client) return <main className="registration-message"><h1>Servicio no disponible</h1><p>No se pudo conectar con el servicio de establecimientos.</p><Link href="/cuenta">Volver a mi cuenta</Link></main>;
 const { data: { user } } = await client.auth.getUser(); if (!user) redirect('/login');
 const { data: profile, error } = await client.from('profiles').select('role').eq('id', user.id).maybeSingle();
 if (error || !profile || !['seller', 'admin'].includes(profile.role)) return <main className="registration-message"><h1>Acceso restringido</h1><p>Esta sección está disponible para vendedores y administradores.</p><Link href="/cuenta">Volver a mi cuenta</Link></main>;
 return <EstablishmentForm />;
}
