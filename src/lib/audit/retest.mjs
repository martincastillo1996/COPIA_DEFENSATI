// Re-test: vuelve a probar solo lo que está abierto, en minutos y no en horas.
import { db } from './store.mjs';

/** Motores de /api/scan: una sola llamada los ejecuta a todos. */
export const PERIMETER = ['webapp', 'surface', 'nuclei', 'files', 'cve'];
const RETESTABLE = new Set([...PERIMETER, 'nmap', 'testssl', 'crawler', 'wordpress', 'api', 'browser', 'cve-services', 'zap-baseline', 'zap-active']);

/**
 * Qué motores hay que repetir para comprobar los hallazgos abiertos de un host.
 * Los que necesitan sesión, código o un archivo del cliente quedan como manuales.
 * @param {string} engagementId @param {string} host
 */
export function planRetest(engagementId, host) {
  const rows = db().prepare("SELECT engine, title FROM findings WHERE engagement=? AND host=? AND status IN ('open','mitigated')").all(engagementId, host);
  if (!rows.length) throw new Error(`No hay hallazgos abiertos de ${host} que re-probar.`);
  const engines = new Set();
  const manual = new Set();
  const ports = new Set();
  for (const r of rows) {
    if (RETESTABLE.has(r.engine)) engines.add(r.engine);
    else manual.add(r.engine);
    if (r.engine === 'nmap') {
      const p = String(r.title).match(/tcp\/(\d{1,5})/)?.[1];
      if (p) ports.add(Number(p));
    }
  }
  if (!engines.size) throw new Error(`Lo abierto de ${host} requiere re-test manual (${[...manual].join(", ")}).`);
  // Los CVE de servicios salen de nmap -sV: sin él no hay versiones que cruzar
  if (engines.has('cve-services')) engines.add('nmap');
  return { engines: [...engines], ports: engines.has('nmap') && ports.size ? [...ports].sort((a, b) => a - b).join(',') : null, manual: [...manual], open: rows.length };
}
