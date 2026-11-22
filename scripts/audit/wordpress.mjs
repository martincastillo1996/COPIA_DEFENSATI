// WordPress: versiones reales de plugins y temas, y su estado frente a vulnerabilidades públicas.
// La versión se lee del propio sitio autorizado. A terceros solo se envía el nombre del plugin.
import { createLimiter } from './limiter.mjs';
import { pinnedGet } from '../../src/lib/audit/net.mjs';

const parts = (v) => String(v).split(/[.-]/).map((x) => parseInt(x, 10) || 0);
export function cmpVersion(a, b) {
  const x = parts(a);
  const y = parts(b);
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}

const SLUG = /^[a-z0-9][a-z0-9_-]{0,80}$/i;

/** Plugins y temas que aparecen en el HTML, con la versión de ?ver= si existe (menos fiable). */
export function extractAssets(html) {
  const found = { plugins: new Map(), themes: new Map() };
  for (const m of html.matchAll(/wp-content\/(plugins|themes)\/([a-z0-9_-]+)\/[^"'\s<>]*/gi)) {
    const map = found[m[1].toLowerCase()];
    const slug = m[2].toLowerCase();
    const ver = m[0].match(/[?&]ver=([0-9][0-9a-z.-]*)/i)?.[1];
    if (!map.has(slug) || (!map.get(slug) && ver)) map.set(slug, ver);
  }
  return found;
}

export const readmeVersion = (text) => text.match(/^\s*Stable tag:\s*([0-9][0-9a-z.-]*)\s*$/im)?.[1];
export const styleVersion = (text) => text.match(/^\s*Version:\s*([0-9][0-9a-z.-]*)\s*$/im)?.[1];

const sev = (cvss) => (cvss >= 9 ? 'CRÍTICO' : cvss >= 7 ? 'ALTO' : cvss >= 4 ? 'MEDIO' : cvss > 0 ? 'BAJO' : 'MEDIO');

/** Vulnerabilidades de WPScan que afectan a la versión instalada. */
export function judgeVulns(kind, slug, version, entry, exact) {
  const out = [];
  for (const v of entry?.vulnerabilities || []) {
    if (v.fixed_in && cmpVersion(version, v.fixed_in) >= 0) continue;
    const cves = (v.references?.cve || []).map((c) => `CVE-${c}`);
    out.push({ key: `${kind}:${slug}:${v.id || v.title}`,
      title: `WordPress: ${entry.friendly_name || slug} ${version}: ${v.title}${cves.length ? ` (${cves.slice(0, 2).join(', ')})` : ''}`,
      severity: sev(v.cvss?.score), confidence: exact ? 'confirmado' : 'probable', cvss: v.cvss?.score,
      attack: `Vulnerabilidad de tipo ${v.vuln_type || 'no indicado'} documentada públicamente. Hay exploits y escáneres automáticos que buscan esta versión exacta.`,
      evidence: `${kind} ${slug} ${version}${v.fixed_in ? `; corregida en ${v.fixed_in}` : '; sin corrección publicada'}`,
      reproduction: `Comprobar ${kind === 'plugin' ? '/wp-content/plugins/' : '/wp-content/themes/'}${slug}/ y la versión instalada.`,
      fix: v.fixed_in ? `Actualizar ${slug} a ${v.fixed_in} o superior.` : `No hay parche: desactivar y sustituir ${slug}.` });
  }
  return out;
}

/** wordpress.org devuelve "2024-05-01 4:15pm GMT". */
export function parseRepoDate(text) {
  const m = String(text || '').match(/^(\d{4})-(\d{2})-(\d{2})(?: (\d{1,2}):(\d{2})\s*(am|pm)?)?/i);
  if (!m) return NaN;
  let hour = Number(m[4] || 0);
  if (m[6]) hour = (hour % 12) + (m[6].toLowerCase() === 'pm' ? 12 : 0);
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]), hour, Number(m[5] || 0));
}

