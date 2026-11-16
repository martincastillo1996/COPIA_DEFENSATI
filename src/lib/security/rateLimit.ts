export type RateLimitMap = Map<string, { count: number; resetTime: number }>;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSec: number;
}

/**
 * Límite de tasa en memoria por clave (ventana fija).
 * El mapa tiene tope de tamaño: sin él, un atacante que rote identificadores lo haría crecer
 * hasta agotar la memoria del proceso.
 */
export function hitRateLimit(
  map: RateLimitMap,
  key: string,
  windowMs: number,
  max: number,
  maxKeys = 10000
): RateLimitResult {
  const now = Date.now();

  if (map.size >= maxKeys) {
    for (const [k, v] of map) {
      if (now > v.resetTime) map.delete(k);
    }
    // Si sigue lleno, se descartan las entradas más antiguas
    while (map.size >= maxKeys) {
      const oldest = map.keys().next().value;
      if (oldest === undefined) break;
      map.delete(oldest);
    }
  }

  const record = map.get(key);
  if (!record || now > record.resetTime) {
    map.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: max - 1, resetInSec: Math.ceil(windowMs / 1000) };
  }

  const resetInSec = Math.ceil((record.resetTime - now) / 1000);
  if (record.count >= max) {
    return { allowed: false, remaining: 0, resetInSec };
  }

  record.count += 1;
  return { allowed: true, remaining: max - record.count, resetInSec };
}
