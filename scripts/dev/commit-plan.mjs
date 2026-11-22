#!/usr/bin/env node
// Qué subir al commit y qué no: npm run commit:plan
// Solo lee el estado de git y el contenido de los archivos que se van a subir; no ejecuta ningún git que escriba.
// Escribe el plan en _to_delete/commit-plan.txt (ignorado por git).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const MAX_SCAN = 1024 * 1024;

/** Archivos que no deben subirse nunca, con el motivo que se le muestra al usuario. */
const EXCLUDE = [
  [/^\.agents\//, 'herramientas locales de agentes; el código no las usa'],
  [/^skills-lock\.json$/, 'bloqueo de herramientas locales'],
  [/^(_to_delete|backups|data|\.claude)\//, 'datos o trabajo local (copias, datos de clientes, ajustes personales)'],
  [/(^|\/)\.env(\.(?!example$).*)?$/, 'puede contener secretos'],
  [/\.(pem|key|dtibak)$/, 'clave o copia cifrada'],
  [/(^|\/)tsconfig\.tsbuildinfo$/, 'archivo generado'],
];
const REVIEW = [
  [/^scripts\/colab_benchmark_calibration\.py$/, 'es un script tuyo: confirma que quieres versionarlo'],
];
const ASSETS = /^public\/assets\//;

/**
 * @param {{ x: string, y: string, path: string }[]} entries salida de git status
 * @param {{ assetsReferenced?: boolean }} [opts]
 */
export function classify(entries, { assetsReferenced = false } = {}) {
  const add = [], exclude = [], review = [], tracked = [];
  for (const e of entries) {
    const untracked = e.x === '?' && e.y === '?';
    if (!untracked) { tracked.push(e); continue; }
    const hit = EXCLUDE.find(([re]) => re.test(e.path));
    if (hit) { exclude.push({ path: e.path, reason: hit[1] }); continue; }
    if (ASSETS.test(e.path) && !assetsReferenced) { exclude.push({ path: e.path, reason: 'ningún archivo de src/ lo referencia' }); continue; }
    const rev = REVIEW.find(([re]) => re.test(e.path));
    if (rev) { review.push({ path: e.path, reason: rev[1] }); continue; }
    add.push(e.path);
  }
  return { add, exclude, review, tracked };
}

/** Agrupa archivos en carpetas cuando TODO lo que está sin seguir bajo esa carpeta se va a añadir. */
export function collapse(add, allUntracked) {
  const addSet = new Set(add);
  const picked = new Set();
  const covered = (dir) => allUntracked.filter((p) => p.startsWith(`${dir}/`)).every((p) => addSet.has(p));
  for (const file of add) {
    let best = file;
    let dir = path.posix.dirname(file);
    while (dir && dir !== '.' && covered(dir)) { best = dir; dir = path.posix.dirname(dir); }
    picked.add(best);
  }
  return [...picked].sort();
}

const PATTERNS = [
  ['clave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['clave de AWS', /\bAKIA[0-9A-Z]{16}\b/],
  ['clave de Google', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['token de GitHub', /\bgh[pousr]_[A-Za-z0-9]{36,}\b/],
  ['token de Slack', /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ['clave de pago en vivo', /\b(?:sk|rk)_live_[0-9a-zA-Z]{16,}\b/],
  ['clave tipo OpenAI', /\bsk-[A-Za-z0-9]{32,}\b/],
  ['clave personal de DEFENSA TI', /\bdti_[a-f0-9]{64}\b/],
  ['secreto literal', /(?:secret|token|passw(?:or)?d|api[_-]?key)\s*[:=]\s*['"][A-Za-z0-9+/_-]{24,}['"]/i],
];

/** Devuelve coincidencias sin el valor completo: nunca se imprime el secreto. */
export function scanSecrets(file, content) {
  if (content.includes('\u0000')) return [];
  const hits = [];
  content.split('\n').forEach((line, i) => {
    for (const [name, re] of PATTERNS) {
      const m = line.match(re);
      if (m) hits.push({ file, line: i + 1, rule: name, sample: `${m[0].slice(0, 4)}…(${m[0].length} caracteres)` });
    }
  });
  return hits;
}

function git(args) {
  const r = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git ${args[0]} falló: ${r.stderr.trim()}`);
  return r.stdout;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
if (isMain) {
  const entries = git(['status', '--porcelain=v1', '-z', '-uall']).split('\0').filter(Boolean).map((l) => ({ x: l[0], y: l[1], path: l.slice(3) }));
  let assetsReferenced = false;
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else if (/\.(tsx?|mjs|css)$/.test(e.name) && /['"`(]\/assets\//.test(fs.readFileSync(f, 'utf8'))) assetsReferenced = true; } };
  walk('src');
  const plan = classify(entries, { assetsReferenced });
  const allUntracked = entries.filter((e) => e.x === '?').map((e) => e.path);

  // Escaneo de secretos en lo que se subirá: modificado, borrado no, y lo nuevo que se añade
  const toScan = [...plan.tracked.filter((t) => t.x !== 'D' && t.y !== 'D').map((t) => t.path), ...plan.add];
  const secrets = [];
  for (const f of toScan) {
    try {
      const st = fs.statSync(f);
      if (st.isFile() && st.size <= MAX_SCAN) secrets.push(...scanSecrets(f, fs.readFileSync(f, 'utf8')));
    } catch { /* borrado o ilegible */ }
  }

  const L = [];
  L.push('PLAN DE COMMIT', '', `Archivos con cambios ya versionados: ${plan.tracked.length} (${plan.tracked.filter((t) => t.x === 'D' || t.y === 'D').length} borrados)`,
    `Archivos nuevos que SÍ subir: ${plan.add.length}`, `Archivos nuevos que NO subir: ${plan.exclude.length}`, `Para que decidas tú: ${plan.review.length}`, '');
  L.push('== SECRETOS ==');
  if (secrets.length) { L.push('REVISA ANTES DE SUBIR (no se imprime el valor):'); for (const s of secrets) L.push(`  ${s.file}:${s.line}  ${s.rule}  ${s.sample}`); } else L.push('Ninguno detectado en lo que se va a subir.');
  L.push('', '== NO SUBIR ==');
  const byReason = new Map();
  for (const e of plan.exclude) byReason.set(e.reason, [...(byReason.get(e.reason) || []), e.path]);
  for (const [reason, list] of byReason) { const dirs = [...new Set(list.map((p) => p.split('/').slice(0, 2).join('/')))]; L.push(`  ${dirs.slice(0, 4).join(', ')}${dirs.length > 4 ? `… (+${dirs.length - 4})` : ''}  (${list.length} archivos): ${reason}`); }
  if (plan.review.length) { L.push('', '== DECIDE TÚ =='); for (const r of plan.review) L.push(`  ${r.path}: ${r.reason}`); }
  L.push('', '== COMANDOS ==', '# Modificaciones y borrados de archivos que ya están en git (incluye tus cambios anteriores)', 'git add -u', '',
    '# Archivos nuevos', `git add ${collapse(plan.add, allUntracked).map((p) => (/\s/.test(p) ? `"${p}"` : p)).join(' ')}`, '', 'git status --short | head -80   # revisa antes de confirmar');
  const text = L.join('\n');
  console.log(text);
  fs.mkdirSync('_to_delete', { recursive: true });
  fs.writeFileSync('_to_delete/commit-plan.txt', text);
  process.exitCode = secrets.length ? 1 : 0;
}
