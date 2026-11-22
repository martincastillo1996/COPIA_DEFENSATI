// Pruebas de API a partir de la especificación OpenAPI que el propio cliente publica y de las rutas
// que su JavaScript público revela. Solo GET sin parámetros obligatorios, mismo origen, IP fijada,
// ritmo compartido y sin credenciales.
import { pinnedGet } from '../../src/lib/audit/net.mjs';
import { isUnsafeUrl } from './crawler.mjs';
import { discover } from './endpoints.mjs';
import { createLimiter } from './limiter.mjs';

export const SPEC_PATHS = ['/openapi.json', '/swagger.json', '/v3/api-docs', '/api/openapi.json', '/api/swagger.json', '/api-docs', '/swagger/v1/swagger.json', '/api/v1/openapi.json'];
export const SENSITIVE = /(^|\/)(admin|users?|accounts?|customers?|clients?|orders?|invoices?|payments?|internal|debug|actuator|config|export|backup)(\/|$|\.)/i;
const LEAK = /Traceback \(most recent call last\)|at [\w$.]+\([\w$./-]+:\d+:\d+\)|SQLSTATE\[|ORA-\d{5}|java\.lang\.\w+Exception|System\.\w+Exception|You have an error in your SQL syntax/;

const requiresAuth = (op, global) => {
  const sec = op.security ?? global;
  return Array.isArray(sec) && sec.length > 0 && !sec.some((s) => Object.keys(s).length === 0);
};

/** Qué rutas se probarán a partir de una especificación ya interpretada. */
export function planProbes(spec, max = 150) {
  const probes = [];
  let skipped = 0;
  for (const [path, item] of Object.entries(spec.paths || {})) {
    const op = item?.get;
    if (!op) continue;
    const params = [...(item.parameters || []), ...(op.parameters || [])];
    if (path.includes('{') || params.some((p) => p.required && p.in !== 'header') || isUnsafeUrl(path)) { skipped++; continue; }
    const declared = requiresAuth(op, spec.security);
    const sensitive = SENSITIVE.test(path);
    if (declared || sensitive) probes.push({ path, declared });
    if (probes.length >= max) break;
  }
  return { probes, skipped, capped: probes.length >= max };
}

const isHtml = (res) => /text\/html/i.test(String(res.headers?.['content-type'] || '')) || /^\s*<(!doctype|html)/i.test(res.body);

/** ¿La respuesta trae datos? Un JSON de objetos vacíos ({"user":{}}) no expone nada. */
export function hasData(body) {
  const full = (x) => (x == null ? false : typeof x === 'string' ? x.trim() !== '' : typeof x === 'object' ? Object.values(x).some(full) : true);
  try { return full(JSON.parse(body)); } catch { return body.trim().length > 2; }
}

/** Cuerpo que devuelve una ruta inexistente, si responde 200 (aplicaciones que "responden a todo"). */
export async function fetchBaseline({ origin, ip, get = pinnedGet, limiter }) {
  try {
    await limiter?.take();
    const r = await get(`${origin}/zz-defensati-${Math.random().toString(36).slice(2, 8)}`, ip, { maxBytes: 200000 });
    return r.status === 200 ? r.body : null;
  } catch {
    return null;
  }
}

/** Evalúa una respuesta sin credenciales. */
export function judge(probe, res) {
  const out = [];
  // Una página HTML (la SPA responde 200 a toda ruta de su interfaz), un JSON vacío o lo mismo que devuelve una ruta
  // inexistente no son datos expuestos
  const ok = res.status >= 200 && res.status < 300 && !isHtml(res) && hasData(res.body) && !(probe.baseline && res.body === probe.baseline);
  const where = `GET ${probe.path} → ${res.status}, ${res.body.length} bytes`;
  if (ok && probe.declared) {
    out.push({ key: `noauth:${probe.path}`, title: `API: ${probe.path} responde sin credenciales aunque la especificación exige autenticación`,
      severity: 'ALTO', confidence: 'probable', cwe: 'CWE-306', evidence: where,
      reproduction: `curl -s ${'<origen>'}${probe.path} sin cabeceras de autenticación`,
      fix: 'Aplicar la autenticación en el servidor para esta ruta y comprobar que la especificación coincide con lo implementado.' });
  } else if (ok && !probe.declared) {
    out.push({ key: `sensitive:${probe.path}`, title: `API: ruta sensible ${probe.path} accesible sin autenticación declarada`,
      severity: 'MEDIO', confidence: 'probable', cwe: 'CWE-284', evidence: where,
      reproduction: `curl -s ${'<origen>'}${probe.path}`,
      fix: 'Confirmar que la ruta debe ser pública; si no, exigir autenticación y autorización.' });
  }
  if (LEAK.test(res.body)) {
    out.push({ key: `leak:${probe.path}`, title: `API: ${probe.path} revela trazas internas en sus respuestas`,
      severity: 'MEDIO', confidence: 'confirmado', cwe: 'CWE-209', evidence: `${where}; contiene una traza de error`,
      reproduction: `GET ${probe.path}`, fix: 'Devolver errores genéricos al cliente y registrar el detalle solo en el servidor.' });
  }
  return out;
}

export async function findSpec({ origin, ip, get = pinnedGet, limiter }) {
  for (const p of SPEC_PATHS) {
    try {
      await limiter?.take();
      const res = await get(origin + p, ip, { maxBytes: 3e6 });
      if (res.status !== 200) continue;
      const spec = JSON.parse(res.body);
      if (spec && typeof spec === 'object' && spec.paths) return { spec, path: p };
    } catch {}
  }
  return null;
}

export async function audit({ host, ip, rps, check, get = pinnedGet, limiter = createLimiter(rps), origin = `https://${host}` }) {
  const found = await findSpec({ origin, ip, get, limiter });
  const disc = await discover({ origin, ip, get, limiter, check }).catch(() => ({ endpoints: [], scripts: 0 }));
  // Sin especificación ni rutas visibles no hay nada que probar, y no se puede dar por corregido lo anterior
  if (!found && !disc.endpoints.length) return { status: 'skipped', detail: 'no publica OpenAPI ni muestra rutas en su JavaScript', findings: [] };

  const { probes, skipped, capped } = found ? planProbes(found.spec) : { probes: [], skipped: 0, capped: false };
  const known = new Set(probes.map((p) => p.path));
  // Las rutas del JavaScript no dicen si exigen autenticación: solo se prueban las de nombre sensible
  const fromJs = disc.endpoints.filter((p) => !known.has(p) && SENSITIVE.test(p)).slice(0, 60).map((path) => ({ path, declared: false }));
  const findings = new Map();
  if (disc.endpoints.length) {
    findings.set('js-endpoints', { key: 'js-endpoints', title: `API: ${disc.endpoints.length} rutas internas visibles en el JavaScript público`, severity: 'BAJO', confidence: 'confirmado', cwe: 'CWE-200',
      evidence: disc.endpoints.slice(0, 8).join(', '), reproduction: 'Abrir los archivos .js del sitio y buscar las rutas /api, /admin o /auth.',
      fix: 'Confirmar que cada ruta exige autenticación y autorización: quien lee el JavaScript conoce el mapa de la API.' });
  }
  const baseline = await fetchBaseline({ origin, ip, get, limiter });
  // Una lectura cortada deja el resultado en parcial: no puede dar por corregido un hallazgo anterior
  let errors = disc.truncated || 0;
  for (const probe of [...probes, ...fromJs]) {
    check();
    try {
      await limiter.take();
      const res = await get(origin + probe.path, ip, { maxBytes: 200000 });
      for (const f of judge({ ...probe, baseline }, res)) findings.set(f.key, f);
      if (res.truncated) errors++;
    } catch { errors++; }
  }
  return {
    status: errors || capped ? 'partial' : 'ok', findings: [...findings.values()],
    detail: `${found ? `${found.path}: ${probes.length} rutas, ${skipped} omitidas` : 'sin OpenAPI'} · ${disc.endpoints.length} rutas en ${disc.scripts} archivos JS (${fromJs.length} sensibles probadas) · ${errors} errores`,
  };
}
