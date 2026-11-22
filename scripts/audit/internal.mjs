// Revisión interna con permiso escrito aparte (--internal): código, dependencias, secretos y servidor.
// Estas herramientas leen archivos que el cliente entregó; no envían tráfico al sitio del cliente.
// Nunca se guarda un secreto ni una línea de código: solo archivo, línea, regla y corrección.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runTool } from './proc.mjs';
import { recordRun } from './findings.mjs';
import { assertAllowed, logEvent } from '../../src/lib/audit/store.mjs';

const RANK = { 'CRÍTICO': 4, ALTO: 3, MEDIO: 2, BAJO: 1 };
const top = (list, max) => list.sort((a, b) => RANK[b.severity] - RANK[a.severity]).slice(0, max);
const failed = (r, name) => ({
  status: r.missing ? 'missing' : 'error',
  detail: r.missing ? `${name} no está instalado` : r.reason || r.err.trim().split('\n').pop() || `${name} terminó con código ${r.code}`,
  findings: [],
});
const rel = (dir, file) => path.relative(dir, path.resolve(dir, String(file))).split(path.sep).join('/');
const cweOf = (v) => String([v].flat()[0] ?? '').match(/CWE-\d+/i)?.[0]?.toUpperCase();

export function parseSemgrep(json, dir) {
  const sev = { ERROR: 'ALTO', WARNING: 'MEDIO', INFO: 'BAJO' };
  const out = new Map();
  for (const r of json.results || []) {
    const cwe = cweOf(r.extra?.metadata?.cwe);
    const where = `${rel(dir, r.path)}:${r.start?.line}`;
    out.set(`${r.check_id}:${where}`, {
      key: `${r.check_id}:${where}`, title: `Código: ${String(r.extra?.message || r.check_id).split('\n')[0].slice(0, 160)}`,
      severity: sev[r.extra?.severity] || 'BAJO', confidence: 'probable', cwe,
      evidence: `${where} · regla ${String(r.check_id).split('.').slice(-2).join('.')}`,
      reproduction: `semgrep scan --config p/default ${rel(dir, r.path)}`,
      fix: r.extra?.fix || 'Sustituir el patrón inseguro por la API segura del framework y comprobar a mano si el dato llega desde el usuario.',
    });
  }
  return top([...out.values()], 300);
}

export function parseGitleaks(list, dir) {
  const critical = /private-key|aws|gcp|azure|stripe|github|gitlab|slack|database|password|jwt|openai|anthropic/i;
  const out = new Map();
  for (const x of list || []) {
    const where = `${rel(dir, x.File)}:${x.StartLine}`;
    out.set(`${x.RuleID}:${where}`, {
      key: `${x.RuleID}:${where}`, title: `Secreto en el repositorio: ${x.Description || x.RuleID}`,
      severity: critical.test(x.RuleID) ? 'CRÍTICO' : 'ALTO', confidence: 'probable', cwe: 'CWE-798',
      evidence: `${where}${x.Commit ? ` · historial git ${String(x.Commit).slice(0, 8)}` : ''} · regla ${x.RuleID}`,
      reproduction: 'gitleaks detect --source <repositorio> --redact',
      fix: 'Revocar y reemplazar el secreto en el proveedor. Quitarlo del historial no basta: ya debe considerarse copiado.',
    });
  }
  return top([...out.values()], 300);
}

