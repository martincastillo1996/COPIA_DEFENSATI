import http from 'node:http';
import https from 'node:https';
import { authorizeFull } from '../../src/lib/audit/authorization.mjs';
import { resolvePublic } from '../../src/lib/audit/net.mjs';
import { db, getJob, assertAllowed, logEvent } from '../../src/lib/audit/store.mjs';
import { crawl, compareAccess } from './crawler.mjs';
import * as tools from './engines.mjs';
import { recordRun } from './findings.mjs';
import { notify } from './notify.mjs';
import * as wordpress from './wordpress.mjs';
import * as apitest from './apitest.mjs';
import * as browser from './browser.mjs';
import { createLimiter } from './limiter.mjs';
import { PERIMETER } from '../../src/lib/audit/retest.mjs';

// Sin fetch: su límite de 5 minutos hasta las cabeceras corta las auditorías largas
function postJson(pathname, body, check) {
  return new Promise((resolve, reject) => {
    const u = new URL(pathname, process.env.MONITOR_APP_URL || 'http://127.0.0.1:3000');
    const req = (u.protocol === 'https:' ? https : http).request(u, { method: 'POST', headers: {
      'Content-Type': 'application/json', 'User-Agent': 'DefensaTI-Worker/3.0', Authorization: `Bearer ${(process.env.ADMIN_TOKEN || '').trim()}`,
    } }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (d) => { text += d; });
      res.on('error', reject);
      res.on('end', () => {
        try {
          const json = JSON.parse(text);
          if (res.statusCode !== 200) reject(new Error(json.error || `HTTP ${res.statusCode}`));
          else resolve(json);
        } catch (e) { reject(e); }
      });
    });
    req.setTimeout(1200000, () => req.destroy(new Error('La app no respondió.')));
    const watch = setInterval(() => {
      try { check(); } catch (e) { req.destroy(e); }
    }, 1000);
    req.on('close', () => clearInterval(watch));
    req.on('error', reject);
    req.end(JSON.stringify(body));
  });
}

const postScan = (body, check) => postJson('/api/scan', body, check);

/** CVE con su vector de ataque; KEV y EPSS quedan en la evidencia para priorizar. */
export function mapCve(list) {
  return list.map((f) => ({ key: f.id, title: f.title, severity: f.severity, confidence: f.confidence || 'probable', cwe: f.cwe, cvss: f.cvss, attack: f.attackVector,
    evidence: [[f.product, f.detectedVersion].filter(Boolean).join(' '), f.kev ? 'KEV (explotada activamente)' : '', f.epss ? `EPSS ${Math.round(f.epss * 100)}%` : ''].filter(Boolean).join(' · '),
    reproduction: 'Confirmar la versión instalada y el parche del proveedor.', fix: f.mitigation }));
}

/** Ejecuta las tareas en paralelo (o una a una con AUDIT_SERIAL=1, para servidores pequeños). */
async function runAll(tasks) {
  const done = {};
  const run = async ([name, fn]) => {
    try { done[name] = { status: 'fulfilled', value: await fn() }; } catch (reason) { done[name] = { status: 'rejected', reason }; }
  };
  const live = tasks.filter(Boolean);
  if (process.env.AUDIT_SERIAL === '1') for (const t of live) await run(t);
  else await Promise.all(live.map(run));
  return done;
}

/** Servicios de nmap -sV cruzados con la base local, NVD, KEV y EPSS. */
export async function cveFromServices(services, check, post = postJson) {
  const technologies = services.map(tools.serviceToTech).filter(Boolean);
  if (!technologies.length) return { status: 'skipped', detail: 'nmap no identificó versiones conocidas', findings: [] };
  const r = await post('/api/admin/cve', { technologies }, check);
  return { status: r.complete ? 'ok' : 'partial', detail: r.complete ? undefined : 'NVD no respondió: solo base local', findings: mapCve(r.findings) };
}

