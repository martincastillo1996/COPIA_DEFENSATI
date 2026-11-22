// Chequeo del servidor antes y después de desplegar. Cada comprobación devuelve ok, warn o fail.
// fail = no despliegues (o algo ya está roto); warn = funciona, pero te falta algo que querrás tener.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { verifyChained } from '../../src/lib/audit/chain.mjs';
import { backupName } from '../backup/lib.mjs';

export const MIN_NODE = [22, 13];
const HOUR = 3600000;
const GB = 1024 ** 3;
const EXPECTED_COLUMNS = { findings: ['attack', 'validated', 'validated_note'], engagements: ['staging', 'internal', 'portal_hash', 'portal_until'], jobs: ['only_engines', 'retest_ports'] };
const POSIX_PRIVATE = ['audit.db', '.share-secret', '.badge-secret'];

export const nodeOk = (version = process.versions.node) => {
  const [major, minor] = String(version).split('.').map(Number);
  return major > MIN_NODE[0] || (major === MIN_NODE[0] && minor >= MIN_NODE[1]);
};

/** @returns {{ found: boolean, version?: string }} */
export function probeTool(cmd, args = ['--version']) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 8000 });
  if (r.error) return { found: false };
  return { found: true, version: `${r.stdout || ''}${r.stderr || ''}`.split('\n').find((l) => l.trim())?.trim().slice(0, 60) };
}

const strong = (v, n) => String(v || '').trim().length >= n;

/**
 * @param {{ env?: Record<string,string|undefined>, dataDir: string, backupDir: string, now?: number, freeBytes?: number,
 *   tools?: Record<string, {found: boolean, version?: string}>, platform?: string }} ctx
 */
