import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { randomBytes } from 'node:crypto';
import { runTool } from './proc.mjs';
import { redactUrl } from './crawler.mjs';

const unxml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const failed = (r, name) => ({
  status: r.missing ? 'missing' : 'error',
  detail: r.missing ? `${name} no está instalado` : r.reason || r.err.trim().split('\n').pop() || `${name} terminó con código ${r.code}`,
  findings: [],
});

export function parseNmap(xml) {
  const findings = [];
  for (const m of xml.matchAll(/<port protocol="(\w+)" portid="(\d+)">([\s\S]*?)<\/port>/g)) {
    const [, proto, port, body] = m;
    if (!/<state state="open"/.test(body)) continue;
    const service = body.match(/<service [^>]*>/)?.[0] || '';
    const get = (name) => unxml(service.match(new RegExp(` ${name}="([^"]*)"`))?.[1] || '');
    const risky = [21, 23, 445, 1433, 1521, 2375, 2379, 3306, 3389, 5432, 5900, 6379, 9200, 11211, 27017].includes(Number(port));
    findings.push({ key: `${proto}/${port}`, title: `Servicio expuesto ${proto}/${port} ${get('name')}`.trim(),
      severity: risky ? 'ALTO' : 'BAJO', confidence: risky ? 'confirmado' : 'informativo',
      evidence: [get('product'), get('version')].filter(Boolean).join(' ') || 'puerto abierto, versión no identificada',
      reproduction: `nmap -sT -sV -Pn -p ${port} <host autorizado>`,
      fix: risky ? 'Cerrar en el firewall o limitar por VPN o IP de origen.' : 'Confirmar que el servicio debe ser público.' });
  }
  return findings;
}

const PRODUCTS = [[/apache httpd/i, 'apache'], [/nginx/i, 'nginx'], [/openssh/i, 'openssh'], [/mariadb/i, 'mariadb'], [/mysql/i, 'mysql'], [/proftpd/i, 'proftpd'],
  [/vsftpd/i, 'vsftpd'], [/exim/i, 'exim'], [/lighttpd/i, 'lighttpd'], [/microsoft iis/i, 'iis'], [/postgresql/i, 'postgresql'], [/redis/i, 'redis'],
  [/mongo/i, 'mongodb'], [/elasticsearch/i, 'elasticsearch'], [/tomcat/i, 'tomcat'], [/samba|smbd/i, 'samba'], [/memcached/i, 'memcached']];

/** Servicios con versión que nmap identificó, para cruzarlos con vulnerabilidades. */
export function parseNmapServices(xml) {
  const list = [];
  for (const m of xml.matchAll(/<port protocol="(\w+)" portid="(\d+)">([\s\S]*?)<\/port>/g)) {
    if (!/<state state="open"/.test(m[3])) continue;
    const tag = m[3].match(/<service [^>]*>/)?.[0] || '';
    const get = (name) => unxml(tag.match(new RegExp(` ${name}="([^"]*)"`))?.[1] || '');
    list.push({ port: Number(m[2]), product: get('product'), version: get('version'), extrainfo: get('extrainfo'), ostype: get('ostype') });
  }
  return list;
}

/** Producto de nmap al identificador del motor CVE. Sin versión no hay nada que cruzar. */
export function serviceToTech(s) {
  const hit = PRODUCTS.find(([re]) => re.test(s.product || ''));
  const version = (s.version || '').match(/^([0-9]+(?:\.[0-9]+)*(?:p\d+)?)/)?.[1];
  if (!hit || !version) return null;
  return { product: hit[1], label: s.product, version, evidence: `nmap -sV puerto ${s.port}: ${s.product} ${s.version}`.slice(0, 120),
    distroPatched: /ubuntu|debian|centos|red ?hat|rhel|amzn|suse|rocky|alma/i.test(`${s.version} ${s.extrainfo} ${s.ostype}`) };
}

export async function nmap({ ip, ports, check }) {
  const bin = process.env.NMAP_PATH || 'nmap';
  // Sin puertos en la autorización se revisan los 65535 TCP
  const args = ['-sT', '-sV', '-Pn', '-n', '--max-rate', '300', '--max-retries', '2', ...(net.isIPv6(ip) ? ['-6'] : []),
    '-p', ports || '1-65535', '-oX', '-', ip];
  const r = await runTool(bin, args, { timeout: 2700000, check });
  if (r.missing || r.reason || r.code !== 0 || !/exit="success"/.test(r.out)) return failed(r, 'nmap');
  return { status: 'ok', findings: parseNmap(r.out), services: parseNmapServices(r.out) };
}

export function parseTestssl(list) {
  const severity = { CRITICAL: 'CRÍTICO', HIGH: 'ALTO', MEDIUM: 'MEDIO', LOW: 'BAJO' };
  return list.filter((x) => severity[x.severity] && !/^(overall_grade|final_score|grade_cap_reason)/.test(x.id)).map((x) => ({
    key: x.id, title: `TLS: ${x.id}`, severity: severity[x.severity], confidence: 'confirmado',
    cwe: x.cwe?.split(' ')[0], evidence: String(x.finding).slice(0, 300),
    reproduction: 'testssl <host autorizado>:443', fix: 'Corregir protocolos, cifrados o cadena del certificado según el control indicado.',
  }));
}

