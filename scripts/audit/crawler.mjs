// Rastreador de solo lectura: GET, mismo origen, IP fijada, ritmo limitado y sin enviar formularios.
import { createHash } from 'node:crypto';
import { pinnedGet } from '../../src/lib/audit/net.mjs';
import { createLimiter } from './limiter.mjs';

// Un GET también puede cambiar datos: estas rutas nunca se visitan
const UNSAFE = /log-?out|sign-?(out|off)|log-?off|salir|cerrar|delete|remove|destroy|elimin|borrar|cancel|anular|unsubscribe|baja|revoke|reset|approve|aprobar|confirm|pagar|checkout|add-to-cart|action=|[?&](do|cmd)=|toggle|enable|disable|activar|impersonat|switch[-_]user/i;
// Rutas que, anunciadas en robots.txt, suelen ser justo lo que no debería estar a la vista
const ROBOTS_SENSITIVE = /admin|backup|private|secret|internal|config|ftp|dump|sql|\bdb\b|staging|\bdev\b|\btest\b|\bold\b|\btmp\b|temp|\.git|upload|logs?\b|passwd|password|keys?\b|encrypt/i;
const STATIC = /\.(png|jpe?g|gif|webp|avif|svg|ico|css|js|mjs|map|woff2?|ttf|pdf|zip|gz|mp4|webm|mp3)$/i;

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3]) : undefined;
};

export function isUnsafeUrl(url) {
  let text = url;
  try { text = decodeURIComponent(url); } catch {}
  return UNSAFE.test(text) || UNSAFE.test(url);
}

/** URL sin valores de parámetros ni identificadores largos, apta para guardar como evidencia. */
export function redactUrl(value) {
  try {
    const u = new URL(value);
    const query = [...new Set(u.searchParams.keys())].map((k) => `${k}=…`).join('&');
    const pathname = u.pathname.replace(/[A-Za-z0-9_-]{32,}/g, (s) => `…${createHash('sha256').update(s).digest('hex').slice(0, 6)}`);
    return u.origin + pathname + (query ? `?${query}` : '');
  } catch {
    return '';
  }
}

