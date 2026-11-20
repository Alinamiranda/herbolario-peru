export const fields = ['name', 'description', 'address', 'department', 'province', 'district', 'phone'] as const;
export type Field = typeof fields[number];
export type EstablishmentInput = Record<Field, string>;
export type FieldErrors = Partial<Record<Field, string>>;

export function validateEstablishment(form: FormData): { values?: EstablishmentInput; errors: FieldErrors; error?: string } {
 const errors: FieldErrors = {};
 for (const key of form.keys()) if (!fields.includes(key as Field) && !key.startsWith('$ACTION_')) return { errors, error: 'La solicitud contiene campos no permitidos.' };
 const values = {} as EstablishmentInput;
 for (const field of fields) {
  const entries = form.getAll(field);
  if (entries.length !== 1 || typeof entries[0] !== 'string') { errors[field] = 'Este campo es obligatorio.'; values[field] = ''; continue; }
  values[field] = entries[0].trim();
 }
 const limits: Record<Exclude<Field, 'phone'>, [number, number, string]> = { name: [3, 120, 'El nombre debe tener entre 3 y 120 caracteres.'], description: [20, 2000, 'La descripción debe tener entre 20 y 2000 caracteres.'], address: [5, 200, 'La dirección debe tener entre 5 y 200 caracteres.'], department: [2, 100, 'Ingresa un departamento válido (2 a 100 caracteres).'], province: [2, 100, 'Ingresa una provincia válida (2 a 100 caracteres).'], district: [2, 100, 'Ingresa un distrito válido (2 a 100 caracteres).'] };
 for (const [key, [min, max, message]] of Object.entries(limits)) { const field = key as Exclude<Field, 'phone'>; const text = values[field]; if (!errors[field] && (Array.from(text).length < min || Array.from(text).length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text))) errors[field] = message; }
 const raw = values.phone;
 if (!errors.phone && !/^(?:\+51\s*)?[\d ()-]+$/.test(raw)) errors.phone = 'Ingresa un teléfono peruano válido.';
 const digits = raw.replace(/\D/g, ''); const phone = raw.startsWith('+51') ? digits.slice(2) : digits;
 if (!errors.phone && !/^(?:9\d{8}|[1-8]\d{7,8})$/.test(phone)) errors.phone = 'Ingresa un teléfono peruano válido con código de área si corresponde.';
 values.phone = phone;
 return Object.keys(errors).length ? { errors } : { errors, values };
}

export type RegistrationStore = { identity(): Promise<{ id: string; role: string } | null>; insert(owner: string, data: EstablishmentInput): Promise<'ok' | 'duplicate' | 'error'> };
export async function registerEstablishment(store: RegistrationStore, form: FormData) {
 const identity = await store.identity();
 if (!identity) return { status: 'unauthenticated' as const };
 if (identity.role !== 'seller' && identity.role !== 'admin') return { status: 'forbidden' as const };
 const parsed = validateEstablishment(form);
 if (!parsed.values) return { status: 'invalid' as const, errors: parsed.errors, error: parsed.error };
 const result = await store.insert(identity.id, parsed.values);
 return { status: result } as const;
}
