import crypto from 'crypto';

// Secreto para firma de sellos (usa variable de entorno o fallback consistente en runtime)
const BADGE_SECRET = process.env.BADGE_SECRET || process.env.NEXTAUTH_SECRET || 'defensati-verified-badge-hmac-key-2026';

/**
 * Dominios de clientes con blindaje perimetral activo o dominios corporativos oficiales.
 */
export const VERIFIED_CLIENT_DOMAINS = new Set<string>([
  'neuronalgravity.com',
  'www.neuronalgravity.com',
  'defensati.com',
  'www.defensati.com',
  'security-score-seven.vercel.app',
]);

/**
 * Normaliza un dominio extrayendo únicamente el host en minúsculas.
 */
export function normalizeDomain(domain: string): string {
  return (domain || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/[^a-z0-9.-]/g, '');
}

/**
 * Genera una firma HMAC-SHA256 para certificar que un dominio obtuvo Grado A en una auditoría específica.
 */
export function signBadge(domain: string, grade: string, auditId = ''): string {
  const cleanDomain = normalizeDomain(domain);
  const payload = `${cleanDomain}:${grade.toUpperCase()}:${auditId}`;
  return crypto.createHmac('sha256', BADGE_SECRET).update(payload).digest('hex').slice(0, 32);
}

/**
 * Verifica si un token criptográfico corresponde a un dominio, grado y auditId legítimos emitidos por DEFENSA TI.
 */
export function verifyBadgeToken(domain: string, grade: string, auditId = '', token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const expected = signBadge(domain, grade, auditId);
  if (expected.length !== token.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
}
