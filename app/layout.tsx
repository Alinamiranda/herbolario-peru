import type { Metadata } from 'next';
import './globals.css';
import './auth.css';
export const metadata: Metadata = { title: 'Herbolario Perú', description: 'Conectamos contigo y con la riqueza natural del Perú.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="es"><body>{children}</body></html>; }
