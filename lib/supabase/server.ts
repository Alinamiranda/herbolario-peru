import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
export async function createClient() {
 // Auth checks session expiry using the current time; never initialize it while prerendering.
 await connection();
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if (!url || !key) return null;
 const store = await cookies();
 return createServerClient(url, key, { cookies: { getAll() { return store.getAll(); }, setAll(values) { try { values.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* Proxy refreshes cookies during rendering. */ } } } });
}