export function parseTrivy(json, dir) {
  const sev = { CRITICAL: 'CRÍTICO', HIGH: 'ALTO', MEDIUM: 'MEDIO', LOW: 'BAJO' };
  const out = new Map();
  for (const res of json.Results || []) {
    const target = rel(dir, res.Target || '');
    for (const v of res.Vulnerabilities || []) {
      if (!sev[v.Severity]) continue;
      const cvss = Object.values(v.CVSS || {}).map((c) => c.V3Score).find(Boolean);
      out.set(`${v.VulnerabilityID}:${v.PkgName}:${target}`, {
        key: `${v.VulnerabilityID}:${v.PkgName}:${target}`, title: `Dependencia: ${v.PkgName} ${v.InstalledVersion}: ${v.VulnerabilityID}${v.Title ? ` ${String(v.Title).slice(0, 100)}` : ''}`,
        severity: sev[v.Severity], confidence: 'confirmado', cwe: cweOf(v.CweIDs), cvss,
        evidence: `${target} · ${v.PkgName} ${v.InstalledVersion}${v.FixedVersion ? ` · corregida en ${v.FixedVersion}` : ' · sin corrección'}`,
        reproduction: `trivy fs --scanners vuln ${target || '.'}`,
        fix: v.FixedVersion ? `Actualizar ${v.PkgName} a ${v.FixedVersion} o superior.` : `Sin parche publicado: sustituir ${v.PkgName} o mitigar su uso.`,
      });
    }
    for (const m of res.Misconfigurations || []) {
      if (!sev[m.Severity]) continue;
      out.set(`${m.ID}:${target}`, { key: `${m.ID}:${target}`, title: `Configuración: ${m.Title} (${m.ID})`, severity: sev[m.Severity], confidence: 'confirmado',
        evidence: `${target} · ${m.ID}`, reproduction: `trivy config ${target || '.'}`, fix: m.Resolution || 'Aplicar la resolución del control.' });
    }
    for (const s of res.Secrets || []) {
      out.set(`${s.RuleID}:${target}:${s.StartLine}`, { key: `${s.RuleID}:${target}:${s.StartLine}`, title: `Secreto en el repositorio: ${s.Title || s.RuleID}`,
        severity: 'ALTO', confidence: 'probable', cwe: 'CWE-798', evidence: `${target}:${s.StartLine} · regla ${s.RuleID}`,
        reproduction: 'trivy fs --scanners secret .', fix: 'Revocar y reemplazar el secreto.' });
    }
  }
  return top([...out.values()], 300);
}

/** /var/log/lynis-report.dat: pares clave=valor. */
export function parseLynis(text) {
  const findings = [];
  let index;
  for (const line of text.split(/\r?\n/)) {
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const k = line.slice(0, eq);
    const v = line.slice(eq + 1);
    if (k === 'hardening_index') index = Number(v);
    if (k !== 'warning[]' && k !== 'suggestion[]') continue;
    const [id, msg, details, solution] = v.split('|');
    if (!id) continue;
    const warn = k === 'warning[]';
    findings.push({ key: id, title: `Servidor (Lynis ${id}): ${msg}`, severity: warn ? 'MEDIO' : 'BAJO', confidence: 'confirmado',
      evidence: details && details !== '-' ? details.slice(0, 200) : undefined,
      fix: solution && solution !== '-' ? solution.slice(0, 300) : 'Ver el control en la documentación de Lynis.' });
  }
  return { index, findings: [...findings.filter((f) => f.severity === 'MEDIO'), ...findings.filter((f) => f.severity === 'BAJO').slice(0, 100)] };
}

/** Respuesta de HIBP por dominio: { alias: [filtraciones] }. Se guardan recuentos, nunca correos. */
export function parseHibp(map, domain) {
  const per = new Map();
  for (const breaches of Object.values(map || {})) for (const b of breaches) per.set(b, (per.get(b) || 0) + 1);
  return [...per].map(([name, n]) => ({
    key: `hibp:${name}`, title: `Credenciales de ${n} cuenta(s) de @${domain} aparecen en la filtración ${name}`,
    severity: n >= 10 ? 'CRÍTICO' : 'ALTO', confidence: 'confirmado',
    evidence: `${n} cuenta(s) en ${name} (Have I Been Pwned)`, reproduction: `Panel de Have I Been Pwned del dominio ${domain}`,
    fix: 'Forzar el cambio de contraseña de esas cuentas, exigir MFA y revisar accesos recientes.',
  }));
}

const scratch = () => fs.mkdtempSync(path.join(os.tmpdir(), 'dti-int-'));
const cleanup = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch {} };

export async function semgrep({ dir, check }) {
  const r = await runTool(process.env.SEMGREP_PATH || 'semgrep', ['scan', '--config', 'p/default', '--config', 'p/owasp-top-ten', '--json', '--metrics', 'off', '--quiet',
    '--exclude', 'node_modules', '--exclude', 'vendor', '--exclude', '.git', '--timeout', '30', '--max-target-bytes', '1000000', dir], { timeout: 1800000, check });
  if (r.missing || r.reason) return failed(r, 'semgrep');
  try { return { status: 'ok', findings: parseSemgrep(JSON.parse(r.out), dir) }; } catch { return failed(r, 'semgrep'); }
}

