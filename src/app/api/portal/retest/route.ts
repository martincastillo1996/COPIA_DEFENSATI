import { NextResponse } from 'next/server';
import { requestRetest } from '@/lib/audit/portal.mjs';
import { getClientIp } from '@/lib/security/clientIp';
import { hitRateLimit, RateLimitMap } from '@/lib/security/rateLimit';

const limits: RateLimitMap = new Map();
const headers = { 'Cache-Control': 'no-store' };
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers });

/** POST { token }: el cliente pide repetir las pruebas de sus hallazgos abiertos. */
export async function POST(req: Request) {
  if (!hitRateLimit(limits, getClientIp(req), 60 * 60 * 1000, 20).allowed) return json({ error: 'Demasiados intentos. Espera un momento.' }, 429);
  if (!(req.headers.get('content-type') || '').includes('application/json')) return json({ error: 'Solicitud inválida.' }, 415);
  const body = await req.json().catch(() => null);
  try {
    const ids = requestRetest(typeof body?.token === 'string' ? body.token : '');
    return json({ queued: ids.length }, 202);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'No se pudo solicitar.';
    // Los mensajes propios son seguros de mostrar; cualquier otro detalle interno no sale
    const known = /^(Enlace|Ya hay|No hay)/.test(message);
    return json({ error: known ? message : 'No se pudo solicitar el re-test ahora.' }, /^Ya hay un re-test/.test(message) ? 429 : 400);
  }
}