export function perimeterRuns(report) {
  // Si el sitio no respondió, la ausencia de hallazgos no significa que se corrigieron
  const reachable = typeof report.ttfb_ms === 'number';
  const map = (f) => ({ key: f.id, title: f.title, severity: f.severity, confidence: f.confidence, cwe: f.cwe, cvss: f.cvss,
    evidence: f.evidence, reproduction: f.evidence ? `Comprobar: ${f.evidence}` : undefined, fix: f.mitigation, attack: f.attackVector });
  const all = report.webApp?.findings || [];
  const status = (present) => (present && reachable ? 'ok' : 'error');
  const n = report.webApp?.nuclei;
  return {
    webapp: { status: status(report.webApp), findings: all.filter((f) => !f.id.startsWith('nuclei-')).map(map) },
    surface: { status: status(report.asm), findings: (report.asm?.findings || []).map(map) },
    nuclei: {
      status: !n ? 'error' : !n.available ? 'missing' : n.complete && reachable ? 'ok' : 'partial',
      findings: all.filter((f) => f.id.startsWith('nuclei-')).map(map),
    },
    files: {
      status: status(report.sensitiveFiles),
      findings: (report.sensitiveFiles?.findings || []).filter((f) => f.isExposed).map((f) => ({ key: f.path, title: `Archivo sensible expuesto: ${f.path}`,
        severity: 'CRÍTICO', confidence: 'confirmado', cwe: 'CWE-538', reproduction: `GET ${f.path}`, fix: 'Retirar el archivo y rotar los secretos que contenga.' })),
    },
    cve: {
      // Sin puertos medidos no se puede dar por corregido un hallazgo que depende de ellos
      status: report.cveIntel && !report.ports?.length ? 'partial' : status(report.cveIntel),
      findings: mapCve(report.cveIntel?.findings || []),
    },
  };
}

