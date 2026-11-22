/**
 * Motor de Superficie de Ataque (ASM) y Endurecimiento DNS/TLS/Correo (DEFENSA TI ASM v1.0)
 *
 * Pasivo en modo público (equivale a consultar registros públicos):
 *   - Subdominios vía Certificate Transparency (crt.sh / CertSpotter) y su resolución DNS.
 *   - Subdomain takeover (CNAME colgante hacia servicios reclamables).
 *   - DNSSEC (DoH), CAA, NS, y correo: DKIM, MTA-STS, TLS-RPT, BIMI.
 * Activo, solo en modo "full" (auditoría autorizada):
 *   - Protocolos TLS soportados (1.0/1.1/1.2/1.3), forward secrecy, cadena, OCSP stapling,
 *     tamaño de clave, vigencia del certificado e intercambio híbrido post-cuántico.
 *
 * Al buscar subdominios solo se consultan DNS y catálogos públicos de certificados con el
 * nombre del dominio auditado. Nunca se conecta a subdominios descubiertos salvo, en el caso
 * de un CNAME hacia un servicio reclamable, una única petición GET para confirmar la huella.
 */

import dns from 'dns';
import tls from 'tls';
import crypto from 'crypto';
import { safeLookup, safeHttpGet } from '@/lib/security/safeNet';
import { ScanFinding, sortFindings } from '@/lib/scanner/findingTypes';

export interface SubdomainInfo {
  name: string;
  resolves: boolean;
  ips: string[];
  cname?: string;
  risky?: string;
  takeover?: { provider: string; confirmed: boolean; evidence: string };
}

export interface TlsDeepResult {
  protocols: Record<'TLSv1' | 'TLSv1.1' | 'TLSv1.2' | 'TLSv1.3', boolean | null>;
  legacyEnabled: string[];
  negotiated?: { protocol: string; cipher: string };
  forwardSecrecy: boolean | null;
  keyInfo?: { type: string; bits?: number; curve?: string };
  chainDepth?: number;
  certLifetimeDays?: number;
  ocspStapling: boolean | null;
  pqHybrid: boolean | null;
}

export interface AsmResult {
  subdomains: {
    source: string;
    totalDiscovered: number;
    analyzed: number;
    resolving: number;
    list: SubdomainInfo[];
    risky: number;
    takeovers: number;
  };
  dnsHardening: {
    dnssec: boolean | null;
    caa: { present: boolean; issuers: string[] };
    nameservers: string[];
  };
  emailAuth: {
    /** false = el dominio no recibe correo: DKIM/MTA-STS no aplican. */
    hasMx: boolean;
    dkim: { found: boolean; selectors: string[] };
    mtaSts: { present: boolean; mode?: string };
    tlsRpt: boolean;
    bimi: boolean;
  };
  tls?: TlsDeepResult;
  typosquats: TyposquatHit[];
  publicBuckets: PublicBucket[];
  findings: ScanFinding[];
  mode: 'public' | 'full';
  generatedAt: string;
}

// ─────────────────────────── Utilidades ───────────────────────────

const sleepTimeout = <T>(p: Promise<T>, ms: number): Promise<T | null> =>
  Promise.race([p, new Promise<null>((r) => setTimeout(() => r(null), ms))]);

const resolver = new dns.promises.Resolver({ timeout: 2500, tries: 1 });

async function safeResolve<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return (await sleepTimeout(fn(), 3500)) ?? fallback;
  } catch {
    return fallback;
  }
}

async function pool<T, R>(items: T[], size: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (true) {
        const i = next++;
        if (i >= items.length) return;
        out[i] = await worker(items[i]);
      }
    })
  );
  return out;
}

async function fetchJson(url: string, timeoutMs: number, headers: Record<string, string> = {}): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'application/json', ...headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ─────────────────────────── Subdominios (CT) ───────────────────────────

const g = globalThis as unknown as { __ctCache?: Map<string, { at: number; names: string[]; source: string }> };
if (!g.__ctCache) g.__ctCache = new Map();
const CT_TTL = 6 * 60 * 60 * 1000;

function cleanNames(raw: string[], domain: string): string[] {
  const set = new Set<string>();
  for (const n of raw) {
    for (const part of String(n).split('\n')) {
      const name = part.trim().toLowerCase().replace(/^\*\./, '');
      if (!name || name.includes('*') || name.includes(' ')) continue;
      if (name === domain || name.endsWith(`.${domain}`)) set.add(name);
    }
  }
  return [...set].sort();
}

// Prefijos comunes que se comprueban por DNS (solo consultas DNS, sin conectar a los hosts)
const COMMON_PREFIXES = [
  'www', 'mail', 'webmail', 'smtp', 'vpn', 'remote', 'portal', 'intranet', 'api', 'app', 'apps', 'admin', 'panel',
  'dev', 'test', 'staging', 'stage', 'qa', 'uat', 'beta', 'demo', 'old', 'backup', 'cdn', 'static', 'assets', 'files',
  'ftp', 'sftp', 'git', 'gitlab', 'jenkins', 'jira', 'grafana', 'kibana', 'sso', 'auth', 'login', 'owa', 'autodiscover',
  'shop', 'tienda', 'pagos', 'pay', 'm', 'blog', 'docs', 'status', 'crm', 'erp', 'db', 'mysql',
];

