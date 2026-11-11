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
  const clean = rawUrlOrDomain.toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  return HYPERSCALER_DOMAINS.some((giant) => clean.includes(giant));
}
