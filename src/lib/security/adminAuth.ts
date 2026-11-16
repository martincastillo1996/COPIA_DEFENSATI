import crypto from 'crypto';

/**
 * Comprueba el token de administración (cabecera Authorization: Bearer o x-admin-token)
 * contra ADMIN_TOKEN con comparación de tiempo constante. Sin ADMIN_TOKEN configurado
 * (mínimo 16 caracteres) nunca autoriza.
 */
export function isAdminRequest(req: Request): boolean {
  const expected = (process.env.ADMIN_TOKEN || '').trim();
  if (expected.length < 16) return false;

  const auth = req.headers.get('authorization') || '';
  const provided = auth.startsWith('Bearer ')
    ? auth.slice(7).trim()
    : (req.headers.get('x-admin-token') || '').trim();
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