/** `auth` (cabeceras de sesión) solo vive en la memoria de este proceso. */
export async function executeJob(id, auth) {
  const job = getJob(id);
  const { engagement, host } = job;
  // Re-test: solo los motores de los hallazgos abiertos
  const only = job.only_engines ? new Set(JSON.parse(job.only_engines)) : null;
  const want = (name) => !only || only.has(name);
  const check = () => assertAllowed(engagement, host);
  const engines = {};
  const alerts = [];
  const update = (progress, step) => db().prepare('UPDATE jobs SET progress=?, step=?, engines=? WHERE id=?').run(progress, step, JSON.stringify(engines), id);
  const save = (engine, result) => {
    engines[engine] = { status: result.status, detail: result.detail, count: result.findings.length };
    alerts.push(...recordRun({ engagement, host, engine, findings: result.findings, complete: result.status === 'ok' }));
  };
  const attempt = async (engine, fn) => {
    check();
    let result;
    try {
      result = await fn();
    } catch (e) {
      result = { status: 'error', detail: e.message, findings: [] };
    }
    check(); // una parada no es un fallo del motor
    save(engine, result);
    return result;
  };

  try {
    const e = await authorizeFull(host, engagement);
    const ip = await resolvePublic(host);
    const origin = `https://${host}`;
    // Un solo presupuesto de peticiones para todos los motores de HTTP del trabajo
    const scope = { host, ip, rps: e.rps, ports: job.retest_ports || e.ports, active: Boolean(e.active), check, limiter: createLimiter(e.rps) };
    const crawlResult = async (options) => {
      const r = await crawl({ ...scope, origin, ...options });
      return { status: r.complete ? 'ok' : r.pages ? 'partial' : 'error', findings: r.findings,
        detail: `${r.pages} páginas, ${r.forms} formularios, ${r.params} parámetros, ${r.skipped} rutas peligrosas omitidas, ${r.errors} errores` };
    };

    if (auth) {
      if (auth.zap && !(e.staging && e.active)) throw new Error('ZAP con sesión solo se permite en staging con pruebas activas autorizadas (new --staging --active).');
      update(20, 'rastreo autenticado');
      await attempt('crawler-auth', () => crawlResult({ session: auth.sessionA }));
      if (auth.sessionB && auth.urls?.length) {
        update(70, 'control de acceso');
        await attempt('idor', async () => {
          const r = await compareAccess({ ...scope, origin, ...auth });
          return { status: r.complete ? 'ok' : 'partial', findings: r.findings };
        });
      }
      if (auth.zap) {
        update(85, 'ZAP con sesión');
        await attempt('zap-auth', () => tools.zap({ ...scope, session: auth.sessionA }));
      }
    } else {
      const perimeter = async () => {
        try {
          // El Nuclei largo solo corre en la auditoría completa o si hay hallazgos de Nuclei que re-probar
          const data = await postScan({ url: origin, mode: 'full', deep: only ? only.has('nuclei') : true, force: true, legalConsentAccepted: true, engagementId: engagement }, check);
          db().prepare('UPDATE jobs SET report=? WHERE id=?').run(data.id, id);
          for (const [name, result] of Object.entries(perimeterRuns(data.report))) save(name, result);
        } catch (err) {
          check();
          save('perimeter', { status: 'error', detail: err.message, findings: [] });
        }
      };
      update(5, 'perímetro, nmap, testssl, rastreo, WordPress y API');
      // En paralelo: el motor más lento (Nuclei) ya no espera a los demás. Se espera a todos para no dejar procesos vivos si hay una parada.
      const done = await runAll([
        PERIMETER.some((n) => want(n)) && ['perimeter', perimeter],
        want('nmap') && ['nmap', () => attempt('nmap', () => tools.nmap(scope))],
        want('testssl') && ['testssl', () => attempt('testssl', () => tools.testssl(scope))],
        want('crawler') && ['crawler', () => attempt('crawler', () => crawlResult({ verifyTls: false }))],
        want('wordpress') && ['wordpress', () => attempt('wordpress', () => wordpress.audit(scope))],
        want('api') && ['api', () => attempt('api', () => apitest.audit(scope))],
        want('browser') && ['browser', () => attempt('browser', () => browser.audit(scope))],
      ]);
      for (const r of Object.values(done)) if (r.status === 'rejected') throw r.reason;
      if (want('cve-services')) {
        update(60, 'CVE de los servicios');
        await attempt('cve-services', () => cveFromServices(done.nmap?.value?.services || [], check));
      }
      // ZAP va solo y al final: es el que más memoria usa
      const zapName = scope.active ? 'zap-active' : 'zap-baseline';
      if (want(zapName)) {
        update(70, 'ZAP');
        await attempt(zapName, () => tools.zap(scope));
      }
    }

    // 'skipped' = no aplicaba (sin WordPress ni OpenAPI): no es una falla
    const incomplete = Object.values(engines).some((x) => x.status !== 'ok' && x.status !== 'skipped');
    update(100, 'fin');
    db().prepare('UPDATE jobs SET status=?, finished=? WHERE id=?').run(incomplete ? 'partial' : 'done', Date.now(), id);
  } catch (err) {
    db().prepare("UPDATE jobs SET status='failed', error=?, engines=?, finished=? WHERE id=?").run(err.message, JSON.stringify(engines), Date.now(), id);
  }

  const final = getJob(id);
  logEvent('job.finish', { id, status: final.status, error: final.error });
  const urgent = alerts.filter((f) => f.severity === 'CRÍTICO' || f.severity === 'ALTO');
  if (urgent.length) {
    await notify(`🔴 ${urgent.length} hallazgo(s) alto/crítico nuevo(s) en ${host}\n${urgent.slice(0, 8).map((f) => `• [${f.severity}] ${f.title}`).join('\n')}`);
  }
  if (final.status !== 'done') await notify(`🟠 Auditoría ${final.status} de ${host}: revisar motores del trabajo ${id}. ${final.error || ''}`);
  return final;
}