export async function crawl({ origin, ip, rps, check, session, maxPages = 500, verifyTls = true, limiter = createLimiter(rps) }) {
  const base = new URL(origin);
  if (session && base.protocol !== 'https:') throw new Error('La sesión solo se envía por HTTPS.');
  const queue = [`${base.origin}/`];
  const seen = new Set(queue);
  const variants = new Map();
  const params = new Set();
  const findings = new Map();
  let pages = 0;
  let requests = 0;
  let forms = 0;
  let errors = 0;
  let skipped = 0;

  const add = (f) => findings.set(f.key, f);
  const visit = (raw, from) => {
    let u;
    try { u = new URL(raw.replace(/&amp;/g, '&'), from); } catch { return; }
    u.hash = '';
    if (u.origin !== base.origin || STATIC.test(u.pathname)) return;
    if (isUnsafeUrl(u.pathname + u.search)) { skipped++; return; }
    for (const key of u.searchParams.keys()) params.add(`${u.pathname}?${key}`);
    const shape = `${u.pathname}?${[...u.searchParams.keys()].sort()}`;
    if (seen.has(u.href) || seen.size >= maxPages * 5 || (variants.get(shape) || 0) >= 3) return;
    variants.set(shape, (variants.get(shape) || 0) + 1);
    seen.add(u.href);
    queue.push(u.href);
  };

  // robots.txt: lo que un sitio pide no indexar suele ser justo lo que no debería estar a la vista
  try {
    await limiter.take();
    const rb = await pinnedGet(`${base.origin}/robots.txt`, ip, { headers: session, verifyTls: session ? true : verifyTls, maxBytes: 100000 });
    if (rb.status === 200 && !/<html/i.test(rb.body.slice(0, 300))) {
      const listed = [...new Set([...rb.body.matchAll(/^\s*(?:dis)?allow\s*:\s*(\/[^\s*$#]*)/gim)].map((m) => m[1]))].slice(0, 40);
      for (const path of listed) visit(path, `${base.origin}/`);
      const sensitive = listed.filter((x) => ROBOTS_SENSITIVE.test(x) && !isUnsafeUrl(x));
      if (sensitive.length) {
        add({ key: 'robots-sensitive', title: 'robots.txt anuncia rutas que parecen sensibles', severity: 'BAJO', confidence: 'confirmado', cwe: 'CWE-200',
          evidence: `robots.txt: ${sensitive.slice(0, 8).join(', ')}`, reproduction: `GET ${base.origin}/robots.txt`,
          fix: 'robots.txt no protege nada: es público y es lo primero que lee un atacante. Protege esas rutas con autenticación y no las anuncies.' });
      }
    }
  } catch { /* sin robots.txt */ }

  while (queue.length && requests < maxPages) {
    check();
    const url = queue.shift();
    requests++;
    await limiter.take();
    check();
    let res;
    try {
      res = await pinnedGet(url, ip, { headers: session, verifyTls: session ? true : verifyTls });
    } catch {
      errors++;
      continue;
    }
    // truncated: el servidor cortó antes de lo declarado; se analiza lo recibido pero el rastreo no es completo
    if (res.status === 429 || res.status >= 500 || res.truncated) errors++;
    if (res.status >= 300 && res.status < 400) {
      if (res.headers.location) visit(res.headers.location, url);
      continue;
    }
    if (res.status !== 200) continue;
    pages++;
    if (!/html/i.test(String(res.headers['content-type'] || ''))) continue;

    const html = res.body;
    const shown = redactUrl(url);
    // Apache y nginx ("Index of"), Python ("Directory listing for") y Express serve-index ("listing directory")
    if (/<title>\s*(Index of \/|Directory listing for \/|listing directory \/)/i.test(html)) {
      add({ key: `listing:${shown}`, title: 'Listado de directorio habilitado', severity: 'MEDIO', confidence: 'confirmado', cwe: 'CWE-548',
        evidence: `GET ${shown} → 200 con índice de directorio`, reproduction: `Abrir ${shown} y comprobar el listado.`,
        fix: 'Desactivar el listado: "autoindex off" en Nginx u "Options -Indexes" en Apache.' });
    }

    for (const match of html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)) {
      forms++;
      const form = match[0];
      const open = form.match(/^<form\b[^>]*>/i)[0];
      let action;
      try { action = new URL(attr(open, 'action') || url, url); } catch { continue; }
      const inputs = form.match(/<(input|select|textarea)\b[^>]*>/gi) || [];
      for (const input of inputs) {
        const name = attr(input, 'name');
        if (name) params.add(`${action.pathname}?${name}`);
      }
      const where = redactUrl(action.href);
      if (action.protocol === 'http:' && base.protocol === 'https:') {
        add({ key: `form-http:${where}`, title: 'Formulario que envía datos por HTTP', severity: 'ALTO', confidence: 'confirmado', cwe: 'CWE-319',
          evidence: `${shown} → ${where}`, reproduction: `Revisar el atributo action del formulario en ${shown}.`, fix: 'Enviar el formulario por HTTPS.' });
      }
      const post = (attr(open, 'method') || 'get').toLowerCase() === 'post';
      const token = inputs.some((i) => (attr(i, 'type') || '').toLowerCase() === 'hidden' && /csrf|token|nonce|authenticity|xsrf/i.test(attr(i, 'name') || ''));
      if (post && !token && action.origin === base.origin) {
        add({ key: `csrf:${where}`, title: 'Formulario POST sin token anti-CSRF visible', severity: 'BAJO', confidence: 'probable', cwe: 'CWE-352',
          evidence: `${shown} → POST ${where}`, reproduction: `Revisar el formulario en ${shown}; confirmar si lo protege SameSite o una validación de Origin.`,
          fix: 'Añadir token anti-CSRF validado en servidor y cookies SameSite.' });
      }
    }

    for (const match of html.matchAll(/<(a|area|iframe)\b[^>]*>/gi)) {
      const href = attr(match[0], match[1].toLowerCase() === 'iframe' ? 'src' : 'href');
      if (href) visit(href, url);
    }
  }

  return {
    // Un rastreo incompleto no puede dar por corregido un hallazgo anterior
    complete: pages > 0 && !queue.length && !errors,
    pages, forms, skipped, errors, params: params.size,
    findings: [...findings.values()],
  };
}

/**
 * BOLA/IDOR de solo lectura: B no debe leer los recursos privados de A.
 * Las URL y las dos cuentas de prueba las entrega el cliente; no se enumeran identificadores.
 */
export async function compareAccess({ origin, urls, ip, sessionA, sessionB, rps, check, verifyTls = true, limiter = createLimiter(rps) }) {
  const findings = [];
  let complete = urls.length > 0;
  for (const raw of urls) {
    const u = new URL(raw, origin);
    if (u.origin !== new URL(origin).origin || isUnsafeUrl(u.pathname + u.search)) throw new Error(`URL no permitida para IDOR: ${redactUrl(u.href)}`);
    const read = async (headers) => {
      check();
      await limiter.take();
      check();
      return pinnedGet(u.href, ip, { headers, verifyTls });
    };
    try {
      const a = await read(sessionA);
      if (a.status !== 200 || !a.body || a.truncated) { complete = false; continue; }
      const anonymous = await read({});
      if (anonymous.status === 200 && anonymous.body === a.body) continue; // recurso público
      const b = await read(sessionB);
      if (b.status === 429 || b.status >= 500 || b.truncated) { complete = false; continue; }
      if (b.status !== 200 || b.body !== a.body) continue;
      const shown = redactUrl(u.href);
      const id = createHash('sha256').update(u.href).digest('hex').slice(0, 16);
      findings.push({ key: `idor:${id}`, title: 'Posible IDOR/BOLA: otra cuenta lee el mismo recurso', severity: 'ALTO', confidence: 'probable', cwe: 'CWE-639',
        evidence: `GET ${shown}: la cuenta B recibe la misma respuesta que A`, reproduction: `Pedir ${shown} con las cuentas A y B y confirmar que el recurso es privado de A.`,
        fix: 'Validar la propiedad del objeto en servidor en cada petición.' });
    } catch {
      check();
      complete = false;
    }
  }
  return { complete, findings };
}
