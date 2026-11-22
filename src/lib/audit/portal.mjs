// Portal del cliente: ve sus hallazgos y pide un re-test. Acceso por enlace con token de 256 bits;
// en la base solo queda su hash. La vista no incluye notas internas ni quién validó qué.
import crypto from 'node:crypto';
import { assertAllowed, db, enqueue, getEngagement, logEvent } from './store.mjs';
import { buildReport } from './expert.mjs';
import { planRetest } from './retest.mjs';

const hash = (/** @type {string} */ t) => crypto.createHash('sha256').update(t).digest('hex');
const RETEST_COOLDOWN_MS = 30 * 60 * 1000;
const DAY = 86400000;

/** @param {string} engagementId @param {number} [days] días de acceso tras terminar la ventana */
export function createPortalToken(engagementId, days = 30) {
  const e = getEngagement(engagementId);
  const token = crypto.randomBytes(32).toString('hex');
  const until = Math.max(e.ends, Date.now()) + days * DAY;
  db().prepare('UPDATE engagements SET portal_hash=?, portal_until=? WHERE id=?').run(hash(token), until, engagementId);
  logEvent('portal.create', { id: engagementId, until });
  return { token, until };
}

/** @param {string} engagementId */
export function revokePortal(engagementId) {
  getEngagement(engagementId);
  db().prepare('UPDATE engagements SET portal_hash=NULL, portal_until=NULL WHERE id=?').run(engagementId);
  logEvent('portal.revoke', { id: engagementId });
}

/** @param {string} token @returns {any} */
export function engagementByToken(token) {
  if (!/^[a-f0-9]{64}$/.test(String(token))) return null;
  const row = db().prepare('SELECT * FROM engagements WHERE portal_hash=?').get(hash(token));
  if (!row || !row.portal_until || Date.now() > row.portal_until) return null;
  return { ...row, hosts: JSON.parse(row.hosts) };
}

/** @param {string} token */
export function clientView(token) {
  const e = engagementByToken(token);
  if (!e) return null;
  const r = buildReport(e.id);
  const last = db().prepare('SELECT status, progress, step, created, finished, only_engines FROM jobs WHERE engagement=? ORDER BY created DESC LIMIT 1').get(e.id);
  const now = Date.now();
  return {
    engagement: { domain: e.domain, client: e.client, hosts: e.hosts, starts: e.starts, ends: e.ends },
    summary: r.summary,
    findings: r.findings.map((f) => ({
      id: f.id, host: f.host, title: f.title, severity: f.severity, confidence: f.confidence, needsValidation: f.needsValidation, status: f.status,
      attack: f.attack, impact: f.impact, mitre: f.mitre, evidence: f.evidence, fix: f.fix, retest: f.retest, cwe: f.cwe, kev: f.kev,
    })),
    paths: r.paths.map((p) => ({ id: p.id, title: p.title, severity: p.severity, impact: p.impact, allProven: p.allProven, steps: p.steps.map((s) => ({ text: s.text, state: s.state })) })),
    plan: r.plan,
    snippets: r.snippets,
    notRun: r.coverage.notRun,
    lastJob: last ? { status: last.status, progress: last.progress, step: last.step, at: last.finished || last.created, retest: Boolean(last.only_engines) } : null,
    canRetest: !e.stopped && Boolean(e.verified) && now >= e.starts && now <= e.ends,
  };
}

/**
 * El cliente pide repetir las pruebas de lo abierto. No elige qué ni dónde: solo sus hosts y sus hallazgos.
 * @param {string} token @returns {string[]} ids de los trabajos encolados
 */
export function requestRetest(token) {
  const e = engagementByToken(token);
  if (!e) throw new Error('Enlace no válido o vencido.');
  const recent = db().prepare('SELECT 1 FROM jobs WHERE engagement=? AND created>? LIMIT 1').get(e.id, Date.now() - RETEST_COOLDOWN_MS);
  if (recent) throw new Error('Ya hay un re-test reciente: espera 30 minutos.');
  const ids = [];
  for (const host of e.hosts) {
    assertAllowed(e.id, host); // ventana, verificación y parada de emergencia
    let plan;
    try { plan = planRetest(e.id, host); } catch { continue; }
    try { ids.push(enqueue(e.id, host, 'queued', { only: plan.engines, ports: plan.ports })); } catch { /* ya hay un trabajo para ese host */ }
  }
  if (!ids.length) throw new Error('No hay nada que re-probar ahora.');
  logEvent('portal.retest', { id: e.id, jobs: ids.length });
  return ids;
}