async function dnsBruteforce(domain: string): Promise<string[]> {
  // Comodín DNS: si un nombre aleatorio resuelve, este método no es fiable y se omite
  const probe = await safeResolve(() => resolver.resolve4(`zz-${crypto.randomBytes(5).toString('hex')}.${domain}`), [] as string[]);
  if (probe.length > 0) return [];
  const hits = await pool(COMMON_PREFIXES, 12, async (p) => {
    const name = `${p}.${domain}`;
    const [a, c] = await Promise.all([
      safeResolve(() => resolver.resolve4(name), [] as string[]),
      safeResolve(() => resolver.resolveCname(name), [] as string[]),
    ]);
    return a.length || c.length ? name : null;
  });
  return hits.filter((h): h is string => Boolean(h));
}

async function discoverSubdomains(domain: string): Promise<{ names: string[]; source: string }> {
  const hit = g.__ctCache!.get(domain);
  if (hit && Date.now() - hit.at < CT_TTL) return { names: hit.names, source: hit.source };

  const spotterKey = process.env.CERTSPOTTER_API_KEY?.trim();
  // Tres fuentes en paralelo y combinadas: crt.sh es inestable y CertSpotter sin clave limita resultados
  const [crt, spotter, brute] = await Promise.all([
    (async () => {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const rows = (await fetchJson(`https://crt.sh/?q=${encodeURIComponent('%.' + domain)}&output=json`, 12000)) as Array<{ name_value?: string }>;
          return cleanNames(rows.map((r) => r.name_value || ''), domain);
        } catch {
          // reintento
        }
      }
      return null;
    })(),
    (async () => {
      try {
        const rows = (await fetchJson(
          `https://api.certspotter.com/v1/issuances?domain=${encodeURIComponent(domain)}&include_subdomains=true&expand=dns_names`,
          9000,
          spotterKey ? { Authorization: `Bearer ${spotterKey}` } : {}
        )) as Array<{ dns_names?: string[] }>;
        return cleanNames(rows.flatMap((r) => r.dns_names || []), domain);
      } catch {
        return null;
      }
    })(),
    dnsBruteforce(domain).catch(() => [] as string[]),
  ]);

  const used: string[] = [];
  if (crt && crt.length) used.push('crt.sh');
  if (spotter && spotter.length) used.push('certspotter');
  if (brute.length) used.push('dns');
  const names = [...new Set([...(crt || []), ...(spotter || []), ...brute])].sort();
  const source = used.length ? used.join('+') : 'ninguna';
  if (names.length > 0) g.__ctCache!.set(domain, { at: Date.now(), names, source });
  return { names, source };
}

// ─────────────────────────── Typosquatting (pasivo, solo DNS) ───────────────────────────

const MULTI_SUFFIX = /\.(com|gob|org|edu|net|mil|nom|co|ac|gov)\.[a-z]{2}$/;

function splitDomain(domain: string): { label: string; suffix: string } {
  const m = domain.match(MULTI_SUFFIX);
  const suffix = m ? m[0].slice(1) : domain.split('.').slice(-1)[0];
  const rest = domain.slice(0, domain.length - suffix.length - 1);
  return { label: rest.split('.').pop() || rest, suffix };
}

const HOMOGLYPHS: Record<string, string[]> = { o: ['0'], l: ['1', 'i'], i: ['1', 'l'], e: ['3'], a: ['4'], s: ['5'], m: ['rn'], b: ['d'], g: ['q'] };
const KEYBOARD: Record<string, string> = { a: 'qs', b: 'vn', c: 'xv', d: 'sf', e: 'wr', f: 'dg', g: 'fh', h: 'gj', i: 'uo', j: 'hk', k: 'jl', l: 'k', m: 'n', n: 'bm', o: 'ip', p: 'o', r: 'et', s: 'ad', t: 'ry', u: 'yi', v: 'cb', w: 'qe', y: 'tu' };
const ALT_SUFFIXES = ['com', 'net', 'org', 'pe', 'com.pe', 'co', 'io', 'info', 'online', 'app', 'site'];
const PHISH_WORDS = ['login', 'seguro', 'pagos', 'clientes', 'soporte', 'verificacion'];

export function typoCandidates(domain: string, max = 80): string[] {
  const { label, suffix } = splitDomain(domain);
  const phish: string[] = [];
  const tlds: string[] = [];
  const typos = new Set<string>();
  const ok = (l: string) => l && l !== label && /^[a-z0-9-]+$/.test(l) && !l.startsWith('-') && !l.endsWith('-');
  for (const w of PHISH_WORDS) {
    phish.push(`${label}-${w}.${suffix}`, `${w}-${label}.${suffix}`);
  }
  for (const suf of ALT_SUFFIXES) if (suf !== suffix) tlds.push(`${label}.${suf}`);
  const add = (l: string) => {
    if (ok(l)) typos.add(`${l}.${suffix}`);
  };
  for (let i = 0; i < label.length; i++) {
    add(label.slice(0, i) + label.slice(i + 1));
    add(label.slice(0, i) + label[i] + label.slice(i));
    if (i < label.length - 1) add(label.slice(0, i) + label[i + 1] + label[i] + label.slice(i + 2));
    for (const h of HOMOGLYPHS[label[i]] || []) add(label.slice(0, i) + h + label.slice(i + 1));
    for (const k of KEYBOARD[label[i]] || '') add(label.slice(0, i) + k + label.slice(i + 1));
    if (i > 0) add(label.slice(0, i) + '-' + label.slice(i));
  }
  return [...new Set([...tlds, ...phish, ...typos])].filter((d) => d !== domain).slice(0, max);
}

