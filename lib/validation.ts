export function validateAuth(form: FormData, register: boolean): string | null {
 const email = String(form.get('email') || '').trim(); const password = String(form.get('password') || '');
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Ingresa un correo electrónico válido.';
 if (!password) return 'Ingresa tu contraseña.';
 if (register) { const name = String(form.get('name') || '').trim();
  if (name.length < 2 || name.length > 100) return 'Ingresa tu nombre completo (entre 2 y 100 caracteres).';
  if (password.length < 8 || password.length > 72 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return 'La contraseña debe tener entre 8 y 72 caracteres, con al menos una letra y un número.';
  if (password !== form.get('confirmPassword')) return 'Las contraseñas no coinciden.';
  if (!['buyer', 'seller'].includes(String(form.get('role')))) return 'Selecciona un tipo de cuenta válido.';
  if (form.get('terms') !== 'on') return 'Debes aceptar los términos y condiciones.';
 } return null;
}
