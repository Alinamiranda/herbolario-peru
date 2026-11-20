import type { PublicEstablishment } from './directory';
export const DETAIL_COLUMNS = 'id,name,description,address,department,province,district,phone,is_active';
export function validEstablishmentId(id: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id); }
export function normalizePeruvianPhone(phone: string): string | undefined {
 const value = phone.trim();
 if (!/^(?:\+51\s*)?[\d ()-]+$/.test(value)) return undefined;
 let digits = value.replace(/\D/g, '');
 if (value.startsWith('+51')) digits = digits.slice(2);
 return /^(9\d{8}|[1-8]\d{7,8})$/.test(digits) ? `51${digits}` : undefined;
}
export function contactLinks(phone: string) {
 const number = normalizePeruvianPhone(phone); if (!number) return null;
 const message = 'Hola, encontré su establecimiento en Herbolario Perú y quisiera obtener más información.';
 return { phone: `tel:+${number}`, whatsapp: `https://wa.me/${number}?text=${encodeURIComponent(message)}` };
}
export function safeDirectoryReturn(value: string | string[] | undefined) {
 if (typeof value !== 'string' || value.length > 800 || /[\u0000-\u001f\u007f]/.test(value)) return '/directorio';
 try { const url = new URL(value, 'https://local.invalid'); if (url.origin !== 'https://local.invalid' || url.pathname !== '/directorio' || url.hash) return '/directorio'; return `/directorio${url.search}`; } catch { return '/directorio'; }
}
export type DetailStore = { read(id: string): Promise<{ data: (PublicEstablishment & { is_active: boolean }) | null; error: boolean }> };
export async function getEstablishment(store: DetailStore, id: string) {
 if (!validEstablishmentId(id)) return { status: 'not-found' as const };
 const { data, error } = await store.read(id);
 if (error) return { status: 'error' as const };
 if (!data || data.is_active !== true || data.id.toLowerCase() !== id.toLowerCase()) return { status: 'not-found' as const };
 return { status: 'ok' as const, data };
}
