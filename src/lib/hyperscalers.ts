/**
 * Lista de dominios de hiperescala, gigantes tecnológicos globales y plataformas
 * con infraestructura perimetral multimillonaria propia.
 * 
 * Para estos dominios, DEFENSA TI no emite cotizaciones estándar de S/ 450 ni
 * precios para pymes, sino que muestra análisis de referencia corporativa.
 */
export const HYPERSCALER_DOMAINS = [
  'google.',
  'youtube.com',
  'microsoft.com',
  'apple.com',
  'amazon.',
  'aws.amazon.com',
  'cloudflare.com',
  'github.com',
  'meta.com',
  'facebook.com',
  'instagram.com',
  'whatsapp.com',
  'netflix.com',
  'spotify.com',
  'stripe.com',
  'openai.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'wikipedia.org',
  'bing.com',
  'adobe.com',
  'yahoo.com',
  'oracle.com',
  'ibm.com',
  'salesforce.com',
  'zoom.us',
  'dropbox.com',
  'paypal.com',
  'tiktok.com',
  'shopify.com',
  'bcp.com.pe',
  'interbank.pe',
  'bbva.pe',
];

/**
 * Determina si una URL o dominio corresponde a un gigante tecnológico o
 * plataforma de hiperescala.
 */
export function isHyperscalePlatform(rawUrlOrDomain?: string | null): boolean {
  if (!rawUrlOrDomain) return false;
  const host = rawUrlOrDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '');
  if (!host) return false;

  // Coincidencia por etiquetas de dominio, nunca por subcadena: "relax.com.pe" contiene
  // "x.com" pero no es x.com, y "google.com.mitienda.pe" no es Google.
  return HYPERSCALER_DOMAINS.some((giant) => {
    if (giant.endsWith('.')) {
      // Marca con cualquier TLD: google.com, www.google.es, amazon.com.mx
      const brand = giant.slice(0, -1);
      const labels = host.split('.');
      const idx = labels.lastIndexOf(brand);
      if (idx === -1) return false;
      const tld = labels.slice(idx + 1);
      // Solo sufijos propios de una marca global: .com, un ccTLD de 2 letras (.es, .pe)
      // o com/co + ccTLD (.com.pe, .co.uk). Los gTLD abiertos (.xyz, .top, .vip, .icu)
      // los registra cualquiera: "google.xyz" o "amazon.top" NO son la marca.
      const isCc = (l: string) => /^[a-z]{2}$/.test(l);
      if (tld.length === 1) return tld[0] === 'com' || isCc(tld[0]);
      if (tld.length === 2) return (tld[0] === 'com' || tld[0] === 'co') && isCc(tld[1]);
      return false;
    }
    return host === giant || host.endsWith('.' + giant);
  });
}
