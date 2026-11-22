/**
 * Mapeo de hallazgos técnicos perimetrales a controles de marcos normativos.
 *
 * IMPORTANTE: es una evaluación automática de INDICIOS técnicos observables desde Internet
 * (cifrado en tránsito, servicios expuestos, parches visibles, cabeceras, correo). No sustituye
 * una auditoría de certificación ni evalúa controles organizativos o internos. Los números de
 * control corresponden a PCI DSS v4.0, ISO/IEC 27001:2022 Anexo A, NIST CSF 2.0 y OWASP Top 10:2021.
 * Para la regulación peruana se citan áreas temáticas, sin numerar artículos.
 */

import type { AuditReportRecord } from '@/lib/storage/reportStore';

export type ControlStatus = 'cumple' | 'parcial' | 'no_cumple' | 'no_evaluable';

export interface ComplianceControl {
  id: string;
  title: string;
  status: ControlStatus;
  evidence: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  controls: ComplianceControl[];
  passed: number;
  partial: number;
  failed: number;
  notEvaluable: number;
  /** Porcentaje sobre controles evaluables (parcial = 0,5). null si ninguno es evaluable. */
  pct: number | null;
}

export interface ComplianceResult {
  frameworks: ComplianceFramework[];
  overallPct: number | null;
  disclaimer: string;
  generatedAt: string;
}

const CRITICAL_PORTS = new Set([21, 23, 139, 445, 1433, 1521, 2049, 2375, 2379, 3306, 3389, 5432, 5900, 5901, 5984, 6379, 7474, 9200, 5601, 27017]);

interface Facts {
  fullScan: boolean;
  tlsValid: boolean;
  legacyTls: boolean | null;
  hsts: boolean;
  csp: boolean;
  cspWeak: boolean | null;
  xcto: boolean;
  waf: boolean;
  criticalPorts: number[];
  openCount: number;
  portsScanned: boolean;
  cveConfirmedHigh: number;
  kev: number;
  libsVuln: number | null;
  secrets: number | null;
  sriMissing: number | null;
  exposedFiles: number | null;
  exposedEndpoints: number | null;
  takeovers: number | null;
  dmarcEnforced: boolean | null;
  spf: boolean | null;
  dkim: boolean | null;
  mtaSts: boolean | null;
  dnssec: boolean | null;
  corsBad: boolean | null;
  badMethods: boolean | null;
}

function headerPass(r: AuditReportRecord, name: string): boolean {
  return Boolean(r.headers?.some((h) => h.header.toLowerCase() === name && h.status === 'pass'));
}

function factsFrom(r: AuditReportRecord): Facts {
  const full = r.scanMode === 'full';
  const open = (r.ports || []).filter((p) => p.isOpen);
  const asm = r.asm;
  const web = r.webApp;
  const cves = r.cveIntel?.findings || [];
  const dm = r.dnsSecurity?.dmarc?.policy as string | undefined;
  return {
    fullScan: full,
    tlsValid: Boolean(r.ssl?.valid),
    legacyTls: asm?.tls ? asm.tls.legacyEnabled.length > 0 : null,
    hsts: headerPass(r, 'strict-transport-security'),
    csp: headerPass(r, 'content-security-policy'),
    cspWeak: web ? web.csp.weaknesses.length > 0 : null,
    xcto: headerPass(r, 'x-content-type-options'),
    waf: Boolean(r.waf?.hasWaf),
    criticalPorts: open.filter((p) => CRITICAL_PORTS.has(p.port)).map((p) => p.port),
    openCount: open.length,
    portsScanned: Boolean(r.ports?.length),
    cveConfirmedHigh: cves.filter((f) => f.confidence === 'confirmado' && (f.severity === 'CRÍTICO' || f.severity === 'ALTO') && f.cves.length > 0).length,
    kev: cves.filter((f) => f.kev).length,
    libsVuln: web ? web.libraries.filter((l) => l.vulnerable).length : null,
    secrets: web ? web.secretsFound : null,
    sriMissing: web ? web.thirdParty.scriptsWithoutSri : null,
    exposedFiles: full && r.sensitiveFiles ? r.sensitiveFiles.findings.filter((f) => f.isExposed).length : null,
    exposedEndpoints: web?.active ? web.active.exposedEndpoints.length + web.active.sourceMaps.length : null,
    takeovers: asm ? asm.subdomains.takeovers : null,
    dmarcEnforced: dm ? dm === 'reject' || dm === 'quarantine' : null,
    spf: r.dnsSecurity ? Boolean(r.dnsSecurity.spf?.present) : null,
    dkim: asm ? (asm.emailAuth.hasMx === false ? null : asm.emailAuth.dkim.found) : null,
    mtaSts: asm ? (asm.emailAuth.hasMx === false ? null : asm.emailAuth.mtaSts.present) : null,
    dnssec: asm ? asm.dnsHardening.dnssec : null,
    corsBad: web?.active ? web.active.cors.reflectsOrigin || (web.active.cors.allowsNull && web.active.cors.allowsCredentials) : null,
    badMethods: web?.active ? web.active.allowedMethods.some((m) => ['TRACE', 'TRACK', 'PUT', 'DELETE', 'CONNECT'].includes(m)) : null,
  };
}

