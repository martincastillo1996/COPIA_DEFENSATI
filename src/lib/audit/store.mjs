// Autorizaciones, cola y hallazgos. SQLite integrado de Node (>= 22.13), sin dependencias.
// Se carga al usarlo: con un Node antiguo el escáner público sigue funcionando y el modo full falla cerrado.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { appendChained } from './chain.mjs';

export const dataDir = () => process.env.AUDIT_DATA_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), 'data');

/** @type {any} */
let connection;

/** @returns {any} */
export function db() {
  if (connection) return connection;
  const sqlite = /** @type {any} */ (process).getBuiltinModule?.('node:sqlite');
  if (!sqlite) throw new Error('El modo full requiere Node 22.13 o superior.');
  fs.mkdirSync(dataDir(), { recursive: true });
  const file = path.join(dataDir(), 'audit.db');
  const c = new sqlite.DatabaseSync(file);
  c.exec(`PRAGMA busy_timeout=5000;
    PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS engagements(
      id TEXT PRIMARY KEY, domain TEXT NOT NULL, client TEXT NOT NULL, signer TEXT NOT NULL,
      hosts TEXT NOT NULL, starts INTEGER NOT NULL, ends INTEGER NOT NULL,
      pdf_sha TEXT NOT NULL, token TEXT NOT NULL, verified INTEGER, method TEXT,
      active INTEGER NOT NULL DEFAULT 0, ports TEXT, rps INTEGER NOT NULL DEFAULT 5,
      stopped INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS jobs(
      id TEXT PRIMARY KEY, engagement TEXT NOT NULL REFERENCES engagements(id), host TEXT NOT NULL,
      status TEXT NOT NULL, progress INTEGER NOT NULL DEFAULT 0, step TEXT, engines TEXT, error TEXT,
      report TEXT, pid INTEGER, created INTEGER NOT NULL, finished INTEGER);
    CREATE TABLE IF NOT EXISTS findings(
      id TEXT PRIMARY KEY, engagement TEXT NOT NULL REFERENCES engagements(id), host TEXT NOT NULL,
      engine TEXT NOT NULL, title TEXT NOT NULL, severity TEXT NOT NULL, confidence TEXT NOT NULL,
      cwe TEXT, cvss REAL, evidence TEXT, reproduction TEXT, fix TEXT,
      status TEXT NOT NULL, note TEXT, first_seen INTEGER NOT NULL, last_seen INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
    CREATE TABLE IF NOT EXISTS snapshots(host TEXT NOT NULL, at INTEGER NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, created INTEGER NOT NULL, revoked INTEGER NOT NULL DEFAULT 0, last_used INTEGER);
    CREATE INDEX IF NOT EXISTS snapshots_host ON snapshots(host, at);`);
  // Bases creadas por versiones anteriores: se añaden las columnas nuevas sin perder datos
  for (const [table, col, def] of [['findings', 'attack', 'TEXT'], ['findings', 'validated', 'INTEGER NOT NULL DEFAULT 0'], ['findings', 'validated_note', 'TEXT'],
    ['engagements', 'staging', 'INTEGER NOT NULL DEFAULT 0'], ['engagements', 'internal', 'INTEGER NOT NULL DEFAULT 0'],
    ['engagements', 'portal_hash', 'TEXT'], ['engagements', 'portal_until', 'INTEGER'], ['jobs', 'only_engines', 'TEXT'], ['jobs', 'retest_ports', 'TEXT']]) {
    const have = new Set(c.prepare(`PRAGMA table_info(${table})`).all().map((/** @type {any} */ r) => r.name));
    if (!have.has(col)) { try { c.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`); } catch {} }
  }
  try { fs.chmodSync(file, 0o600); } catch {}
  connection = c;
  return c;
}

export function closeDb() {
  connection?.close();
  connection = undefined;
}

/** @param {string} event @param {object} [detail] */
export function logEvent(event, detail = {}) {
  return appendChained(path.join(dataDir(), 'audit-log.jsonl'), { at: new Date().toISOString(), event, ...detail });
}

/** @param {string} value */
export function cleanHost(value) {
  const host = String(value || '').trim().toLowerCase().replace(/\.$/, '');
  if (!/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]+)$/.test(host)) {
    throw new Error(`Host inválido: ${host}`);
  }
  return host;
}

/** @param {any} o */
export function createEngagement(o) {
  const domain = cleanHost(o.domain);
  const hosts = [...new Set((o.hosts?.length ? o.hosts : [domain]).map(cleanHost))];
  for (const h of hosts) {
    if (h !== domain && !h.endsWith(`.${domain}`)) throw new Error(`${h} no pertenece a ${domain}.`);
  }
  if (!o.client || !o.signer) throw new Error('Faltan cliente y firmante.');

  // La fecha final incluye el día completo en hora de Perú
  const starts = Date.parse(`${o.from}T00:00:00-05:00`);
  const ends = Date.parse(`${o.to}T23:59:59-05:00`);
  if (!(starts < ends)) throw new Error('Fechas inválidas: usa AAAA-MM-DD.');

  const pdf = fs.readFileSync(/* turbopackIgnore: true */ o.pdf);
  if (pdf.subarray(0, 5).toString() !== '%PDF-') throw new Error('La autorización debe ser un PDF.');

  const rps = Number(o.rps ?? 5);
  if (!Number.isInteger(rps) || rps < 1 || rps > 20) throw new Error('rps debe estar entre 1 y 20.');
  if (o.ports && !/^\d{1,5}(-\d{1,5})?(,\d{1,5}(-\d{1,5})?)*$/.test(o.ports)) throw new Error('Puertos inválidos.');

  const id = crypto.randomBytes(8).toString('hex');
  const token = crypto.randomBytes(24).toString('hex');
  const dir = path.join(dataDir(), 'engagements');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${id}.pdf`), pdf, { mode: 0o600 });
  const sha = crypto.createHash('sha256').update(pdf).digest('hex');
  db().prepare(`INSERT INTO engagements(id,domain,client,signer,hosts,starts,ends,pdf_sha,token,active,ports,rps,created,staging,internal)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, domain, o.client, o.signer, JSON.stringify(hosts), starts, ends, sha, token, o.active ? 1 : 0, o.ports || null, rps, Date.now(), o.staging ? 1 : 0, o.internal ? 1 : 0);
  logEvent('engagement.create', { id, domain, hosts, starts, ends, sha, active: Boolean(o.active), staging: Boolean(o.staging), internal: Boolean(o.internal) });
  return getEngagement(id);
}

/** @param {string} id @returns {any} */
export function getEngagement(id) {
  const e = db().prepare('SELECT * FROM engagements WHERE id=?').get(id);
  if (!e) throw new Error(`No existe la autorización ${id}.`);
  return { ...e, hosts: JSON.parse(e.hosts) };
}

export const emergencyStopped = () => db().prepare("SELECT value FROM settings WHERE key='estop'").get()?.value === '1';

/** @param {boolean} on */
export function setEmergencyStop(on) {
  db().prepare("INSERT INTO settings VALUES('estop',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(on ? '1' : '0');
  logEvent('estop', { on });
}

/** @param {string} id @param {string} host @returns {any} */
export function assertAllowed(id, host) {
  if (emergencyStopped()) throw new Error('Parada de emergencia activa.');
  const e = getEngagement(id);
  const now = Date.now();
  if (e.stopped) throw new Error('Autorización detenida.');
  if (now < e.starts || now > e.ends) throw new Error('Fuera de la ventana autorizada.');
  if (!e.verified) throw new Error('Dominio sin verificar.');
  if (!e.hosts.includes(host)) throw new Error(`${host} está fuera del alcance.`);
  return e;
}

/** @param {string} host @returns {any} */
export function findEngagement(host) {
  const now = Date.now();
  const rows = db().prepare('SELECT * FROM engagements WHERE verified IS NOT NULL AND stopped=0 AND starts<=? AND ends>=? ORDER BY created DESC').all(now, now);
  const found = rows.find((/** @type {any} */ e) => JSON.parse(e.hosts).includes(host));
  if (!found) throw new Error(`No hay autorización vigente y verificada para ${host}.`);
  return assertAllowed(found.id, host);
}

/** @param {any} e */
export function assertDocument(e) {
  const pdf = fs.readFileSync(path.join(dataDir(), 'engagements', `${e.id}.pdf`));
  if (crypto.createHash('sha256').update(pdf).digest('hex') !== e.pdf_sha) throw new Error('El PDF de autorización fue modificado.');
}

/** @param {string} engagement @param {string} host @param {string} [status] @param {{ only?: string[], ports?: string | null, actor?: string }} [opts] only y ports son para re-test; actor, quién lo pidió */
export function enqueue(engagement, host, status = 'queued', opts = {}) {
  assertAllowed(engagement, host);
  const busy = db().prepare("SELECT id FROM jobs WHERE host=? AND status IN ('queued','running')").get(host);
  if (busy) throw new Error(`Ya hay un trabajo para ${host}: ${busy.id}`);
  const id = crypto.randomUUID();
  db().prepare('INSERT INTO jobs(id,engagement,host,status,pid,created,only_engines,retest_ports) VALUES(?,?,?,?,?,?,?,?)')
    .run(id, engagement, host, status, status === 'running' ? process.pid : null, Date.now(), opts.only ? JSON.stringify(opts.only) : null, opts.ports || null);
  logEvent('job.create', { id, engagement, host, retest: Boolean(opts.only), actor: opts.actor });
  return id;
}

/** @param {string} id @returns {any} */
export const getJob = (id) => db().prepare('SELECT * FROM jobs WHERE id=?').get(id);
