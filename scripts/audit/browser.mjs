// Rastreo con navegador real para aplicaciones de una sola página (React, Vue, Angular).
// Descubre las rutas de API que el JavaScript llama al cargar y los dominios de terceros que arrastra.
//
// Blindaje (el navegador ejecuta el JavaScript del sitio auditado, así que se le quita todo lo demás):
//  - La IP queda fijada con --host-resolver-rules: ningún otro nombre resuelve (sin DNS rebinding).
//  - Solo el mismo origen y solo GET/HEAD: las peticiones a otros dominios y las escrituras se abortan.
//  - Sin clics, formularios ni sesión: solo navega y lee. Sin service workers, descargas ni permisos.
//  - Contexto efímero, ritmo compartido con los demás motores y parada de emergencia cada segundo.
import { pinnedGet } from '../../src/lib/audit/net.mjs';
import { isUnsafeUrl } from './crawler.mjs';
import { judge, SENSITIVE, fetchBaseline } from './apitest.mjs';
import { createLimiter } from './limiter.mjs';

const STATIC = /\.(png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|map|woff2?|ttf|pdf|zip|gz|mp4|webm|mp3)$/i;

export async function launchBrowser(chromium, args) {
  const base = { headless: true, args };
  if (process.env.CHROME_PATH) return chromium.launch({ ...base, executablePath: process.env.CHROME_PATH });
  try {
    return await chromium.launch({ ...base, channel: 'chrome' });
  } catch {
    return chromium.launch({ ...base, channel: 'msedge' });
  }
}

const capped = (p, ms = 4000) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]).catch(() => {});

/**
 * Espera a que la aplicación termine de pintar antes de leer sus enlaces: el DOM sin cambios durante 700 ms
 * (máximo 2,5 s) y, tras bajar al final de la página, otra vez sin cambios. Bajar activa las cargas diferidas
 * (que solo pueden ser GET del mismo origen). Todo con tope: una página hostil que redefina los temporizadores
 * no puede colgar el rastreo.
 * @param {any} page
 */
async function settle(page) {
  const quiet = () => page.evaluate(() => new Promise((resolve) => {
    let timer;
    const done = () => { obs.disconnect(); resolve(undefined); };
    const obs = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(done, 700); });
    obs.observe(document, { childList: true, subtree: true, attributes: true });
    timer = setTimeout(done, 700);
    setTimeout(done, 2500);
  }));
  await capped(quiet());
  await capped(page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)));
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  await capped(quiet());
}

/**
 * @param {{ origin: string, ip: string, limiter?: any, check?: () => void, maxPages?: number, maxMs?: number, launcher?: any }} o
 */
export async function browserCrawl({ origin, ip, limiter = createLimiter(5), check = () => {}, maxPages = 40, maxMs = 240000, launcher }) {
  const base = new URL(origin);
  let chromium = launcher;
  if (!chromium) {
    try { ({ chromium } = await import('playwright-core')); } catch { return { missing: 'playwright-core no está instalado' }; }
  }
  const args = [`--host-resolver-rules=MAP ${base.hostname} ${ip},MAP * ~NOTFOUND`, '--disable-dev-shm-usage', '--disable-extensions', '--mute-audio',
    ...(process.env.AUDIT_BROWSER_NOSANDBOX === '1' ? ['--no-sandbox'] : [])];
  let browser;
  try {
    browser = await launchBrowser(chromium, args);
  } catch (e) {
    return { missing: `no se pudo abrir Chrome ni Edge (${String(e.message).split('\n')[0].slice(0, 120)}). Instálalo o fija CHROME_PATH` };
  }

  const started = Date.now();
  let stopped;
  const watch = setInterval(() => {
    try { check(); } catch (e) { stopped = e; browser.close().catch(() => {}); }
  }, 1000);

  const found = new Set();
  const third = new Set();
  let blockedWrites = 0;
  let skipped = 0;
  let pages = 0;
  let errors = 0;
  let timedOut = false;
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, serviceWorkers: 'block', acceptDownloads: false, permissions: [],
      userAgent: 'DefensaTI-AuthorizedAudit/3.0 (browser)' });
    await context.route('**/*', async (route) => {
      const req = route.request();
      let u;
      try { u = new URL(req.url()); } catch { return route.abort('blockedbyclient'); }
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return route.abort('blockedbyclient');
      if (u.origin !== base.origin) { third.add(u.hostname); return route.abort('blockedbyclient'); }
      const type = req.resourceType();
      // La ruta se anota aunque se bloquee: que la aplicación la use es parte de su superficie de ataque
      if (type === 'xhr' || type === 'fetch') found.add(u.pathname.replace(/\/+$/, '') || '/');
      if (req.method() !== 'GET' && req.method() !== 'HEAD') { blockedWrites++; return route.abort('blockedbyclient'); }
      if (isUnsafeUrl(u.pathname + u.search)) { skipped++; return route.abort('blockedbyclient'); }
      if (type === 'document' || type === 'xhr' || type === 'fetch') await limiter.take();
      return route.continue();
    });
    const page = await context.newPage();
    page.setDefaultNavigationTimeout(20000);
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    page.on('popup', (p) => p.close().catch(() => {}));

    const queue = [`${base.origin}/`];
    const seen = new Set(queue);
    const visit = (raw) => {
      let u;
      try { u = new URL(raw); } catch { return; }
      u.hash = '';
      if (u.origin !== base.origin || STATIC.test(u.pathname) || isUnsafeUrl(u.pathname + u.search) || seen.has(u.href) || seen.size > maxPages * 4) return;
      seen.add(u.href);
      queue.push(u.href);
    };
    while (queue.length && pages < maxPages) {
      check();
      if (stopped) throw stopped;
      if (Date.now() - started > maxMs) { timedOut = true; break; }
      const url = queue.shift();
      try {
        // "load" y no "networkidle": con WebSocket o sondeos la red nunca queda en reposo y la página se descartaba
        const res = await page.goto(url, { waitUntil: 'load', timeout: 20000 });
        if (!res || res.status() >= 400) { errors++; continue; }
        pages++;
        await settle(page);
        for (const href of await page.$$eval('a[href]', (as) => as.map((a) => a.href))) visit(href);
      } catch {
        if (stopped) throw stopped;
        errors++;
      }
    }
    if (stopped) throw stopped;
    return { pages, errors, skipped, blockedWrites, endpoints: [...found].sort().slice(0, 300), thirdParty: [...third].sort(), complete: !timedOut && !queue.length && errors === 0 };
  } finally {
    clearInterval(watch);
    await browser.close().catch(() => {});
  }
}