export async function gitleaks({ dir, check }) {
  const tmp = scratch();
  try {
    const file = path.join(tmp, 'r.json');
    const args = ['detect', '--source', dir, '--report-format', 'json', '--report-path', file, '--redact', '--no-banner', '--exit-code', '0', ...(fs.existsSync(path.join(dir, '.git')) ? [] : ['--no-git'])];
    const r = await runTool(process.env.GITLEAKS_PATH || 'gitleaks', args, { timeout: 1200000, check });
    if (r.missing || r.reason || !fs.existsSync(file)) return failed(r, 'gitleaks');
    return { status: 'ok', findings: parseGitleaks(JSON.parse(fs.readFileSync(file, 'utf8') || '[]'), dir) };
  } finally { cleanup(tmp); }
}

export async function trivy({ dir, check }) {
  const r = await runTool(process.env.TRIVY_PATH || 'trivy', ['fs', '--format', 'json', '--scanners', 'vuln,secret,misconfig', '--quiet', '--skip-dirs', 'node_modules', dir], { timeout: 1800000, check });
  if (r.missing || r.reason) return failed(r, 'trivy');
  try { return { status: 'ok', findings: parseTrivy(JSON.parse(r.out), dir) }; } catch { return failed(r, 'trivy'); }
}

export function lynis({ file }) {
  const st = fs.statSync(file);
  if (!st.isFile() || st.size > 5e6) throw new Error('El informe de Lynis debe ser un archivo de texto menor de 5 MB.');
  const { index, findings } = parseLynis(fs.readFileSync(file, 'utf8'));
  if (index === undefined) throw new Error('No parece un lynis-report.dat (falta hardening_index).');
  return { status: 'ok', detail: `índice de hardening ${index}/100`, findings };
}

export async function hibp({ domain, key = process.env.HIBP_API_KEY, get = fetch }) {
  if (!key) return { status: 'missing', detail: 'falta HIBP_API_KEY (API de pago; el dominio debe estar verificado en HIBP)', findings: [] };
  const res = await get(`https://haveibeenpwned.com/api/v3/breacheddomain/${encodeURIComponent(domain)}`, { headers: { 'hibp-api-key': key, 'User-Agent': 'DefensaTI-Audit' }, signal: AbortSignal.timeout(15000) });
  if (res.status === 404) return { status: 'ok', findings: [] };
  if (!res.ok) return { status: 'error', detail: `HIBP respondió ${res.status}${res.status === 403 ? ' (¿dominio sin verificar en HIBP?)' : ''}`, findings: [] };
  return { status: 'ok', findings: parseHibp(await res.json(), domain) };
}

/** Ejecuta lo pedido y registra el resultado de cada motor. Devuelve un resumen. */
export async function runInternal(e, { repo, lynis: lynisFile, hibp: wantHibp }) {
  if (!e.internal) throw new Error('Esta autorización no incluye revisión interna: créala con --internal y que el PDF lo autorice por escrito.');
  const check = () => { assertAllowed(e.id, e.domain); };
  check();
  const summary = {};
  const save = (engine, r) => {
    recordRun({ engagement: e.id, host: e.domain, engine, findings: r.findings, complete: r.status === 'ok' });
    summary[engine] = { status: r.status, detail: r.detail, count: r.findings.length };
  };
  const attempt = async (engine, fn) => {
    check();
    let r;
    try { r = await fn(); } catch (err) { r = { status: 'error', detail: err.message, findings: [] }; }
    check();
    save(engine, r);
  };
  if (repo) {
    const dir = fs.realpathSync(repo);
    if (!fs.statSync(dir).isDirectory()) throw new Error('--repo debe ser un directorio.');
    for (const [name, fn] of [['semgrep', semgrep], ['gitleaks', gitleaks], ['trivy', trivy]]) await attempt(name, () => fn({ dir, check }));
  }
  if (lynisFile) await attempt('lynis', async () => lynis({ file: lynisFile }));
  if (wantHibp) await attempt('hibp', () => hibp({ domain: e.domain }));
  logEvent('internal.run', { engagement: e.id, engines: Object.keys(summary) });
  return summary;
}
