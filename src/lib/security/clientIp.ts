import net from 'net';
import { parseLooseIpv4 } from './ssrfValidator';

/**
 * Rangos IPv4 oficiales de Cloudflare (https://www.cloudflare.com/ips-v4)
 * Formato [IP_base, prefijo_CIDR]
 */
const CF_IPV4_CIDRS: readonly [string, number][] = [
  ['103.21.244.0', 22],
  ['103.22.200.0', 22],
  ['103.31.4.0', 22],
  ['104.16.0.0', 13],
  ['104.24.0.0', 14],
  ['108.162.192.0', 18],
  ['131.0.72.0', 22],
  ['141.101.64.0', 18],
  ['162.158.0.0', 15],
  ['172.64.0.0', 13],
  ['173.245.48.0', 20],
  ['188.114.96.0', 20],
  ['190.93.240.0', 20],
  ['197.234.240.0', 22],
  ['198.41.128.0', 17],
];

// Rangos pre-calculados como [rango_inicio, rango_fin] en entero sin signo de 32 bits
const CF_IPV4_RANGES: [number, number][] = CF_IPV4_CIDRS.map(([base, prefix]) => {
  const lo = parseLooseIpv4(base) ?? 0;
  const size = (1 << (32 - prefix)) - 1;
  return [lo, (lo + size) >>> 0];
});

function isCloudflareIpv4(ip: string): boolean {
  const num = parseLooseIpv4(ip);
  if (num === null) return false;
  return CF_IPV4_RANGES.some(([lo, hi]) => num >= lo && num <= hi);
}

// Prefijos canónicos de IPv6 de Cloudflare (https://www.cloudflare.com/ips-v6)
const CF_IPV6_PREFIXES = [
  '2400:cb00:',
  '2606:4700:',
  '2803:f800:',
  '2405:b500:',
  '2405:8100:',
  '2a06:98c0:',
  '2c0f:f248:',
];

function isCloudflareIpv6(ip: string): boolean {
  const lower = ip.toLowerCase().trim();
  return CF_IPV6_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export function isCloudflareIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isCloudflareIpv4(ip);
  if (net.isIPv6(ip)) return isCloudflareIpv6(ip);
  return false;
}

/**
 * IP real del visitante para límites de tasa y registros defensivos.
 *
 * Producción está detrás de Cloudflare. Para prevenir falsificación de IP (IP Spoofing)
 * en caso de que alguien envíe peticiones directas al VPS sin pasar por Cloudflare,
 * solo se confía en `cf-connecting-ip` si el proxy inmediato (`x-real-ip` o el último salto
 * de `x-forwarded-for`) pertenece fehacientemente a los rangos de Cloudflare.
 */
export function getClientIp(req: Request): string {
  const cf = (req.headers.get('cf-connecting-ip') || '').trim();
  const real = (req.headers.get('x-real-ip') || '').trim();

  // En entorno de desarrollo o pruebas locales se permite evaluar directamente
  if (process.env.NODE_ENV !== 'production') {
    if (cf && net.isIP(cf)) return cf;
    if (real && net.isIP(real)) return real;
  }

  // Si x-real-ip fue inyectado por Nginx con la IP del proxy y este es Cloudflare:
  if (real && net.isIP(real) && isCloudflareIp(real)) {
    if (cf && net.isIP(cf)) return cf;
  }

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const hops = forwarded.split(',').map((h) => h.trim()).filter(Boolean);
    const last = hops[hops.length - 1];
    if (last && net.isIP(last)) {
      // Si el último salto es Cloudflare, aceptamos cf-connecting-ip
      if (isCloudflareIp(last) && cf && net.isIP(cf)) return cf;
      // Si no es Cloudflare, tomamos el último salto real
      return last;
    }
  }

  if (real && net.isIP(real)) return real;

  return '127.0.0.1';
}
