import Link from 'next/link';
export default function NotFound() { return <main className="detail-notice"><h1>Establecimiento no encontrado</h1><p>No encontramos el establecimiento solicitado o no está disponible.</p><Link href="/directorio">← Volver al directorio</Link></main>; }
