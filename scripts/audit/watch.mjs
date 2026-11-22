// Vigilancia continua con diferencias: lo que cambió desde la última vez, en minutos.
// Una foto ligera por host (DNS, certificado, puertos y cabeceras) y una comparación con la anterior.
import dns from 'node:dns/promises';
import net from 'node:net';
import tls from 'node:tls';
import { pinnedGet } from '../../src/lib/audit/net.mjs';
import { resolvePublic } from '../../src/lib/audit/net.mjs';
import { assertAllowed, db, logEvent } from '../../src/lib/audit/store.mjs';

// Mismos 36 puertos que el escáner público (src/config/ports.ts); una prueba comprueba que coinciden
export const WATCH_PORTS = [80, 443, 8080, 8443, 8888, 9090, 9200, 5601, 21, 990, 22, 23, 3389, 5900, 5901, 25, 110, 143, 587, 993, 995,
  3306, 5432, 1433, 1521, 6379, 27017, 5984, 7474, 2375, 2376, 2379, 445, 139, 2049, 111];
const CRITICAL = new Set([21, 22, 23, 3389, 5900, 5901, 3306, 5432, 1433, 1521, 6379, 27017, 5984, 7474, 9200, 5601, 2375, 2376, 2379, 445, 139, 2049, 111]);
const RANK = { 'CRÍTICO': 4, ALTO: 3, MEDIO: 2, BAJO: 1 };
const POLICY = { none: 1, quarantine: 2, reject: 3 };

export function tcpOpen(ip, port, timeout = 900) {
  return new Promise((resolve) => {
    const s = net.connect({ host: ip, port, timeout });
    const done = (ok) => { s.destroy(); resolve(ok); };
    s.once('connect', () => done(true));
    s.once('timeout', () => done(false));
    s.once('error', () => done(false));
  });
}

export function readCert(host, ip) {
  return new Promise((resolve) => {
    const s = tls.connect({ host: ip, port: 443, servername: host, rejectUnauthorized: false, timeout: 8000 }, () => {
      const c = s.getPeerCertificate();
      s.end();
      resolve(c?.fingerprint256 ? { fp: c.fingerprint256, issuer: c.issuer?.O || c.issuer?.CN || '', notAfter: c.valid_to } : null);
    });
    s.on('error', () => resolve(null));
    s.on('timeout', () => { s.destroy(); resolve(null); });
  });
}

const safe = async (fn) => { try { return await fn(); } catch { return null; } };
const list = (v) => (Array.isArray(v) ? v.map(String).sort() : null);

/** Foto del host. null = no se pudo consultar (no es lo mismo que "no hay registros"). */
export async function snapshot({ host, ip, resolver = dns, probe = tcpOpen, cert = readCert, get = pinnedGet }) {
  const [a, aaaa, mx, ns, txt, dmarcTxt] = await Promise.all([
    safe(() => resolver.resolve4(host)), safe(() => resolver.resolve6(host)), safe(() => resolver.resolveMx(host)),
    safe(() => resolver.resolveNs(host)), safe(() => resolver.resolveTxt(host)), safe(() => resolver.resolveTxt(`_dmarc.${host}`)),
  ]);
  const flat = (t) => (t ? t.map((r) => r.join('')) : null);
  const [open, certInfo, res] = await Promise.all([
    Promise.all(WATCH_PORTS.map(async (p) => ((await probe(ip, p)) ? p : 0))),
    safe(() => cert(host, ip)),
    safe(() => get(`https://${host}/`, ip, { maxBytes: 1 })),
  ]);
  const h = res?.headers || {};
  return {
    at: Date.now(), ip,
    dns: {
      a: list(a), aaaa: list(aaaa), mx: mx ? mx.map((m) => `${m.priority} ${m.exchange}`).sort() : null, ns: list(ns),
      txtOk: Boolean(txt), spf: flat(txt)?.find((r) => /^v=spf1/i.test(r)) || null,
      dmarcOk: Boolean(dmarcTxt), dmarc: flat(dmarcTxt)?.find((r) => /^v=DMARC1/i.test(r)) || null,
    },
    cert: certInfo,
    ports: open.filter(Boolean).sort((x, y) => x - y),
    headers: res ? { hsts: 'strict-transport-security' in h, csp: 'content-security-policy' in h, xfo: 'x-frame-options' in h, xcto: 'x-content-type-options' in h, rp: 'referrer-policy' in h } : null,
  };
}

