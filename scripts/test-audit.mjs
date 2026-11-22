// Pruebas de la auditoría autorizada. Sin terceros: servidor local, DNS simulado y datos temporales.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
import dns from 'node:dns/promises';
import { execFile, spawnSync } from 'node:child_process';
import { promisify } from 'node:util';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-test-'));
process.env.AUDIT_DATA_DIR = tmp;

const store = await import('../src/lib/audit/store.mjs');
const chain = await import('../src/lib/audit/chain.mjs');
const { isPublicIp, pinnedGet } = await import('../src/lib/audit/net.mjs');
const SPEC_PATHS_FOR_TEST = ['/openapi.json', '/swagger.json', '/v3/api-docs', '/api/openapi.json', '/api/swagger.json', '/api-docs', '/swagger/v1/swagger.json', '/api/v1/openapi.json'];
const auth = await import('../src/lib/audit/authorization.mjs');
const { crawl, compareAccess, redactUrl } = await import('./audit/crawler.mjs');
const { recordRun, setStatus } = await import('./audit/findings.mjs');
const engines = await import('./audit/engines.mjs');
const { runTool } = await import('./audit/proc.mjs');
const { perimeterRuns, mapCve, cveFromServices } = await import('./audit/run.mjs');
const expert = await import('../src/lib/audit/expert.mjs');
const apitest = await import('./audit/apitest.mjs');
const wp = await import('./audit/wordpress.mjs');
const internal = await import('./audit/internal.mjs');
const { validate } = await import('./audit/findings.mjs');
const { createLimiter } = await import('./audit/limiter.mjs');
const { planRetest } = await import('../src/lib/audit/retest.mjs');
const watch = await import('./audit/watch.mjs');
const { extractEndpoints } = await import('./audit/endpoints.mjs');
const bench = await import('./audit/bench.mjs');
const portal = await import('../src/lib/audit/portal.mjs');
const browser = await import('./audit/browser.mjs');
const share = await import('../src/lib/audit/share.mjs');
const users = await import('../src/lib/audit/users.mjs');
const { renderPdf } = await import('./audit/pdf.mjs');
const bk = await import('./backup/lib.mjs');
const deploy = await import('./deploy/checks.mjs');
const own = await import('../src/lib/audit/ownership.mjs');
const exec = await import('../src/lib/audit/executive.mjs');
const cplan = await import('./dev/commit-plan.mjs');

