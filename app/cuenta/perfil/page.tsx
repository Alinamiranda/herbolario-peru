import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/actions';
import { ProfileForm } from '@/components/profile-form';
import { loadProfile } from '@/lib/profile';
import { profileStore } from '@/lib/profile-server';
import './profile.css';
export const instant = false;
const labels = { buyer: 'Comprador', seller: 'Vendedor', admin: 'Administrador' };
export default async function ProfilePage() {
 const store = await profileStore();
 if (!store) return <main className="profile-error"><h1>Mi perfil</h1><p>No se pudo conectar con el servicio de perfiles.</p><Link href="/cuenta">Volver a mi cuenta</Link></main>;
 const result = await loadProfile(store);
 if (result.status === 'unauthenticated') redirect('/login');
 if (result.status !== 'ok') return <main className="profile-error"><h1>Mi perfil</h1><p>No se pudo cargar tu perfil. Inténtalo nuevamente más tarde.</p><Link href="/cuenta">Volver a mi cuenta</Link></main>;
 const { profile } = result;
 const initials = profile.full_name.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0]).join('').toLocaleUpperCase('es');
 const date = new Date(profile.created_at);
 const registered = Number.isNaN(date.getTime()) ? 'No disponible' : new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' }).format(date);
 return <main className="profile-shell"><aside className="profile-sidebar"><Link className="brand" href="/">✳ <span>HERBOLARIO <small>PERÚ</small></span></Link><p className="profile-nav-title">MI CUENTA</p><nav aria-label="Navegación de cuenta"><Link href="/cuenta">← Mi cuenta</Link><Link className="active" href="/cuenta/perfil" aria-current="page">◉ Mi perfil</Link></nav><form action={signOut}><button>Cerrar sesión</button></form></aside><section className="profile-main"><div className="profile-inner"><Link className="profile-back" href="/cuenta">← Volver a mi cuenta</Link><header><span className="eyebrow">TU ESPACIO NATURAL</span><h1>Mi perfil</h1><p>Administra tu información personal</p></header><div className="profile-card"><div className="profile-summary"><div className="profile-avatar" aria-hidden="true">{initials}</div><div><span className="profile-role">{labels[profile.role]}</span><h2>{profile.full_name}</h2><p>{profile.email}</p></div></div><div className="profile-meta"><div><span>Correo electrónico</span><strong>{profile.email}</strong></div><div><span>Miembro desde</span><strong>{registered}</strong></div></div><ProfileForm name={profile.full_name} /></div></div></section></main>;
}