type Ev = { status: ControlStatus; evidence: string };
const ok = (evidence: string): Ev => ({ status: 'cumple', evidence });
const bad = (evidence: string): Ev => ({ status: 'no_cumple', evidence });
const part = (evidence: string): Ev => ({ status: 'parcial', evidence });
const na = (evidence: string): Ev => ({ status: 'no_evaluable', evidence });

const needFull = 'Requiere auditoría completa autorizada (modo full).';

const tlsTransit = (f: Facts): Ev => {
  if (!f.tlsValid) return bad('Certificado TLS inválido, caducado o ausente.');
  if (f.legacyTls === true) return bad('El servidor acepta TLS 1.0/1.1.');
  if (!f.hsts) return part('TLS válido, pero sin HSTS (permite degradación a HTTP).');
  return ok(f.legacyTls === false ? 'TLS válido, sin protocolos obsoletos y con HSTS.' : 'TLS válido con HSTS (protocolos obsoletos no comprobados).');
};

const vulnMgmt = (f: Facts): Ev => {
  if (f.kev > 0) return bad(`${f.kev} vulnerabilidad(es) con explotación activa confirmada por CISA KEV.`);
  if (f.cveConfirmedHigh > 0) return bad(`${f.cveConfirmedHigh} CVE de severidad alta/crítica confirmados por versión.`);
  if ((f.libsVuln ?? 0) > 0) return part(`${f.libsVuln} librería(s) JavaScript con vulnerabilidades conocidas.`);
  return ok('Sin CVE alto/crítico por versión ni librerías JavaScript vulnerables detectadas.');
};

const exposedServices = (f: Facts): Ev =>
  !f.portsScanned
    ? na('Este informe no incluye medición de puertos.')
    : f.criticalPorts.length > 0
    ? bad(`Servicios críticos expuestos a Internet: puertos ${f.criticalPorts.join(', ')}.`)
    : ok(`Sin servicios de administración o bases de datos expuestos (${f.openCount} puertos abiertos en total).`);

const wafControl = (f: Facts): Ev => (f.waf ? ok('Se detecta WAF/CDN perimetral.') : bad('No se detecta WAF delante de la aplicación.'));

const configHardening = (f: Facts): Ev => {
  const issues: string[] = [];
  if (!f.hsts) issues.push('HSTS');
  if (!f.csp) issues.push('CSP');
  if (!f.xcto) issues.push('X-Content-Type-Options');
  if ((f.exposedEndpoints ?? 0) > 0) issues.push(`${f.exposedEndpoints} endpoint(s)/source map(s) expuestos`);
  if (f.badMethods) issues.push('métodos HTTP peligrosos');
  if (issues.length === 0) return ok('Cabeceras de seguridad presentes y sin endpoints sensibles detectados.');
  return issues.length >= 3 ? bad(`Faltan o fallan: ${issues.join(', ')}.`) : part(`Pendiente: ${issues.join(', ')}.`);
};

const emailAuth = (f: Facts): Ev => {
  if (f.dmarcEnforced === null && f.spf === null) return na('No se pudo consultar el DNS de correo.');
  const miss: string[] = [];
  if (!f.spf) miss.push('SPF');
  if (!f.dmarcEnforced) miss.push('DMARC en quarantine/reject');
  if (f.dkim === false) miss.push('DKIM');
  if (f.mtaSts === false) miss.push('MTA-STS');
  if (miss.length === 0) return ok('SPF, DKIM y DMARC aplicados; MTA-STS presente.');
  return miss.includes('SPF') || miss.includes('DMARC en quarantine/reject') ? bad(`Falta: ${miss.join(', ')}.`) : part(`Falta: ${miss.join(', ')}.`);
};

