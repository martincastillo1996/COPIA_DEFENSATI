// Copias de seguridad cifradas de data/ (base, registros encadenados, secretos, PDF de autorizaciones, informes).
//
// - La base se copia con VACUUM INTO: una instantánea consistente aunque el worker esté escribiendo (WAL).
// - Se cifra con AES-256-GCM y una clave derivada con scrypt: sin la clave no se puede leer y cualquier
//   alteración se detecta al descifrar.
// - "Verificar" restaura de verdad en una carpeta temporal y comprueba hashes, integridad de la base y cadenas:
//   una copia que no se ha verificado no es una copia.
// - Restaurar nunca pisa datos vivos: exige una carpeta de destino vacía y distinta de la que usa la app.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { spawnSync } from 'node:child_process';
import { verifyChained } from '../../src/lib/audit/chain.mjs';

const MAGIC = Buffer.from('DTIBAK1\n');
const SALT = 16;
const IV = 12;
const TAG = 16;
const HEADER = MAGIC.length + SALT + IV;
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 128 * 1024 * 1024 };
export const MIN_PASSPHRASE = 12;
const TAR = process.platform === 'win32' ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe') : 'tar';
const SKIP_DB = /^audit\.db(-wal|-shm|-journal)?$/;
const NAME = /^defensati-backup-\d{8}-\d{6}\.(dtibak|tgz)$/;
const TABLES = ['engagements', 'jobs', 'findings', 'users', 'snapshots'];
const CHAINS = ['audit-log.jsonl', 'audit-consents.jsonl'];

const posix = (p) => p.split(path.sep).join('/');

function run(args) {
  const r = spawnSync(TAR, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`tar falló: ${(r.stderr || r.error?.message || '').trim().slice(0, 200)}`);
}

function assertPassphrase(p) {
  if (!p || String(p).length < MIN_PASSPHRASE) throw new Error(`Define BACKUP_PASSPHRASE (mínimo ${MIN_PASSPHRASE} caracteres): sin clave no se crea la copia.`);
}

async function sha256(file) {
  const h = crypto.createHash('sha256');
  for await (const c of fs.createReadStream(file)) h.update(c);
  return h.digest('hex');
}

function walk(dir, base = dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full, base));
    else if (e.isFile()) out.push(posix(path.relative(base, full)));
  }
  return out.sort();
}

export async function encryptFile(inFile, outFile, passphrase) {
  assertPassphrase(passphrase);
  const salt = crypto.randomBytes(SALT);
  const iv = crypto.randomBytes(IV);
  const cipher = crypto.createCipheriv('aes-256-gcm', crypto.scryptSync(passphrase, salt, 32, SCRYPT), iv);
  async function* encrypted() {
    yield Buffer.concat([MAGIC, salt, iv]);
    for await (const chunk of fs.createReadStream(inFile)) {
      const b = cipher.update(chunk);
      if (b.length) yield b;
    }
    yield cipher.final();
    yield cipher.getAuthTag();
  }
  await pipeline(Readable.from(encrypted()), fs.createWriteStream(outFile, { mode: 0o600 }));
}

export async function decryptFile(inFile, outFile, passphrase) {
  const size = fs.statSync(inFile).size;
  if (size < HEADER + TAG) throw new Error('El archivo de copia está truncado o no es una copia de DEFENSA TI.');
  const fd = fs.openSync(inFile, 'r');
  const head = Buffer.alloc(HEADER);
  const tag = Buffer.alloc(TAG);
  try {
    fs.readSync(fd, head, 0, HEADER, 0);
    fs.readSync(fd, tag, 0, TAG, size - TAG);
  } finally {
    fs.closeSync(fd);
  }
  if (!head.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error('No es una copia cifrada de DEFENSA TI.');
  assertPassphrase(passphrase);
  const salt = head.subarray(MAGIC.length, MAGIC.length + SALT);
  const iv = head.subarray(MAGIC.length + SALT);
  const decipher = crypto.createDecipheriv('aes-256-gcm', crypto.scryptSync(passphrase, salt, 32, SCRYPT), iv);
  decipher.setAuthTag(tag);
  async function* plain() {
    for await (const chunk of fs.createReadStream(inFile, { start: HEADER, end: size - TAG - 1 })) {
      const b = decipher.update(chunk);
      if (b.length) yield b;
    }
    yield decipher.final(); // lanza si la clave es otra o el archivo se alteró
  }
  try {
    await pipeline(Readable.from(plain()), fs.createWriteStream(outFile, { mode: 0o600 }));
  } catch {
    fs.rmSync(outFile, { force: true });
    throw new Error('No se pudo descifrar: la clave es incorrecta o el archivo fue alterado.');
  }
}

/** Instantánea consistente de la base y su comprobación de integridad. */
function snapshotDb(source, target) {
  const sqlite = /** @type {any} */ (process).getBuiltinModule?.('node:sqlite');
  if (!sqlite) throw new Error('La copia de la base requiere Node 22.13 o superior (SQLite integrado).');
  const live = new sqlite.DatabaseSync(source);
  try {
    live.prepare('VACUUM INTO ?').run(target);
  } finally {
    live.close();
  }
  return inspectDb(target);
}

function inspectDb(file) {
  const sqlite = /** @type {any} */ (process).getBuiltinModule('node:sqlite');
  const db = new sqlite.DatabaseSync(file, { readOnly: true });
  try {
    const integrity = db.prepare('PRAGMA integrity_check').get().integrity_check;
    const existing = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name));
    const counts = {};
    for (const t of TABLES) if (existing.has(t)) counts[t] = db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
    return { integrity, counts };
  } finally {
    db.close();
  }
}

