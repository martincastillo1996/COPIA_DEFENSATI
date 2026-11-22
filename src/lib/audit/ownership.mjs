// Prueba de titularidad de un dominio para el escáner público: sin ella no se sondean sus puertos.
//
// El valor a publicar es determinista por dominio (HMAC con un secreto del servidor): cualquiera puede pedirlo, pero
// solo quien controla el DNS o el sitio puede publicarlo. No necesita base de datos. Se acepta en el propio host o en
// un dominio padre (nunca por encima de dos etiquetas: nadie puede publicar en "com.pe").
import dns from 'node:dns/promises';
import { hmac } from './share.mjs';
import { resolvePublic, pinnedGet } from './net.mjs';

const TIMEOUT_MS = 3000;
const OK_TTL = 10 * 60 * 1000;
const NO_TTL = 30 * 1000;
/** @type {Map<string, { at: number, result: { verified: boolean, method: string | null, domain: string | null } }>} */
const cache = new Map();

/** @param {string} domain */
export const ownershipToken = (domain) => hmac('own', String(domain).toLowerCase()).slice(0, 40);

/** Qué debe publicar el titular, para mostrarlo en el informe. @param {string} domain */
export function ownershipRecord(domain) {
  const d = String(domain).toLowerCase();
  return { host: `_defensati-verify.${d}`, value: `defensati-verify=${ownershipToken(d)}`, file: `https://${d}/.well-known/defensati-verify.txt` };
}

const within = (/** @type {Promise<any>} */ p, ms = TIMEOUT_MS) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('tiempo agotado')), ms))]);

/** El host y sus dominios padre con al menos dos etiquetas. @param {string} host */
export function candidates(host) {
  const labels = String(host).toLowerCase().replace(/\.$/, '').split('.');
  const out = [];
  for (let i = 0; i < labels.length - 1 && out.length < 5; i++) out.push(labels.slice(i).join('.'));
  return out;
}

/**
 * @param {string} host
 * @param {{ resolveTxt?: (name: string) => Promise<string[][]>, fetchFile?: (host: string, expected: string) => Promise<boolean>, now?: number, useCache?: boolean }} [opts]
 */
export async function proveOwnership(host, { resolveTxt = (n) => dns.resolveTxt(n), fetchFile = defaultFetchFile, now = Date.now(), useCache = true } = {}) {
  const h = String(host).toLowerCase().replace(/\.$/, '');
  const none = { verified: false, method: null, domain: null };
  if (!/^[a-z0-9.-]+$/.test(h) || /^\d+(\.\d+){3}$/.test(h) || !h.includes('.')) return none;
  const hit = cache.get(h);
  if (useCache && hit && now - hit.at < (hit.result.verified ? OK_TTL : NO_TTL)) return hit.result;

  const store = (/** @type {typeof none} */ result) => { if (useCache) cache.set(h, { at: now, result }); return result; };
  // TXT en el host o en un padre: en paralelo, y un fallo de DNS es "no verificado" (falla cerrado)
  const checks = candidates(h).map(async (cand) => {
    try {
      const rec = ownershipRecord(cand);
      const records = await within(resolveTxt(rec.host));
      return records.some((r) => r.join('').trim() === rec.value) ? cand : null;
    } catch { return null; }
  });
  const found = (await Promise.all(checks)).find(Boolean);
  if (found) return store({ verified: true, method: 'dns', domain: found });
  // Archivo en el propio host (por HTTPS, a una IP pública y sin seguir redirecciones)
  try {
    if (await within(fetchFile(h, ownershipRecord(h).value), TIMEOUT_MS + 2000)) return store({ verified: true, method: 'file', domain: h });
  } catch { /* sin archivo */ }
  return store(none);
}

/** @param {string} host @param {string} expected */
async function defaultFetchFile(host, expected) {
  const ip = await resolvePublic(host);
  const res = await pinnedGet(`https://${host}/.well-known/defensati-verify.txt`, ip, { maxBytes: 1000 });
  return res.status === 200 && res.body.trim() === expected;
}

export const clearOwnershipCache = () => cache.clear();