export async function testssl({ host, ip, check }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-tls-'));
  try {
    const file = path.join(dir, 'result.json');
    const args = ['--quiet', '--color', '0', '--warnings', 'batch', '--ip', net.isIPv6(ip) ? `[${ip}]` : ip, '--jsonfile', file, `${host}:443`];
    const r = await runTool(process.env.TESTSSL_PATH || 'testssl', args, { timeout: 900000, check });
    // testssl usa el código de salida para contar problemas: la señal de éxito es el JSON completo
    if (r.missing || r.reason || !fs.existsSync(file)) return failed(r, 'testssl');
    const list = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!list.length || list.some((x) => x.id === 'scanProblem' || x.severity === 'FATAL')) return failed(r, 'testssl');
    return { status: 'ok', findings: parseTestssl(list) };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const UNSAFE_PATHS = '(?i).*(log-?out|sign-?out|salir|delete|remove|destroy|elimin|borrar|cancel|anular|unsubscribe|revoke|reset|approve|confirm|pagar|checkout|add-to-cart).*';

export function zapPlan({ host, active, rps, sessionHeader }) {
  const origin = `https://${host}`;
  const escaped = origin.replace(/\./g, '\\.');
  const jobs = [
    { type: 'spider', parameters: { context: 'target', url: `${origin}/`, maxDuration: 5, maxDepth: 5, threadCount: 1, postForm: false, processForm: false } },
    { type: 'passiveScan-wait', parameters: { maxDuration: 5 } },
  ];
  // El valor de la sesión nunca va en el plan: ZAP lo lee de la variable de entorno del contenedor
  if (sessionHeader) {
    jobs.unshift({ type: 'replacer', parameters: { deleteAllRules: true }, rules: [{ description: 'sesión del auditor', matchType: 'req_header', matchString: sessionHeader, matchRegex: false, replacementString: '${ZAP_SESSION_VALUE}' }] });
  }
  // Pruebas activas (XSS, SQLi, redirección abierta): solo con permiso expreso en la autorización
  if (active) {
    // Navegador para SPA: pulsa enlaces, por eso exige el mismo permiso. No pulsa botones ni rellena campos.
    jobs.splice(1, 0, { type: 'spiderAjax', parameters: { context: 'target', url: `${origin}/`, maxDuration: 10, maxCrawlDepth: 5,
      numberOfBrowsers: 1, browserId: 'firefox-headless', inScopeOnly: true, clickDefaultElems: false, elements: ['a'], randomInputs: false } });
    jobs.push({ type: 'activeScan', parameters: { context: 'target', maxScanDurationInMins: 30, threadPerHost: 1, delayInMs: Math.ceil(1000 / rps) } });
  }
  jobs.push({ type: 'report', parameters: { template: 'traditional-json', reportDir: '/zap/wrk', reportFile: 'report.json' } });
  return {
    env: {
      contexts: [{ name: 'target', urls: [origin], includePaths: [`${escaped}(/.*)?`], excludePaths: [UNSAFE_PATHS] }],
      parameters: { failOnError: true, failOnWarning: false, progressToStdout: true },
    },
    jobs,
  };
}

export function parseZap(report) {
  const out = new Map();
  for (const site of [report.site].flat().filter(Boolean)) {
    for (const a of site.alerts || []) {
      const risk = Number(a.riskcode);
      // Confianza 0 es falso positivo
      if (risk < 1 || Number(a.confidence) === 0) continue;
      for (const i of (a.instances || []).slice(0, 20)) {
        const url = redactUrl(i.uri);
        const key = `${a.alertRef || a.pluginid}:${i.method}:${url}:${i.param || ''}`;
        out.set(key, { key, title: a.name || a.alert, severity: ['BAJO', 'BAJO', 'MEDIO', 'ALTO'][risk], confidence: 'probable',
          cwe: Number(a.cweid) > 0 ? `CWE-${a.cweid}` : undefined,
          evidence: `${i.method} ${url}${i.param ? ` · parámetro ${i.param}` : ''}`,
          reproduction: `Repetir la regla ZAP ${a.pluginid} sobre esa URL y confirmar manualmente.`,
          fix: String(a.solution || '').replace(/<[^>]*>/g, ' ').trim().slice(0, 800) });
      }
    }
  }
  return [...out.values()];
}

export async function zap({ host, ip, active, rps, check, session }) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dti-zap-'));
  const name = `dti-zap-${randomBytes(5).toString('hex')}`;
  const bin = process.env.DOCKER_PATH || 'docker';
  const header = session ? Object.keys(session)[0] : undefined;
  try {
    fs.chmodSync(dir, 0o777); // el contenedor escribe el informe con su propio usuario
    const plan = path.join(dir, 'plan.yaml');
    // JSON es YAML válido
    fs.writeFileSync(plan, JSON.stringify(zapPlan({ host, active, rps, sessionHeader: header })));
    fs.chmodSync(plan, 0o644);
    const args = ['run', '--rm', '--name', name, '--memory', '1500m', '--cpus', '1', '--cap-drop', 'ALL', '--security-opt', 'no-new-privileges',
      ...(header ? ['-e', 'ZAP_SESSION_VALUE'] : []), '--add-host', `${host}:${ip}`, '-v', `${dir}:/zap/wrk:rw`, process.env.ZAP_IMAGE || 'zaproxy/zap-stable',
      'zap.sh', '-cmd', '-silent', '-autorun', '/zap/wrk/plan.yaml'];
    // Matar el cliente de Docker no detiene el contenedor
    const r = await runTool(bin, args, { timeout: 3000000, check, env: header ? { ZAP_SESSION_VALUE: session[header] } : undefined, onStop: () => { void runTool(bin, ['kill', name], { timeout: 15000 }); } });
    const file = path.join(dir, 'report.json');
    if (r.missing || r.reason || ![0, 2].includes(r.code) || !fs.existsSync(file)) return failed(r, 'Docker/ZAP');
    const report = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (![report.site].flat().filter(Boolean).length) return { status: 'error', detail: 'ZAP no alcanzó el objetivo', findings: [] };
    return { status: r.code === 0 ? 'ok' : 'partial', findings: parseZap(report) };
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
}
