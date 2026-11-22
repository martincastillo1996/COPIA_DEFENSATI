'use client';

import { usePathname } from 'next/navigation';

/**
 * Elementos de marketing y analítica del sitio público (cookies, WhatsApp, asistente, Analytics).
 * El portal del cliente no los monta: su URL lleva el token de acceso y no debe llegar a Analytics.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/portal')) return null;
  return <>{children}</>;
}