const hits = [];
const server = http.createServer((req, res) => {
  hits.push({ method: req.method, url: req.url });
  const cookie = req.headers.cookie;
  const html = (body, status = 200) => res.writeHead(status, { 'content-type': 'text/html' }).end(body);
  if (req.url === '/') {
    return html('<a href="/files/">f</a><a href="/logout">x</a><a href="/%64elete/1">d</a><a href="http://otro.invalid/">o</a><a href="/go">g</a>'
      + '<form method="post" action="/save"><input name="email"></form><form method="post" action="/ok"><input type="hidden" name="csrf_token"></form>');
  }
  if (req.url === '/files/') return html('<title>Index of /files</title>');
  if (req.url === '/go') return res.writeHead(302, { location: 'http://169.254.169.254/latest' }).end();
  if (req.url === '/broken') return html(cookie ? 'dato de A' : 'login', cookie ? 200 : 401);
  if (req.url === '/safe') return html(cookie === 'A' ? 'dato de A' : 'no', cookie === 'A' ? 200 : 403);
  if (req.url === '/public') return html('público');
  return html('no existe', 404);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://app.test:${server.address().port}`;

const today = new Date(Date.now() - 5 * 3600000).toISOString().slice(0, 10);
const pdf = path.join(tmp, 'aut.pdf');
fs.writeFileSync(pdf, '%PDF-1.4 prueba');
const input = { domain: 'cliente.pe', client: 'C', signer: 'S', pdf, from: today, to: today };
let engagement;

const realTxt = dns.resolveTxt;
const realLookup = dns.lookup;
let txt = [];
dns.resolveTxt = async () => txt;
dns.lookup = async () => [{ address: '127.0.0.1', family: 4 }];

const tests = {
  'IP privadas, mapeadas y especiales bloqueadas': () => {
    for (const ip of ['127.0.0.1', '10.1.1.1', '169.254.169.254', '100.64.0.1', '172.31.0.1', '::1', '::ffff:127.0.0.1', 'fd00::1', '2002:a00:1::', '224.0.0.1', 'x']) {
      assert.equal(isPublicIp(ip), false, ip);
    }
    for (const ip of ['1.1.1.1', '8.8.8.8', '2606:4700:4700::1111']) assert.equal(isPublicIp(ip), true, ip);
  },
  'Autorización: alcance, fechas, PDF y puertos validados': () => {
    assert.throws(() => store.createEngagement({ ...input, hosts: ['otro.pe'] }), /no pertenece/);
    assert.throws(() => store.createEngagement({ ...input, hosts: ['malocliente.pe'] }), /no pertenece/);
    assert.throws(() => store.createEngagement({ ...input, to: '2000-01-01' }), /Fechas/);
    assert.throws(() => store.createEngagement({ ...input, ports: '80 --script x' }), /Puertos/);
    assert.throws(() => store.createEngagement({ ...input, rps: 999 }), /rps/);
    engagement = store.createEngagement(input);
  },
  'Sin verificar no hay modo full': async () => {
    await assert.rejects(auth.authorizeFull('cliente.pe'), /No hay autorización/);
    await assert.rejects(auth.verifyEngagement(engagement.id), /No se encontró/);
  },
  'TXT correcto verifica y autoriza solo ese host': async () => {
    txt = [[`defensati-verify=${engagement.token}`]];
    assert.equal(await auth.verifyEngagement(engagement.id), 'dns');
    assert.equal((await auth.authorizeFull('cliente.pe')).id, engagement.id);
    await assert.rejects(auth.authorizeFull('otro.cliente.pe', engagement.id), /fuera del alcance/);
  },
  'Retirar la prueba de dominio revoca': async () => {
    txt = [];
    await assert.rejects(auth.authorizeFull('cliente.pe'), /ya no está publicada/);
    txt = [[`defensati-verify=${engagement.token}`]];
  },
  'Alterar el PDF revoca': async () => {
    const copy = path.join(tmp, 'engagements', `${engagement.id}.pdf`);
    fs.writeFileSync(copy, '%PDF-alterado');
    await assert.rejects(auth.authorizeFull('cliente.pe'), /modificado/);
    fs.writeFileSync(copy, fs.readFileSync(pdf));
  },
  'Fuera de fechas no autoriza': () => {
    const old = store.createEngagement({ ...input, from: '2020-01-01', to: '2020-01-02' });
    store.db().prepare('UPDATE engagements SET verified=1 WHERE id=?').run(old.id);
    assert.throws(() => store.assertAllowed(old.id, 'cliente.pe'), /ventana/);
  },
  'Parada global y por autorización': () => {
    store.setEmergencyStop(true);
    assert.throws(() => store.assertAllowed(engagement.id, 'cliente.pe'), /emergencia/);
    store.setEmergencyStop(false);
    const set = store.db().prepare('UPDATE engagements SET stopped=? WHERE id=?');
    set.run(1, engagement.id);
    assert.throws(() => store.assertAllowed(engagement.id, 'cliente.pe'), /detenida/);
    set.run(0, engagement.id);
  },
  'La cola no duplica trabajos': () => {
    store.enqueue(engagement.id, 'cliente.pe');
    assert.throws(() => store.enqueue(engagement.id, 'cliente.pe'), /Ya hay/);
  },
  'Hallazgos: alta, re-test, reapertura y riesgo aceptado': () => {
    const f = { key: 'k', title: 'T', severity: 'ALTO', confidence: 'confirmado' };
    const run = (findings, complete) => recordRun({ engagement: engagement.id, host: 'cliente.pe', engine: 'x', findings, complete });
    const status = () => store.db().prepare("SELECT id,status FROM findings WHERE engine='x'").get();
    assert.equal(run([f], true).length, 1);
    assert.equal(run([f], true).length, 0);
    run([], false);
    assert.equal(status().status, 'open', 'una corrida parcial no verifica');
    run([], true);
    assert.equal(status().status, 'verified');
    assert.equal(run([f], true).length, 1, 'la reapertura alerta');
    assert.throws(() => setStatus(status().id, 'accepted'), /nota/);
    assert.throws(() => setStatus(status().id, 'verified'), /re-test/);
    setStatus(status().id, 'accepted', 'aprobado por S');
    run([f], true);
    assert.equal(status().status, 'accepted');
  },
  'Sitio caído no da nada por corregido': () => {
    const r = perimeterRuns({ ttfb_ms: null, webApp: { findings: [] }, asm: { findings: [] } });
    assert.equal(r.webapp.status, 'error');
    assert.equal(r.surface.status, 'error');
  },
  'Crawler: mismo origen, solo GET y rutas peligrosas omitidas': async () => {
    const r = await crawl({ origin, ip: '127.0.0.1', rps: 100, check() {} });
    assert.equal(r.complete, true);
    assert.deepEqual(r.findings.map((f) => f.key.split(':')[0]).sort(), ['csrf', 'listing']);
    assert.ok(hits.every((h) => h.method === 'GET'));
    assert.ok(!hits.some((h) => /logout|64elete|save|latest/.test(h.url)));
  },
  'Crawler: respeta rps': async () => {
    const start = Date.now();
    await crawl({ origin, ip: '127.0.0.1', rps: 10, check() {} });
    assert.ok(Date.now() - start >= 180);
  },
  'Crawler: la parada corta y la sesión no viaja por HTTP': async () => {
    await assert.rejects(crawl({ origin, ip: '127.0.0.1', rps: 100, check() { throw new Error('parada'); } }), /parada/);
    await assert.rejects(crawl({ origin, ip: '127.0.0.1', rps: 100, check() {}, session: { Cookie: 'A' } }), /HTTPS/);
  },
  'IDOR: detecta el roto e ignora el protegido y el público': async () => {
    const opts = { origin, ip: '127.0.0.1', rps: 100, check() {}, sessionA: { Cookie: 'A' }, sessionB: { Cookie: 'B' } };
    const r = await compareAccess({ ...opts, urls: ['/broken', '/safe', '/public'] });
    assert.equal(r.findings.length, 1);
    assert.match(r.findings[0].evidence, /broken/);
    await assert.rejects(compareAccess({ ...opts, urls: ['http://otro.invalid/x'] }), /no permitida/);
  },
  'La evidencia no guarda valores de parámetros': () => {
    const s = redactUrl(`https://c.pe/r/${'a'.repeat(40)}?token=secreto`);
    assert.ok(!s.includes('secreto') && !s.includes('a'.repeat(40)));
  },
  'Nmap, testssl y ZAP: interpretación de resultados': () => {
    const xml = '<port protocol="tcp" portid="3306"><state state="open" reason="syn-ack"/><service name="mysql" product="MySQL" version="8.0.1"/></port><port protocol="tcp" portid="81"><state state="closed"/></port>';
    assert.equal(engines.parseNmap(xml)[0].evidence, 'MySQL 8.0.1');
    assert.equal(engines.parseNmap(xml).length, 1);
    assert.equal(engines.parseTestssl([{ id: 'TLS1', severity: 'LOW', finding: 'x' }, { id: 'ok', severity: 'OK' }]).length, 1);
    const alert = { pluginid: '40012', name: 'XSS', riskcode: '3', confidence: '2', cweid: '79', instances: [{ uri: 'https://c.pe/?q=secreto', method: 'GET', param: 'q' }] };
    const z = engines.parseZap({ site: [{ alerts: [alert, { ...alert, confidence: '0' }] }] });
    assert.equal(z.length, 1);
    assert.ok(!z[0].evidence.includes('secreto'));
  },
  'ZAP activo solo con permiso expreso': () => {
    const types = (active) => engines.zapPlan({ host: 'c.pe', active, rps: 5 }).jobs.map((j) => j.type);
    assert.ok(!types(false).includes('activeScan'));
    assert.ok(types(true).includes('activeScan'));
    assert.ok(!types(false).includes('spiderAjax'));
    assert.ok(types(true).includes('spiderAjax'));
  },
  'Herramientas: parada, ausencia y secretos no heredados': async () => {
    const stopped = await runTool(process.execPath, ['-e', 'setTimeout(()=>{},20000)'], { check() { throw new Error('parada'); } });
    assert.equal(stopped.reason, 'parada');
    assert.equal((await runTool('no-existe-dti', [])).missing, true);
    process.env.DTI_TEST_SECRET = 'x';
    assert.equal((await runTool(process.execPath, ['-e', 'process.stdout.write(process.env.DTI_TEST_SECRET||"-")'])).out, '-');
  },
  'Cadena: escrituras concurrentes y detección de edición': async () => {
    const file = path.join(tmp, 'chain.jsonl');
    const mod = new URL('../src/lib/audit/chain.mjs', import.meta.url).href;
    const code = `import {appendChained} from ${JSON.stringify(mod)}; for (let i=0;i<50;i++) appendChained(${JSON.stringify(file)},{i});`;
    await Promise.all([1, 2, 3, 4].map(() => promisify(execFile)(process.execPath, ['--input-type=module', '-e', code])));
    assert.deepEqual([chain.verifyChained(file).valid, chain.verifyChained(file).count], [true, 200]);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('\\"i\\":7', '\\"i\\":9'));
    assert.equal(chain.verifyChained(file).valid, false);
  },

  'Informe experto: ataque, rutas y plan sin inventar nada': () => {
    const e = store.createEngagement({ ...input, domain: 'informe.pe' });
    const run = (engine, findings) => recordRun({ engagement: e.id, host: 'informe.pe', engine, findings, complete: true });
    run('files', [{ key: '.env', title: 'Archivo sensible expuesto: /.env', severity: 'CRÍTICO', confidence: 'confirmado', cwe: 'CWE-538' }]);
    run('nmap', [{ key: 'tcp/3306', title: 'Servicio expuesto tcp/3306 mysql', severity: 'ALTO', confidence: 'confirmado', evidence: 'MySQL 8.0.1 token secret xss' }]);
    run('nuclei', [{ key: 'p', title: 'Panel de administración expuesto', severity: 'MEDIO', confidence: 'probable', attack: 'vector propio del escáner' }]);
    const r = expert.buildReport(e.id);
    const db = r.findings.find((x) => /3306/.test(x.title));
    assert.equal(db.rule, 'db-exposed', 'la evidencia no decide el tipo');
    assert.ok(db.attack.length > 50 && db.mitre.includes('T1190') && db.retest.includes('nmap'));
    assert.equal(r.findings.find((x) => /Panel/.test(x.title)).attack, 'vector propio del escáner', 'manda el vector del escáner');
    const path = r.paths.find((p) => p.id === 'secrets-to-db');
    assert.ok(path && path.allProven);
    assert.equal(path.steps.filter((x) => x.state === 'supuesto').length, 3, 'lo no probado se marca como supuesto');
    assert.equal(r.findings.find((x) => /Panel/.test(x.title)).needsValidation, true);
    assert.ok(r.plan.h24.some((a) => /base de datos/i.test(a.action)));
    assert.equal(r.summary.counts['CRÍTICO'], 1);
    assert.ok(r.manual.length >= 8 && r.limits.length >= 4);
    const md = expert.toMarkdown(r);
    assert.ok(md.includes('Cómo podrían atacarlos') && md.includes('Plan de defensa') && md.includes('Revisión manual pendiente'));
  },
  'Informe experto: validar a mano exige nota y sobrevive a nuevas corridas': () => {
    const e = store.createEngagement({ ...input, domain: 'validar.pe' });
    const run = () => recordRun({ engagement: e.id, host: 'validar.pe', engine: 'nuclei', complete: true, findings: [{ key: 'x', title: 'Panel de administración expuesto', severity: 'ALTO', confidence: 'probable' }] });
    run();
    const id = store.db().prepare('SELECT id FROM findings WHERE engagement=?').get(e.id).id;
    assert.equal(expert.buildReport(e.id).findings[0].confidence, 'probable');
    assert.throws(() => validate(id, ''), /nota/);
    validate(id, 'Ana lo abrió en el navegador el 22/11');
    run();
    const f = expert.buildReport(e.id).findings[0];
    assert.deepEqual([f.confidence, f.validated, f.needsValidation], ['confirmado', true, false]);
  },
  'Informe experto: un paso por validar no se presenta como comprobado': () => {
    const e = store.createEngagement({ ...input, domain: 'rutas.pe' });
    recordRun({ engagement: e.id, host: 'rutas.pe', engine: 'zap-active', complete: true, findings: [{ key: 'a', title: 'Cross Site Scripting (Reflected)', severity: 'ALTO', confidence: 'probable', cwe: 'CWE-79' }] });
    recordRun({ engagement: e.id, host: 'rutas.pe', engine: 'webapp', complete: true, findings: [{ key: 'b', title: 'Cookie de sesión sin HttpOnly', severity: 'MEDIO', confidence: 'probable' }] });
    const p = expert.buildReport(e.id).paths.find((x) => x.id === 'xss-session');
    assert.ok(p && !p.allProven);
    assert.deepEqual(p.steps.map((x) => x.state), ['por validar', 'por validar', 'supuesto']);
    assert.equal(expert.buildReport(e.id).paths.find((x) => x.id === 'secrets-to-db'), undefined, 'sin las dos capacidades no hay ruta');
  },
  'Informe experto: el HTML escapa el texto del sitio auditado': () => {
    const e = store.createEngagement({ ...input, domain: 'html.pe' });
    recordRun({ engagement: e.id, host: 'html.pe', engine: 'nuclei', complete: true, findings: [{ key: 'x', title: '<script>alert(1)</script> panel', severity: 'BAJO', confidence: 'probable', evidence: '"><img src=x onerror=alert(2)>' }] });
    const html = expert.toHtml(expert.buildReport(e.id));
    assert.ok(!html.includes('<script>alert') && !html.includes('<img src=x') && html.includes('&lt;script&gt;'));
    assert.ok(html.includes("http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'"), 'el archivo guardado también lleva su CSP');
  },
  'API: solo GET sin parámetros, sin credenciales, y detecta lo declarado como protegido': async () => {
    const spec = { security: [{ bearer: [] }], paths: {
      '/users': { get: {} }, '/health': { get: { security: [] } }, '/orders/{id}': { get: {} }, '/logout': { get: {} },
      '/items': { get: { parameters: [{ in: 'query', name: 'q', required: true }] } }, '/admin/stats': { get: { security: [] } }, '/ping': { post: {} },
    } };
    const plan = apitest.planProbes(spec);
    assert.deepEqual(plan.probes.map((x) => x.path), ['/users', '/admin/stats']);
    assert.equal(plan.skipped, 3);
    assert.equal(apitest.judge({ path: '/users', declared: true }, { status: 200, body: '[{"id":1}]' })[0].cwe, 'CWE-306');
    assert.equal(apitest.judge({ path: '/users', declared: true }, { status: 401, body: '{"e":1}' }).length, 0);
    assert.equal(apitest.judge({ path: '/x', declared: true }, { status: 500, body: 'Traceback (most recent call last):' })[0].cwe, 'CWE-209');
    const seen = [];
    const get = async (url) => {
      seen.push(url);
      if (url.endsWith('/openapi.json')) return { status: 200, body: JSON.stringify(spec) };
      if (url.endsWith('/users')) return { status: 200, body: '[{"id":1}]' };
      return { status: url.endsWith('/admin/stats') ? 401 : 404, body: '{}' };
    };
    const r = await apitest.audit({ host: 'c.pe', ip: '1.2.3.4', rps: 1000, check() {}, get });
    assert.equal(r.status, 'ok');
    assert.equal(r.findings.length, 1);
    assert.ok(!seen.some((u) => /logout|\{|ping/.test(u)));
    const none = await apitest.audit({ host: 'c.pe', ip: '1.2.3.4', rps: 1000, check() {}, get: async () => ({ status: 404, body: '' }) });
    assert.deepEqual([none.status, none.findings.length], ['skipped', 0]);
  },
  'WordPress: versión exacta, vulnerabilidades solo si afectan y estado del plugin': async () => {
    const html = '<script src="/wp-content/plugins/foo/js/a.js?ver=1.0.0"></script><link href="/wp-content/themes/bar/style.css?ver=9.9">';
    const a = wp.extractAssets(html);
    assert.equal(a.plugins.get('foo'), '1.0.0');
    assert.equal(wp.readmeVersion('=== Foo ===\nStable tag: 1.2.2\n'), '1.2.2');
    assert.equal(wp.readmeVersion('Stable tag: trunk\n'), undefined);
    const entry = { friendly_name: 'Foo', vulnerabilities: [{ id: 1, title: 'XSS', fixed_in: '1.2.3', cvss: { score: 8.1 }, references: { cve: ['2024-1'] }, vuln_type: 'XSS' }, { id: 2, title: 'RCE', fixed_in: null, cvss: { score: 9.8 } }] };
    assert.equal(wp.judgeVulns('plugin', 'foo', '1.2.2', entry, true).length, 2);
    assert.equal(wp.judgeVulns('plugin', 'foo', '1.2.3', entry, true).length, 1, 'parcheada: solo queda la que no tiene parche');
    assert.equal(wp.judgeVulns('plugin', 'foo', '1.2.2', entry, false)[0].confidence, 'probable', 'versión de ?ver= no es exacta');
    const now = Date.parse('2026-11-21');
    const repo = wp.judgeRepo('plugin', 'foo', '1.0.0', { version: '2.0.0', last_updated: '2022-01-01 10:00am GMT' }, now);
    assert.deepEqual(repo.map((x) => x.key.split(':')[2]).sort(), ['abandoned', 'outdated']);
    assert.equal(wp.judgeRepo('plugin', 'foo', '1.0.0', { error: 'closed' }, now)[0].severity, 'ALTO');
    const get = async (url) => (url.endsWith('/')
      ? { status: 200, body: html } : url.includes('readme.txt') ? { status: 200, body: 'Stable tag: 1.2.2' } : { status: 404, body: '' });
    const fetchJson = async (url) => (url.includes('wpscan') ? { foo: entry } : { version: '1.3.0', last_updated: '2026-10-01 1:00pm GMT' });
    const withToken = await wp.audit({ host: 'c.pe', ip: '1.2.3.4', rps: 1000, check() {}, get, fetchJson, token: 'x', now });
    assert.ok(withToken.findings.some((x) => /XSS/.test(x.title)) && withToken.findings.some((x) => /desactualizado/.test(x.title)));
    const noToken = await wp.audit({ host: 'c.pe', ip: '1.2.3.4', rps: 1000, check() {}, get, fetchJson, token: '', now });
    assert.equal(noToken.status, 'partial');
    assert.match(noToken.detail, /WPSCAN_API_TOKEN/);
    const notWp = await wp.audit({ host: 'c.pe', ip: '1.2.3.4', rps: 1000, check() {}, get: async () => ({ status: 200, body: '<html></html>' }) });
    assert.equal(notWp.status, 'skipped');
  },
  'nmap: servicios con versión se cruzan con el motor CVE': () => {
    const xml = '<port protocol="tcp" portid="22"><state state="open"/><service name="ssh" product="OpenSSH" version="8.9p1 Ubuntu 3ubuntu0.6" extrainfo="Ubuntu Linux; protocol 2.0" ostype="Linux"/></port>'
      + '<port protocol="tcp" portid="80"><state state="open"/><service name="http" product="Apache httpd" version="2.4.49"/></port>'
      + '<port protocol="tcp" portid="9999"><state state="open"/><service name="x" product="Cosa rara" version="1.0"/></port>'
      + '<port protocol="tcp" portid="81"><state state="closed"/><service name="http" product="nginx" version="1.18.0"/></port>';
    const services = engines.parseNmapServices(xml);
    assert.equal(services.length, 3);
    const techs = services.map(engines.serviceToTech).filter(Boolean);
    assert.deepEqual(techs.map((t) => [t.product, t.version, t.distroPatched]), [['openssh', '8.9p1', true], ['apache', '2.4.49', false]]);
    assert.equal(engines.serviceToTech({ product: 'nginx', version: '' }), null, 'sin versión no hay nada que cruzar');
    assert.equal(mapCve([{ id: 'a', title: 'T', severity: 'ALTO', product: 'Apache', detectedVersion: '2.4.49', kev: true, epss: 0.91, attackVector: 'vector' }])[0].attack, 'vector');
    assert.match(mapCve([{ id: 'a', title: 'T', severity: 'ALTO', kev: true }])[0].evidence, /KEV/);
  },
  'CVE de servicios: sin versiones no se consulta; sin NVD queda parcial': async () => {
    const calls = [];
    const post = async (path, body) => { calls.push(body); return { findings: [{ id: 'apache-path-traversal-2021', title: 'Apache', severity: 'CRÍTICO', confidence: 'confirmado', attackVector: 'v' }], complete: calls.length > 1 }; };
    const none = await cveFromServices([{ port: 80, product: 'Cosa', version: '1' }], () => {}, post);
    assert.deepEqual([none.status, calls.length], ['skipped', 0]);
    const svc = [{ port: 80, product: 'Apache httpd', version: '2.4.49', extrainfo: '', ostype: '' }];
    const partial = await cveFromServices(svc, () => {}, post);
    assert.deepEqual([partial.status, partial.findings[0].attack, calls[0].technologies[0].product], ['partial', 'v', 'apache']);
    assert.equal((await cveFromServices(svc, () => {}, post)).status, 'ok');
  },
  'ZAP con sesión: el secreto va por variable de entorno y no por el plan': async () => {
    const plan = JSON.stringify(engines.zapPlan({ host: 'c.pe', active: true, rps: 5, sessionHeader: 'Cookie' }));
    assert.ok(plan.includes('replacer') && plan.includes('${ZAP_SESSION_VALUE}') && !plan.includes('SECRETO-123'));
    assert.ok(!JSON.stringify(engines.zapPlan({ host: 'c.pe', active: true, rps: 5 })).includes('replacer'));
    const r = await runTool(process.execPath, ['-e', 'process.stdout.write(process.env.ZAP_SESSION_VALUE + "|" + (process.env.ADMIN_TOKEN || "sin"))'], { env: { ZAP_SESSION_VALUE: 'SECRETO-123' } });
    assert.equal(r.out, 'SECRETO-123|sin');
  },
  'Revisión interna: parsers sin secretos ni código, y exige permiso aparte': async () => {
    const dir = '/repo';
    const sg = internal.parseSemgrep({ results: [{ check_id: 'python.django.security.sqli', path: '/repo/app/views.py', start: { line: 42 }, extra: { severity: 'ERROR', message: 'SQL injection', lines: 'cursor.execute(SECRETO)', metadata: { cwe: ['CWE-89: SQL Injection'] } } }] }, dir);
    assert.deepEqual([sg[0].severity, sg[0].cwe, sg[0].confidence], ['ALTO', 'CWE-89', 'probable']);
    assert.ok(!JSON.stringify(sg).includes('SECRETO') && sg[0].evidence.startsWith('app/views.py:42'));
    const gl = internal.parseGitleaks([{ RuleID: 'aws-access-token', File: '/repo/.env', StartLine: 3, Secret: 'AKIAREDACTED', Match: 'AKIAREDACTED', Commit: 'abcdef1234567' }], dir);
    assert.equal(gl[0].severity, 'CRÍTICO');
    assert.ok(!JSON.stringify(gl).includes('AKIA') && gl[0].evidence.includes('abcdef12'));
    const tv = internal.parseTrivy({ Results: [{ Target: '/repo/package-lock.json', Vulnerabilities: [{ VulnerabilityID: 'CVE-2024-1', PkgName: 'lodash', InstalledVersion: '4.17.0', FixedVersion: '4.17.21', Severity: 'HIGH', Title: 'Prototype pollution', CweIDs: ['CWE-1321'] }, { VulnerabilityID: 'CVE-2024-2', PkgName: 'x', InstalledVersion: '1', Severity: 'UNKNOWN' }] }] }, dir);
    assert.equal(tv.length, 1);
    assert.deepEqual([tv[0].confidence, tv[0].cwe], ['confirmado', 'CWE-1321']);
    assert.match(tv[0].fix, /4\.17\.21/);
    const ly = internal.parseLynis('hardening_index=61\nwarning[]=SSH-7440|Root login permitido|-|Poner PermitRootLogin no|\nsuggestion[]=BANN-7126|Agregar banner legal|-|-|\n');
    assert.equal(ly.index, 61);
    assert.deepEqual(ly.findings.map((x) => x.severity), ['MEDIO', 'BAJO']);
    const hb = internal.parseHibp({ ana: ['Adobe'], luis: ['Adobe', 'Canva'] }, 'c.pe');
    assert.deepEqual(hb.map((x) => [x.key, x.severity]), [['hibp:Adobe', 'ALTO'], ['hibp:Canva', 'ALTO']]);
    assert.ok(!JSON.stringify(hb).includes('ana') && !JSON.stringify(hb).includes('luis'), 'nunca se guardan los correos');
    assert.equal((await internal.hibp({ domain: 'c.pe', key: '' })).status, 'missing');
    const ok = await internal.hibp({ domain: 'c.pe', key: 'k', get: async () => ({ status: 200, ok: true, json: async () => ({ a: ['X'] }) }) });
    assert.equal(ok.findings.length, 1);
    assert.equal((await internal.hibp({ domain: 'c.pe', key: 'k', get: async () => ({ status: 404 }) })).findings.length, 0);
    const e = store.createEngagement({ ...input, domain: 'interno.pe' });
    await assert.rejects(() => internal.runInternal(e, { repo: '/tmp' }), /revisión interna/);
    const e2 = store.createEngagement({ ...input, domain: 'interno2.pe', internal: true, staging: true });
    assert.deepEqual([store.getEngagement(e2.id).internal, store.getEngagement(e2.id).staging], [1, 1]);
  },
  'Base antigua: se migra sin perder datos': async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-old-'));
    const code = `const { DatabaseSync } = process.getBuiltinModule('node:sqlite');
      const c = new DatabaseSync(process.env.AUDIT_DATA_DIR + '/audit.db');
      c.exec("CREATE TABLE findings(id TEXT PRIMARY KEY, engagement TEXT, host TEXT, engine TEXT, title TEXT, severity TEXT, confidence TEXT, cwe TEXT, cvss REAL, evidence TEXT, reproduction TEXT, fix TEXT, status TEXT, note TEXT, first_seen INTEGER, last_seen INTEGER); CREATE TABLE engagements(id TEXT PRIMARY KEY, domain TEXT, client TEXT, signer TEXT, hosts TEXT, starts INTEGER, ends INTEGER, pdf_sha TEXT, token TEXT, verified INTEGER, method TEXT, active INTEGER NOT NULL DEFAULT 0, ports TEXT, rps INTEGER NOT NULL DEFAULT 5, stopped INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL); CREATE TABLE jobs(id TEXT PRIMARY KEY, engagement TEXT, host TEXT, status TEXT, progress INTEGER NOT NULL DEFAULT 0, step TEXT, engines TEXT, error TEXT, report TEXT, pid INTEGER, created INTEGER NOT NULL, finished INTEGER); INSERT INTO findings(id,title) VALUES('viejo','Hallazgo previo'); INSERT INTO engagements(id,created) VALUES('e1',1)");
      c.close();
      const s = await import(process.argv[1]);
      const cols = s.db().prepare('PRAGMA table_info(findings)').all().map((r) => r.name);
      const ecols = s.db().prepare('PRAGMA table_info(engagements)').all().map((r) => r.name);
      const jcols = s.db().prepare('PRAGMA table_info(jobs)').all().map((r) => r.name);
      const snap = s.db().prepare("SELECT name FROM sqlite_master WHERE name='snapshots'").all().length;
      console.log(JSON.stringify({ n: s.db().prepare('SELECT title FROM findings').get().title, cols, ecols, jcols, snap }));`;
    const { stdout } = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', code, new URL('../src/lib/audit/store.mjs', import.meta.url).href], { env: { ...process.env, AUDIT_DATA_DIR: dir } });
    const r = JSON.parse(stdout);
    assert.equal(r.n, 'Hallazgo previo');
    for (const c of ['attack', 'validated', 'validated_note']) assert.ok(r.cols.includes(c), c);
    for (const c of ['staging', 'internal', 'portal_hash', 'portal_until']) assert.ok(r.ecols.includes(c), c);
    for (const c of ['only_engines', 'retest_ports']) assert.ok(r.jcols.includes(c), c);
    assert.equal(r.snap, 1);
    fs.rmSync(dir, { recursive: true, force: true });
  },

  'Limitador compartido: motores en paralelo no superan el ritmo autorizado': async () => {
    const lim = createLimiter(20);
    const stamps = [];
    const worker = async (n) => { for (let i = 0; i < n; i++) { await lim.take(); stamps.push(Date.now()); } };
    await Promise.all([worker(4), worker(4)]);
    stamps.sort((a, b) => a - b);
    const gaps = stamps.slice(1).map((t, i) => t - stamps[i]);
    assert.ok(Math.min(...gaps) >= 40, 'separación mínima ' + Math.min(...gaps));
    assert.ok(stamps.at(-1) - stamps[0] >= 330, 'ocho peticiones a 20/s no caben en menos de 350 ms');
  },
  'Re-test: solo los motores de lo abierto, con sus puertos y lo manual aparte': () => {
    const e = store.createEngagement({ ...input, domain: 'retest.pe' });
    const run = (engine, findings) => recordRun({ engagement: e.id, host: 'retest.pe', engine, findings, complete: true });
    assert.throws(() => planRetest(e.id, 'retest.pe'), /No hay hallazgos abiertos/);
    run('idor', [{ key: 'i', title: 'Posible IDOR', severity: 'ALTO', confidence: 'probable' }]);
    assert.throws(() => planRetest(e.id, 'retest.pe'), /manual/);
    run('nmap', [{ key: 'a', title: 'Servicio expuesto tcp/3306 mysql', severity: 'ALTO', confidence: 'confirmado' }, { key: 'b', title: 'Servicio expuesto tcp/22 ssh', severity: 'BAJO', confidence: 'informativo' }]);
    run('cve-services', [{ key: 'c', title: 'MySQL antiguo', severity: 'ALTO', confidence: 'probable' }]);
    run('files', [{ key: 'f', title: 'Archivo sensible expuesto: /.env', severity: 'CRÍTICO', confidence: 'confirmado' }]);
    const plan = planRetest(e.id, 'retest.pe');
    assert.deepEqual([...plan.engines].sort(), ['cve-services', 'files', 'nmap']);
    assert.equal(plan.ports, '22,3306');
    assert.deepEqual(plan.manual, ['idor']);
    store.db().prepare('UPDATE engagements SET verified=? WHERE id=?').run(Date.now(), e.id);
    const job = store.getJob(store.enqueue(e.id, 'retest.pe', 'queued', { only: plan.engines, ports: plan.ports }));
    assert.deepEqual(JSON.parse(job.only_engines).sort(), ['cve-services', 'files', 'nmap']);
    assert.equal(job.retest_ports, '22,3306');
    const e2 = store.createEngagement({ ...input, domain: 'retest2.pe' });
    recordRun({ engagement: e2.id, host: 'retest2.pe', engine: 'cve-services', complete: true, findings: [{ key: 'c', title: 'x', severity: 'ALTO', confidence: 'probable' }] });
    assert.ok(planRetest(e2.id, 'retest2.pe').engines.includes('nmap'), 'los CVE de servicios necesitan nmap -sV');
  },
  'Falsos positivos: exigen nota, no reaparecen y bajan la precisión del motor': () => {
    const e = store.createEngagement({ ...input, domain: 'fp.pe' });
    const items = [1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ key: 'k' + i, title: 'Panel de administración ' + i, severity: 'ALTO', confidence: 'probable' }));
    const run = () => recordRun({ engagement: e.id, host: 'fp.pe', engine: 'calidad', findings: items, complete: true });
    run();
    const rows = store.db().prepare("SELECT id FROM findings WHERE engine='calidad' ORDER BY title").all();
    assert.equal(rows.length, 8);
    assert.throws(() => setStatus(rows[0].id, 'false_positive', ''), /nota/);
    for (const r of rows.slice(0, 6)) setStatus(r.id, 'false_positive', 'Ana: es una página pública de ayuda');
    validate(rows[6].id, 'Luis lo comprobó: panel real');
    validate(rows[7].id, 'Luis lo comprobó: panel real 2');
    assert.throws(() => validate(rows[0].id, 'Ana otra vez comprobó algo'), /falso positivo/);
    assert.equal(run().length, 0, 'un falso positivo no vuelve a alertar');
    assert.equal(store.db().prepare('SELECT status FROM findings WHERE id=?').get(rows[0].id).status, 'false_positive');
    const r = expert.buildReport(e.id);
    assert.equal(r.findings.length, 2);
    assert.equal(r.summary.falsePositives, 6);
    const q = r.quality.find((x) => x.engine === 'calidad');
    assert.deepEqual([q.reviewed, q.trusted, q.low], [8, true, true]);
    assert.equal(r.findings[0].engineQuality.low, true);
  },
  'Vigilancia: fotos comparables, cambios que importan y los mismos 36 puertos del escáner': async () => {
    const mkResolver = (over = {}) => ({
      resolve4: async () => ['1.2.3.4'], resolve6: async () => { throw new Error('sin AAAA'); },
      resolveMx: async () => [{ priority: 10, exchange: 'mx.c.pe' }], resolveNs: async () => ['ns1.c.pe'],
      resolveTxt: async (h) => (h.startsWith('_dmarc') ? [['v=DMARC1; p=reject']] : [['v=spf1 -all']]), ...over,
    });
    const base = { host: 'c.pe', ip: '1.2.3.4', resolver: mkResolver(), probe: async (_ip, p) => [80, 443].includes(p),
      cert: async () => ({ fp: 'AA', issuer: 'LE', notAfter: 'x' }), get: async () => ({ status: 200, headers: { 'strict-transport-security': 'x', 'content-security-policy': 'y' } }) };
    const s1 = await watch.snapshot(base);
    assert.deepEqual(s1.ports, [80, 443]);
    assert.equal(s1.dns.aaaa, null);
    assert.equal(s1.dns.spf, 'v=spf1 -all');
    assert.deepEqual(s1.headers, { hsts: true, csp: true, xfo: false, xcto: false, rp: false });
    assert.deepEqual(watch.diffSnapshots(s1, s1), []);
    const s2 = await watch.snapshot({ ...base, probe: async (_ip, p) => [80, 443, 3306].includes(p), cert: async () => ({ fp: 'BB', issuer: 'Otro CA', notAfter: 'y' }),
      get: async () => ({ status: 200, headers: {} }),
      resolver: mkResolver({ resolve4: async () => ['9.9.9.9'], resolveTxt: async (h) => (h.startsWith('_dmarc') ? [['v=DMARC1; p=none']] : []) }) });
    const ev = watch.diffSnapshots(s1, s2);
    const titles = ev.map((x) => x.title).join(' | ');
    assert.deepEqual([ev[0].severity, /3306/.test(ev[0].title)], ['CRÍTICO', true], 'lo más grave primero');
    for (const re of [/emisor del certificado/, /registro DNS A/, /SPF eliminado/, /DMARC debilitado/, /HSTS desapareció/, /Content-Security-Policy desapareció/]) assert.match(titles, re);
    assert.ok(!/AAAA/.test(titles), 'lo que no se pudo consultar no es un cambio');
    // persistencia con autorización
    const e = store.createEngagement({ ...input, domain: 'watch.pe' });
    store.db().prepare('UPDATE engagements SET verified=? WHERE id=?').run(Date.now(), e.id);
    const first = await watch.watchHost(e, 'watch.pe', { ip: '1.2.3.4', ...base });
    assert.deepEqual([first.first, first.events.length], [true, 0]);
    const again = await watch.watchHost(e, 'watch.pe', { ip: '1.2.3.4', ...base, probe: async (_ip, p) => [80, 443, 6379].includes(p) });
    assert.deepEqual([again.first, again.events[0].severity], [false, 'CRÍTICO']);
    assert.equal(store.db().prepare("SELECT COUNT(*) n FROM snapshots WHERE host='watch.pe'").get().n, 2);
    await assert.rejects(() => watch.watchHost(e, 'otro.watch.pe', { ip: '1.2.3.4', ...base }), /fuera del alcance/);
    // sondeo TCP real
    const srv = net.createServer().listen(0, '127.0.0.1');
    await new Promise((r) => srv.once('listening', r));
    const port = srv.address().port;
    assert.equal(await watch.tcpOpen('127.0.0.1', port), true);
    await new Promise((r) => srv.close(r));
    assert.equal(await watch.tcpOpen('127.0.0.1', port), false);
    // los puertos vigilados son los del escáner público
    const fromScanner = [...fs.readFileSync(new URL('../src/config/ports.ts', import.meta.url), 'utf8').matchAll(/port:\s*(\d+)/g)].map((m) => Number(m[1])).sort((a, b) => a - b);
    assert.deepEqual([...watch.WATCH_PORTS].sort((a, b) => a - b), fromScanner);
  },
  'Endpoints del JavaScript: descubre rutas, prueba solo las sensibles y no sale del origen': async () => {
    const js = 'const a=fetch("/api/users");axios.get("/admin/export");const b="/static/app.js";x="/api/orders/";y="/logout"; z=`/api/${id}`; w="/api/health"';
    assert.deepEqual(extractEndpoints(js).sort(), ['/admin/export', '/api/health', '/api/orders', '/api/users']);
    const seen = [];
    const html = '<script src="/app.js"></script><script src="https://cdn.otro.com/lib.js"></script>';
    const get = async (url) => {
      seen.push(url);
      if (url.endsWith('/c.pe/') || url === 'https://c.pe/') return { status: 200, body: html, headers: {} };
      if (url.endsWith('/app.js')) return { status: 200, body: js, headers: {} };
      if (url.endsWith('/api/users')) return { status: 200, body: '[{"id":1}]', headers: {} };
      return { status: url.endsWith('/admin/export') ? 401 : 404, body: '{}', headers: {} };
    };
    const r = await apitest.audit({ host: 'c.pe', ip: '1.2.3.4', rps: 1000, check() {}, get });
    assert.equal(r.status, 'ok');
    const keys = r.findings.map((f) => f.title);
    assert.ok(keys.some((t) => /rutas internas visibles/.test(t)));
    assert.ok(keys.some((t) => /sensible \/api\/users/.test(t)));
    assert.ok(!seen.some((u) => u.includes('otro.com')), 'no se pide nada fuera del origen');
    assert.ok(!seen.some((u) => u.endsWith('/api/health')), 'las rutas no sensibles solo se listan');
  },
  'Banco de pruebas: detecta, mide la precisión y atribuye por motor': () => {
    const truth = { lab: 'lab', vulnerabilities: [{ id: 'xss', match: 'cross site scripting' }, { id: 'sqli', match: 'sql' }, { id: 'ftp', match: 'listado de directorio' }], accepted: ['cabecera'] };
    const f = [
      { id: '1', engine: 'zap-active', title: 'Cross Site Scripting (Reflected)', severity: 'ALTO' },
      { id: '2', engine: 'nuclei', title: 'Cross Site Scripting en búsqueda', severity: 'ALTO' },
      { id: '3', engine: 'crawler', title: 'Listado de directorio habilitado', severity: 'MEDIO' },
      { id: '4', engine: 'webapp', title: 'Falta cabecera CSP', severity: 'BAJO' },
      { id: '5', engine: 'nuclei', title: 'Panel raro', severity: 'ALTO' },
    ];
    const r = bench.scoreBench(truth, f, [{ created: 0, finished: 120000 }]);
    assert.deepEqual([r.detected, r.total, r.missed], [2, 3, [{ id: 'sqli', class: 'exposicion' }]]);
    assert.ok(Math.abs(r.recall - 2 / 3) < 1e-9);
    assert.equal(r.precision, 0.75);
    assert.deepEqual(r.unexplained.map((u) => u.title), ['Panel raro']);
    assert.deepEqual([r.byEngine['zap-active'].detected, r.byEngine.nuclei.detected, r.seconds], [1, 1, 120]);
    assert.match(bench.benchMarkdown(r), /No detectadas \(1\)/);
  },
  'Correcciones listas para pegar: una por tipo, sin duplicar y con el HTML escapado': () => {
    const e = store.createEngagement({ ...input, domain: 'snip.pe' });
    recordRun({ engagement: e.id, host: 'snip.pe', engine: 'webapp', complete: true, findings: [
      { key: 'a', title: 'Falta cabecera Content-Security-Policy', severity: 'MEDIO', confidence: 'confirmado' },
      { key: 'b', title: 'Falta cabecera X-Frame-Options', severity: 'BAJO', confidence: 'confirmado' }] });
    recordRun({ engagement: e.id, host: 'snip.pe', engine: 'files', complete: true, findings: [{ key: 'c', title: 'Archivo sensible expuesto: /.env', severity: 'CRÍTICO', confidence: 'confirmado' }] });
    const r = expert.buildReport(e.id);
    assert.equal(r.snippets.find((s) => s.rule === 'headers').covers, 2);
    assert.ok(r.snippets.find((s) => s.rule === 'secret-files').items.some((i) => /deny all/.test(i.code)));
    assert.match(expert.toMarkdown(r), /## Correcciones listas para pegar[\s\S]*```/);
    assert.ok(expert.toHtml(r).includes('add_header X-Frame-Options &quot;SAMEORIGIN&quot; always;'));
  },
  'Portal: token con hash, vista sin notas internas, vencimiento y re-test acotado': () => {
    const e = store.createEngagement({ ...input, domain: 'portal.pe' });
    store.db().prepare('UPDATE engagements SET verified=? WHERE id=?').run(Date.now(), e.id);
    recordRun({ engagement: e.id, host: 'portal.pe', engine: 'nmap', complete: true, findings: [
      { key: 'a', title: 'Servicio expuesto tcp/3306 mysql', severity: 'ALTO', confidence: 'confirmado', reproduction: 'SECRETO-REPRO' }] });
    const fid = store.db().prepare('SELECT id FROM findings WHERE engagement=?').get(e.id).id;
    validate(fid, 'Nota interna de Pedro: lo probó');
    const { token, until } = portal.createPortalToken(e.id);
    assert.match(token, /^[a-f0-9]{64}$/);
    assert.ok(until > e.ends);
    assert.ok(!JSON.stringify(store.db().prepare('SELECT * FROM engagements WHERE id=?').get(e.id)).includes(token), 'en la base solo queda el hash');
    const view = portal.clientView(token);
    assert.ok(view);
    const text = JSON.stringify(view);
    assert.ok(!text.includes('SECRETO-REPRO') && !text.includes('Pedro') && !text.includes(token));
    assert.deepEqual([view.canRetest, view.findings.length], [true, 1]);
    assert.equal(portal.clientView('a'.repeat(64)), null);
    assert.equal(portal.clientView('corto'), null);
    store.db().prepare('UPDATE engagements SET portal_until=? WHERE id=?').run(Date.now() - 1000, e.id);
    assert.equal(portal.clientView(token), null, 'vencido');
    store.db().prepare('UPDATE engagements SET portal_until=? WHERE id=?').run(until, e.id);
    const ids = portal.requestRetest(token);
    assert.equal(ids.length, 1);
    const job = store.getJob(ids[0]);
    assert.deepEqual([JSON.parse(job.only_engines), job.retest_ports], [['nmap'], '3306']);
    assert.throws(() => portal.requestRetest(token), /reciente/);
    assert.throws(() => portal.requestRetest('x'.repeat(64)), /no válido/);
    portal.revokePortal(e.id);
    assert.equal(portal.clientView(token), null, 'revocado');
  },
  'Cadena: un hash guardado fuera del servidor detecta el recorte': () => {
    const file = path.join(tmp, 'head.jsonl');
    const hashes = [1, 2, 3, 4].map((i) => chain.appendChained(file, { i }));
    assert.ok(chain.containsHash(file, hashes[1]));
    assert.equal(chain.containsHash(file, '0'.repeat(64)), false);
    const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
    fs.writeFileSync(file, lines.slice(0, 2).join('\n') + '\n');
    assert.equal(chain.verifyChained(file).valid, true, 'recortar el final no rompe la cadena');
    assert.equal(chain.containsHash(file, hashes[3]), false, 'pero el head guardado ya no está');
  },

  'Informe: el mismo hallazgo de dos motores se muestra una vez, con la mayor confianza': () => {
    const e = store.createEngagement({ ...input, domain: 'dup.pe' });
    const title = 'API: ruta sensible /api/admin/users accesible sin autenticación declarada';
    recordRun({ engagement: e.id, host: 'dup.pe', engine: 'api', complete: true, findings: [{ key: 'x', title, severity: 'MEDIO', confidence: 'probable' }] });
    recordRun({ engagement: e.id, host: 'dup.pe', engine: 'browser', complete: true, findings: [{ key: 'y', title, severity: 'MEDIO', confidence: 'confirmado' }] });
    const r = expert.buildReport(e.id);
    assert.equal(r.findings.length, 1);
    assert.deepEqual([r.findings[0].engine, r.findings[0].confidence, r.summary.counts.MEDIO], ['browser', 'confirmado', 1]);
    assert.deepEqual(r.findings[0].alsoFoundBy, ['API (OpenAPI)']);
  },
  'Navegador: desactivado por defecto, y sin Chrome o sin la biblioteca figura como faltante': async () => {
    delete process.env.AUDIT_BROWSER;
    const off = await browser.audit({ host: 'x.pe', ip: '1.2.3.4', rps: 1, check() {} });
    assert.deepEqual([off.status, off.findings.length], ['skipped', 0]);
    assert.match(off.detail, /AUDIT_BROWSER=1/);
    const none = await browser.audit({ host: 'x.pe', ip: '1.2.3.4', rps: 1, check() {}, launcher: { launch: async () => { throw new Error('sin chrome'); } } });
    assert.equal(none.status, 'missing');
    assert.match(none.detail, /CHROME_PATH/);
  },
  'Navegador real: descubre rutas de una SPA, bloquea escrituras y terceros, y no sale del origen': async () => {
    let chromium;
    try { ({ chromium } = await import('playwright-core')); } catch { console.log('    (omitida: playwright-core no está instalado)'); return; }
    const hits = [];
    const spa = http.createServer((req, res) => {
      hits.push(`${req.method} ${req.url}`);
      const send = (code, type, body) => res.writeHead(code, { 'content-type': type }).end(body);
      if (req.url === '/') return send(200, 'text/html', '<!doctype html><title>spa</title><a href="/logout">salir</a><script src="/app.js"></script>');
      if (req.url === '/app.js') {
        return send(200, 'text/javascript', "fetch('/api/admin/users'); fetch('/api/delete', { method: 'POST', body: 'x' }); fetch('/api/logout'); fetch('https://tercero.invalid/track'); setTimeout(() => { const a = document.createElement('a'); a.href = '/pagina2'; a.textContent = 'dos'; document.body.appendChild(a); }, 150);");
      }
      // El enlace a /pagina3 aparece 1 s después de cargar y sin red: antes el rastreador lo perdía
      if (req.url === '/pagina2') return send(200, 'text/html', '<!doctype html><title>2</title><script>fetch("/api/orders/list"); setTimeout(() => { const a = document.createElement("a"); a.href = "/pagina3"; a.textContent = "tres"; document.body.appendChild(a); }, 1000);</script>');
      if (req.url === '/pagina3') return send(200, 'text/html', '<!doctype html><title>3</title>');
      if (req.url === '/api/admin/users') return send(200, 'application/json', '[{"id":1}]');
      if (req.url === '/api/orders/list') return send(401, 'application/json', '{}');
      return send(404, 'text/plain', 'no');
    }).listen(0, '127.0.0.1');
    await new Promise((r) => spa.once('listening', r));
    const origin = `http://spa.test:${spa.address().port}`;
    try {
      const crawl = await browser.browserCrawl({ origin, ip: '127.0.0.1', launcher: chromium, limiter: createLimiter(1000) });
      if (crawl.missing) { console.log(`    (omitida: ${crawl.missing})`); return; }
      assert.equal(crawl.pages, 3, 'sigue los enlaces que el JavaScript añade después de cargar (150 ms y 1 s)');
      assert.deepEqual(crawl.endpoints, ['/api/admin/users', '/api/delete', '/api/logout', '/api/orders/list']);
      assert.deepEqual(crawl.thirdParty, ['tercero.invalid']);
      assert.ok(crawl.blockedWrites >= 1 && crawl.skipped >= 1);
      assert.ok(!hits.some((h) => h.startsWith('POST')), 'ninguna escritura llegó al servidor: ' + hits.join(' | '));
      assert.ok(!hits.some((h) => h.includes('/logout') || h.includes('tercero')), 'ni la ruta peligrosa ni el tercero');

      const r = await browser.audit({ host: 'spa.test', origin, ip: '127.0.0.1', rps: 1000, check() {}, launcher: chromium });
      assert.equal(r.status, 'ok', r.detail);
      const titles = r.findings.map((x) => x.title).join(' | ');
      for (const re of [/rutas de API llamadas/, /1 dominio\(s\) de terceros/, /ruta sensible \/api\/admin\/users/]) assert.match(titles, re);
      assert.ok(!/orders/.test(r.findings.filter((x) => /sensible/.test(x.title)).map((x) => x.title).join()), 'la ruta que exige autenticación no es hallazgo');

      let calls = 0;
      await assert.rejects(() => browser.browserCrawl({ origin, ip: '127.0.0.1', launcher: chromium, limiter: createLimiter(1000), check() { if (calls++ >= 1) throw new Error('parada de emergencia'); } }), /parada de emergencia/);
    } finally {
      spa.close();
    }
  },

  'Enlaces firmados: vigentes, caducan y no se pueden manipular ni reutilizar en otro informe': () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const t = share.signShare(id, 1);
    assert.equal(share.verifyShare(id, t), true);
    assert.equal(share.verifyShare('22222222-2222-4222-8222-222222222222', t), false, 'no vale para otro informe');
    assert.equal(share.verifyShare(id, t.slice(0, -1) + (t.endsWith('0') ? '1' : '0')), false, 'firma alterada');
    const [e, sig] = t.split('.');
    assert.equal(share.verifyShare(id, `${(parseInt(e, 36) + 36e5).toString(36)}.${sig}`), false, 'no se puede alargar la vigencia');
    assert.equal(share.verifyShare(id, t, Date.now() + 2 * 3600000), false, 'caduca');
    for (const bad of ['', 'abc', '.', 'zz.', null, undefined]) assert.equal(share.verifyShare(id, bad), false);
    assert.throws(() => share.signShare(id, 0), /vigencia/);
    assert.throws(() => share.signShare(id, 721), /vigencia/);
    assert.ok(fs.existsSync(path.join(tmp, '.share-secret')), 'el secreto queda en un archivo propio');
  },
  'Usuarios: la clave se muestra una vez, no se guarda en claro y se revoca': () => {
    const u = users.createUser('Ana López', 'analyst');
    assert.match(u.token, /^dti_[a-f0-9]{64}$/);
    assert.ok(!JSON.stringify(store.db().prepare('SELECT * FROM users').all()).includes(u.token), 'solo queda el hash');
    assert.deepEqual(users.findUserByToken(u.token), { id: u.id, name: 'Ana López', role: 'analyst' });
    assert.equal(users.findUserByToken('dti_' + 'a'.repeat(64)), null);
    assert.equal(users.findUserByToken('x'), null);
    assert.throws(() => users.createUser('A', 'analyst'), /nombre/);
    assert.throws(() => users.createUser('Luis', 'admin'), /Rol válido/);
    users.revokeUser(u.id);
    assert.equal(users.findUserByToken(u.token), null, 'revocada');
    assert.equal(users.listUsers().find((x) => x.id === u.id).revoked, 1);
    assert.throws(() => users.revokeUser('nope'), /inexistente/);
    const log = fs.readFileSync(path.join(tmp, 'audit-log.jsonl'), 'utf8');
    assert.ok(log.includes('user.create') && log.includes('user.revoke') && !log.includes(u.token), 'queda registrado sin la clave');
  },
  'PDF real: el informe sale como PDF, sin JavaScript ni red': async () => {
    let chromium;
    try { ({ chromium } = await import('playwright-core')); } catch { console.log('    (omitida: playwright-core no está instalado)'); return; }
    const e = store.createEngagement({ ...input, domain: 'pdf.pe' });
    recordRun({ engagement: e.id, host: 'pdf.pe', engine: 'nuclei', complete: true, findings: [
      { key: 'a', title: '<script>alert(1)</script> Panel de administración', severity: 'ALTO', confidence: 'probable', evidence: '"><img src=https://evil.example/x.png>' },
      { key: 'b', title: 'Falta cabecera Content-Security-Policy', severity: 'MEDIO', confidence: 'confirmado' }] });
    const file = path.join(tmp, 'informe.pdf');
    try {
      await renderPdf(expert.toHtml(expert.buildReport(e.id)), file, { launcher: chromium });
    } catch (err) {
      if (/No se pudo abrir/.test(err.message)) { console.log(`    (omitida: ${err.message})`); return; }
      throw err;
    }
    const buf = fs.readFileSync(file);
    assert.equal(buf.subarray(0, 5).toString(), '%PDF-');
    assert.ok(buf.length > 3000, 'tamaño ' + buf.length);
    assert.ok((buf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length >= 1);
    await assert.rejects(() => renderPdf('<p>x</p>', path.join(tmp, 'x.pdf'), { launcher: { launch: async () => { throw new Error('sin chrome'); } } }), /No se pudo abrir Chrome/);
  },

  'Rastreador: lee robots.txt, reconoce el listado de Express y avisa de rutas sensibles': async () => {
    const hits = [];
    const site = http.createServer((req, res) => {
      hits.push(req.url);
      const send = (c, t, b) => res.writeHead(c, { 'content-type': t }).end(b);
      if (req.url === '/') return send(200, 'text/html', '<!doctype html><title>Inicio</title><p>sin enlaces</p>');
      if (req.url === '/robots.txt') return send(200, 'text/plain', 'User-agent: *\nDisallow: /ftp\nDisallow: /admin-backup\nDisallow: /logout\nDisallow: /*.pdf$\nAllow: /publico\n');
      if (req.url === '/ftp') return send(200, 'text/html', '<html><head><title>listing directory /ftp</title></head><body><ul><li>legal.md</li></ul></body></html>');
      return send(404, 'text/plain', 'no');
    }).listen(0, '127.0.0.1');
    await new Promise((r) => site.once('listening', r));
    try {
      const r = await crawl({ origin: `http://127.0.0.1:${site.address().port}`, ip: '127.0.0.1', rps: 1000, check() {} });
      const listing = r.findings.find((f) => f.key.startsWith('listing:'));
      assert.ok(listing && /\/ftp/.test(listing.evidence), 'reconoce el listado de directorio de Express (serve-index)');
      const rb = r.findings.find((f) => f.key === 'robots-sensitive');
      assert.ok(rb && /\/ftp/.test(rb.evidence) && /admin-backup/.test(rb.evidence), 'avisa de las rutas sensibles de robots.txt');
      assert.ok(!/logout/.test(rb.evidence) && !hits.includes('/logout'), 'una ruta peligrosa ni se anuncia ni se visita');
      assert.ok(!hits.some((h) => h.includes('*')), 'los comodines de robots.txt no se piden');
      assert.ok(hits.includes('/admin-backup') && hits.includes('/publico'), 'las rutas de robots.txt se rastrean');
    } finally {
      site.close();
    }
  },
  'Banco de pruebas: la verdad se verifica contra el laboratorio y se separa por clase': async () => {
    const truth = { lab: 'lab', vulnerabilities: [
      { id: 'ftp', class: 'exposicion', match: 'listado de directorio.*/ftp', probe: { path: '/ftp', contains: 'legal\\.md' } },
      { id: 'metricas', class: 'exposicion', match: '/metrics', probe: { path: '/metrics', contains: 'process_cpu' } },
      { id: 'inexistente', class: 'exposicion', match: 'x', probe: { path: '/nope', status: 200 } },
      { id: 'sqli', class: 'activa', match: 'sql' },
      { id: 'precio', class: 'logica', match: 'precio' }], accepted: ['cabecera'] };
    const seen = [];
    const get = async (url) => {
      seen.push(url);
      if (url.endsWith('/ftp')) return { status: 200, body: '<li>legal.md</li>' };
      if (url.endsWith('/metrics')) return { status: 200, body: 'otra cosa' };
      if (url.endsWith('/nope')) return { status: 404, body: '' };
      throw new Error('no debería llamarse');
    };
    const v = await bench.verifyTruth(truth, { origin: 'https://lab.pe', ip: '1.2.3.4', get });
    assert.deepEqual(v.truth.vulnerabilities.map((x) => x.id), ['ftp', 'sqli', 'precio']);
    assert.deepEqual(v.dropped.map((d) => d.id), ['metricas', 'inexistente']);
    assert.match(v.dropped[0].reason, /sin el contenido esperado/);
    assert.match(v.dropped[1].reason, /404/);
    assert.deepEqual(v.unverifiable, ['sqli', 'precio']);
    assert.ok(seen.length === 3 && seen.every((u) => u.startsWith('https://lab.pe/')), 'solo GET a rutas del laboratorio');
    const findings = [{ id: '1', engine: 'crawler', title: 'Listado de directorio habilitado', evidence: 'GET https://lab.pe/ftp → 200', severity: 'MEDIO' }];
    const r = bench.scoreBench(v.truth, findings);
    assert.deepEqual(r.byClass, { exposicion: { total: 1, detected: 1 }, activa: { total: 1, detected: 0 }, logica: { total: 1, detected: 0 } });
    assert.equal(r.recall, 1 / 3);
    const md = bench.benchMarkdown({ ...r, dropped: v.dropped, unverifiable: v.unverifiable });
    assert.ok(/Exposición visible desde fuera \| 1 \| 1/.test(md) && /Descartadas/.test(md) && /Sin sonda/.test(md));
    for (const bad of [{ vulnerabilities: [] }, { vulnerabilities: [{ id: 'a', match: '(' }] }, { vulnerabilities: [{ id: 'a', match: 'x', probe: { path: 'http://evil/x' } }] },
      { vulnerabilities: [{ id: 'a', match: 'x' }, { id: 'a', match: 'y' }] }, { vulnerabilities: [{ id: 'a', match: 'x', class: 'otra' }] }]) {
      assert.throws(() => bench.validateTruth(bad));
    }
  },
  'Verdad de Juice Shop: archivo válido, sondas de solo GET y las tres clases': () => {
    const truth = JSON.parse(fs.readFileSync(new URL('../docs/bench/juice-shop.truth.json', import.meta.url), 'utf8'));
    bench.validateTruth(truth);
    assert.ok(truth.vulnerabilities.length >= 8);
    for (const c of ['exposicion', 'activa', 'logica']) assert.ok(truth.vulnerabilities.some((v) => v.class === c), c);
    for (const v of truth.vulnerabilities.filter((x) => x.probe)) assert.deepEqual(Object.keys(v.probe).sort().filter((k) => !['path', 'contains', 'status'].includes(k)), [], 'la sonda solo lleva ruta y comprobaciones: ' + v.id);
  },
  'Laboratorio: aislado, sin publicar Juice Shop y con acceso solo desde IP permitidas': () => {
    const dir = new URL('../lab/', import.meta.url);
    const compose = fs.readFileSync(new URL('docker-compose.yml', dir), 'utf8');
    const caddyfile = fs.readFileSync(new URL('Caddyfile', dir), 'utf8');
    const [juice, caddy] = compose.split(/^  caddy:/m);
    assert.ok(/cap_drop:\s*\[ALL\]/.test(juice) && /no-new-privileges/.test(juice) && /mem_limit/.test(juice) && /pids_limit/.test(juice), 'Juice Shop sin capacidades, sin privilegios nuevos y con topes');
    assert.ok(!/^\s+ports:/m.test(juice) && !/3000:3000/.test(compose), 'Juice Shop no publica ningún puerto');
    assert.ok(/"80:80"/.test(caddy) && /"443:443"/.test(caddy) && /cap_drop:\s*\[ALL\]/.test(caddy) && /NET_BIND_SERVICE/.test(caddy));
    assert.ok(/\$\{ALLOWED_IPS:\?/.test(compose) && /\$\{LAB_DOMAIN:\?/.test(compose), 'sin lista de IP ni dominio no arranca');
    assert.ok(/not remote_ip \{\$ALLOWED_IPS\}/.test(caddyfile) && /respond @fuera/.test(caddyfile) && /reverse_proxy juice:3000/.test(caddyfile));
    assert.ok(caddyfile.indexOf('respond @fuera') < caddyfile.indexOf('reverse_proxy'), 'el bloqueo va antes del proxy');
  },

  'HTTP: un servidor que declara más bytes de los que envía no pierde la respuesta': async () => {
    // Juice Shop real: Content-Length 11320 y 11308 bytes enviados. Node lo marca "aborted"; curl lo tolera.
    const body = '<html><head><title>listing directory /ftp</title></head><body>legal.md</body></html>';
    const short = net.createServer((s) => {
      s.once('data', () => { s.write(`HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: ${body.length + 12}\r\nConnection: close\r\n\r\n${body}`); s.end(); });
    }).listen(0, '127.0.0.1');
    const closer = net.createServer((s) => s.once('data', () => s.destroy())).listen(0, '127.0.0.1');
    await Promise.all([short, closer].map((s) => new Promise((r) => s.once('listening', r))));
    try {
      const r = await pinnedGet(`http://127.0.0.1:${short.address().port}/ftp`, '127.0.0.1');
      assert.deepEqual([r.status, r.truncated], [200, true]);
      assert.match(r.body, /listing directory \/ftp/, 'se conserva lo recibido');
      const ok = await pinnedGet(`http://127.0.0.1:${server.address().port}/`, '127.0.0.1');
      assert.equal(ok.truncated, false, 'una respuesta normal no se marca como truncada');
      await assert.rejects(() => pinnedGet(`http://127.0.0.1:${closer.address().port}/x`, '127.0.0.1'), 'sin cabeceras no hay respuesta que conservar');
    } finally {
      short.close();
      closer.close();
    }
  },
  'API: ni la SPA que responde a todo, ni JSON vacío, ni lo idéntico a una ruta inexistente': async () => {
    const html = { 'content-type': 'text/html; charset=UTF-8' };
    const json = { 'content-type': 'application/json' };
    assert.equal(apitest.judge({ path: '/orders', declared: false }, { status: 200, headers: html, body: '<!doctype html><html><body>app</body></html>' }).length, 0, 'la SPA no es un dato expuesto');
    assert.equal(apitest.judge({ path: '/rest/user/whoami', declared: false }, { status: 200, headers: json, body: '{"user":{}}' }).length, 0, 'JSON vacío');
    assert.equal(apitest.judge({ path: '/x', declared: false, baseline: '{"a":1}' }, { status: 200, headers: json, body: '{"a":1}' }).length, 0, 'igual que una ruta inexistente');
    assert.equal(apitest.judge({ path: '/rest/admin/application-version', declared: false }, { status: 200, headers: json, body: '{"version":"20.4.0"}' })[0].key, 'sensitive:/rest/admin/application-version');
    assert.deepEqual([apitest.hasData('{}'), apitest.hasData('{"a":[],"b":{"c":""}}'), apitest.hasData('[{"id":1}]'), apitest.hasData('texto plano'), apitest.hasData('null')], [false, false, true, true, false]);
    // Integrado: la SPA responde 200 con su HTML a todo; solo el JSON con datos es hallazgo
    const shell = '<!doctype html><html><body><app-root></app-root><script src="/main.js"></script></body></html>';
    const get = async (url) => {
      const p = new URL(url).pathname;
      if (p === '/') return { status: 200, headers: html, body: shell };
      if (p === '/main.js') return { status: 200, headers: {}, body: 'fetch("/admin/stats"); fetch("/api/users"); fetch("/api/orders/mine");' };
      if (p === '/api/users') return { status: 200, headers: json, body: '[{"id":1,"email":"a@b.c"}]' };
      if (p === '/api/orders/mine') return { status: 200, headers: json, body: '{"orders":[]}' };
      if (SPEC_PATHS_FOR_TEST.includes(p)) return { status: 404, headers: {}, body: '' };
      return { status: 200, headers: html, body: shell };
    };
    const r = await apitest.audit({ host: 'c.pe', ip: '1.2.3.4', rps: 1000, check() {}, get });
    const titles = r.findings.map((f) => f.title).join(' | ');
    assert.match(titles, /ruta sensible \/api\/users/);
    assert.ok(!/admin\/stats|orders/.test(titles.replace(/rutas internas visibles[^|]*/, '')), 'la SPA y el JSON vacío no son hallazgos: ' + titles);
  },
  'Navegador: una aplicación con conexión permanente (WebSocket, sondeo) se rastrea igual': async () => {
    let chromium;
    try { ({ chromium } = await import('playwright-core')); } catch { console.log('    (omitida: playwright-core no está instalado)'); return; }
    const site = http.createServer((req, res) => {
      if (req.url === '/') return res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><title>spa</title><script>fetch("/stream")</script>');
      // Conexión que nunca termina: la red jamás queda en reposo (como el socket.io de Juice Shop)
      if (req.url === '/stream') { res.writeHead(200, { 'content-type': 'text/event-stream' }); const t = setInterval(() => res.write(': latido\n\n'), 200); req.on('close', () => clearInterval(t)); return; }
      res.writeHead(404).end('no');
    }).listen(0, '127.0.0.1');
    await new Promise((r) => site.once('listening', r));
    const t0 = Date.now();
    try {
      const r = await browser.browserCrawl({ origin: `http://spa.test:${site.address().port}`, ip: '127.0.0.1', launcher: chromium, limiter: createLimiter(1000) });
      if (r.missing) { console.log(`    (omitida: ${r.missing})`); return; }
      assert.equal(r.pages, 1, 'la página cuenta aunque la red nunca quede en reposo');
      assert.ok(r.endpoints.includes('/stream'));
      assert.ok(Date.now() - t0 < 16000, 'no espera los 20 s de networkidle: ' + (Date.now() - t0) + ' ms');
    } finally {
      site.closeAllConnections?.();
      site.close();
    }
  },
  'Laboratorio local: el precargador obliga a escuchar solo en 127.0.0.1': async () => {
    const code = "const s = require('http').createServer().listen(PORT_ARGS); s.on('listening', () => { console.log(s.address().address); s.close(); });";
    const bind = fileURLToPath(new URL('../lab/local-bind.cjs', import.meta.url));
    const run = async (args, preload) => (await promisify(execFile)(process.execPath, [...(preload ? ['--require', bind] : []), '-e', code.replace('PORT_ARGS', args)])).stdout.trim();
    assert.equal(await run('0', true), '127.0.0.1', 'sin host');
    assert.equal(await run("0, '0.0.0.0'", true), '127.0.0.1', 'aunque la aplicación pida todas las interfaces');
    assert.equal(await run('{ port: 0 }', true), '127.0.0.1', 'con objeto de opciones');
    assert.ok(['::', '0.0.0.0'].includes(await run('0', false)), 'sin el precargador escucharía en todas las interfaces');
  },
  'Respuestas cortadas: el rastreo, la API y WordPress quedan en parcial y no dan nada por corregido': async () => {
    // El servidor declara más bytes de los que envía y cierra (como Juice Shop real)
    const html = '<!doctype html><title>x</title><p>sin enlaces</p>';
    const short = net.createServer((sock) => sock.once('data', () => {
      sock.write(`HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nContent-Length: ${html.length + 20}\r\nConnection: close\r\n\r\n${html}`);
      sock.end();
    })).listen(0, '127.0.0.1');
    await new Promise((r) => short.once('listening', r));
    try {
      const r = await crawl({ origin: `http://127.0.0.1:${short.address().port}`, ip: '127.0.0.1', rps: 1000, check() {} });
      assert.ok(r.pages >= 1, 'se analiza lo recibido');
      assert.equal(r.complete, false, 'pero el rastreo no es completo: un hallazgo anterior no puede darse por corregido');
    } finally {
      short.close();
    }
    const json = { 'content-type': 'application/json' };
    const apiGet = (cut) => async (url) => {
      const p = new URL(url).pathname;
      if (p === '/') return { status: 200, headers: { 'content-type': 'text/html' }, body: '<script src="/m.js"></script>' };
      if (p === '/m.js') return { status: 200, headers: {}, body: 'fetch("/api/users")' };
      if (p === '/api/users') return { status: 200, headers: json, body: '[{"id":1}]', truncated: cut };
      return { status: 404, headers: {}, body: '' };
    };
    const whole = await apitest.audit({ host: 'c.pe', ip: '1.2.3.4', rps: 1000, check() {}, get: apiGet(false) });
    const cutOff = await apitest.audit({ host: 'c.pe', ip: '1.2.3.4', rps: 1000, check() {}, get: apiGet(true) });
    assert.equal(whole.status, 'ok');
    assert.equal(cutOff.status, 'partial', 'una lectura cortada deja la API en parcial');
    const wpGet = (cut) => async (url) => (url.endsWith('/')
      ? { status: 200, headers: {}, body: '<script src="/wp-content/plugins/foo/a.js"></script>' }
      : { status: 200, headers: {}, body: 'Stable tag: 1.2.2', truncated: cut });
    const fetchJson = async (url) => (url.includes('wpscan') ? { foo: { friendly_name: 'Foo', vulnerabilities: [] } } : { version: '1.2.2', last_updated: '2026-10-01 1:00pm GMT' });
    const base = { host: 'c.pe', ip: '1.2.3.4', rps: 1000, check() {}, fetchJson, token: 'x' };
    assert.equal((await wp.audit({ ...base, get: wpGet(false) })).status, 'ok');
    assert.equal((await wp.audit({ ...base, get: wpGet(true) })).status, 'partial', 'WordPress con una lectura cortada es parcial');
  },

  'Copia: se cifra, se verifica y se restaura idéntica aunque la base esté en uso': async () => {
    const pass = 'clave larga de prueba 123';
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-out-'));
    const to = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'dti-rest-test-')), 'datos');
    try {
      // La carpeta de la suite tiene la base abierta, el registro encadenado, secretos y PDF de autorizaciones
      fs.writeFileSync(path.join(tmp, '.marcador-secreto'), 'SECRETO-EN-CLARO-98765');
      const live = store.db().prepare('SELECT COUNT(*) n FROM findings').get().n;
      assert.ok(live > 5 && fs.existsSync(path.join(tmp, '.share-secret')), 'hay datos reales que respaldar');
      const r = await bk.createBackup({ dataDir: tmp, outDir: out, passphrase: pass });
      assert.ok(r.file.endsWith('.dtibak') && r.size > 1000);
      assert.equal(r.manifest.db.counts.findings, live, 'la instantánea de la base coincide con la viva');
      assert.ok(r.manifest.chains['audit-log.jsonl'].valid);
      const raw = fs.readFileSync(r.file);
      for (const plain of ['SECRETO-EN-CLARO-98765', 'SQLite format 3', 'defensati-verify', '%PDF-', 'manifest']) assert.ok(!raw.includes(plain), 'legible sin clave: ' + plain);
      const v = await bk.verifyBackup(r.file, pass);
      assert.deepEqual([v.ok, v.problems], [true, []]);
      const rest = await bk.restoreBackup(r.file, pass, to, { liveDataDir: tmp });
      assert.ok(rest.files > 5);
      assert.equal(fs.readFileSync(path.join(to, '.marcador-secreto'), 'utf8'), 'SECRETO-EN-CLARO-98765');
      assert.equal(fs.readFileSync(path.join(to, '.share-secret'), 'utf8'), fs.readFileSync(path.join(tmp, '.share-secret'), 'utf8'));
      const { DatabaseSync } = process.getBuiltinModule('node:sqlite');
      const back = new DatabaseSync(path.join(to, 'audit.db'), { readOnly: true });
      assert.equal(back.prepare('SELECT COUNT(*) n FROM findings').get().n, live, 'la base restaurada tiene todos los hallazgos');
      assert.equal(back.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
      back.close();
      assert.ok(chain.verifyChained(path.join(to, 'audit-log.jsonl')).valid, 'la cadena restaurada es válida');
      const pdfs = fs.readdirSync(path.join(tmp, 'engagements')).filter((n) => n.endsWith('.pdf'));
      for (const p of pdfs) assert.equal(fs.readFileSync(path.join(to, 'engagements', p)).length, fs.readFileSync(path.join(tmp, 'engagements', p)).length);
    } finally {
      fs.rmSync(path.join(tmp, '.marcador-secreto'), { force: true });
      fs.rmSync(out, { recursive: true, force: true });
      fs.rmSync(path.dirname(to), { recursive: true, force: true });
    }
  },
  'Copia: no se abre con otra clave, ni alterada, ni truncada, ni sin clave': async () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-out-'));
    const data = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-data-'));
    try {
      chain.appendChained(path.join(data, 'audit-log.jsonl'), { a: 1 });
      fs.writeFileSync(path.join(data, '.badge-secret'), 'x'.repeat(64));
      const r = await bk.createBackup({ dataDir: data, outDir: out, passphrase: 'clave larga de prueba 123' });
      await assert.rejects(() => bk.verifyBackup(r.file, 'otra clave larga distinta'), /clave es incorrecta o el archivo fue alterado/);
      await assert.rejects(() => bk.verifyBackup(r.file, ''), /BACKUP_PASSPHRASE/);
      const bytes = fs.readFileSync(r.file);
      const flipped = Buffer.from(bytes);
      flipped[Math.floor(bytes.length / 2)] ^= 0xff;
      fs.writeFileSync(path.join(out, 'alterada.dtibak'), flipped);
      await assert.rejects(() => bk.verifyBackup(path.join(out, 'alterada.dtibak'), 'clave larga de prueba 123'), /alterado/);
      fs.writeFileSync(path.join(out, 'truncada.dtibak'), bytes.subarray(0, bytes.length - 40));
      await assert.rejects(() => bk.verifyBackup(path.join(out, 'truncada.dtibak'), 'clave larga de prueba 123'), /alterado|truncado/);
      fs.writeFileSync(path.join(out, 'ajena.dtibak'), 'esto no es una copia de nada, solo texto largo para pasar el tamaño mínimo');
      await assert.rejects(() => bk.verifyBackup(path.join(out, 'ajena.dtibak'), 'clave larga de prueba 123'), /No es una copia/);
      await assert.rejects(() => bk.createBackup({ dataDir: data, outDir: out, passphrase: 'corta' }), /mínimo 12/);
      await assert.rejects(() => bk.createBackup({ dataDir: data, outDir: out, passphrase: undefined }), /BACKUP_PASSPHRASE/);
      assert.deepEqual((await bk.verifyBackup(r.file, 'clave larga de prueba 123')).problems, [], 'la original sigue intacta');
    } finally {
      fs.rmSync(out, { recursive: true, force: true });
      fs.rmSync(data, { recursive: true, force: true });
    }
  },
  'Copia: retención, carpeta fuera de data, restauración que no pisa y cadena rota avisada': async () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-out-'));
    const data = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-data-'));
    const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-dest-'));
    const pass = 'clave larga de prueba 123';
    try {
      const log = path.join(data, 'audit-log.jsonl');
      for (let i = 0; i < 3; i++) chain.appendChained(log, { i });
      const made = [];
      for (const st of ['20261101-010000', '20261102-010000', '20261103-010000', '20261104-010000']) made.push(await bk.createBackup({ dataDir: data, outDir: out, passphrase: pass, keep: 2, stampOverride: st }));
      assert.deepEqual(fs.readdirSync(out).sort(), ['defensati-backup-20261103-010000.dtibak', 'defensati-backup-20261104-010000.dtibak'], 'se conservan las 2 más recientes');
      assert.equal(made[3].pruned.length, 1);
      await assert.rejects(() => bk.createBackup({ dataDir: data, outDir: path.join(data, 'copias'), passphrase: pass }), /dentro de data/);
      await assert.rejects(() => bk.restoreBackup(made[3].file, pass, data, { liveDataDir: data }), /carpeta nueva/);
      await assert.rejects(() => bk.restoreBackup(made[3].file, pass, path.join(data, 'sub'), { liveDataDir: data }), /carpeta nueva/);
      fs.writeFileSync(path.join(dest, 'algo.txt'), 'existente');
      await assert.rejects(() => bk.restoreBackup(made[3].file, pass, dest, { liveDataDir: path.join(os.tmpdir(), 'otra') }), /no está vacía/);
      assert.equal(fs.readFileSync(path.join(dest, 'algo.txt'), 'utf8'), 'existente', 'no se tocó lo que había');
      // Una cadena editada se respalda igual (es evidencia) pero avisa
      fs.writeFileSync(log, fs.readFileSync(log, 'utf8').replace('\\"i\\":1', '\\"i\\":9'));
      const broken = await bk.createBackup({ dataDir: data, outDir: out, passphrase: pass, keep: 9 });
      assert.equal(broken.manifest.chains['audit-log.jsonl'].valid, false);
      assert.match(broken.warnings.join(), /NO es válida/);
    } finally {
      for (const d of [out, data, dest]) fs.rmSync(d, { recursive: true, force: true });
    }
  },
  'Copia sin cifrar: el manifiesto delata un contenido cambiado y avisa de que no es segura': async () => {
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-out-'));
    const data = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-data-'));
    const work = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-work-'));
    const tar = process.platform === 'win32' ? path.join(process.env.SystemRoot, 'System32', 'tar.exe') : 'tar';
    try {
      fs.writeFileSync(path.join(data, '.badge-secret'), 'x'.repeat(64));
      const r = await bk.createBackup({ dataDir: data, outDir: out, encrypt: false });
      assert.ok(r.file.endsWith('.tgz') && /SIN cifrar/.test(r.warnings.join()));
      assert.equal((await bk.verifyBackup(r.file)).ok, true);
      // Alguien edita un archivo dentro del tar y lo vuelve a empaquetar
      const x = path.join(work, 'x');
      fs.mkdirSync(x);
      assert.equal(spawnSync(tar, ['-xzf', r.file, '-C', x]).status, 0);
      fs.writeFileSync(path.join(x, 'data', '.badge-secret'), 'y'.repeat(64));
      fs.writeFileSync(path.join(x, 'data', 'extra.txt'), 'archivo que no estaba');
      const edited = path.join(out, 'defensati-backup-29990101-000000.tgz');
      assert.equal(spawnSync(tar, ['-czf', edited, '-C', x, '.']).status, 0);
      const v = await bk.verifyBackup(edited);
      assert.equal(v.ok, false);
      assert.match(v.problems.join('\n'), /no coincide con el manifiesto: data\/\.badge-secret/);
      assert.match(v.problems.join('\n'), /no declarado en el manifiesto: data\/extra\.txt/);
      await assert.rejects(() => bk.restoreBackup(edited, '', path.join(work, 'nuevo')), /no pasa la verificación/);
      assert.ok(!fs.existsSync(path.join(work, 'nuevo')), 'una copia que no verifica no deja nada restaurado');
    } finally {
      for (const d of [out, data, work]) fs.rmSync(d, { recursive: true, force: true });
    }
  },

  'Chequeo de despliegue: detecta lo que bloquea y lo que solo conviene arreglar': async () => {
    assert.deepEqual([deploy.nodeOk('22.13.0'), deploy.nodeOk('22.12.9'), deploy.nodeOk('21.9.0'), deploy.nodeOk('26.1.0'), deploy.nodeOk('23.0.0')], [true, false, false, true, true]);
    const GB = 1024 ** 3;
    const data = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-dc-'));
    const bak = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-dcb-'));
    const tools = { nmap: { found: true, version: 'Nmap 7' }, testssl: { found: true }, nuclei: { found: true }, docker: { found: true }, chrome: { found: true } };
    const env = { ADMIN_TOKEN: 'a'.repeat(32), PUBLIC_APP_URL: 'https://x.pe', BACKUP_PASSPHRASE: 'clave larga de prueba 123', SHARE_SECRET: 's'.repeat(32), BADGE_SECRET: 'b'.repeat(32) };
    const lv = (results, id) => results.find((r) => r.id === id)?.level;
    try {
      // Estado sano: base íntegra, cadena válida, copia reciente y todo instalado
      const { DatabaseSync } = process.getBuiltinModule('node:sqlite');
      const db = new DatabaseSync(path.join(data, 'audit.db'));
      db.exec('CREATE TABLE findings(id TEXT, attack TEXT, validated INTEGER, validated_note TEXT); CREATE TABLE engagements(id TEXT, staging INTEGER, internal INTEGER, portal_hash TEXT, portal_until INTEGER); CREATE TABLE jobs(id TEXT, only_engines TEXT, retest_ports TEXT); CREATE TABLE settings(key TEXT, value TEXT)');
      db.close();
      chain.appendChained(path.join(data, 'audit-log.jsonl'), { a: 1 });
      const fresh = path.join(bak, 'defensati-backup-20261122-010000.dtibak');
      fs.writeFileSync(fresh, 'x');
      const ok = deploy.runChecks({ env, dataDir: data, backupDir: bak, freeBytes: 50 * GB, tools, platform: 'win32' });
      assert.equal(deploy.hasFailures(ok), false, JSON.stringify(ok.filter((r) => r.level !== 'ok')));
      for (const id of ['admin_token', 'db', 'schema', 'chain:audit-log.jsonl', 'backup', 'disk', 'tool:chrome']) assert.equal(lv(ok, id), 'ok', id);
      // Lo que bloquea (fail)
      assert.equal(lv(deploy.runChecks({ env: { ...env, ADMIN_TOKEN: 'corto' }, dataDir: data, backupDir: bak, tools }), 'admin_token'), 'fail');
      assert.equal(lv(deploy.runChecks({ env, dataDir: data, backupDir: bak, freeBytes: 0.2 * GB, tools }), 'disk'), 'fail');
      // Una base con una versión anterior del esquema avisa de que se migrará sola
      const old = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-dco-'));
      const odb = new DatabaseSync(path.join(old, 'audit.db'));
      odb.exec('CREATE TABLE findings(id TEXT); CREATE TABLE engagements(id TEXT); CREATE TABLE jobs(id TEXT)');
      odb.close();
      const mig = deploy.runChecks({ env, dataDir: old, backupDir: bak, tools });
      assert.equal(lv(mig, 'schema'), 'warn');
      assert.match(mig.find((r) => r.id === 'schema').detail, /findings\.attack/);
      fs.rmSync(old, { recursive: true, force: true });
      // Base dañada y cadena alterada
      const bad = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-dcx-'));
      fs.writeFileSync(path.join(bad, 'audit.db'), 'esto no es una base de datos sqlite, solo basura '.repeat(50));
      chain.appendChained(path.join(bad, 'audit-log.jsonl'), { i: 1 });
      chain.appendChained(path.join(bad, 'audit-log.jsonl'), { i: 2 });
      fs.writeFileSync(path.join(bad, 'audit-log.jsonl'), fs.readFileSync(path.join(bad, 'audit-log.jsonl'), 'utf8').replace('\\"i\\":1', '\\"i\\":9'));
      const broken = deploy.runChecks({ env, dataDir: bad, backupDir: bak, tools });
      assert.equal(lv(broken, 'db'), 'fail');
      assert.equal(lv(broken, 'chain:audit-log.jsonl'), 'fail');
      assert.equal(deploy.hasFailures(broken), true);
      fs.rmSync(bad, { recursive: true, force: true });
      // Lo que solo conviene arreglar (warn): sin copia reciente, sin herramientas, sin clave de copias
      const old26 = Date.now() - 30 * 3600000;
      fs.utimesSync(fresh, old26 / 1000, old26 / 1000);
      const warns = deploy.runChecks({ env: { ADMIN_TOKEN: env.ADMIN_TOKEN }, dataDir: data, backupDir: bak, freeBytes: 50 * GB, tools: {} });
      for (const id of ['backup', 'backup_pass', 'public_url', 'tool:nmap', 'tool:chrome']) assert.equal(lv(warns, id), 'warn', id);
      assert.equal(deploy.hasFailures(warns), false, 'los avisos no bloquean');
      assert.equal(lv(deploy.runChecks({ env, dataDir: data, backupDir: path.join(bak, 'no-existe'), tools }), 'backup'), 'warn', 'sin carpeta de copias');
    } finally {
      fs.rmSync(data, { recursive: true, force: true });
      fs.rmSync(bak, { recursive: true, force: true });
    }
  },

  'Plan de commit: separa lo que se sube, lo que no, y detecta secretos sin imprimirlos': () => {
    const e = (x, y, p) => ({ x, y, path: p });
    const entries = [
      e('?', '?', '.agents/skills/a.md'), e('?', '?', 'public/assets/a.png'), e('?', '?', 'public/world-110m.json'), e('?', '?', 'src/lib/audit/store.mjs'),
      e('?', '?', 'src/lib/audit/users.mjs'), e('?', '?', 'scripts/audit/run.mjs'), e('?', '?', 'scripts/colab_benchmark_calibration.py'), e('?', '?', 'skills-lock.json'),
      e('?', '?', '.env.production'), e('?', '?', '.env.example'), e('?', '?', 'backups/x.dtibak'), e('?', '?', 'data/audit.db'), e('?', '?', 'claves/servidor.pem'),
      e(' ', 'M', 'package.json'), e(' ', 'D', 'src/components/Viejo.tsx'),
    ];
    const plan = cplan.classify(entries);
    assert.deepEqual(plan.add.sort(), ['.env.example', 'public/world-110m.json', 'scripts/audit/run.mjs', 'src/lib/audit/store.mjs', 'src/lib/audit/users.mjs']);
    assert.deepEqual(plan.exclude.map((x) => x.path).sort(), ['.agents/skills/a.md', '.env.production', 'backups/x.dtibak', 'claves/servidor.pem', 'data/audit.db', 'public/assets/a.png', 'skills-lock.json']);
    assert.deepEqual(plan.review.map((x) => x.path), ['scripts/colab_benchmark_calibration.py']);
    assert.deepEqual(plan.tracked.map((x) => x.path), ['package.json', 'src/components/Viejo.tsx']);
    assert.ok(cplan.classify([e('?', '?', 'public/assets/a.png')], { assetsReferenced: true }).add.includes('public/assets/a.png'), 'si el código lo usa, se sube');
    // Carpetas: solo se agrupan si TODO lo nuevo que hay dentro se sube
    const all = entries.filter((x) => x.x === '?').map((x) => x.path);
    const picked = cplan.collapse(plan.add, all);
    assert.ok(picked.includes('src'), 'todo lo nuevo bajo src se sube: se agrupa hasta src');
    assert.ok(picked.includes('scripts/audit') && picked.includes('public/world-110m.json'));
    assert.ok(!picked.includes('scripts') && !picked.includes('public'), 'scripts/ y public/ tienen archivos que no se suben: no se agrupan');
    // Secretos: se detectan y NUNCA se imprime el valor completo
    const fake = ['-----BEGIN ' + 'RSA PRIVATE KEY-----', 'k = "AKIA' + 'ABCDEFGHIJKLMNOP"', 'dti_' + 'a'.repeat(64), 'const password = "' + 'Zx9'.repeat(9) + '"', 'ghp_' + 'A'.repeat(36), 'AIza' + 'B'.repeat(35)].join('\n');
    const hits = cplan.scanSecrets('x.ts', fake);
    assert.deepEqual(hits.map((h) => h.rule).sort(), ['clave de AWS', 'clave de Google', 'clave personal de DEFENSA TI', 'clave privada', 'secreto literal', 'token de GitHub']);
    assert.ok(hits.every((h) => !h.sample.includes('AAAAAAAAAA') && /…\(\d+ caracteres\)$/.test(h.sample)), 'no se imprime el secreto');
    for (const limpio of ['const token = process.env.TOKEN;', 'ADMIN_TOKEN=', "passwordless: 'sí'", 'sha256 = "abc"', 'x'.repeat(100)]) assert.deepEqual(cplan.scanSecrets('y.ts', limpio), [], limpio);
    assert.deepEqual(cplan.scanSecrets('bin', 'AKIA' + 'ABCDEFGHIJKLMNOP' + '\u0000'), [], 'los binarios no se escanean');
  },

  'Titularidad: el valor es por dominio, se acepta en el host o su padre y falla cerrado': async () => {
    own.clearOwnershipCache();
    const rec = own.ownershipRecord('tienda.com.pe');
    assert.match(rec.value, /^defensati-verify=[a-f0-9]{40}$/);
    assert.equal(rec.host, '_defensati-verify.tienda.com.pe');
    assert.equal(own.ownershipToken('tienda.com.pe'), own.ownershipToken('TIENDA.com.pe'));
    assert.notEqual(own.ownershipToken('tienda.com.pe'), own.ownershipToken('otra.com.pe'), 'cada dominio, su valor');
    assert.deepEqual(own.candidates('www.shop.tienda.com.pe'), ['www.shop.tienda.com.pe', 'shop.tienda.com.pe', 'tienda.com.pe', 'com.pe']);
    const noFile = async () => false;
    const dnsWith = (table) => async (name) => { if (table[name]) return [[table[name]]]; throw Object.assign(new Error('ENODATA'), { code: 'ENODATA' }); };
    const run = (host, table, extra = {}) => own.proveOwnership(host, { resolveTxt: dnsWith(table), fetchFile: noFile, useCache: false, ...extra });

    // En el propio host y en el dominio padre
    assert.deepEqual(await run('tienda.com.pe', { '_defensati-verify.tienda.com.pe': rec.value }), { verified: true, method: 'dns', domain: 'tienda.com.pe' });
    assert.deepEqual(await run('www.tienda.com.pe', { '_defensati-verify.tienda.com.pe': rec.value }), { verified: true, method: 'dns', domain: 'tienda.com.pe' }, 'el padre vale para un subdominio');
    assert.equal((await run('tienda.com.pe', { '_defensati-verify.tienda.com.pe': ' ' + rec.value + ' ' })).verified, true, 'tolera espacios');
    // Lo que NO vale
    assert.equal((await run('tienda.com.pe', { '_defensati-verify.tienda.com.pe': own.ownershipRecord('otra.com.pe').value })).verified, false, 'el valor de otro dominio');
    assert.equal((await run('tienda.com.pe', { '_defensati-verify.otra.com.pe': own.ownershipRecord('otra.com.pe').value })).verified, false, 'un hermano no cuenta');
    assert.equal((await run('www.tienda.com.pe', { '_defensati-verify.hijo.www.tienda.com.pe': 'x' })).verified, false, 'solo hacia arriba');
    assert.equal((await run('tienda.com.pe', { '_defensati-verify.tienda.com.pe': 'defensati-verify=' })).verified, false);
    assert.equal((await run('tienda.com.pe', {})).verified, false, 'sin registro');
    // Falla cerrado: DNS roto o que no responde
    assert.equal((await own.proveOwnership('tienda.com.pe', { resolveTxt: async () => { throw new Error('SERVFAIL'); }, fetchFile: noFile, useCache: false })).verified, false);
    const t0 = Date.now();
    const hang = await own.proveOwnership('tienda.com.pe', { resolveTxt: () => new Promise(() => {}), fetchFile: noFile, useCache: false });
    assert.equal(hang.verified, false);
    assert.ok(Date.now() - t0 < 6500, 'un DNS que no responde no cuelga el escáner: ' + (Date.now() - t0) + ' ms');
    // Archivo en el sitio
    assert.deepEqual(await own.proveOwnership('tienda.com.pe', { resolveTxt: dnsWith({}), fetchFile: async (h, v) => h === 'tienda.com.pe' && v === rec.value, useCache: false }), { verified: true, method: 'file', domain: 'tienda.com.pe' });
    assert.equal((await own.proveOwnership('tienda.com.pe', { resolveTxt: dnsWith({}), fetchFile: async () => { throw new Error('red'); }, useCache: false })).verified, false);
    // Entradas que ni se consultan
    let calls = 0;
    const counting = async () => { calls++; throw new Error('x'); };
    for (const bad of ['', '127.0.0.1', 'localhost', 'a b.pe', 'x/../y.pe', '10.0.0.1']) assert.equal((await own.proveOwnership(bad, { resolveTxt: counting, fetchFile: noFile, useCache: false })).verified, false, bad);
    assert.equal(calls, 0, 'no se consulta el DNS para entradas inválidas');
    // Caché: lo verificado dura 10 min; lo no verificado, 30 s
    let n = 0;
    const counted = async (name) => { n++; return name === '_defensati-verify.cache.pe' ? [[own.ownershipRecord('cache.pe').value]] : Promise.reject(new Error('no')); };
    await own.proveOwnership('cache.pe', { resolveTxt: counted, fetchFile: noFile, now: 1000 });
    const after1 = n;
    await own.proveOwnership('cache.pe', { resolveTxt: counted, fetchFile: noFile, now: 1000 + 5 * 60000 });
    assert.equal(n, after1, 'dentro de 10 min no vuelve a consultar');
    await own.proveOwnership('cache.pe', { resolveTxt: counted, fetchFile: noFile, now: 1000 + 11 * 60000 });
    assert.ok(n > after1, 'pasados 10 min sí');
    let m = 0;
    const failing = async () => { m++; throw new Error('no'); };
    await own.proveOwnership('nocache.pe', { resolveTxt: failing, fetchFile: noFile, now: 5000 });
    const m1 = m;
    await own.proveOwnership('nocache.pe', { resolveTxt: failing, fetchFile: noFile, now: 5000 + 10000 });
    assert.equal(m, m1, 'un fallo se recuerda 30 s');
    await own.proveOwnership('nocache.pe', { resolveTxt: failing, fetchFile: noFile, now: 5000 + 31000 });
    assert.ok(m > m1, 'pasados 30 s se vuelve a comprobar: así verificar el DNS tiene efecto rápido');
    own.clearOwnershipCache();
  },

  'Resumen para gerencia: nunca dice "seguro" sin datos y sube el nivel con lo comprobado': () => {
    const finding = (severity, over = {}) => ({ title: 'Hallazgo ' + severity, severity, impact: 'Impacto en el negocio.', fix: 'Corregir esto.', defense: { h24: [], d7: [], d30: [] }, retest: 'Repetir.', status: 'open', needsValidation: false, ...over });
    const report = (over = {}) => ({
      summary: { counts: { 'CRÍTICO': 0, ALTO: 0, MEDIO: 0, BAJO: 0 }, needsValidation: 0, resolved: 0 },
      coverage: { engines: [{ engine: 'nmap', status: 'ok' }], notRun: [], retest: false }, paths: [], findings: [], plan: { h24: [] }, ...over,
    });
    const lvl = (r) => exec.buildExecutive(r);
    // Sin hallazgos: solo "sin hallazgos" si TODO corrió; si no, no concluyente (y nunca "seguro")
    const clean = lvl(report());
    assert.deepEqual([clean.level, clean.reliability], ['SIN HALLAZGOS', 'completa']);
    assert.match(clean.headline, /no demuestra que no existan fallos/);
    const partial = lvl(report({ coverage: { engines: [{ engine: 'nmap' }], notRun: [{ engine: 'ZAP', status: 'missing' }], retest: false } }));
    assert.deepEqual([partial.level, partial.reliability], ['NO CONCLUYENTE', 'parcial']);
    assert.match(partial.headline, /no significa que el sitio esté seguro/);
    assert.match(partial.coverageNote, /ZAP/);
    const empty = lvl(report({ coverage: { engines: [], notRun: [], retest: false } }));
    assert.deepEqual([empty.level, empty.reliability], ['NO CONCLUYENTE', 'sin datos']);
    for (const x of [clean, partial, empty]) assert.ok(!/(es|está) (seguro|protegido)\b/i.test(x.headline.replace(/no significa que el sitio esté seguro/, '')), x.headline);
    // Niveles según lo medido
    const counts = (c) => report({ summary: { counts: { 'CRÍTICO': 0, ALTO: 0, MEDIO: 0, BAJO: 0, ...c }, needsValidation: 0, resolved: 0 } });
    assert.equal(lvl(counts({ 'CRÍTICO': 1 })).level, 'CRÍTICO');
    assert.equal(lvl(counts({ ALTO: 2 })).level, 'ALTO');
    assert.equal(lvl(counts({ MEDIO: 1 })).level, 'MEDIO');
    assert.equal(lvl(counts({ BAJO: 3 })).level, 'BAJO');
    assert.match(lvl(counts({ ALTO: 2 })).headline, /2 hallazgos urgentes/);
    assert.match(lvl(counts({ ALTO: 1 })).headline, /1 hallazgo urgente\b/);
    // Una ruta de ataque comprobada de gravedad alta lo vuelve crítico; una sin comprobar, no
    const path = (allProven) => report({ summary: { counts: { 'CRÍTICO': 0, ALTO: 0, MEDIO: 1, BAJO: 0 }, needsValidation: 0, resolved: 0 }, paths: [{ title: 'Ruta', impact: 'Daño', severity: 'ALTO', allProven }] });
    assert.equal(lvl(path(true)).level, 'CRÍTICO');
    assert.equal(lvl(path(false)).level, 'MEDIO');
    assert.equal(lvl(path(true)).chains.length, 1);
    // Prioridades: 3 como máximo, con lo "por confirmar" marcado y los textos recortados
    const many = report({ summary: { counts: { 'CRÍTICO': 0, ALTO: 5, MEDIO: 0, BAJO: 0 }, needsValidation: 2, resolved: 1 },
      findings: [1, 2, 3, 4, 5].map((i) => finding('ALTO', { title: 'T' + i + ' ' + 'x'.repeat(300), needsValidation: i === 2 })), });
    const m = lvl(many);
    assert.equal(m.priorities.length, 3);
    assert.ok(m.priorities.every((p) => p.title.length <= 110) && m.priorities[1].needsValidation === true);
    assert.ok(m.nextSteps.some((s) => /Confirmar a mano 2 hallazgos/.test(s)) && m.nextSteps.some((s) => /lógica del negocio/.test(s)));
    assert.ok(!lvl(counts({ MEDIO: 1 })).nextSteps.some((s) => /Confirmar a mano/.test(s)), 'sin pendientes no se pide confirmar');
    assert.match(lvl(report({ coverage: { engines: [{ engine: 'a' }], notRun: [], retest: true } })).retestNote, /no descubre hallazgos nuevos/);
  },
  'Resumen para gerencia: va primero en el informe, escapa lo hostil y sale en HTML de una página': () => {
    const e = store.createEngagement({ ...input, domain: 'gerencia.pe', client: '<img src=x onerror=alert(3)> SAC' });
    recordRun({ engagement: e.id, host: 'gerencia.pe', engine: 'nuclei', complete: true, findings: [
      { key: 'a', title: '<script>alert(1)</script> Panel de administración expuesto', severity: 'ALTO', confidence: 'probable', evidence: '"><img src=x onerror=alert(2)>' },
      { key: 'b', title: 'Archivo sensible expuesto: /.env', severity: 'CRÍTICO', confidence: 'confirmado' }] });
    const r = expert.buildReport(e.id);
    assert.equal(r.executive.level, 'CRÍTICO');
    const md = expert.toMarkdown(r);
    assert.ok(md.indexOf('## Resumen para gerencia') > 0 && md.indexOf('## Resumen para gerencia') < md.indexOf('## Detalle de los números'), 'el resumen va antes del detalle');
    assert.match(md, /Riesgo crítico/);
    assert.ok(expert.toHtml(r).includes('Resumen para gerencia'));
    const one = expert.toSummaryHtml(r);
    assert.ok(!/<script/i.test(one) && !one.includes('<img src=x') && one.includes('&lt;script&gt;'), 'el texto del sitio auditado va escapado');
    // El nombre del cliente también es texto libre: va escapado en todos los formatos
    for (const html of [one, expert.toHtml(r)]) assert.ok(!html.includes('<img src=x onerror=alert(3)') && html.includes('&lt;img src=x onerror=alert(3)&gt; SAC'), 'cliente hostil sin escapar');
    assert.ok(one.includes("http-equiv=\"Content-Security-Policy\"") && one.includes('RIESGO CRÍTICO') && one.includes('Próximos pasos'));
    assert.ok(one.indexOf('Lo primero que hay que atender') < one.indexOf('Próximos pasos'));
  },
  'Resumen de una página: aunque el informe sea enorme, el PDF tiene UNA hoja': async () => {
    let chromium;
    try { ({ chromium } = await import('playwright-core')); } catch { console.log('    (omitida: playwright-core no está instalado)'); return; }
    const long = 'palabra '.repeat(120);
    const r = {
      engagement: { domain: 'enorme.pe', client: 'Cliente con un nombre muy largo SAC', hosts: ['enorme.pe'], starts: 0, ends: 1, active: true, staging: false, internal: false },
      generatedAt: '2026-11-22T00:00:00Z',
      summary: { counts: { 'CRÍTICO': 9, ALTO: 40, MEDIO: 99, BAJO: 200 }, needsValidation: 77, resolved: 31, falsePositives: 0, accepted: 0 },
      coverage: { engines: [{ engine: 'a' }], notRun: ['ZAP', 'Nuclei', 'testssl', 'nmap', 'Semgrep', 'Trivy'].map((n) => ({ engine: n, status: 'missing' })), retest: true },
      paths: [1, 2, 3, 4].map((i) => ({ title: 'Ruta ' + long, impact: long, severity: 'CRÍTICO', allProven: true })),
      findings: Array.from({ length: 40 }, (_, i) => ({ title: 'Hallazgo ' + i + ' ' + long, severity: 'ALTO', impact: long, fix: long, defense: { h24: [long], d7: [], d30: [] }, retest: long, status: 'open', needsValidation: true })),
      plan: { h24: Array.from({ length: 30 }, () => ({ action: long, covers: 1 })) },
    };
    r.executive = exec.buildExecutive(r);
    const file = path.join(tmp, 'una-hoja.pdf');
    const pages = (f) => (fs.readFileSync(f).toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length;
    try {
      await renderPdf(expert.toSummaryHtml(r), file, { launcher: chromium, footer: false });
    } catch (err) {
      if (/No se pudo abrir/.test(err.message)) { console.log(`    (omitida: ${err.message})`); return; }
      throw err;
    }
    assert.equal(pages(file), 1, 'el resumen enorme sigue siendo de una sola página');
    assert.ok(fs.statSync(file).size > 2000);
    // Un informe normal también: una hoja
    const small = { ...r, findings: r.findings.slice(0, 2).map((f) => ({ ...f, title: 'Corto', impact: 'Breve', fix: 'Hacer esto' })), plan: { h24: [{ action: 'Cerrar el puerto', covers: 1 }] }, paths: [],
      coverage: { engines: [{ engine: 'a' }], notRun: [], retest: false }, summary: { ...r.summary, counts: { 'CRÍTICO': 0, ALTO: 2, MEDIO: 0, BAJO: 0 } } };
    small.executive = exec.buildExecutive(small);
    const f2 = path.join(tmp, 'una-hoja-corta.pdf');
    await renderPdf(expert.toSummaryHtml(small), f2, { launcher: chromium, footer: false });
    assert.equal(pages(f2), 1);
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${name}: ${e.message}`);
  }
}
console.log(`\n  ${Object.keys(tests).length - failed}/${Object.keys(tests).length} pruebas pasaron.`);

dns.resolveTxt = realTxt;
dns.lookup = realLookup;
server.close();
store.closeDb();
fs.rmSync(tmp, { recursive: true, force: true });
process.exitCode = failed ? 1 : 0;
