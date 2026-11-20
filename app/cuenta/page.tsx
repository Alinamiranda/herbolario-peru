import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/actions';
export const instant = false;
export default async function Account() { const client = await createClient(); if (!client) redirect('/login'); const { data: { user } } = await client.auth.getUser(); if (!user) redirect('/login'); const { data: profile } = await client.from('profiles').select('full_name, role').eq('id', user.id).maybeSingle(); return <main className="account"><Link className="brand" href="/">✳ <span>HERBOLARIO <small>PERÚ</small></span></Link><div className="account-card"><span className="eyebrow">TU ESPACIO NATURAL</span><h1>Hola{profile?.full_name ? `, ${profile.full_name}` : ''}.</h1><p>Tu sesión está activa.</p><p>{user.email}</p>{profile && <p>Cuenta: {profile.role === 'seller' ? 'Vendedor' : profile.role === 'admin' ? 'Administrador' : 'Comprador'}</p>}<form action={signOut}><button className="primary">Cerrar sesión</button></form></div></main>; }
