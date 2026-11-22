// Mide los motores propios contra un laboratorio LOCAL (por ejemplo OWASP Juice Shop en tu máquina).
//
//   npx tsx scripts/dev/lab-engines.mjs http://127.0.0.1:3100 --truth docs/bench/juice-shop.truth.json
//
// SOLO acepta 127.0.0.1 o localhost. No pasa por la autorización ni por las puertas anti-SSRF porque no sale de tu
// equipo; por eso mismo se niega a apuntar a cualquier otro host. Para un laboratorio remoto usa el camino real
// (new, verify, run, bench) con una autorización.
import fs from 'node:fs';
import { performance } from 'node:perf_hooks';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

let target;
try { target = new URL(args[0] || ''); } catch { /* se informa abajo */ }
if (!target || !['http:', 'https:'].includes(target.protocol) || !['127.0.0.1', 'localhost'].includes(target.hostname)) {
  console.error('Este arnés solo acepta un laboratorio en 127.0.0.1 o localhost (ej. http://127.0.0.1:3100).');
  process.exit(1);
}
const ip = '127.0.0.1';
const origin = `${target.protocol}//127.0.0.1${target.port ? `:${target.port}` : ''}`;

const { crawl } = await import('../audit/crawler.mjs');
const apitest = await import('../audit/apitest.mjs');
const browser = await import('../audit/browser.mjs');
const { createLimiter } = await import('../audit/limiter.mjs');
const { verifyTruth, scoreBench, benchMarkdown, validateTruth } = await import('../audit/bench.mjs');
const { pinnedGet } = await import('../../src/lib/audit/net.mjs');
const { probeExposedEndpoints } = await import('../../src/lib/scanner/webAppScanner.ts');

const check = () => {};
const limiter = createLimiter(100);
const all = [];
const timing = {};
const add = (engine, list) => {
  for (const f of list) all.push({ id: `${engine}:${f.key || f.id}`, engine, title: f.title, severity: f.severity, cwe: f.cwe, evidence: f.evidence });
};
const timed = async (name, fn) => {
  const t0 = performance.now();
  try {
    const r = await fn();
    timing[name] = { ms: Math.round(performance.now() - t0), status: r?.status || 'ok', detail: r?.detail };
  } catch (e) {
    timing[name] = { ms: Math.round(performance.now() - t0), status: 'error', detail: e.message };
  }
};

await timed('crawler', async () => {
  const r = await crawl({ origin, ip, rps: 100, check, maxPages: 150, verifyTls: false, limiter });
  add('crawler', r.findings);
  return { status: r.complete ? 'ok' : 'partial', detail: `${r.pages} páginas, ${r.forms} formularios, ${r.errors} errores` };
});
await timed('webapp', async () => {
  const r = await probeExposedEndpoints(origin, (url, opts) => pinnedGet(url, ip, { maxBytes: opts.maxBytes }));
  add('webapp', r.findings);
  return { status: 'ok', detail: `${r.exposed.length} rutas expuestas` };
});
await timed('api', async () => {
  const r = await apitest.audit({ host: '127.0.0.1', origin, ip, rps: 100, check, limiter });
  add('api', r.findings);
  return r;
});
if (!flag('--no-browser')) {
  await timed('browser', async () => {
    let chromium;
    try { ({ chromium } = await import('playwright-core')); } catch { return { status: 'missing', detail: 'playwright-core no está instalado' }; }
    const r = await browser.audit({ host: '127.0.0.1', origin, ip, rps: 100, check, limiter, launcher: chromium });
    add('browser', r.findings);
    return r;
  });
}

const truthFile = value('--truth');
if (!truthFile) {
  console.log(JSON.stringify({ timing, findings: all }, null, 2));
  process.exit(0);
}
const verified = await verifyTruth(validateTruth(JSON.parse(fs.readFileSync(truthFile, 'utf8'))), { origin, ip });
const r = { ...scoreBench(verified.truth, all), dropped: verified.dropped, unverifiable: verified.unverifiable };
const seconds = Object.values(timing).reduce((s, t) => s + t.ms, 0) / 1000;
console.log(benchMarkdown({ ...r, seconds: Math.round(seconds) }));
console.log('## Motores\n');
for (const [name, t] of Object.entries(timing)) console.log(`- ${name}: ${t.status}, ${(t.ms / 1000).toFixed(1)} s${t.detail ? ` (${t.detail})` : ''}`);
console.log(`\n## Todos los hallazgos (${all.length})\n`);
for (const f of all) console.log(`- [${f.severity}] ${f.engine}: ${f.title}${f.evidence ? ` · ${String(f.evidence).slice(0, 110)}` : ''}`);
if (value('--out')) fs.writeFileSync(value('--out'), JSON.stringify({ result: r, timing, findings: all }, null, 2));
