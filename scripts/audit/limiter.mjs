import { setTimeout as sleep } from 'node:timers/promises';

/**
 * Presupuesto de peticiones por segundo compartido por todos los motores de HTTP de un trabajo.
 * Cada llamada recibe su propio turno: ejecutarlos en paralelo no supera el ritmo autorizado.
 */
export function createLimiter(rps) {
  const gap = 1000 / rps;
  let next = 0;
  return {
    async take() {
      const now = Date.now();
      const at = Math.max(now, next);
      next = at + gap;
      if (at > now) await sleep(at - now);
    },
  };
}