const policyOf = (record) => POLICY[(record || '').match(/;\s*p=(\w+)/i)?.[1]?.toLowerCase()] || 0;

/** Qué cambió entre dos fotos. Solo compara lo que se pudo consultar en ambas. */
export function diffSnapshots(prev, cur) {
  const ev = [];
  const add = (severity, title, detail) => ev.push({ severity, title, detail });
  for (const p of cur.ports.filter((x) => !prev.ports.includes(x))) {
    add(CRITICAL.has(p) ? 'CRÍTICO' : 'MEDIO', `Puerto ${p} nuevo abierto`, CRITICAL.has(p) ? 'Servicio de administración o base de datos accesible desde Internet.' : 'Servicio nuevo accesible desde Internet.');
  }
  for (const p of prev.ports.filter((x) => !cur.ports.includes(x))) add('BAJO', `Puerto ${p} ya no responde`, 'Puede ser una corrección o una caída del servicio.');
  if (prev.cert && cur.cert) {
    if (prev.cert.issuer !== cur.cert.issuer) add('ALTO', 'Cambió el emisor del certificado', `${prev.cert.issuer} → ${cur.cert.issuer}`);
    else if (prev.cert.fp !== cur.cert.fp) add('BAJO', 'Certificado renovado o reemplazado', `Vence: ${cur.cert.notAfter}`);
  } else if (prev.cert && !cur.cert) add('MEDIO', 'El certificado dejó de responder', 'Puede ser una caída o un cambio de configuración.');
  for (const k of ['a', 'aaaa', 'mx', 'ns']) {
    if (prev.dns[k] && cur.dns[k] && prev.dns[k].join() !== cur.dns[k].join()) {
      add('ALTO', `Cambió el registro DNS ${k.toUpperCase()}`, `${prev.dns[k].join(', ') || '(vacío)'} → ${cur.dns[k].join(', ') || '(vacío)'}`);
    }
  }
  if (prev.dns.txtOk && cur.dns.txtOk && prev.dns.spf !== cur.dns.spf) add(prev.dns.spf && !cur.dns.spf ? 'ALTO' : 'MEDIO', prev.dns.spf && !cur.dns.spf ? 'SPF eliminado' : 'Cambió el registro SPF', `${prev.dns.spf || '(ninguno)'} → ${cur.dns.spf || '(ninguno)'}`);
  if (prev.dns.dmarcOk && cur.dns.dmarcOk && prev.dns.dmarc !== cur.dns.dmarc) {
    const weaker = policyOf(cur.dns.dmarc) < policyOf(prev.dns.dmarc);
    add(weaker ? 'ALTO' : 'MEDIO', weaker ? 'DMARC debilitado o eliminado' : 'Cambió el registro DMARC', `${prev.dns.dmarc || '(ninguno)'} → ${cur.dns.dmarc || '(ninguno)'}`);
  }
  if (prev.headers && cur.headers) {
    for (const [k, label] of [['hsts', 'HSTS'], ['csp', 'Content-Security-Policy'], ['xfo', 'X-Frame-Options'], ['xcto', 'X-Content-Type-Options'], ['rp', 'Referrer-Policy']]) {
      if (prev.headers[k] && !cur.headers[k]) add('MEDIO', `La cabecera ${label} desapareció`, 'Una actualización o un cambio de configuración la quitó.');
    }
  }
  return ev.sort((x, y) => RANK[y.severity] - RANK[x.severity]);
}

export function lastSnapshot(host) {
  const row = db().prepare('SELECT data FROM snapshots WHERE host=? ORDER BY at DESC LIMIT 1').get(host);
  return row ? JSON.parse(row.data) : null;
}

/** Foto, comparación con la anterior y registro. Exige la autorización vigente. */
export async function watchHost(engagement, host, deps = {}) {
  assertAllowed(engagement.id, host);
  const ip = deps.ip || (await resolvePublic(host));
  const cur = await snapshot({ host, ip, ...deps });
  const prev = lastSnapshot(host);
  db().prepare('INSERT INTO snapshots(host,at,data) VALUES(?,?,?)').run(host, cur.at, JSON.stringify(cur));
  db().prepare('DELETE FROM snapshots WHERE host=? AND at NOT IN (SELECT at FROM snapshots WHERE host=? ORDER BY at DESC LIMIT 60)').run(host, host);
  const events = prev ? diffSnapshots(prev, cur) : [];
  logEvent('watch.run', { engagement: engagement.id, host, events: events.length });
  return { first: !prev, events, snapshot: cur };
}