export async function audit({ host, ip, rps, check, limiter = createLimiter(rps), get = pinnedGet, launcher, origin = `https://${host}` }) {
  if (process.env.AUDIT_BROWSER !== '1' && !launcher) return { status: 'skipped', detail: 'desactivado: AUDIT_BROWSER=1 lo activa (requiere playwright-core y Chrome)', findings: [] };
  const r = await browserCrawl({ origin, ip, limiter, check, launcher });
  if (r.missing) return { status: 'missing', detail: r.missing, findings: [] };

  const findings = new Map();
  if (r.endpoints.length) {
    findings.set('browser-endpoints', { key: 'browser-endpoints', title: `Navegador: ${r.endpoints.length} rutas de API llamadas al cargar la aplicación`, severity: 'BAJO', confidence: 'confirmado', cwe: 'CWE-200',
      evidence: r.endpoints.slice(0, 8).join(', '), reproduction: 'Abrir la aplicación con las herramientas de desarrollo del navegador y revisar la pestaña Red (Fetch/XHR).',
      fix: 'Confirmar que cada ruta exige autenticación y autorización en el servidor: la interfaz no es un control de acceso.' });
  }
  if (r.thirdParty.length) {
    findings.set('browser-third-party', { key: 'browser-third-party', title: `Navegador: la aplicación carga recursos de ${r.thirdParty.length} dominio(s) de terceros`, severity: 'BAJO', confidence: 'confirmado', cwe: 'CWE-829',
      evidence: r.thirdParty.slice(0, 8).join(', '), reproduction: 'Pestaña Red del navegador, filtrando por dominio distinto del sitio.',
      fix: 'Mantén solo los terceros necesarios, con integridad de subrecursos (SRI) y una política CSP con lista cerrada de scripts.' });
  }
  // Las rutas de nombre sensible se prueban sin credenciales, igual que las de OpenAPI
  // Nunca se sondea con GET una ruta de nombre peligroso (borrar, cerrar sesión...), aunque la aplicación la llame
  const sensitive = r.endpoints.filter((p) => SENSITIVE.test(p) && !isUnsafeUrl(p)).slice(0, 60);
  const baseline = sensitive.length ? await fetchBaseline({ origin, ip, get, limiter }) : null;
  let probeErrors = 0;
  for (const path of sensitive) {
    check();
    try {
      await limiter.take();
      const res = await get(origin + path, ip, { maxBytes: 200000 });
      for (const f of judge({ path, declared: false, baseline }, res)) findings.set(f.key, f);
      if (res.truncated) probeErrors++;
    } catch { probeErrors++; }
  }
  return {
    status: r.complete && !probeErrors ? 'ok' : 'partial', findings: [...findings.values()],
    detail: `${r.pages} páginas, ${r.endpoints.length} rutas de API, ${r.thirdParty.length} terceros bloqueados, ${r.blockedWrites} escrituras bloqueadas, ${r.skipped} rutas peligrosas omitidas, ${r.errors} errores`,
  };
}
