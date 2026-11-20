'use client';
import { useActionState, useState } from 'react';
import { saveProfile } from '@/app/cuenta/perfil/actions';
export function ProfileForm({ name }: { name: string }) {
 const [state, action, pending] = useActionState(saveProfile, {});
 const [value, setValue] = useState(name);
 return <form action={action} className="profile-form"><div><h2>Información personal</h2><p>Actualiza el nombre que aparece en tu cuenta.</p></div><label htmlFor="full_name">Nombre completo</label><input id="full_name" name="full_name" value={value} onChange={e => setValue(e.target.value)} minLength={2} maxLength={100} required autoComplete="name" />{state.error && <p className="alert error" role="alert">{state.error}</p>}{state.message && <p className="alert success" role="status">{state.message}</p>}<div className="profile-buttons"><button className="primary" disabled={pending}>{pending ? 'Guardando…' : 'Guardar cambios'}</button><button className="profile-cancel" type="button" disabled={pending} onClick={() => setValue(name)}>Cancelar</button></div></form>;
}
