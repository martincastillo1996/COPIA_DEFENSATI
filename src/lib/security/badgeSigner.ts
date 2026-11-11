import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Secreto HMAC para la firma de sellos.
 * 1. BADGE_SECRET (o NEXTAUTH_SECRET) desde variables de entorno.
 * 2. Si no existe, se genera uno aleatorio y se guarda en data/.badge-secret (fuera de git)
 *    para que sea estable entre reinicios. Nunca se usa una clave escrita en el código.
 */
function resolveBadgeSecret(): string {
  const fromEnv = (process.env.BADGE_SECRET || process.env.NEXTAUTH_SECRET || '').trim();
  if (fromEnv.length >= 16) return fromEnv;

  const secretFile = path.join(process.cwd(), 'data', '.badge-secret');
  try {
    if (fs.existsSync(secretFile)) {
      const stored = fs.readFileSync(secretFile, 'utf-8').trim();
      if (stored.length >= 32) return stored;
    }
  } catch {
    // Se intenta generar uno nuevo a continuación
  }

  const generated = crypto.randomBytes(32).toString('hex');
  try {
    fs.mkdirSync(path.dirname(secretFile), { recursive: true });
    fs.writeFileSync(secretFile, generated, { encoding: 'utf-8', mode: 0o600 });
  } catch {
    console.warn('[badgeSigner] BADGE_SECRET no definido y data/ no es escribible: los sellos emitidos dejaran de validar al reiniciar el proceso.');
  }
  return generated;
}

const BADGE_SECRET = resolveBadgeSecret();

/**
 * Dominios de clientes con blindaje perimetral activo o dominios corporativos oficiales.
 */
export const VERIFIED_CLIENT_DOMAINS = new Set<string>([
  'neuronalgravity.com',
  'www.neuronalgravity.com',
  'defensati.com',
  'www.defensati.com',
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
