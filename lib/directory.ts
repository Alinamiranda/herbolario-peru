export type Location = { department: string; province: string; district: string };
export type SearchFilters = { name: string; department: string; province: string; district: string; page: number };
export type PublicEstablishment = Location & { id: string; name: string; description: string; address: string; phone: string };
export const PAGE_SIZE = 20;
export function parseFilters(params: Record<string, string | string[] | undefined>): { filters?: SearchFilters; error?: string } {
 const keys = ['name', 'department', 'province', 'district'] as const;
 const values = {} as Record<typeof keys[number], string>;
 for (const key of keys) { const v = params[key]; if (Array.isArray(v) || (v && (v.length > 120 || /[\u0000-\u001f\u007f]/.test(v)))) return { error: 'Los filtros contienen valores inválidos.' }; values[key] = (v || '').trim(); }
 const rawPage = params.page;
 if (Array.isArray(rawPage) || (rawPage && (!/^[1-9]\d{0,3}$/.test(rawPage) || Number(rawPage) > 1000))) return { error: 'La página solicitada no es válida.' };
 if ((values.province && !values.department) || (values.district && !values.province)) return { error: 'Selecciona primero el departamento y la provincia.' };
 return { filters: { ...values, page: rawPage ? Number(rawPage) : 1 } };
}
export function choices(locations: Location[], department: string, province: string) {
 const unique = (values: string[]) => [...new Set(values)].sort((a,b) => a.localeCompare(b, 'es'));
 return { departments: unique(locations.map(x => x.department)), provinces: unique(locations.filter(x => x.department === department).map(x => x.province)), districts: unique(locations.filter(x => x.department === department && x.province === province).map(x => x.district)) };
}
export function escapeLike(value: string) { return value.replace(/[\\%_]/g, '\\$&'); }
export function phoneHref(phone: string) { return /^(9\d{8}|[1-8]\d{7,8})$/.test(phone) ? `tel:+51${phone}` : undefined; }
