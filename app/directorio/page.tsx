import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DIRECTORY_ACTIVE, PAGE_SIZE, escapeLike, parseFilters, phoneHref, type Location, type PublicEstablishment } from '@/lib/directory';
import { Filters } from './filters';
import './directory.css';
export const instant = false;
export default async function Directory({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
 const client = await createClient();
 if (!client) return <main className="dir-notice"><h1>Directorio no disponible</h1><p>No se pudo conectar con el servicio.</p><Link href="/">Volver al inicio</Link></main>;
 const { data: { user }, error: authError } = await client.auth.getUser();
 if (authError || !user) redirect('/login');
 const parsed = parseFilters(await searchParams);
 if (!parsed.filters) return <main className="dir-notice"><h1>Filtros inválidos</h1><p>{parsed.error}</p><Link href="/directorio">Limpiar filtros</Link></main>;
 const filters = parsed.filters;
 const { data: locationData, error: locationError } = await client.rpc('directory_locations');
 if (locationError || !Array.isArray(locationData)) return <main className="dir-notice"><h1>Directorio no disponible</h1><p>No se pudieron cargar las ubicaciones. Inténtalo más tarde.</p><Link href="/cuenta">Volver a mi cuenta</Link></main>;
 const locations = (locationData as Location[]).filter(x => x && typeof x.department === 'string' && typeof x.province === 'string' && typeof x.district === 'string');
 let query = client.from('establishments').select('id,name,description,address,department,province,district,phone', { count: 'exact' }).eq('is_active', DIRECTORY_ACTIVE);
 if (filters.name) query = query.ilike('name', `%${escapeLike(filters.name)}%`);
 if (filters.department) query = query.eq('department', filters.department);
 if (filters.province) query = query.eq('province', filters.province);
 if (filters.district) query = query.eq('district', filters.district);
 const start = (filters.page - 1) * PAGE_SIZE;
 const { data, error, count } = await query.order('name').order('id').range(start, start + PAGE_SIZE - 1);
 const rows = (data || []) as PublicEstablishment[];
 const pageLink = (page: number) => { const p = new URLSearchParams(); for (const key of ['name','department','province','district'] as const) if (filters[key]) p.set(key, filters[key]); if (page > 1) p.set('page', String(page)); return `/directorio${p.size ? `?${p}` : ''}`; };
 return <main className="dir-shell"><header className="dir-header"><Link className="brand" href="/">✳ <span>HERBOLARIO <small>PERÚ</small></span></Link><nav aria-label="Navegación principal"><Link href="/">Inicio</Link><Link href="/directorio" aria-current="page">Directorio</Link><Link className="dir-account" href="/cuenta">Mi cuenta ↗</Link></nav></header><section className="dir-hero"><div className="dir-wrap"><span className="dir-eyebrow">CONEXIONES QUE FLORECEN ✳</span><h1>Encuentra tu <em>herbolario ideal.</em></h1><p>Descubre establecimientos naturistas cerca de tu localidad</p></div></section><div className="dir-wrap dir-content"><Filters key={`${filters.name}|${filters.department}|${filters.province}|${filters.district}`} locations={locations} initial={filters} /><div className="dir-results-heading"><div><span className="dir-eyebrow">DESCUBRE CERCA DE TI</span><h2>Establecimientos naturistas</h2></div>{!error && <span>{count ?? 0} {(count ?? 0) === 1 ? 'resultado' : 'resultados'}</span>}</div>{error ? <div className="dir-empty" role="alert"><h3>No se pudo cargar el directorio</h3><p>Inténtalo nuevamente más tarde.</p></div> : rows.length === 0 ? <div className="dir-empty"><span aria-hidden="true">❧</span><h3>No encontramos establecimientos</h3><p>Prueba con otros filtros para descubrir más lugares.</p><Link href="/directorio">Limpiar filtros →</Link></div> : <><div className="dir-grid">{rows.map(item => <article className="dir-card" key={item.id}><div className="dir-card-top"><span className="dir-card-icon" aria-hidden="true">✳</span><span className="dir-tag">NATURALEZA Y BIENESTAR</span></div><h3>{item.name}</h3><p className="dir-description">{item.description}</p><div className="dir-card-details"><p><span aria-hidden="true">⌖</span> {item.address}</p><p>{item.district}, {item.province}, {item.department}</p><p><span aria-hidden="true">☎</span> {item.phone}</p></div><Link className="dir-contact" href={`/establecimientos/${item.id}?returnTo=${encodeURIComponent(pageLink(filters.page))}`}>Ver detalles <span>→</span></Link>{phoneHref(item.phone) ? <a className="dir-contact" href={phoneHref(item.phone)}>Contactar <span>↗</span></a> : <span className="dir-contact-unavailable">Contacto no disponible</span>}</article>)}</div><nav className="dir-pagination" aria-label="Páginas de resultados">{filters.page > 1 && <Link href={pageLink(filters.page-1)}>← Anterior</Link>}<span>Página {filters.page}</span>{count !== null && start + PAGE_SIZE < count && <Link href={pageLink(filters.page+1)}>Siguiente →</Link>}</nav></>}</div><footer className="dir-footer"><strong>✳ HERBOLARIO PERÚ</strong><span>Conectando personas con la naturaleza.</span></footer></main>;
}
