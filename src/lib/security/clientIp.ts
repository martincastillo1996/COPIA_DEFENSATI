import net from 'net';

/**
 * IP real del visitante para límites de tasa y registros.
 *
 * Producción está detrás de Cloudflare, que fija `cf-connecting-ip` y no deja que el cliente
 * lo sobrescriba. `x-forwarded-for` NO es fiable en su primer valor: el cliente puede enviar el
 * suyo y los proxys solo añaden al final, por eso de esa cabecera se toma el último salto.
 *
 * Importante: esto solo es sólido si el servidor acepta tráfico web únicamente desde las IP de
 * Cloudflare (firewall del VPS). Con el origen abierto, cualquier cabecera se puede falsificar.
 */
export function getClientIp(req: Request): string {
  const cf = (req.headers.get('cf-connecting-ip') || '').trim();
  if (cf && net.isIP(cf)) return cf;

  const real = (req.headers.get('x-real-ip') || '').trim();
  if (real && net.isIP(real)) return real;

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded.split(',').map((h) => h.trim()).filter(Boolean);
    const last = hops[hops.length - 1];
    if (last && net.isIP(last)) return last;
  }

  return '127.0.0.1';
}