/** Plugin desactualizado o abandonado según el directorio oficial de wordpress.org. */
export function judgeRepo(kind, slug, version, info, now = Date.now()) {
  const out = [];
  if (!info) return out;
  if (info.error === 'closed') {
    out.push({ key: `${kind}:${slug}:closed`, title: `WordPress: ${slug} ${version} fue retirado del directorio oficial`, severity: 'ALTO', confidence: 'probable',
      evidence: `${kind} ${slug} cerrado en wordpress.org`, fix: `Retirar ${slug}: un plugin cerrado suele serlo por una falla grave o por abandono.` });
    return out;
  }
  if (info.version && cmpVersion(version, info.version) < 0) {
    out.push({ key: `${kind}:${slug}:outdated`, title: `WordPress: ${kind} ${slug} ${version} desactualizado (última ${info.version})`,
      severity: parts(version)[0] < parts(info.version)[0] ? 'MEDIO' : 'BAJO', confidence: 'confirmado',
      evidence: `instalada ${version}, publicada ${info.version}`, fix: `Actualizar ${slug} a ${info.version}.` });
  }
  const last = parseRepoDate(info.last_updated);
  if (Number.isFinite(last) && now - last > 730 * 86400000) {
    out.push({ key: `${kind}:${slug}:abandoned`, title: `WordPress: ${kind} ${slug} sin actualizaciones desde hace más de 2 años`, severity: 'MEDIO', confidence: 'probable',
      evidence: `última actualización ${new Date(last).toISOString().slice(0, 10)}`, fix: `Sustituir ${slug} por una alternativa mantenida: las fallas nuevas ya no se corregirán.` });
  }
  return out;
}

const defaultFetchJson = async (url, headers = {}) => {
  const res = await fetch(url, { headers: { 'User-Agent': 'DefensaTI-Audit/3.0', ...headers }, signal: AbortSignal.timeout(10000) });
  return res.status === 404 ? null : res.json();
};

export async function audit({ host, ip, rps, check, limiter = createLimiter(rps), get = pinnedGet, fetchJson = defaultFetchJson, token = process.env.WPSCAN_API_TOKEN, now = Date.now() }) {
  const origin = `https://${host}`;
  const home = await get(`${origin}/`, ip, { maxBytes: 1.5e6 });
  const html = home.body;
  let truncated = home.truncated ? 1 : 0;
  if (!/wp-content|wp-includes/i.test(html)) return { status: 'skipped', detail: 'no se detectó WordPress', findings: [] };

  const assets = extractAssets(html);
  const findings = new Map();
  const add = (list) => { for (const f of list) findings.set(f.key, f); };
  let versioned = 0;
  let unknown = 0;
  let queried = 0;

  const items = [...[...assets.plugins].map(([s, v]) => ['plugin', s, v]), ...[...assets.themes].map(([s, v]) => ['theme', s, v])].filter(([, s]) => SLUG.test(s)).slice(0, 40);
  for (const [kind, slug, assetVer] of items) {
    check();
    let version = assetVer;
    let exact = false;
    try {
      const file = kind === 'plugin' ? `plugins/${slug}/readme.txt` : `themes/${slug}/style.css`;
      const res = await get(`${origin}/wp-content/${file}`, ip, { maxBytes: 20000 });
      if (res.truncated) truncated++;
      const v = res.status === 200 ? (kind === 'plugin' ? readmeVersion(res.body) : styleVersion(res.body)) : undefined;
      if (v) { version = v; exact = true; }
    } catch {}
    await limiter.take();
    if (!version) { unknown++; continue; }
    versioned++;
    try {
      if (kind === 'plugin') {
        add(judgeRepo(kind, slug, version, await fetchJson(`https://api.wordpress.org/plugins/info/1.2/?action=plugin_information&request[slug]=${encodeURIComponent(slug)}`), now));
      }
      if (token) {
        const data = await fetchJson(`https://wpscan.com/api/v3/${kind}s/${encodeURIComponent(slug)}`, { Authorization: `Token token=${token}` });
        queried++;
        if (data?.[slug]) add(judgeVulns(kind, slug, version, data[slug], exact));
      }
    } catch {}
  }

  const complete = Boolean(token) && queried === versioned && unknown === 0 && !truncated;
  return {
    status: complete ? 'ok' : 'partial', findings: [...findings.values()],
    detail: `${items.length} componentes, ${versioned} con versión, ${unknown} sin versión.${token ? '' : ' Sin WPSCAN_API_TOKEN no se consultaron vulnerabilidades, solo estado de actualización.'}`,
  };
}
