import { MonitoredDomain, ChecksDetail } from '@/types/security';
import { WorkerScanResult } from './types';
import { isPrivateOrLocalHost, verifyDnsResolution } from '@/lib/security/ssrfValidator';
import { scanSsl } from '@/lib/scanner/sslScanner';
import { scanHeaders } from '@/lib/scanner/headerScanner';
import { scanDnsSecurity } from '@/lib/scanner/dnsScanner';
import { lookupServerLocation } from '@/lib/scanner/geoScanner';
import { scanWebAudit } from '@/lib/scanner/webAuditScanner';
import { calculateSecurityScore } from '@/lib/scanner/scoreEngine';
import { calculateResilienceVectors } from '@/lib/scanner/benchmarks';

/**
 * DEFENSA TI - Scanner Autónomo para Worker VPS
 * Ejecuta auditoría perimetral no intrusiva con estrictas defensas Anti-SSRF.
 */
export async function executeDomainAudit(domainRecord: MonitoredDomain): Promise<WorkerScanResult> {
  const hostname = domainRecord.domain.trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  const targetUrl = `https://${hostname}`;

  // 1. Blindaje Anti-SSRF: Bloqueo de rangos privados RFC 1918 y hostnames prohibidos
  if (isPrivateOrLocalHost(hostname)) {
    throw new Error(`[Anti-SSRF] Destino ${hostname} bloqueado por apuntar a red interna o reservada.`);
  }

  // 2. Resolución DNS para verificación Anti-SSRF y obtención de IP real
  const dnsCheck = await verifyDnsResolution(hostname);
  if (!dnsCheck.safe) {
    throw new Error(`[Anti-SSRF] Resolución DNS de ${hostname} fallida o insegura: ${dnsCheck.reason}`);
  }
  const resolvedIp = dnsCheck.resolvedIps[0] || '0.0.0.0';

  // 3. Ejecución concurrente de sondas perimetrales
  const [sslRes, headerRes, dnsRes, geoRes, webAuditRes] = await Promise.all([
    scanSsl(hostname).catch((err) => ({
      valid: false,
      protocol: 'Error',
      issuer: 'N/A',
      validTo: 'N/A',
      daysRemaining: 0,
      score: 0,
      error: err?.message || 'Fallo de socket TLS',
    })),
    scanHeaders(targetUrl).catch(() => ({
      headers: [],
      missingHeaders: [],
      score: 0,
      grade: 'F' as const,
      ttfb_ms: 0,
    })),
    scanDnsSecurity(hostname).catch(() => ({
      dmarc: { present: false, policy: 'missing' as const, risk: 'CRÍTICO' as const, description: 'No disponible' },
      spf: { present: false, strict: false, risk: 'ALTO' as const, description: 'No disponible' },
      scoreBonus: 0,
    })),
    lookupServerLocation(resolvedIp).catch(() => null),
    scanWebAudit(targetUrl).catch(() => ({
      waf: { hasWaf: false, isOriginExposed: true, details: 'Sin WAF' },
      cms: { detected: false, isEcommerce: false, detectedPlugins: [], risk: 'BAJO' as const, description: '', versionExposed: false },
      mixedContent: { hasMixedContent: false, count: 0, items: [], risk: 'BAJO' as const, description: '' },
      malware: { isInfectedOrSuspicious: false, threatLevel: 'LIMPIO' as const, indicators: [], description: '' },
    })),
  ]);

  // 4. Cálculo del Score Determinista
  let score = 0;
  if (sslRes.valid) {
    try {
      const calc = calculateSecurityScore(hostname, headerRes.headers, sslRes);
      score = calc.score;
    } catch {
      score = 60;
    }
  }

  const ssl_days_left = sslRes.valid ? sslRes.daysRemaining : 0;
  const tls_version = sslRes.valid ? sslRes.protocol : 'Sin HTTPS';
  const ttfb_ms = ('ttfb_ms' in headerRes && typeof (headerRes as { ttfb_ms?: number }).ttfb_ms === 'number')
    ? Number((headerRes as { ttfb_ms?: number }).ttfb_ms)
    : 0;

  const wafProvider = 'provider' in webAuditRes.waf ? (webAuditRes.waf as { provider?: string }).provider : undefined;
  const waf_detected = webAuditRes.waf.hasWaf ? (wafProvider || 'WAF Edge Activo') : 'Ninguno';
  const asn = geoRes?.as || (geoRes?.isp ? `AS - ${geoRes.isp}` : 'AS Desconocido');

  // 5. Cálculo de Vectores de Resiliencia (1 - 5)
  const hasHsts = headerRes.headers.some((h) => h.header.toLowerCase() === 'strict-transport-security' && h.status === 'pass');
  const hasCsp = headerRes.headers.some((h) => h.header.toLowerCase() === 'content-security-policy' && h.status === 'pass');
  const hasXfo = headerRes.headers.some((h) => h.header.toLowerCase() === 'x-frame-options' && h.status === 'pass');
  const hasXcto = headerRes.headers.some((h) => h.header.toLowerCase() === 'x-content-type-options' && h.status === 'pass');

  const vectors = calculateResilienceVectors({
    dmarcPolicy: dnsRes.dmarc.policy,
    spfPresent: dnsRes.spf.present,
    sslValid: sslRes.valid,
    tlsVersion: tls_version,
    sslDaysRemaining: ssl_days_left,
    hasHsts,
    hasCsp,
    hasXfo,
    hasXcto,
    hasWaf: webAuditRes.waf.hasWaf,
  });

  const hstsHdr = headerRes.headers.find((h) => h.header.toLowerCase() === 'strict-transport-security');
  const cspHdr = headerRes.headers.find((h) => h.header.toLowerCase() === 'content-security-policy');
  const xfoHdr = headerRes.headers.find((h) => h.header.toLowerCase() === 'x-frame-options');
  const xctoHdr = headerRes.headers.find((h) => h.header.toLowerCase() === 'x-content-type-options');
  const rpHdr = headerRes.headers.find((h) => h.header.toLowerCase() === 'referrer-policy');
  const ppHdr = headerRes.headers.find((h) => h.header.toLowerCase() === 'permissions-policy');

  // El tipo solo admite pass, warning o fail: lo ausente cuenta como fail
  const hs = (h?: { status?: string }): 'pass' | 'warning' | 'fail' => (h?.status === 'pass' || h?.status === 'warning' ? h.status : 'fail');

  const checks_detail: ChecksDetail = {
    headers: {
      hsts: { present: Boolean(hstsHdr?.present), status: hs(hstsHdr), value: hstsHdr?.value || null },
      csp: { present: Boolean(cspHdr?.present), status: hs(cspHdr), value: cspHdr?.value || null },
      xfo: { present: Boolean(xfoHdr?.present), status: hs(xfoHdr), value: xfoHdr?.value || null },
      xcto: { present: Boolean(xctoHdr?.present), status: hs(xctoHdr), value: xctoHdr?.value || null },
      referrerPolicy: { present: Boolean(rpHdr?.present), status: hs(rpHdr), value: rpHdr?.value || null },
      permissionsPolicy: { present: Boolean(ppHdr?.present), status: hs(ppHdr), value: ppHdr?.value || null },
    },
    ssl: {
      valid: sslRes.valid,
      protocol: tls_version,
      issuer: sslRes.issuer,
      validTo: sslRes.validTo,
      daysRemaining: ssl_days_left,
    },
    dns: {
      spf: { present: dnsRes.spf.present, strict: dnsRes.spf.strict, raw: 'raw' in dnsRes.spf ? (dnsRes.spf as { raw?: string }).raw : undefined },
      dmarc: { present: dnsRes.dmarc.present, policy: dnsRes.dmarc.policy, raw: 'raw' in dnsRes.dmarc ? (dnsRes.dmarc as { raw?: string }).raw : undefined },
    },
    waf: {
      detected: webAuditRes.waf.hasWaf,
      name: waf_detected,
      isOriginExposed: webAuditRes.waf.isOriginExposed,
    },
    geo: {
      country: geoRes?.country || 'Desconocido',
      countryCode: geoRes?.countryCode || '',
      city: geoRes?.city || '',
      lat: geoRes?.lat || 0,
      lon: geoRes?.lon || 0,
      isp: geoRes?.isp,
      asn,
    },
    performance: {
      ttfb_ms,
    },
  };

  return {
    domain: domainRecord,
    score,
    ssl_days_left,
    ttfb_ms,
    tls_version,
    server_ip: resolvedIp,
    asn,
    waf_detected,
    vectors,
    checks_detail,
  };
}