const stamp = (d = new Date()) => d.toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);

/**
 * @param {{ dataDir: string, outDir: string, passphrase?: string, keep?: number, reports?: boolean, envFile?: string, encrypt?: boolean, stampOverride?: string }} o
 */
export async function createBackup({ dataDir, outDir, passphrase, keep = 14, reports = true, envFile, encrypt = true, stampOverride }) {
  if (encrypt) assertPassphrase(passphrase);
  const data = path.resolve(dataDir);
  if (!fs.existsSync(data)) throw new Error(`No existe la carpeta de datos: ${data}`);
  const out = path.resolve(outDir);
  if (out === data || out.startsWith(data + path.sep)) throw new Error('La carpeta de copias no puede estar dentro de data/: cada copia incluiría a las anteriores.');
  fs.mkdirSync(out, { recursive: true, mode: 0o700 });

  const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-bak-'));
  fs.chmodSync(stage, 0o700);
  const tgz = path.join(os.tmpdir(), `dti-bak-${crypto.randomBytes(6).toString('hex')}.tgz`);
  const warnings = [];
  try {
    for (const name of fs.readdirSync(data)) {
      if (SKIP_DB.test(name) || (name === 'reports' && !reports)) continue;
      fs.cpSync(path.join(data, name), path.join(stage, 'data', name), { recursive: true, filter: (src) => !/\.lock$/.test(src) });
    }
    fs.mkdirSync(path.join(stage, 'data'), { recursive: true });
    let db;
    if (fs.existsSync(path.join(data, 'audit.db'))) {
      db = snapshotDb(path.join(data, 'audit.db'), path.join(stage, 'data', 'audit.db'));
      if (db.integrity !== 'ok') throw new Error(`La base falló la comprobación de integridad: ${db.integrity}`);
    }
    if (envFile) {
      if (!fs.existsSync(envFile)) throw new Error(`No existe ${envFile}`);
      fs.mkdirSync(path.join(stage, 'env'), { recursive: true });
      fs.copyFileSync(envFile, path.join(stage, 'env', '.env.local'));
    }
    const chains = {};
    for (const c of CHAINS) {
      const f = path.join(stage, 'data', c);
      if (!fs.existsSync(f)) continue;
      chains[c] = verifyChained(f);
      // Una cadena rota se respalda igual (es evidencia), pero se avisa
      if (!chains[c].valid) warnings.push(`La cadena ${c} NO es válida: se respaldó tal cual, revísala.`);
    }
    const files = [];
    for (const rel of walk(stage)) {
      const full = path.join(stage, rel);
      files.push({ path: rel, size: fs.statSync(full).size, sha256: await sha256(full) });
    }
    const manifest = { version: 1, createdAt: new Date().toISOString(), host: os.hostname(), node: process.version, encrypted: encrypt, reports, db, chains, files };
    fs.writeFileSync(path.join(stage, 'manifest.json'), JSON.stringify(manifest, null, 2), { mode: 0o600 });

    run(['-czf', tgz, '-C', stage, '.']);
    const file = path.join(out, `defensati-backup-${stampOverride || stamp()}.${encrypt ? 'dtibak' : 'tgz'}`);
    if (encrypt) await encryptFile(tgz, file, passphrase);
    else {
      fs.copyFileSync(tgz, file);
      fs.chmodSync(file, 0o600);
      warnings.push('Copia SIN cifrar: contiene secretos y datos de clientes. No la guardes fuera de este servidor.');
    }

    const all = fs.readdirSync(out).filter((n) => NAME.test(n)).sort().reverse();
    const pruned = all.slice(Math.max(1, keep));
    for (const n of pruned) fs.rmSync(path.join(out, n), { force: true });
    return { file, size: fs.statSync(file).size, sha256: await sha256(file), manifest, warnings, pruned };
  } finally {
    fs.rmSync(stage, { recursive: true, force: true });
    fs.rmSync(tgz, { force: true });
  }
}

