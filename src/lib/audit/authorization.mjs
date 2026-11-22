import dns from 'node:dns/promises';
import { db, logEvent, getEngagement, findEngagement, assertAllowed, assertDocument } from './store.mjs';
import { resolvePublic, pinnedGet } from './net.mjs';

/** @param {any} e @returns {Promise<string|null>} */
export async function checkOwnership(e) {
  const expected = `defensati-verify=${e.token}`;
  try {
    const records = await dns.resolveTxt(`_defensati-verify.${e.domain}`);
    if (records.some((r) => r.join('').trim() === expected)) return 'dns';
  } catch {}
  try {
    const ip = await resolvePublic(e.domain);
    const res = await pinnedGet(`https://${e.domain}/.well-known/defensati-verify.txt`, ip, { maxBytes: 1000 });
    if (res.status === 200 && res.body.trim() === expected) return 'file';
  } catch {}
  return null;
}

/** @param {string} id */
export async function verifyEngagement(id) {
  const method = await checkOwnership(getEngagement(id));
  if (!method) throw new Error('No se encontró el TXT ni el archivo de verificación.');
  db().prepare('UPDATE engagements SET verified=?, method=? WHERE id=?').run(Date.now(), method, id);
  logEvent('engagement.verify', { id, method });
  return method;
}

/**
 * Puerta única del modo full: alcance, fechas, PDF intacto y prueba de dominio todavía publicada.
 * @param {string} host
 * @param {string} [id]
 * @returns {Promise<any>}
 */
export async function authorizeFull(host, id) {
  const e = id ? assertAllowed(id, host) : findEngagement(host);
  assertDocument(e);
  if (!(await checkOwnership(e))) throw new Error('La prueba de control del dominio ya no está publicada.');
  return assertAllowed(e.id, host);
}