export interface TyposquatHit {
  name: string;
  ips: string[];
  hasMx: boolean;
  sameNs: boolean;
}

async function findTyposquats(domain: string, ownNs: string[]): Promise<TyposquatHit[]> {
  const own = new Set(ownNs.map((n) => n.toLowerCase()));
  const res = await pool(typoCandidates(domain), 16, async (name) => {
    const [a, mx] = await Promise.all([
      safeResolve(() => resolver.resolve4(name), [] as string[]),
      safeResolve(() => resolver.resolveMx(name), [] as dns.MxRecord[]),
    ]);
    if (!a.length && !mx.length) return null;
    const ns = await safeResolve(() => resolver.resolveNs(name), [] as string[]);
    return { name, ips: a.slice(0, 2), hasMx: mx.length > 0, sameNs: ns.some((n) => own.has(n.toLowerCase())) };
  });
  return res.filter((r): r is TyposquatHit => Boolean(r));
}

// ─────────────────────────── Buckets cloud (solo full) ───────────────────────────

export interface PublicBucket {
  url: string;
  provider: string;
}

async function findPublicBuckets(domain: string): Promise<PublicBucket[]> {
  const { label } = splitDomain(domain);
  const names = [label, ...['backup', 'backups', 'assets', 'static', 'media', 'files', 'prod', 'dev', 'uploads', 'data', 'public'].map((s) => `${label}-${s}`)];
  const urls: PublicBucket[] = names.flatMap((n) => [
    { url: `https://${n}.s3.amazonaws.com/`, provider: 'Amazon S3' },
    { url: `https://storage.googleapis.com/${n}/`, provider: 'Google Cloud Storage' },
  ]);
  const hits = await pool(urls, 8, async (u) => {
    try {
      const r = await safeHttpGet(u.url, { timeoutMs: 4000, maxBytes: 4000 });
      if (r.status === 200 && /<ListBucketResult/i.test(r.body)) return u;
    } catch {
      // inexistente o inaccesible
    }
    return null;
  });
  return hits.filter((h): h is PublicBucket => Boolean(h));
}

const RISKY_LABEL =
  /^(dev|develop|development|test|testing|stage|staging|uat|qa|preprod|pre-prod|sandbox|demo|beta|old|legacy|backup|bak|admin|administrator|intranet|internal|vpn|rdp|ssh|ftp|sftp|db|database|sql|mysql|phpmyadmin|pma|jenkins|gitlab|git|svn|jira|confluence|grafana|kibana|prometheus|monitor|nagios|zabbix|sentry|vault|consul|rancher|portainer|k8s|kube|docker|registry|nexus|sonar|sso|ldap|owa|exchange|autodiscover-old|webmail-old|api-dev|api-test|api-staging)(\d+)?(-[a-z0-9]+)?$/;

interface TakeoverProvider {
  name: string;
  suffix: RegExp;
  /** Huella de la página "sin dueño"; si existe, se confirma con una petición GET. */
  fingerprint?: RegExp;
  /** true = un CNAME que no resuelve ya es evidencia suficiente. */
  nxdomainIsEnough: boolean;
}