/** Descifra y extrae en una carpeta temporal; comprueba todo y devuelve los problemas encontrados. */
export async function extractBackup(file, passphrase) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-rest-'));
  fs.chmodSync(work, 0o700);
  const cleanup = () => fs.rmSync(work, { recursive: true, force: true });
  try {
    const tgz = path.join(work, 'copia.tgz');
    if (file.endsWith('.dtibak')) await decryptFile(file, tgz, passphrase);
    else fs.copyFileSync(file, tgz);
    const dir = path.join(work, 'x');
    fs.mkdirSync(dir);
    run(['-xzf', tgz, '-C', dir]);
    fs.rmSync(tgz);

    const problems = [];
    const manifestFile = path.join(dir, 'manifest.json');
    if (!fs.existsSync(manifestFile)) throw new Error('La copia no trae manifest.json.');
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    const expected = new Map(manifest.files.map((f) => [f.path, f]));
    for (const rel of walk(dir)) {
      if (rel === 'manifest.json') continue;
      const f = expected.get(rel);
      if (!f) { problems.push(`archivo no declarado en el manifiesto: ${rel}`); continue; }
      const full = path.join(dir, rel);
      if (fs.statSync(full).size !== f.size || (await sha256(full)) !== f.sha256) problems.push(`el contenido no coincide con el manifiesto: ${rel}`);
      expected.delete(rel);
    }
    for (const rel of expected.keys()) problems.push(`falta un archivo del manifiesto: ${rel}`);
    const dbFile = path.join(dir, 'data', 'audit.db');
    if (fs.existsSync(dbFile)) {
      const db = inspectDb(dbFile);
      if (db.integrity !== 'ok') problems.push(`la base restaurada falla la integridad: ${db.integrity}`);
      if (JSON.stringify(db.counts) !== JSON.stringify(manifest.db?.counts)) problems.push('los recuentos de la base restaurada no coinciden con los de la copia');
    }
    for (const c of CHAINS) {
      const f = path.join(dir, 'data', c);
      if (fs.existsSync(f) && manifest.chains?.[c]?.valid && !verifyChained(f).valid) problems.push(`la cadena ${c} restaurada no es válida`);
    }
    return { dir, manifest, problems, cleanup };
  } catch (e) {
    cleanup();
    throw e;
  }
}

export async function verifyBackup(file, passphrase) {
  const x = await extractBackup(file, passphrase);
  try {
    return { ok: x.problems.length === 0, problems: x.problems, manifest: x.manifest };
  } finally {
    x.cleanup();
  }
}

/** Restaura en una carpeta vacía y distinta de la que usa la app. Nunca pisa datos vivos. */
export async function restoreBackup(file, passphrase, to, { force = false, liveDataDir } = {}) {
  const dest = path.resolve(to);
  const live = liveDataDir ? path.resolve(liveDataDir) : undefined;
  if (live && (dest === live || dest.startsWith(live + path.sep) || live.startsWith(dest + path.sep))) {
    throw new Error('Restaura en una carpeta nueva, no en la de datos de la app. Detén la app y el worker, y muévela tú.');
  }
  if (fs.existsSync(dest) && fs.readdirSync(dest).length && !force) throw new Error(`La carpeta ${dest} no está vacía. Usa otra, o --force si sabes lo que haces.`);
  const x = await extractBackup(file, passphrase);
  try {
    if (x.problems.length) throw new Error(`La copia no pasa la verificación, no se restaura:\n- ${x.problems.join('\n- ')}`);
    fs.mkdirSync(dest, { recursive: true, mode: 0o700 });
    fs.cpSync(path.join(x.dir, 'data'), dest, { recursive: true });
    if (fs.existsSync(path.join(x.dir, 'env'))) fs.cpSync(path.join(x.dir, 'env'), path.join(dest, '_env'), { recursive: true });
    if (process.platform !== 'win32') {
      for (const rel of walk(dest)) if (/(^|\/)(audit\.db|\.[a-z-]*secret|\.env.*)$/.test(rel) || rel.startsWith('engagements/')) fs.chmodSync(path.join(dest, rel), 0o600);
    }
    return { to: dest, files: walk(dest).length, manifest: x.manifest };
  } finally {
    x.cleanup();
  }
}

export const backupName = (n) => NAME.test(n);
