'use client';

import { useSyncExternalStore } from 'react';
import Script from 'next/script';

export const COOKIE_CONSENT_KEY = 'defensati_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'defensati-cookie-consent';

function subscribe(onChange: () => void) {
  window.addEventListener(COOKIE_CONSENT_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

/**
 * Google Analytics 4 para todo el sitio.
 * - Solo se inyecta si NEXT_PUBLIC_GA_ID tiene un identificador válido (G-XXXXXXXXXX).
 * - Solo se carga cuando el visitante aceptó las cookies analíticas en el banner
 *   (Ley N° 29733). Con "solo esenciales" o sin respuesta, no se carga nada.
 */
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const consented = useSyncExternalStore(subscribe, hasAnalyticsConsent, () => false);

  if (!consented || !gaId || !/^G-[A-Z0-9]{4,20}$/.test(gaId)) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // Un enlace firmado lleva ?t=: Analytics registraría la URL completa y se llevaría el token
          gtag('config', '${gaId}', new URLSearchParams(location.search).has('t') ? { page_location: location.origin + location.pathname } : {});
        `}
      </Script>
    </>
  );
}