const TAKEOVER_PROVIDERS: TakeoverProvider[] = [
  { name: 'Amazon S3', suffix: /\.s3[.-][a-z0-9-]*\.?amazonaws\.com$|\.s3\.amazonaws\.com$|\.s3-website[.-][a-z0-9-]+\.amazonaws\.com$/, fingerprint: /NoSuchBucket|The specified bucket does not exist/i, nxdomainIsEnough: false },
  { name: 'GitHub Pages', suffix: /\.github\.io$/, fingerprint: /There isn't a GitHub Pages site here/i, nxdomainIsEnough: false },
  { name: 'Heroku', suffix: /\.herokuapp\.com$|\.herokudns\.com$/, fingerprint: /No such app|herokucdn\.com\/error-pages\/no-such-app/i, nxdomainIsEnough: false },
  { name: 'Azure App Service', suffix: /\.azurewebsites\.net$/, nxdomainIsEnough: true },
  { name: 'Azure Cloud Service', suffix: /\.cloudapp\.net$|\.cloudapp\.azure\.com$/, nxdomainIsEnough: true },
  { name: 'Azure Traffic Manager', suffix: /\.trafficmanager\.net$/, nxdomainIsEnough: true },
  { name: 'Azure Blob Storage', suffix: /\.blob\.core\.windows\.net$/, nxdomainIsEnough: true },
  { name: 'Azure Front Door', suffix: /\.azurefd\.net$/, nxdomainIsEnough: true },
  { name: 'AWS Elastic Beanstalk', suffix: /\.elasticbeanstalk\.com$/, nxdomainIsEnough: true },
  { name: 'Shopify', suffix: /\.myshopify\.com$/, fingerprint: /Sorry, this shop is currently unavailable/i, nxdomainIsEnough: false },
  { name: 'Fastly', suffix: /\.fastly\.net$/, fingerprint: /Fastly error: unknown domain/i, nxdomainIsEnough: false },
  { name: 'Pantheon', suffix: /\.pantheonsite\.io$/, fingerprint: /The gods are wise|404 error unknown site/i, nxdomainIsEnough: false },
  { name: 'Netlify', suffix: /\.netlify\.(app|com)$/, fingerprint: /Not Found - Request ID/i, nxdomainIsEnough: false },
  { name: 'Surge.sh', suffix: /\.surge\.sh$/, fingerprint: /project not found/i, nxdomainIsEnough: false },
  { name: 'Ghost', suffix: /\.ghost\.io$/, fingerprint: /The thing you were looking for is no longer here/i, nxdomainIsEnough: false },
  { name: 'Zendesk', suffix: /\.zendesk\.com$/, fingerprint: /Help Center Closed/i, nxdomainIsEnough: false },
  { name: 'ReadTheDocs', suffix: /\.readthedocs\.io$/, fingerprint: /unknown to Read the Docs/i, nxdomainIsEnough: false },
];

async function analyzeSubdomain(name: string): Promise<SubdomainInfo> {
  const [a, aaaa, cnames] = await Promise.all([
    safeResolve(() => resolver.resolve4(name), [] as string[]),
    safeResolve(() => resolver.resolve6(name), [] as string[]),
    safeResolve(() => resolver.resolveCname(name), [] as string[]),
  ]);
  const ips = [...a, ...aaaa];
  const cname = cnames[0]?.toLowerCase().replace(/\.$/, '');
  const label = name.split('.')[0];
  const info: SubdomainInfo = {
    name,
    resolves: ips.length > 0,
    ips: ips.slice(0, 3),
    cname,
    risky: RISKY_LABEL.test(label) ? label : undefined,
  };

  if (cname) {
    const provider = TAKEOVER_PROVIDERS.find((p) => p.suffix.test(cname));
    if (provider) {
      const targetResolves = ips.length > 0;
      if (!targetResolves && provider.nxdomainIsEnough) {
        info.takeover = { provider: provider.name, confirmed: true, evidence: `CNAME → ${cname} no resuelve (recurso eliminado y reclamable)` };
      } else if (!targetResolves) {
        info.takeover = { provider: provider.name, confirmed: false, evidence: `CNAME → ${cname} no resuelve` };
      } else if (provider.fingerprint) {
        try {
          const res = await safeHttpGet(`https://${name}/`, { timeoutMs: 4000, maxBytes: 20000, maxRedirects: 1 }).catch(() =>
            safeHttpGet(`http://${name}/`, { timeoutMs: 4000, maxBytes: 20000, maxRedirects: 1 })
          );
          if (provider.fingerprint.test(res.body)) {
            info.takeover = { provider: provider.name, confirmed: true, evidence: `CNAME → ${cname} responde con la página de recurso inexistente de ${provider.name}` };
          }
        } catch {
          // Sin respuesta: no se concluye nada
        }
      }
    }
  }
  return info;
}

// ─────────────────────────── DNS y correo ───────────────────────────

async function checkDnssec(domain: string): Promise<boolean | null> {
  try {
    const data = (await fetchJson(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=DS`,
      4500,
      { Accept: 'application/dns-json' }
    )) as { Status?: number; Answer?: Array<{ type: number }> };
    if (typeof data.Status !== 'number') return null;
    return Boolean(data.Answer?.some((a) => a.type === 43));
  } catch {
    return null;
  }
}

const DKIM_SELECTORS = ['default', 'google', 'selector1', 'selector2', 'k1', 'k2', 's1', 's2', 'dkim', 'mail', 'smtp', 'mandrill', 'zoho', 'mxvault', 'sendgrid', 'amazonses'];

async function checkEmailAuth(domain: string): Promise<AsmResult['emailAuth']> {
  const txtJoin = (r: string[][]) => r.map((x) => x.join(''));
  const [mx, dkimHits, mtaTxt, tlsRpt, bimi] = await Promise.all([
    safeResolve(() => resolver.resolveMx(domain), [] as dns.MxRecord[]),
    pool(DKIM_SELECTORS, 8, async (sel) => {
      const r = await safeResolve(() => resolver.resolveTxt(`${sel}._domainkey.${domain}`), [] as string[][]);
      return txtJoin(r).some((t) => /v=DKIM1|k=rsa|p=/i.test(t)) ? sel : null;
    }),
    safeResolve(() => resolver.resolveTxt(`_mta-sts.${domain}`), [] as string[][]),
    safeResolve(() => resolver.resolveTxt(`_smtp._tls.${domain}`), [] as string[][]),
    safeResolve(() => resolver.resolveTxt(`default._bimi.${domain}`), [] as string[][]),
  ]);

  const selectors = dkimHits.filter((s): s is string => Boolean(s));
  const mtaPresent = txtJoin(mtaTxt).some((t) => /v=STSv1/i.test(t));
  let mode: string | undefined;
  if (mtaPresent) {
    try {
      const res = await safeHttpGet(`https://mta-sts.${domain}/.well-known/mta-sts.txt`, { timeoutMs: 4000, maxBytes: 4000 });
      mode = res.body.match(/^mode:\s*(\w+)/im)?.[1]?.toLowerCase();
    } catch {
      // Política inaccesible
    }
  }
  return {
    hasMx: mx.length > 0,
    dkim: { found: selectors.length > 0, selectors },
    mtaSts: { present: mtaPresent, mode },
    tlsRpt: txtJoin(tlsRpt).some((t) => /v=TLSRPTv1/i.test(t)),
    bimi: txtJoin(bimi).some((t) => /v=BIMI1/i.test(t)),
  };
}

// ─────────────────────────── TLS profundo (full) ───────────────────────────

const PROTOCOLS = ['TLSv1', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'] as const;

function probeProtocol(host: string, version: (typeof PROTOCOLS)[number]): Promise<boolean | null> {
  return new Promise((resolve) => {
    let ctx: tls.SecureContext;
    try {
      // Si este cliente no puede hablar el protocolo, el resultado no es concluyente
      ctx = tls.createSecureContext({ minVersion: version, maxVersion: version, ciphers: 'ALL:@SECLEVEL=0' });
    } catch {
      resolve(null);
      return;
    }
    let done = false;
    const finish = (v: boolean | null) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(v);
    };
    const socket = tls.connect({
      host,
      port: 443,
      servername: host,
      secureContext: ctx,
      lookup: safeLookup,
      rejectUnauthorized: false,
      timeout: 3500,
    });
    socket.once('secureConnect', () => finish(true));
    socket.once('timeout', () => finish(null));
    socket.once('error', (err: NodeJS.ErrnoException) => {
      const code = String(err.code || '') + ' ' + String(err.message || '');
      // Rechazo explícito del servidor: protocolo no soportado
      if (/ALERT|HANDSHAKE_FAILURE|PROTOCOL_VERSION|WRONG_VERSION|UNSUPPORTED_PROTOCOL|ECONNRESET|NO_PROTOCOLS|NO_CIPHERS/i.test(code)) finish(false);
      else finish(null);
    });
  });
}

function probeMain(host: string): Promise<Partial<TlsDeepResult>> {
  return new Promise((resolve) => {
    let ocsp: boolean | null = false;
    let done = false;
    const finish = (v: Partial<TlsDeepResult>) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(v);
    };
    // requestOCSP existe en tiempo de ejecución pero no en los tipos de ConnectionOptions
    const options: tls.ConnectionOptions & { requestOCSP: boolean } = {
      host,
      port: 443,
      servername: host,
      lookup: safeLookup,
      rejectUnauthorized: false,
      requestOCSP: true,
      timeout: 4000,
    };
    const socket = tls.connect(options);
    socket.once('OCSPResponse', (r: Buffer | null) => {
      ocsp = Boolean(r && r.length > 0);
    });
    socket.once('secureConnect', () => {
      const out: Partial<TlsDeepResult> = { ocspStapling: ocsp };
      try {
        const cipher = socket.getCipher();
        out.negotiated = { protocol: socket.getProtocol() || 'desconocido', cipher: cipher?.name || 'desconocido' };
        const eph = socket.getEphemeralKeyInfo() as { type?: string } | Record<string, never>;
        out.forwardSecrecy = socket.getProtocol() === 'TLSv1.3' ? true : Boolean(eph && 'type' in eph && eph.type);

        const peer = socket.getPeerCertificate(true);
        if (peer && peer.raw) {
          const x509 = new crypto.X509Certificate(peer.raw);
          const pk = x509.publicKey;
          const det = pk.asymmetricKeyDetails as { modulusLength?: number; namedCurve?: string } | undefined;
          out.keyInfo = { type: String(pk.asymmetricKeyType || 'desconocido'), bits: det?.modulusLength, curve: det?.namedCurve };
          out.certLifetimeDays = Math.round((new Date(x509.validTo).getTime() - new Date(x509.validFrom).getTime()) / 86_400_000);
          let depth = 1;
          let cur = peer as tls.DetailedPeerCertificate;
          const seen = new Set<string>();
          while (cur.issuerCertificate && cur.issuerCertificate !== cur && !seen.has(cur.fingerprint256) && depth < 8) {
            seen.add(cur.fingerprint256);
            cur = cur.issuerCertificate;
            depth++;
          }
          out.chainDepth = depth;
        }
      } catch {
        // Información parcial
      }
      // Se espera un instante a que llegue una posible respuesta OCSP
      setTimeout(() => finish({ ...out, ocspStapling: ocsp }), 250);
    });
    socket.once('timeout', () => finish({}));
    socket.once('error', () => finish({}));
  });
}

function probePqHybrid(host: string): Promise<boolean | null> {
  return new Promise((resolve) => {
    let ctx: tls.SecureContext;
    try {
      ctx = tls.createSecureContext({ minVersion: 'TLSv1.3', ecdhCurve: 'X25519MLKEM768' });
    } catch {
      resolve(null); // Este entorno no soporta ML-KEM: no concluyente
      return;
    }
    let done = false;
    const finish = (v: boolean | null) => {
      if (done) return;
      done = true;
      socket.destroy();
      resolve(v);
    };
    const socket = tls.connect({ host, port: 443, servername: host, secureContext: ctx, lookup: safeLookup, rejectUnauthorized: false, timeout: 3500 });
    socket.once('secureConnect', () => finish(true));
    socket.once('timeout', () => finish(null));
    socket.once('error', () => finish(false));
  });
}

async function scanTlsDeep(host: string): Promise<TlsDeepResult> {
  const [protoResults, main, pq] = await Promise.all([
    Promise.all(PROTOCOLS.map((p) => probeProtocol(host, p))),
    probeMain(host),
    probePqHybrid(host),
  ]);
  const protocols = Object.fromEntries(PROTOCOLS.map((p, i) => [p, protoResults[i]])) as TlsDeepResult['protocols'];
  return {
    protocols,
    legacyEnabled: (['TLSv1', 'TLSv1.1'] as const).filter((p) => protocols[p] === true),
    negotiated: main.negotiated,
    forwardSecrecy: main.forwardSecrecy ?? null,
    keyInfo: main.keyInfo,
    chainDepth: main.chainDepth,
    certLifetimeDays: main.certLifetimeDays,
    ocspStapling: main.ocspStapling ?? null,
    pqHybrid: pq,
  };
}

// ─────────────────────────── Motor ───────────────────────────

export async function scanAsm(rawHostname: string, opts: { mode: 'public' | 'full'; isPremium?: boolean }): Promise<AsmResult> {
  const domain = rawHostname.replace(/^www\./, '').toLowerCase();
  const host = rawHostname.toLowerCase();
  const shouldDeepScan = opts.mode === 'full' || opts.isPremium === true;

  const [ct, dnssec, caaRaw, nsRaw, emailAuth, tlsDeep] = await Promise.all([
    discoverSubdomains(domain),
    checkDnssec(domain),
    safeResolve(() => resolver.resolveCaa(domain), [] as dns.CaaRecord[]),
    safeResolve(() => resolver.resolveNs(domain), [] as string[]),
    checkEmailAuth(domain),
    shouldDeepScan ? sleepTimeout(scanTlsDeep(host), 14000) : Promise.resolve(null),
  ]);
  const [typosquats, publicBuckets] = await Promise.all([
    sleepTimeout(findTyposquats(domain, nsRaw), 12000).then((r) => r ?? []),
    // Búsqueda de buckets públicos activos en AWS S3 y Google Cloud Storage (Solo Premium)
    shouldDeepScan ? sleepTimeout(findPublicBuckets(domain), 12000).then((r) => r ?? []) : Promise.resolve([] as PublicBucket[]),
  ]);

  // Se analizan hasta 60 subdominios, priorizando los de nombre sensible
  const prioritized = [...ct.names].sort((a, b) => Number(RISKY_LABEL.test(b.split('.')[0])) - Number(RISKY_LABEL.test(a.split('.')[0])));
  const toAnalyze = prioritized.filter((n) => n !== domain && n !== `www.${domain}`).slice(0, 60);
  const list = await pool(toAnalyze, 10, analyzeSubdomain);

  const risky = list.filter((s) => s.risky && s.resolves);
  const takeovers = list.filter((s) => s.takeover);
  const caaIssuers = caaRaw.map((r) => r.issue || r.issuewild || '').filter(Boolean);

  const findings: ScanFinding[] = [];

  for (const s of takeovers) {
    findings.push({
      id: `asm-takeover-${s.name}`,
      category: 'asm',
      title: `Subdomain takeover ${s.takeover!.confirmed ? 'confirmado' : 'probable'}: ${s.name}`,
      severity: s.takeover!.confirmed ? 'CRÍTICO' : 'ALTO',
      confidence: s.takeover!.confirmed ? 'confirmado' : 'probable',
      attackVector: `El registro DNS de ${s.name} apunta a un recurso de ${s.takeover!.provider} que ya no existe. Un atacante crea una cuenta en ese servicio, reclama el nombre y pasa a servir contenido bajo tu dominio: phishing con tu certificado y tu reputación, robo de cookies de sesión del dominio padre y distribución de malware.`,
      mitigation: `Eliminar el registro CNAME de ${s.name} si ya no se usa, o recuperar el recurso en ${s.takeover!.provider}. Mantener un inventario de DNS y revisar los CNAME en cada baja de servicio.`,
      evidence: s.takeover!.evidence,
    });
  }

  if (risky.length > 0) {
    findings.push({
      id: 'asm-risky-subdomains',
      category: 'asm',
      title: `${risky.length} subdominio(s) de desarrollo, administración o infraestructura expuestos`,
      severity: risky.some((s) => /^(jenkins|gitlab|git|svn|phpmyadmin|pma|grafana|kibana|prometheus|vault|consul|rancher|portainer|k8s|kube|docker|registry|nexus|sonar|admin|administrator|db|database|sql|mysql|rdp|ssh|ftp|sftp)/.test(s.risky!)) ? 'ALTO' : 'MEDIO',
      confidence: 'probable',
      attackVector: 'Los entornos de pruebas, paneles y herramientas internas suelen tener menos controles, datos reales copiados y credenciales por defecto. Son la puerta de entrada habitual: el atacante no ataca el sitio principal bien protegido, sino el "dev" olvidado, y desde ahí pivota.',
      mitigation: 'Retirar de Internet los entornos no productivos o ponerlos detrás de VPN/ZTNA con MFA. Si deben ser públicos, aplicar los mismos controles que producción y no usar datos reales.',
      evidence: risky.slice(0, 8).map((s) => s.name).join(', '),
    });
  }

  const foreignSquats = typosquats.filter((t) => !t.sameNs);
  if (foreignSquats.length > 0) {
    const withMx = foreignSquats.filter((t) => t.hasMx).length;
    findings.push({
      id: 'asm-typosquatting',
      category: 'asm',
      title: `${foreignSquats.length} dominio(s) parecido(s) registrados por terceros${withMx ? ` (${withMx} con correo activo)` : ''}`,
      severity: withMx > 0 ? 'ALTO' : 'MEDIO',
      confidence: 'probable',
      attackVector: 'Dominios casi idénticos al tuyo (una letra cambiada, otra extensión o palabras como "login" o "pagos") se usan para phishing contra tus clientes y para fraude del CEO por correo. Los que tienen servidor de correo pueden enviar mensajes que parecen tuyos.',
      mitigation: 'Revisar el titular (WHOIS) y el contenido de cada dominio: algunos pueden ser legítimos o tuyos con otro DNS. Registrar defensivamente las variantes críticas, pedir la baja de los maliciosos (UDRP / registrador) y publicar a tus clientes cuáles son tus dominios oficiales.',
      evidence: foreignSquats.slice(0, 8).map((t) => t.name + (t.hasMx ? ' (MX)' : '')).join(', '),
    });
  }
  for (const b of publicBuckets) {
    findings.push({
      id: `asm-bucket-${b.url}`,
      category: 'asm',
      title: `Almacenamiento cloud con listado público: ${b.url}`,
      severity: 'CRÍTICO',
      confidence: 'probable',
      attackVector: 'El contenedor permite listar y descargar sus archivos sin credenciales. Muchas fugas masivas de datos de bancos, aseguradoras y gobiernos provienen de buckets mal configurados.',
      mitigation: 'Confirmar que el contenedor es de tu organización (el nombre coincide, pero podría ser de un tercero). Si lo es: activar Block Public Access (S3) o acceso uniforme a nivel de bucket (GCS) y revisar qué se expuso y desde cuándo.',
      evidence: `${b.provider}: GET devuelve un listado (ListBucketResult)`,
    });
  }

  if (dnssec === false) {
    findings.push({
      id: 'dns-no-dnssec',
      category: 'dns',
      title: 'DNSSEC no habilitado',
      severity: 'MEDIO',
      confidence: 'confirmado',
      attackVector: 'Sin DNSSEC, un atacante que logre envenenar la caché de un resolvedor (o interceptar la red) puede redirigir a tus clientes a un servidor falso sin que ningún mecanismo lo detecte.',
      mitigation: 'Activar DNSSEC en la zona (firmar con el proveedor DNS) y publicar el registro DS en el registrador del dominio. Es práctica exigida en entidades financieras y de gobierno.',
    });
  }

  if (caaRaw.length === 0) {
    findings.push({
      id: 'dns-no-caa',
      category: 'dns',
      title: 'Sin registro CAA (cualquier CA puede emitir certificados)',
      severity: 'BAJO',
      confidence: 'confirmado',
      attackVector: 'Sin CAA, cualquier autoridad certificadora puede emitir un certificado para tu dominio; un error de validación en una CA permite a un atacante obtener uno legítimo y suplantarte.',
      mitigation: 'Publicar registros CAA que limiten la emisión a tus CA ("0 issue \\"letsencrypt.org\\"") y añadir "iodef" para recibir avisos.',
    });
  }

  if (emailAuth.hasMx && !emailAuth.dkim.found) {
    findings.push({
      id: 'email-no-dkim',
      category: 'email',
      title: 'No se encontró DKIM en los selectores habituales',
      severity: 'BAJO',
      confidence: 'probable',
      attackVector: 'Sin firma DKIM los correos legítimos no se pueden distinguir de los falsos, y DMARC no puede alinearse por DKIM. Facilita el fraude del CEO y el phishing con tu dominio.',
      mitigation: 'Habilitar DKIM (2048 bits) en tu proveedor de correo y publicar el selector. Si ya lo usas con un selector propio, ignora este aviso: solo se prueban 16 nombres comunes.',
      evidence: 'Selectores probados: ' + DKIM_SELECTORS.join(', '),
    });
  }

  if (emailAuth.hasMx && !emailAuth.mtaSts.present) {
    findings.push({
      id: 'email-no-mtasts',
      category: 'email',
      title: 'Sin MTA-STS: el correo entrante puede degradarse a texto plano',
      severity: 'BAJO',
      confidence: 'informativo',
      attackVector: 'Sin MTA-STS, un atacante en la red puede forzar que el servidor remitente envíe el correo sin cifrar (ataque de degradación STARTTLS) y leerlo o alterarlo.',
      mitigation: 'Publicar _mta-sts TXT y la política en https://mta-sts.<dominio>/.well-known/mta-sts.txt con mode: enforce, más TLS-RPT para recibir informes.',
    });
  } else if (emailAuth.mtaSts.mode && emailAuth.mtaSts.mode !== 'enforce') {
    findings.push({
      id: 'email-mtasts-not-enforced',
      category: 'email',
      title: `MTA-STS en modo "${emailAuth.mtaSts.mode}" (no se aplica)`,
      severity: 'BAJO',
      confidence: 'confirmado',
      attackVector: 'En modo testing/none la política solo informa; no bloquea la entrega por conexiones sin cifrar.',
      mitigation: 'Tras revisar los informes TLS-RPT, cambiar a mode: enforce.',
    });
  }

  if (tlsDeep) {
    if (tlsDeep.legacyEnabled.length > 0) {
      findings.push({
        id: 'tls-legacy-protocols',
        category: 'tls',
        title: `Protocolos TLS obsoletos habilitados: ${tlsDeep.legacyEnabled.join(', ')}`,
        severity: 'ALTO',
        confidence: 'confirmado',
        attackVector: 'TLS 1.0/1.1 son vulnerables a ataques de descifrado (BEAST, POODLE-TLS, Lucky13) y no cumplen PCI-DSS desde 2018. Un atacante en la red puede forzar la degradación y recuperar cookies de sesión.',
        mitigation: 'Deshabilitar TLS 1.0 y 1.1 y dejar solo TLS 1.2 y 1.3. Nginx: "ssl_protocols TLSv1.2 TLSv1.3;". Apache: "SSLProtocol -all +TLSv1.2 +TLSv1.3".',
        evidence: 'El servidor completó el handshake con ' + tlsDeep.legacyEnabled.join(' y '),
      });
    }
    if (tlsDeep.protocols['TLSv1.3'] === false) {
      findings.push({
        id: 'tls-no-tls13',
        category: 'tls',
        title: 'TLS 1.3 no disponible',
        severity: 'BAJO',
        confidence: 'confirmado',
        attackVector: 'TLS 1.3 elimina suites débiles y reduce la superficie de ataque del handshake; sin él se depende de una configuración TLS 1.2 correcta.',
        mitigation: 'Habilitar TLS 1.3 en el servidor web o el balanceador (OpenSSL ≥ 1.1.1).',
      });
    }
    if (tlsDeep.forwardSecrecy === false) {
      findings.push({
        id: 'tls-no-pfs',
        category: 'tls',
        title: 'Sin forward secrecy en la suite negociada',
        severity: 'MEDIO',
        confidence: 'confirmado',
        attackVector: 'Sin intercambio efímero (ECDHE), quien registre el tráfico hoy puede descifrarlo en el futuro si obtiene la clave privada del servidor.',
        mitigation: 'Priorizar suites ECDHE/DHE (AEAD: AES-GCM o ChaCha20) y retirar las de intercambio RSA estático.',
        evidence: tlsDeep.negotiated ? `${tlsDeep.negotiated.protocol} · ${tlsDeep.negotiated.cipher}` : undefined,
      });
    }
    if (tlsDeep.keyInfo?.type === 'rsa' && (tlsDeep.keyInfo.bits ?? 4096) < 2048) {
      findings.push({
        id: 'tls-weak-key',
        category: 'tls',
        title: `Clave RSA débil (${tlsDeep.keyInfo.bits} bits)`,
        severity: 'ALTO',
        confidence: 'confirmado',
        attackVector: 'Claves RSA menores de 2048 bits son factorizables con recursos accesibles a un atacante organizado, lo que permite suplantar al servidor.',
        mitigation: 'Reemitir el certificado con RSA ≥ 2048 bits (recomendado 3072) o ECDSA P-256.',
      });
    }
    if ((tlsDeep.certLifetimeDays ?? 0) > 398) {
      findings.push({
        id: 'tls-long-lived-cert',
        category: 'tls',
        title: `Certificado con vigencia de ${tlsDeep.certLifetimeDays} días (> 398)`,
        severity: 'BAJO',
        confidence: 'confirmado',
        attackVector: 'Los certificados de larga vigencia amplían la ventana de abuso si se filtra la clave privada y no cumplen el máximo aceptado por los navegadores.',
        mitigation: 'Usar certificados de ≤ 398 días y automatizar la renovación (ACME).',
      });
    }
    if (tlsDeep.ocspStapling === false) {
      findings.push({
        id: 'tls-no-ocsp-stapling',
        category: 'tls',
        title: 'Sin OCSP stapling',
        severity: 'BAJO',
        confidence: 'informativo',
        attackVector: 'Sin stapling, la revocación de un certificado comprometido depende de que el cliente consulte a la CA, con fallos silenciosos y fuga de privacidad.',
        mitigation: 'Activar OCSP stapling (nginx: "ssl_stapling on; ssl_stapling_verify on;").',
      });
    }
    if (tlsDeep.pqHybrid === false) {
      findings.push({
        id: 'tls-no-pq-hybrid',
        category: 'tls',
        title: 'Sin intercambio de claves híbrido post-cuántico (X25519MLKEM768)',
        severity: 'BAJO',
        confidence: 'informativo',
        attackVector: 'Adversarios con capacidad de almacenar tráfico hoy ("cosechar ahora, descifrar después") podrían descifrarlo cuando existan ordenadores cuánticos útiles. Relevante para datos de larga vida: banca, salud y gobierno.',
        mitigation: 'Habilitar grupos híbridos ML-KEM en el terminador TLS (OpenSSL ≥ 3.5, Cloudflare/AWS/Google ya lo ofrecen) y planificar la migración criptográfica.',
      });
    }
  }

  return {
    subdomains: {
      source: ct.source,
      totalDiscovered: ct.names.length,
      analyzed: list.length,
      resolving: list.filter((s) => s.resolves).length,
      list: list.slice(0, 60),
      risky: risky.length,
      takeovers: takeovers.length,
    },
    dnsHardening: { dnssec, caa: { present: caaRaw.length > 0, issuers: caaIssuers }, nameservers: nsRaw.slice(0, 6) },
    emailAuth,
    tls: tlsDeep ?? undefined,
    typosquats: typosquats.slice(0, 30),
    publicBuckets,
    findings: sortFindings(findings),
    mode: opts.mode,
    generatedAt: new Date().toISOString(),
  };
}
