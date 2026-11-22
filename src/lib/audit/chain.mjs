// Registro append-only encadenado por SHA-256. Detecta ediciones, inserciones y borrados intermedios.
// Un recorte del final solo se detecta comparando con un hash guardado fuera del servidor (`audit log`).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const GENESIS = '0'.repeat(64);

function withLock(file, fn) {
  const lock = `${file}.lock`;
  const until = Date.now() + 5000;
  for (;;) {
    try {
      fs.closeSync(fs.openSync(lock, 'wx'));
      break;
    } catch (e) {
      // EPERM: en Windows, el candado se está borrando en otro proceso
      if (e.code !== 'EEXIST' && e.code !== 'EPERM') throw e;
      try {
        // Candado huérfano de un proceso caído
        if (Date.now() - fs.statSync(lock).mtimeMs > 30000) fs.unlinkSync(lock);
      } catch {}
      if (Date.now() > until) throw new Error(`Registro bloqueado: ${file}`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10);
    }
  }
  try {
    return fn();
  } finally {
    fs.unlinkSync(lock);
  }
}

function lastHash(file) {
  if (!fs.existsSync(file)) return GENESIS;
  const size = fs.statSync(file).size;
  if (!size) return GENESIS;
  const buf = Buffer.alloc(Math.min(size, 65536));
  const fd = fs.openSync(file, 'r');
  try {
    fs.readSync(fd, buf, 0, buf.length, size - buf.length);
  } finally {
    fs.closeSync(fd);
  }
  return JSON.parse(buf.toString('utf8').trimEnd().split('\n').pop()).hash;
}

/** @param {string} file @param {unknown} data */
export function appendChained(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return withLock(file, () => {
    const prev = lastHash(file);
    const body = JSON.stringify(data);
    const hash = sha(`${prev}\n${body}`);
    fs.appendFileSync(file, `${JSON.stringify({ prev, body, hash })}\n`, { mode: 0o600 });
    return hash;
  });
}

/** @param {string} file @returns {any[]} */
export function readChained(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(JSON.parse(l).body));
}

/** @param {string} file */
export function verifyChained(file) {
  let head = GENESIS;
  let count = 0;
  if (!fs.existsSync(file)) return { valid: true, count, head };
  for (const line of fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
    try {
      const r = JSON.parse(line);
      if (r.prev !== head || sha(`${r.prev}\n${r.body}`) !== r.hash) return { valid: false, count, head };
      head = r.hash;
      count++;
    } catch {
      return { valid: false, count, head };
    }
  }
  return { valid: true, count, head };
}

/** ¿Contiene la cadena este hash? Si no, se recortó o se reemplazó desde que se guardó. @param {string} file @param {string} hash */
export function containsHash(file, hash) {
  if (!fs.existsSync(file)) return false;
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).some((l) => {
    try { return JSON.parse(l).hash === hash; } catch { return false; }
  });
}