const dataLeak = (f: Facts): Ev => {
  const issues: string[] = [];
  if ((f.secrets ?? 0) > 0) issues.push(`${f.secrets} credencial(es) en JavaScript público`);
  if ((f.exposedFiles ?? 0) > 0) issues.push(`${f.exposedFiles} archivo(s) sensible(s) expuesto(s)`);
  if ((f.exposedEndpoints ?? 0) > 0) issues.push('endpoints o source maps expuestos');
  if (issues.length > 0) return bad(issues.join('; ') + '.');
  if (f.exposedFiles === null && f.secrets === null) return na(needFull);
  return ok('Sin credenciales en el cliente ni archivos sensibles expuestos.');
};

const appSecurity = (f: Facts): Ev => {
  const issues: string[] = [];
  if (!f.csp) issues.push('sin CSP');
  else if (f.cspWeak) issues.push('CSP débil');
  if (f.corsBad) issues.push('CORS permisivo');
  if (!f.waf) issues.push('sin WAF');
  if (issues.length === 0) return ok('CSP efectiva, CORS restringido y WAF presente.');
  return issues.length >= 2 ? bad(`Pendiente: ${issues.join(', ')}.`) : part(`Pendiente: ${issues.join(', ')}.`);
};

const integrity = (f: Facts): Ev => {
  if (f.sriMissing === null) return na('No se pudo analizar la portada.');
  if (f.sriMissing === 0) return ok('Todos los recursos de terceros tienen SRI o no existen recursos de terceros.');
  return f.sriMissing >= 4 ? bad(`${f.sriMissing} recursos de terceros sin SRI.`) : part(`${f.sriMissing} recurso(s) de terceros sin SRI.`);
};

const dnsIntegrity = (f: Facts): Ev => {
  if (f.dnssec === null) return na('No se pudo determinar DNSSEC.');
  const miss: string[] = [];
  if (!f.dnssec) miss.push('DNSSEC');
  if ((f.takeovers ?? 0) > 0) miss.push(`${f.takeovers} subdominio(s) con riesgo de takeover`);
  if (miss.length === 0) return ok('DNSSEC activo y sin subdominios colgantes.');
  return (f.takeovers ?? 0) > 0 ? bad(`Pendiente: ${miss.join(', ')}.`) : part(`Pendiente: ${miss.join(', ')}.`);
};

const accessControlSurface = (f: Facts): Ev => {
  if (f.exposedEndpoints === null && f.corsBad === null) return na(needFull);
  const issues: string[] = [];
  if (f.corsBad) issues.push('CORS permisivo');
  if ((f.exposedEndpoints ?? 0) > 0) issues.push('paneles/API/depuradores accesibles');
  return issues.length ? bad(`${issues.join(' y ')}.`) : ok('Sin paneles, depuradores ni CORS permisivo detectados.');
};

interface ControlDef {
  id: string;
  title: string;
  eval: (f: Facts) => Ev;
}
interface FrameworkDef {
  id: string;
  name: string;
  controls: ControlDef[];
}

