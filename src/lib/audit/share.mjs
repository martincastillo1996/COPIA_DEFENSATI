// Enlaces firmados con caducidad para compartir un informe de auditoría completa.
// Un informe full contiene hallazgos sensibles: sin sesión del personal solo se abre con este enlace.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { dataDir } from './store.mjs';

const MAX_HOURS = 720;
/** @type {string | undefined} */
let cached;

function secret() {
  if (cached) return cached;
  const fromEnv = (process.env.SHARE_SECRET || '').trim();
  if (fromEnv.length >= 16) return (cached = fromEnv);
  const file = path.join(dataDir(), '.share-secret');
  try {
    const stored = fs.readFileSync(file, 'utf8').trim();
    if (stored.length >= 32) return (cached = stored);
  } catch {}
  const fresh = crypto.randomBytes(32).toString('hex');
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.writeFileSync(file, fresh, { mode: 0o600 });
  return (cached = fresh);
}

/** HMAC del secreto del servidor con una etiqueta propia: cada uso tiene su dominio de firma. */
export const hmac = (/** @type {string} */ label, /** @type {string} */ value) => crypto.createHmac('sha256', secret()).update(`${label}|${value}`).digest('hex');

const mac = (/** @type {string} */ id, /** @type {number} */ exp) => crypto.createHmac('sha256', secret()).update(`share|${id}|${exp}`).digest('hex').slice(0, 40);

/** @param {string} reportId @param {number} [hours] entre 1 y 720 */
export function signShare(reportId, hours = 72) {
  if (!Number.isFinite(hours) || hours < 1 || hours > MAX_HOURS) throw new Error(`La vigencia debe estar entre 1 y ${MAX_HOURS} horas.`);
  const exp = Date.now() + Math.round(hours * 3600000);
  return `${exp.toString(36)}.${mac(reportId, exp)}`;
}

/** @param {string} reportId @param {string} token @param {number} [now] */
export function verifyShare(reportId, token, now = Date.now()) {
  const [e, sig] = String(token || '').split('.');
  const exp = parseInt(e || '', 36);
  if (!Number.isFinite(exp) || !sig || now > exp) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(mac(reportId, exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