export function runChecks({ env = process.env, dataDir, backupDir, now = Date.now(), freeBytes, tools = {}, platform = process.platform }) {
  const out = [];
  const add = (id, level, title, detail = '') => out.push({ id, level, title, detail });

  if (nodeOk()) add('node', 'ok', `Node ${process.versions.node}`);
  else add('node', 'fail', `Node ${process.versions.node}`, `El modo full y las copias exigen ${MIN_NODE.join('.')} o superior: sin eso la auditoría completa falla cerrada.`);
  if (strong(env.ADMIN_TOKEN, 16)) add('admin_token', 'ok', 'ADMIN_TOKEN definido');
  else add('admin_token', 'fail', 'ADMIN_TOKEN ausente o menor de 16 caracteres', 'El monitor, el worker y la cola no pueden autenticarse.');
  if (/^https:\/\//.test(env.PUBLIC_APP_URL || '')) add('public_url', 'ok', 'PUBLIC_APP_URL con HTTPS');
  else add('public_url', 'warn', 'PUBLIC_APP_URL sin definir o sin HTTPS', 'Los enlaces del portal y de los informes saldrán con el dominio por defecto.');
  if (strong(env.BACKUP_PASSPHRASE, 12)) add('backup_pass', 'ok', 'BACKUP_PASSPHRASE definida');
  else add('backup_pass', 'warn', 'BACKUP_PASSPHRASE ausente o corta', 'Sin ella no se crea ninguna copia de seguridad.');

  const exists = (n) => fs.existsSync(path.join(dataDir, n));
  if (strong(env.SHARE_SECRET, 16) || exists('.share-secret')) add('share_secret', 'ok', 'Secreto de enlaces firmados presente');
  else add('share_secret', 'warn', 'Aún no hay secreto de enlaces firmados', 'Se generará al crear el primer enlace: cópialo con las copias de seguridad.');
  if (strong(env.BADGE_SECRET || env.NEXTAUTH_SECRET, 16) || exists('.badge-secret')) add('badge_secret', 'ok', 'Secreto del sello presente');
  else add('badge_secret', 'warn', 'Aún no hay secreto del sello', 'Se genera solo; si se pierde, los sellos emitidos dejan de validar.');

  let writable = false;
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    const probe = path.join(dataDir, `.escritura-${process.pid}`);
    fs.writeFileSync(probe, 'x');
    fs.rmSync(probe);
    writable = true;
  } catch { /* se informa abajo */ }
  if (writable) add('data_dir', 'ok', 'data/ existe y se puede escribir');
  else add('data_dir', 'fail', 'data/ no se puede escribir', dataDir);

  if (platform !== 'win32') {
    const loose = POSIX_PRIVATE.filter((n) => exists(n) && (fs.statSync(path.join(dataDir, n)).mode & 0o077) !== 0);
    if (loose.length) add('perms', 'warn', 'Archivos privados legibles por otros usuarios', `${loose.join(', ')}: ejecuta chmod 600`);
    else add('perms', 'ok', 'Permisos de los archivos privados');
  }

  const dbFile = path.join(dataDir, 'audit.db');
  if (!fs.existsSync(dbFile)) add('db', 'warn', 'La base de auditoría aún no existe', 'Se crea al usarla por primera vez.');
  else {
    try {
      const sqlite = /** @type {any} */ (process).getBuiltinModule?.('node:sqlite');
      if (!sqlite) throw new Error('Node sin SQLite integrado');
      const db = new sqlite.DatabaseSync(dbFile, { readOnly: true });
      try {
        const integrity = db.prepare('PRAGMA integrity_check').get().integrity_check;
        if (integrity === 'ok') add('db', 'ok', 'Base de auditoría íntegra');
        else add('db', 'fail', 'La base de auditoría está dañada', String(integrity).slice(0, 120));
        const missing = [];
        for (const [table, cols] of Object.entries(EXPECTED_COLUMNS)) {
          const have = new Set(db.prepare(`PRAGMA table_info(${table})`).all().map((/** @type {any} */ r) => r.name));
          for (const c of cols) if (have.size && !have.has(c)) missing.push(`${table}.${c}`);
        }
        if (missing.length) add('schema', 'warn', 'La base viene de una versión anterior', `Se migra sola al arrancar. Falta: ${missing.join(', ')}`);
        else add('schema', 'ok', 'Esquema de la base al día');
        const estop = db.prepare("SELECT value FROM settings WHERE key='estop'").get?.();
        if (estop?.value === '1') add('estop', 'warn', 'Parada de emergencia ACTIVA', 'No se ejecutará ninguna auditoría completa hasta que hagas estop-clear.');
      } finally {
        db.close();
      }
    } catch (e) {
      add('db', 'fail', 'No se pudo abrir la base de auditoría', String(e.message).slice(0, 120));
    }
  }

  for (const name of ['audit-log.jsonl', 'audit-consents.jsonl']) {
    const file = path.join(dataDir, name);
    if (!fs.existsSync(file)) continue;
    const r = verifyChained(file);
    if (r.valid) add(`chain:${name}`, 'ok', `Cadena ${name} válida`, `${r.count} registros, head ${r.head.slice(0, 12)}…`);
    else add(`chain:${name}`, 'fail', `La cadena ${name} fue alterada`, `Válida solo hasta el registro ${r.count}.`);
  }

  const wanted = [['nmap', 'nmap'], ['testssl', 'testssl'], ['nuclei', 'Nuclei'], ['docker', 'Docker (ZAP)'], ['chrome', 'Chrome (navegador y PDF)']];
  for (const [key, label] of wanted) {
    const t = tools[key];
    if (t?.found) add(`tool:${key}`, 'ok', `${label} instalado`, t.version || '');
    else add(`tool:${key}`, 'warn', `${label} no está instalado`, 'El motor correspondiente saldrá como "faltante" en las auditorías.');
  }

  if (typeof freeBytes === 'number') {
    const g = (freeBytes / GB).toFixed(1);
    if (freeBytes >= 5 * GB) add('disk', 'ok', `Disco libre: ${g} GB`);
    else if (freeBytes >= 0.5 * GB) add('disk', 'warn', `Poco disco libre: ${g} GB`, 'Las copias y los informes crecen con el tiempo.');
    else add('disk', 'fail', `Disco casi lleno: ${g} GB`, 'La base y los registros pueden dejar de escribirse.');
  }

  let newest = 0;
  try {
    for (const n of fs.readdirSync(backupDir)) if (backupName(n)) newest = Math.max(newest, fs.statSync(path.join(backupDir, n)).mtimeMs);
  } catch { /* sin carpeta de copias */ }
  if (!newest) add('backup', 'warn', 'No hay ninguna copia de seguridad', `Crea una antes de desplegar: npm run backup -- create (carpeta: ${backupDir}).`);
  else {
    const h = (now - newest) / HOUR;
    if (h <= 26) add('backup', 'ok', `Última copia hace ${h.toFixed(1)} h`);
    else add('backup', 'warn', `La última copia tiene ${Math.round(h)} h`, 'Programa la copia diaria (docs/despliegue.md).');
  }
  return out;
}

export const hasFailures = (results) => results.some((r) => r.level === 'fail');