const FRAMEWORKS: FrameworkDef[] = [
  {
    id: 'pci',
    name: 'PCI DSS v4.0',
    controls: [
      { id: '1.2.5', title: 'Servicios, protocolos y puertos permitidos identificados y aprobados', eval: exposedServices },
      { id: '4.2.1', title: 'Criptografía robusta para transmitir datos por redes abiertas', eval: tlsTransit },
      { id: '6.3.3', title: 'Componentes protegidos contra vulnerabilidades conocidas mediante parches', eval: vulnMgmt },
      { id: '6.4.2', title: 'Solución técnica automatizada (WAF) para aplicaciones web públicas', eval: wafControl },
      { id: '6.4.3', title: 'Scripts de la página de pago autorizados y con integridad verificada', eval: integrity },
    ],
  },
  {
    id: 'iso27001',
    name: 'ISO/IEC 27001:2022 — Anexo A',
    controls: [
      { id: 'A.5.14', title: 'Transferencia de información (autenticación de correo)', eval: emailAuth },
      { id: 'A.8.8', title: 'Gestión de vulnerabilidades técnicas', eval: vulnMgmt },
      { id: 'A.8.9', title: 'Gestión de la configuración', eval: configHardening },
      { id: 'A.8.12', title: 'Prevención de fuga de datos', eval: dataLeak },
      { id: 'A.8.20', title: 'Seguridad de redes', eval: exposedServices },
      { id: 'A.8.21', title: 'Seguridad de los servicios de red (DNS)', eval: dnsIntegrity },
      { id: 'A.8.24', title: 'Uso de criptografía', eval: tlsTransit },
      { id: 'A.8.26', title: 'Requisitos de seguridad de las aplicaciones', eval: appSecurity },
    ],
  },
  {
    id: 'nist',
    name: 'NIST CSF 2.0',
    controls: [
      { id: 'PR.DS-02', title: 'Datos en tránsito protegidos', eval: tlsTransit },
      { id: 'PR.IR-01', title: 'Redes protegidas del acceso lógico no autorizado', eval: exposedServices },
      { id: 'PR.PS-01', title: 'Prácticas de gestión de la configuración', eval: configHardening },
      { id: 'PR.PS-02', title: 'Software mantenido, actualizado y retirado', eval: vulnMgmt },
    ],
  },
  {
    id: 'owasp',
    name: 'OWASP Top 10:2021',
    controls: [
      { id: 'A01', title: 'Pérdida de control de acceso (superficie expuesta)', eval: accessControlSurface },
      { id: 'A02', title: 'Fallos criptográficos', eval: tlsTransit },
      { id: 'A05', title: 'Configuración de seguridad incorrecta', eval: configHardening },
      { id: 'A06', title: 'Componentes vulnerables y obsoletos', eval: vulnMgmt },
      { id: 'A08', title: 'Fallos de integridad de software y datos (SRI)', eval: integrity },
    ],
  },
  {
    id: 'pe',
    name: 'Perú — SBS Res. 504-2021 y Ley 29733',
    controls: [
      { id: 'SBS-VULN', title: 'SBS 504-2021 · Gestión de vulnerabilidades técnicas', eval: vulnMgmt },
      { id: 'SBS-CRIPTO', title: 'SBS 504-2021 · Protección criptográfica de la información en tránsito', eval: tlsTransit },
      { id: 'SBS-APP', title: 'SBS 504-2021 · Seguridad de aplicaciones y canales web', eval: appSecurity },
      { id: 'SBS-RED', title: 'SBS 504-2021 · Seguridad de red y servicios expuestos', eval: exposedServices },
      { id: 'SBS-PHISH', title: 'SBS 504-2021 · Protección contra suplantación (correo y DNS)', eval: emailAuth },
      { id: 'L29733-16', title: 'Ley 29733 art. 16 · Medidas de seguridad del tratamiento de datos personales', eval: dataLeak },
    ],
  },
];

export function evaluateCompliance(report: AuditReportRecord): ComplianceResult {
  const facts = factsFrom(report);
  const frameworks: ComplianceFramework[] = FRAMEWORKS.map((fw) => {
    const controls: ComplianceControl[] = fw.controls.map((c) => {
      let ev: Ev;
      try {
        ev = c.eval(facts);
      } catch {
        ev = na('No se pudo evaluar.');
      }
      return { id: c.id, title: c.title, status: ev.status, evidence: ev.evidence };
    });
    const passed = controls.filter((c) => c.status === 'cumple').length;
    const partial = controls.filter((c) => c.status === 'parcial').length;
    const failed = controls.filter((c) => c.status === 'no_cumple').length;
    const notEvaluable = controls.filter((c) => c.status === 'no_evaluable').length;
    const evaluable = passed + partial + failed;
    return {
      id: fw.id,
      name: fw.name,
      controls,
      passed,
      partial,
      failed,
      notEvaluable,
      pct: evaluable > 0 ? Math.round(((passed + partial * 0.5) / evaluable) * 100) : null,
    };
  });

  const pcts = frameworks.map((f) => f.pct).filter((p): p is number => p !== null);
  return {
    frameworks,
    overallPct: pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : null,
    disclaimer:
      'Evaluación automática de indicios técnicos perimetrales observables desde Internet. No sustituye una auditoría de certificación ni evalúa controles organizativos o internos.',
    generatedAt: new Date().toISOString(),
  };
}
