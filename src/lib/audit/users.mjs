// Claves por persona con rol, en lugar de un único token compartido: se sabe quién hizo cada cosa.
// En la base solo queda el hash de la clave; se muestra una sola vez al crearla.
import crypto from 'node:crypto';
import { db, logEvent } from './store.mjs';

/** El personal opera desde el CLI con acceso al servidor; estos roles gobiernan la API HTTP. */
export const ROLES = ['analyst', 'viewer'];
const hash = (/** @type {string} */ t) => crypto.createHash('sha256').update(t).digest('hex');
const HOUR = 3600000;

/** @param {string} name @param {string} role */
export function createUser(name, role) {
  const clean = String(name || '').trim();
  if (!/^[\p{L}\p{N} ._-]{2,40}$/u.test(clean)) throw new Error('El nombre debe tener entre 2 y 40 caracteres (letras, números, espacio, punto, guion).');
  if (!ROLES.includes(role)) throw new Error(`Rol válido: ${ROLES.join(' o ')}. analyst opera auditorías; viewer solo lee informes.`);
  const id = crypto.randomBytes(6).toString('hex');
  const token = `dti_${crypto.randomBytes(32).toString('hex')}`;
  db().prepare('INSERT INTO users(id,name,role,token_hash,created) VALUES(?,?,?,?,?)').run(id, clean, role, hash(token), Date.now());
  logEvent('user.create', { id, name: clean, role });
  return { id, name: clean, role, token };
}

/** @param {string} token @returns {{ id: string, name: string, role: string } | null} */
export function findUserByToken(token) {
  if (!/^dti_[a-f0-9]{64}$/.test(String(token))) return null;
  const row = db().prepare('SELECT id,name,role,last_used FROM users WHERE token_hash=? AND revoked=0').get(hash(token));
  if (!row) return null;
  // Un registro de uso por hora basta y evita escribir en la base en cada petición
  if (!row.last_used || Date.now() - row.last_used > HOUR) db().prepare('UPDATE users SET last_used=? WHERE id=?').run(Date.now(), row.id);
  return { id: row.id, name: row.name, role: row.role };
}

export const listUsers = () => db().prepare('SELECT id,name,role,created,revoked,last_used FROM users ORDER BY created').all();

/** @param {string} id */
export function revokeUser(id) {
  if (!db().prepare('UPDATE users SET revoked=1 WHERE id=?').run(id).changes) throw new Error('Usuario inexistente.');
  logEvent('user.revoke', { id });
}
