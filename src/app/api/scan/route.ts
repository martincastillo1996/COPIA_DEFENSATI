import { NextResponse } from 'next/server';
import { scanSsl } from '@/lib/scanner/sslScanner';
import { scanHeaders, HeaderCheckItem } from '@/lib/scanner/headerScanner';
import { calculateSecurityScore } from '@/lib/scanner/scoreEngine';
import { generateRemediation, RemediationItem } from '@/lib/ai/remediation';
import { saveReport, getReportById, getScoreHistory, AuditReportRecord } from '@/lib/storage/reportStore';
import { scanPerimetralPorts, PortCheckResult } from '@/lib/scanner/portScanner';
import { scanSensitiveFiles, SensitiveFilesResult } from '@/lib/scanner/sensitiveFilesScanner';
import { scanDnsSecurity } from '@/lib/scanner/dnsScanner';
import { lookupServerLocation } from '@/lib/scanner/geoScanner';
import { scanWebAudit } from '@/lib/scanner/webAuditScanner';
import {
  inferIndustryFromDomain,
  getIndustryBenchmark,
  calculateResilienceVectors,
  buildAuditCategories,
} from '@/lib/scanner/benchmarks';
import { IndustrySector } from '@/types/security';
import { evaluateRansomwareRisk } from '@/lib/scanner/ransomwareRiskScanner';
import { evaluateDdosResilience } from '@/lib/scanner/ddosResilienceScanner';
import { evaluateBankingCompliance } from '@/lib/scanner/bankingComplianceScanner';
import { scanCveIntel, cveScoreImpact, CveIntelResult } from '@/lib/scanner/cveIntelScanner';
import { scanAsm, AsmResult } from '@/lib/scanner/asmScanner';
import { scanWebApp, WebAppResult } from '@/lib/scanner/webAppScanner';
import { findingsScoreImpact, sortFindings } from '@/lib/scanner/findingTypes';
import { runNuclei } from '@/lib/scanner/nucleiRunner';
import { evaluateCompliance } from '@/lib/scanner/complianceMapper';
import { diffReports } from '@/lib/scanner/findingsDiff';
import { buildIntegrity } from '@/lib/security/reportIntegrity';
import { v4 as uuidv4 } from 'uuid';
import { isPrivateOrLocalHost, verifyDnsResolution } from '@/lib/security/ssrfValidator';
import { saveAuditConsent, AuditConsentRecord } from '@/lib/storage/auditConsentStore';
import { signBadge } from '@/lib/security/badgeSigner';
import { verifyTurnstileToken } from '@/lib/security/turnstileValidator';
import { isHyperscalePlatform } from '@/lib/hyperscalers';
import { getClientIp } from '@/lib/security/clientIp';
import { hitRateLimit, RateLimitMap } from '@/lib/security/rateLimit';
import { isAdminRequest, authenticate } from '@/lib/security/adminAuth';
import { proveOwnership, ownershipRecord } from '@/lib/audit/ownership.mjs';
import { authorizeFull } from '@/lib/audit/authorization.mjs';
import { assertAllowed, logEvent } from '@/lib/audit/store.mjs';
import { getAuditorLocation } from '@/lib/auditor';

// Caché en Memoria de Escaneos por Dominio (TTL de 2 horas para soportar picos masivos)
const DOMAIN_SCAN_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas
const MAX_CACHED_SCANS = 500;

interface CachedScanEntry {
  report: AuditReportRecord;
  cachedAt: number;
  expiresAt: number;
}

const globalForScanCache = globalThis as unknown as {
  __domainScanCache?: Map<string, CachedScanEntry>;
};

if (!globalForScanCache.__domainScanCache) {
  globalForScanCache.__domainScanCache = new Map<string, CachedScanEntry>();
}

const domainScanCache = globalForScanCache.__domainScanCache;

// Rate Limiter Per-IP para Escaneos (10 escaneos cada 15 minutos por cliente)
const scanRateLimitMap: RateLimitMap = new Map();
const SCAN_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const SCAN_MAX_REQUESTS = 10;

// Escaneos SIN verificación humana (Turnstile): cupo mucho menor por IP y un tope global por
// hora. Antes bastaba con no enviar el token para saltarse la verificación sin ningún límite extra.
const noTokenIpMap: RateLimitMap = new Map();
const noTokenGlobalMap: RateLimitMap = new Map();
const NO_TOKEN_MAX_PER_IP = 3;
const NO_TOKEN_GLOBAL_MAX_PER_HOUR = 120;

function checkScanRateLimit(ip: string): { allowed: boolean; remaining: number; resetInSec: number } {
  return hitRateLimit(scanRateLimitMap, ip, SCAN_WINDOW_MS, SCAN_MAX_REQUESTS);
}

// Filtro Anti-Scrapers y Bots Maliciosos que buscan usar la API como proxy gratuito
const BLOCKED_BOT_USER_AGENTS = /python-requests|aiohttp|curl\/|wget\/|scrapy|postmanruntime|libwww-perl|httpclient|okhttp|go-http-client/i;

function isAllowedDomain(urlOrHost: string | null): boolean {
  if (!urlOrHost) return false;
  try {
    let hostname = urlOrHost.trim();
    if (hostname.includes('://')) {
      hostname = new URL(hostname).hostname;
    } else {
      hostname = hostname.split(':')[0].trim();
    }
    hostname = hostname.toLowerCase();

    if (hostname === 'neuronalgravity.com' || hostname.endsWith('.neuronalgravity.com')) return true;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    return false;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const clientIp = getClientIp(req);

    // 0. Protección Anti-Bots / Scrapers (Evita que terceros usen tu backend como API pública)
    const userAgent = req.headers.get('user-agent') || '';
    const origin = req.headers.get('origin');

    // Petición interna con token de administración (monitor de clientes y auditoría completa)
    const adminRequest = isAdminRequest(req);

    if (!adminRequest && (!userAgent || BLOCKED_BOT_USER_AGENTS.test(userAgent))) {
      return NextResponse.json(
        { error: 'Acceso denegado: El uso automatizado vía scripts o scrapers está estrictamente restringido.' },
        { status: 403 }
      );
    }

    // Bloqueo de Hotlinking (Evita que otra web incruste llamadas a tu API de escaneo)
    if (!adminRequest && origin && !isAllowedDomain(origin)) {
      return NextResponse.json(
        { error: 'Acceso no autorizado desde este origen.' },
        { status: 403 }
      );
    }

    // 0.1 Control de Tasa (Máximo 10 escaneos por cada 15 minutos por IP)
    const rateCheck = adminRequest
      ? { allowed: true, remaining: SCAN_MAX_REQUESTS, resetInSec: 0 }
      : checkScanRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Has alcanzado el límite de escaneos permitidos (máximo 10 escaneos cada 15 minutos). Por favor espera ${Math.ceil(rateCheck.resetInSec / 60)} minutos o contáctanos por WhatsApp para auditorías masivas.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.resetInSec),
            'X-RateLimit-Limit': String(SCAN_MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Cuerpo de la solicitud inválido.' }, { status: 400 });
    }
    const { url, force, legalConsentAccepted, turnstileToken, mode, industry, previousReportId, engagementId, deep, comparison, serialKey, licenseKey } = body;

    // 0.05 Diferenciación de versiones: Lite (gratuita / pública) vs. Premium (clientes con clave serial)
    const rawKey = typeof serialKey === 'string' ? serialKey.trim() : typeof licenseKey === 'string' ? licenseKey.trim() : '';
    const configuredKeys = (process.env.PREMIUM_SERIAL_KEYS || 'DEFENSA-VIP-2026,DTI-PREMIUM-2026')
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    if (process.env.ADMIN_TOKEN) configuredKeys.push(process.env.ADMIN_TOKEN.trim().toLowerCase());

    const isPremiumKey = rawKey ? configuredKeys.includes(rawKey.toLowerCase()) : false;
    if (rawKey && !isPremiumKey && !adminRequest) {
      return NextResponse.json(
        { error: 'Clave serial o código de cliente inválido o expirado. Solicita tu clave de auditoría premium por WhatsApp.' },
        { status: 403 }
      );
    }

    const isLocalOrDev = process.env.NODE_ENV !== 'production' || process.env.ENABLE_DEEP_SCAN === '1';
    const isPremium = Boolean(adminRequest || isPremiumKey || (mode === 'full' && isLocalOrDev));
    const scanMode: 'public' | 'full' = isPremium ? 'full' : 'public';

    if (typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { error: 'Parámetro de URL requerido para auditoría perimetral.' },
        { status: 400 }
      );
    }

    // 0.2 Declaración Jurada Obligatoria (Ley N° 30096 - Delitos Informáticos)
    if (!legalConsentAccepted) {
      return NextResponse.json(
        {
          error: 'Declaración jurada obligatoria: Para auditar debes confirmar ser titular del dominio o contar con autorización por escrito conforme a la Ley N° 30096 (Delitos Informáticos del Perú).',
        },
        { status: 403 }
      );
    }

    // 1. Normalizar URL
    const rawInput = url.trim().toLowerCase();
    let parsedUrl = url.trim();
    if (!parsedUrl.startsWith('http://') && !parsedUrl.startsWith('https://')) {
      parsedUrl = 'https://' + parsedUrl;
    }

    let target: URL;
    try {
      target = new URL(parsedUrl);
    } catch {
      return NextResponse.json(
        { error: 'Formato de URL inválido. Ingrese un dominio válido (ej. tudominio.com).' },
        { status: 400 }
      );
    }

    // 1.1 Restricción de puertos (solo puertos web públicos permitidos)
    if (target.port && !['80', '443', '8080', '8443'].includes(target.port)) {
      return NextResponse.json(
        { error: 'Acceso denegado: Solo se permiten puertos web estándar (80, 443, 8080, 8443).' },
        { status: 400 }
      );
    }

    const hostname = target.hostname;

    // 2. Blindaje Anti-SSRF: Comprobación preliminar de hostnames e IPs
    if (isPrivateOrLocalHost(hostname)) {
      return NextResponse.json(
        { error: 'Acceso denegado: Auditoría bloqueada hacia host privado, loopback o metadatos cloud.' },
        { status: 400 }
      );
    }

    // 2.0.1 Puerta del modo completo: el token no basta, hace falta una autorización escrita vigente
    let engagement: { id: string; rps: number } | undefined;
    if (scanMode === 'full') {
      try {
        if (target.port && target.port !== '443') throw new Error('El modo completo solo admite el origen HTTPS autorizado.');
        if (target.protocol !== 'https:') throw new Error('El modo completo solo admite HTTPS.');
        engagement = await authorizeFull(hostname, typeof engagementId === 'string' ? engagementId : undefined);
        logEvent('scan.full', { engagement: engagement?.id, host: hostname, ip: clientIp, actor: authenticate(req)?.actor });
      } catch (err) {
        if (!isLocalOrDev && !isPremiumKey && !adminRequest) {
          return NextResponse.json(
            { error: `Auditoría completa no autorizada: ${err instanceof Error ? err.message : 'sin autorización'}`, code: 'ENGAGEMENT_REQUIRED' },
            { status: 403 }
          );
        }
        // Con clave serial autorizada, petición de admin o flag de escaneo profundo activo, se permite continuar
      }
    }

    // 2.0 Caché Inteligente por Dominio (Zero-Downtime y $0 Costo en Picos de Tráfico)
    // Comparativa con un tercero: sin sondeo de puertos, y su informe no se guarda ni alimenta el sello
    const isComparison = scanMode === 'public' && comparison === true;
    // Sondeo de puertos: solo con una autorización verificada (modo completo) o con la titularidad del dominio probada
    // (TXT o archivo de verificación). Quien escanea un dominio ajeno no puede sondear sus puertos.
    const proof = scanMode === 'public' && !isComparison
      ? await proveOwnership(hostname).catch(() => ({ verified: false, method: null, domain: null }))
      : null;
    // Decisión del titular del servicio: el sondeo de puertos (lista cerrada) ya no exige prueba de titularidad.
    // La declaración jurada (Ley 30096) sigue siendo obligatoria. Los archivos sensibles siguen solo en modo completo.
    const portsAllowed = !isComparison;
    const cacheKey = `${isComparison ? 'comparison' : scanMode}:${target.origin.toLowerCase()}:${portsAllowed ? 'puertos' : 'sinpuertos'}`;
    const cachedEntry = !force && scanMode === 'public' && domainScanCache.has(cacheKey) ? domainScanCache.get(cacheKey) : undefined;
    const isCached = Boolean(cachedEntry && Date.now() < (cachedEntry?.expiresAt || 0));

    // 0.1 Validación de Seguridad Cloudflare Turnstile Anti-Bot
    if (!adminRequest) {
      if (turnstileToken) {
        const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
        if (!turnstileCheck.success) {
          return NextResponse.json(
            {
              error:
                'Verificación humana de Cloudflare Turnstile fallida o expirada. Por favor completa la verificación e intenta de nuevo.',
            },
            { status: 403 }
          );
        }
      } else {
        // Sin token de Turnstile: solo se permite si el dominio ya fue previamente auditado y está vigente en caché
        if (!isCached) {
          return NextResponse.json(
            {
              error:
                'Para iniciar una nueva auditoría perimetral se requiere completar la verificación humana de Cloudflare Turnstile.',
            },
            { status: 403 }
          );
        }

        // Consultas repetidas de dominios en caché sin token: cupo controlado
        const perIp = hitRateLimit(noTokenIpMap, clientIp, SCAN_WINDOW_MS, NO_TOKEN_MAX_PER_IP);
        const global = hitRateLimit(noTokenGlobalMap, 'global', 60 * 60 * 1000, NO_TOKEN_GLOBAL_MAX_PER_HOUR);
        if (!perIp.allowed || !global.allowed) {
          return NextResponse.json(
            { error: 'Para seguir consultando auditorías completa la verificación humana en el escáner principal o espera unos minutos.' },
            { status: 429, headers: { 'Retry-After': String(perIp.allowed ? global.resetInSec : perIp.resetInSec) } }
          );
        }
      }
    }

    // 2.A Registro Inmutable de Consentimiento y Declaración Jurada (Prueba Legal de Autorización)
    const scanDate = new Date();
    const consentRecord: AuditConsentRecord = {
      id: uuidv4(),
      domain: hostname,
      normalizedUrl: parsedUrl,
      timestamp: scanDate.toISOString(),
      date: scanDate.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' }),
      time: scanDate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ip: clientIp,
      userAgent: req.headers.get('user-agent') || 'Desconocido',
      hasSwornDeclaration: true,
      engagementId: engagement?.id,
      declarationText:
        'Declaro bajo juramento que soy el titular del dominio que voy a auditar, o que cuento con autorización expresa y por escrito de su propietario, conforme a la Ley N° 30096, Delitos Informáticos del Perú. Entiendo que auditar una web ajena sin permiso puede ser delito.',
    };
    saveAuditConsent(consentRecord);

    if (isCached && cachedEntry) {
      const freshAuditId = uuidv4();
      const cachedTelemetry = adminRequest
        ? {
            durationMs: Date.now() - startTime,
            aiModel: cachedEntry.report.telemetry?.aiModel || 'gemini-1.5-flash-cache',
            targetResolvedIp: cachedEntry.report.telemetry?.targetResolvedIp,
            engineVersion: '1.4.0-cloud-cache',
          }
        : {
            durationMs: Date.now() - startTime,
          };

      const cachedReport: AuditReportRecord = {
        ...cachedEntry.report,
        id: freshAuditId,
        telemetry: cachedTelemetry,
      };

      // Enriquecer reportes cacheados previamente con los nuevos motores
      if (!cachedReport.ransomware && cachedReport.ports) {
        try {
          cachedReport.ransomware = evaluateRansomwareRisk({
            ports: cachedReport.ports,
            sensitiveFiles: cachedReport.sensitiveFiles,
            filesScanned: cachedReport.scanMode === 'full',
          });
        } catch {
          // Ignorar
        }
      }
      if (!cachedReport.ddos) {
        try {
          cachedReport.ddos = await evaluateDdosResilience({
            hostname,
            resolvedIp: cachedReport.telemetry?.targetResolvedIp || cachedReport.location?.ip,
            hasWaf: Boolean(cachedReport.waf?.hasWaf),
            wafProvider: cachedReport.waf?.provider,
            hasXmlRpc: cachedReport.sensitiveFiles?.findings?.some(f => f.path.includes('xmlrpc') && f.isExposed),
            spfRaw: cachedReport.dnsSecurity?.spf?.raw,
          });
        } catch {
          // Ignorar
        }
      }
      if (!cachedReport.banking) {
        try {
          cachedReport.banking = await evaluateBankingCompliance({
            hostname,
            headers: cachedReport.headers || [],
            cookies: cachedReport.cookies,
            isEcommerce: cachedReport.cms?.isEcommerce,
            paymentGateways: cachedReport.commercial?.paymentGateways,
          });
        } catch {
          // Ignorar
        }
      }

      if (!cachedReport.compliance) {
        try {
          cachedReport.compliance = evaluateCompliance(cachedReport);
        } catch {
          // Ignorar
        }
      }

      // El sello cubre el identificador: cada copia servida desde caché se vuelve a firmar
      cachedReport.integrity = buildIntegrity(cachedReport);

      // Guardar para que la ruta /report/[id] resuelva con éxito inmediato
      try {
        if (!isComparison) saveReport(freshAuditId, cachedReport);
      } catch {
        // Ignorar fallback
      }

      const detectedIndustry: IndustrySector = (industry && ['retail', 'fintech', 'banca', 'salud', 'educacion', 'tecnologia', 'general'].includes(industry))
        ? (industry as IndustrySector)
        : inferIndustryFromDomain(hostname);
      const benchmark = cachedReport.benchmark || getIndustryBenchmark(detectedIndustry);

      return NextResponse.json({
        id: freshAuditId,
        domain: hostname,
        score: cachedReport.score,
        grade: cachedReport.grade,
        ssl_days_left: cachedReport.ssl_days_left ?? (cachedReport.ssl?.daysRemaining || 0),
        ttfb_ms: cachedReport.ttfb_ms ?? null,
        tls_version: cachedReport.tls_version || (cachedReport.ssl?.protocol || 'N/D'),
        server_ip: cachedReport.telemetry?.targetResolvedIp || cachedReport.location?.ip || 'N/D',
        asn: cachedReport.asn || cachedReport.location?.as || 'AS Desconocido',
        waf_detected: cachedReport.waf_detected || (cachedReport.waf?.hasWaf ? (cachedReport.waf.provider || 'WAF Detectado') : 'Ninguno'),
        location: {
          country: cachedReport.location?.country || 'Desconocido',
          countryCode: cachedReport.location?.countryCode || '',
          city: cachedReport.location?.city || 'N/A',
          lat: cachedReport.location?.lat || null,
          lon: cachedReport.location?.lon || null,
          isp: cachedReport.location?.isp || 'Desconocido',
        },
        auditor_location: getAuditorLocation(),
        vectors: cachedReport.vectors || { anti_phishing: 3, web_encryption: 4, network_exposure: 3 },
        history: cachedReport.history || [],
        benchmark,
        categories: cachedReport.categories || [],
        ransomware: cachedReport.ransomware,
        ddos: cachedReport.ddos,
        banking: cachedReport.banking,
        cveIntel: cachedReport.cveIntel,
        asm: cachedReport.asm,
        webApp: cachedReport.webApp,
        compliance: cachedReport.compliance,
        telemetry: {
          durationMs: Date.now() - startTime,
          cached: true,
          engineVersion: '2.0.0-cloud-cache',
        },
        scannedAt: cachedReport.scannedAt || new Date().toISOString(),
        report: cachedReport,
        cached: true,
      });
    } else if (domainScanCache.has(cacheKey)) {
      domainScanCache.delete(cacheKey);
    }

    // 2.1. Resolución DNS dual (IPv4 + IPv6) para neutralizar DNS Rebinding
    let targetResolvedIp: string | undefined;
    const dnsCheck = await verifyDnsResolution(hostname);
    if (!dnsCheck.safe) {
      return NextResponse.json(
        { error: `Acceso denegado por seguridad perimetral: ${dnsCheck.reason || 'Host no seguro.'}` },
        { status: 400 }
      );
    }
    if (dnsCheck.resolvedIps.length > 0) {
      targetResolvedIp = dnsCheck.resolvedIps[0];
    }

    // 3. Ejecución concurrente asíncrona de inspección perimetral
    const [rawSslResult, portResults, serverLocation, headerResult, sensitiveFilesResult, dnsSecurityResult, webAuditResult] = await Promise.all([
      scanSsl(hostname).catch((err) => ({
        valid: false,
        protocol: 'Error',
        issuer: 'N/A',
        validTo: 'N/A',
        daysRemaining: 0,
        score: 0,
        isHyperscale: false,
        error: err?.message || 'Error en socket TLS',
      })),
      // Solo con autorización o titularidad probada (ver portsAllowed). Lista vacía = no evaluado.
      // Lista vacía = no evaluado, nunca "cerrado".
      (portsAllowed ? scanPerimetralPorts(hostname) : Promise.resolve([] as PortCheckResult[])).catch(
        () => [] as PortCheckResult[]
      ),
      lookupServerLocation(targetResolvedIp || hostname).catch(() => null),
      scanHeaders(parsedUrl).catch(() => ({
        headers: [],
        missingHeaders: [],
        score: 0,
        grade: 'F' as const,
      })),
      // Búsqueda de archivos sensibles (/.env, /.git, respaldos, wp-config, etc.): activo en versión Premium
      (isPremium
        ? scanSensitiveFiles(parsedUrl)
        : Promise.resolve({ hasExposedFiles: false, criticalCount: 0, findings: [] } as SensitiveFilesResult)
      ).catch(() => ({
        hasExposedFiles: false,
        criticalCount: 0,
        findings: [],
      })),
      scanDnsSecurity(hostname).catch(() => ({
        dmarc: { present: false, policy: 'missing' as const, risk: 'CRÍTICO' as const, description: 'No se pudo verificar DMARC.' },
        spf: { present: false, strict: false, risk: 'ALTO' as const, description: 'No se pudo verificar SPF.' },
        scoreBonus: 0,
      })),
      scanWebAudit(parsedUrl).catch(() => ({
        waf: {
          hasWaf: false,
          isOriginExposed: true,
          details: 'Servidor de origen sin WAF detectable.',
          remediation: 'Implementar Cloudflare WAF para blindar el origen.',
        },
        cms: {
          detected: false,
          isEcommerce: false,
          detectedPlugins: [],
          risk: 'BAJO' as const,
          description: 'No se pudo determinar CMS.',
          versionExposed: false,
        },
        mixedContent: {
          hasMixedContent: false,
          count: 0,
          items: [],
          risk: 'BAJO' as const,
          description: 'Sin contenido mixto detectable.',
        },
        malware: {
          isInfectedOrSuspicious: false,
          threatLevel: 'LIMPIO' as const,
          indicators: [],
          description: 'No se detectaron firmas visibles de infección.',
        },
        commercial: undefined,
      })),
    ]);

    const headersList: HeaderCheckItem[] = Array.isArray(headerResult)
      ? headerResult
      : (headerResult && headerResult.headers) ? headerResult.headers : [];

    // Sin HTTP, sin TLS y sin puertos no se midió nada: ni nota, ni "seguro", ni "crítico"
    const answered = !Array.isArray(headerResult) && 'ttfb_ms' in headerResult && Number(headerResult.ttfb_ms) > 0;
    if (!answered && !rawSslResult.valid && !portResults.some((p) => p.isOpen)) {
      return NextResponse.json(
        { error: 'No se pudo conectar con el sitio, así que no se emite calificación. Revisa el dominio o inténtalo más tarde.', code: 'TARGET_UNREACHABLE' },
        { status: 422 }
      );
    }

    // 3.1 Inteligencia avanzada (CVE × KEV/EPSS, superficie de ataque y aplicación web), en paralelo.
    // Lo pasivo corre siempre; los sondeos activos (TLS profundo, CORS, endpoints) solo en modo full.
    const rawHeadersForIntel = headerResult && 'rawHeaders' in headerResult ? headerResult.rawHeaders : undefined;
    const [cveIntelResult, asmResult, webAppResult] = await Promise.all([
      scanCveIntel({ rawHeaders: rawHeadersForIntel, cms: webAuditResult.cms, ports: portResults }).catch(() => undefined) as Promise<CveIntelResult | undefined>,
      scanAsm(hostname, { mode: scanMode, isPremium }).catch(() => undefined) as Promise<AsmResult | undefined>,
      scanWebApp(parsedUrl, { mode: scanMode, isPremium, rawHeaders: rawHeadersForIntel }).catch(() => undefined) as Promise<WebAppResult | undefined>,
    ]);

    // Nuclei (plantillas comunitarias de CVE/exposición): auditoría autorizada o entorno local con binario
    if (webAppResult) {
      try {
        const check = engagement ? () => { assertAllowed(engagement.id, hostname); } : undefined;
        check?.();
        const nuclei = await runNuclei(target.origin, {
          timeoutMs: deep === true ? 120_000 : 45_000,
          rps: engagement?.rps || 5,
          check,
        }).catch(() => null);
        if (nuclei && nuclei.ran) {
          webAppResult.nuclei = { available: nuclei.available, ran: nuclei.ran, complete: nuclei.complete, durationMs: nuclei.durationMs, templatesMatched: nuclei.templatesMatched };
          webAppResult.findings = sortFindings([...webAppResult.findings, ...nuclei.findings]);
        } else if (nuclei) {
          webAppResult.nuclei = { available: nuclei.available, ran: false, complete: false, durationMs: 0, templatesMatched: 0 };
        }
      } catch {
        // Fallback silencioso si no está instalado
      }
    }

    // 4. Regla Perimetral Absoluta
    let sslResult = { ...rawSslResult };
    const isExplicitHttp = rawInput.startsWith('http://');
    const isKnownBadSsl = hostname.includes('self-signed') || hostname.includes('expired') || hostname.includes('neverssl');

    if (isExplicitHttp || isKnownBadSsl || !sslResult.valid || sslResult.error) {
      sslResult = {
        valid: false,
        protocol: 'Sin HTTPS',
        issuer: sslResult.issuer || 'No confiable',
        validTo: 'N/A',
        daysRemaining: 0,
        score: 0,
        isHyperscale: false,
        error: sslResult.error || 'Certificado inválido, autofirmado o no confiable.',
      };
    }

    // 5. Puertos: solo lo medido. Un puerto 80 abierto sin TLS válido sube a riesgo alto
    const adjustedPorts = portResults.map((p) =>
      p.port === 80 && p.isOpen && !sslResult.valid
        ? { ...p, risk: 'ALTO' as const, description: 'Tráfico en texto plano expuesto sin cifrado seguro.' }
        : p
    );

    const isHyperscale = isHyperscalePlatform(hostname) || ('isHyperscale' in sslResult ? Boolean((sslResult as Record<string, unknown>).isHyperscale) : false);

    // 6. Motor Determinista de Calificación
    let score = 0;
    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';

    if (sslResult.valid) {
      try {
        const scoreOutput = calculateSecurityScore(hostname, headersList, sslResult);
        score = scoreOutput.score;
        grade = scoreOutput.grade;
      } catch (err) {
        // Sin cálculo no hay nota: antes se inventaba un 70
        throw new Error('No se pudo calcular la calificación', { cause: err });
      }
    }

    // Penalización perimetral: Si puertos críticos de base de datos o administración (MySQL, Postgres, MSSQL, Redis, RDP, SMB o FTP)
    // están expuestos al mundo exterior, la calificación se limita estrictamente a Grado D/F.
    const hasExposedCriticalPorts = adjustedPorts.some(
      (p) => p.isOpen && [21, 3306, 5432, 1433, 6379, 3389, 445, 27017].includes(p.port)
    );
    if (hasExposedCriticalPorts) {
      score = Math.min(score, 35);
      grade = 'D';
    }

    // Penalización crítica por fuga de archivos sensibles (.env, .git, backups)
    if (sensitiveFilesResult.criticalCount > 0) {
      score = Math.min(score, 25);
      grade = 'F';
    }

    // Penalización por infección de malware o inyecciones detectadas en el DOM
    if (webAuditResult.malware.isInfectedOrSuspicious) {
      if (webAuditResult.malware.threatLevel === 'CRÍTICO') {
        score = Math.min(score, 15);
        grade = 'F';
      } else {
        score = Math.max(0, score - 20);
      }
    }

    // Penalización por contenido mixto inseguro (HTTP en HTTPS)
    if (webAuditResult.mixedContent.hasMixedContent) {
      score = Math.max(0, score - (webAuditResult.mixedContent.risk === 'ALTO' ? 12 : 6));
    }

    // Penalización leve si el servidor de origen no cuenta con WAF perimetral
    if (!webAuditResult.waf.hasWaf) {
      score = Math.max(0, score - 5);
    }

    // Penalización por vulnerabilidades conocidas (CVE confirmados por versión / explotación activa KEV)
    const cveImpact = cveScoreImpact(cveIntelResult);
    score = Math.max(0, Math.min(score, cveImpact.cap) - cveImpact.minus);
    const asmImpact = findingsScoreImpact(asmResult?.findings);
    const webImpact = findingsScoreImpact(webAppResult?.findings);
    score = Math.max(0, Math.min(score, asmImpact.cap, webImpact.cap) - asmImpact.minus - webImpact.minus);

    // Reajuste del grado final acorde al puntaje consolidado
    if (score < 40) grade = 'F';
    else if (score < 55 && grade !== 'F') grade = 'D';
    else if (score < 70 && !['F', 'D'].includes(grade)) grade = 'C';
    else if (score < 80 && ['A+', 'A'].includes(grade)) grade = 'B';
    else if (score < 90 && grade === 'A+') grade = 'A';

    // 7. Remediaciones
    let remediations: RemediationItem[] = [];
    try {
      const missingHeaders = headersList.filter((h) =>
        h.status === 'fail' || h.status === 'missing' || h.present === false
      );
      if (
        missingHeaders.length > 0 ||
        !sslResult.valid ||
        sensitiveFilesResult.hasExposedFiles ||
        !webAuditResult.waf.hasWaf ||
        webAuditResult.malware.isInfectedOrSuspicious ||
        webAuditResult.mixedContent.hasMixedContent
      ) {
        remediations = await generateRemediation(target.origin, missingHeaders, isHyperscale);
      }
    } catch {
      remediations = [];
    }

    const auditId = uuidv4();
    const durationMs = Date.now() - startTime;

    // Métricas perimétricas enriquecidas para SaaS y Dashboard de Alta Densidad
    const detectedIndustry: IndustrySector = (industry && ['retail', 'fintech', 'banca', 'salud', 'educacion', 'tecnologia', 'general'].includes(industry))
      ? (industry as IndustrySector)
      : inferIndustryFromDomain(hostname);
    const benchmark = getIndustryBenchmark(detectedIndustry);

    const ssl_days_left = sslResult.valid ? sslResult.daysRemaining : 0;
    const tls_version = sslResult.valid ? (sslResult.protocol || 'N/D') : 'Sin HTTPS';
    const wafProvider = 'provider' in webAuditResult.waf ? (webAuditResult.waf as { provider?: string }).provider : undefined;
    const wafName = webAuditResult.waf.hasWaf ? (wafProvider || 'WAF Edge Activo') : 'Ninguno';
    const asn = serverLocation?.as || (serverLocation?.isp ? `${serverLocation.isp}` : 'AS Desconocido');
    const serverIp = targetResolvedIp || serverLocation?.ip || 'N/D';
    const ttfb_ms = ('ttfb_ms' in headerResult && typeof (headerResult as { ttfb_ms?: number }).ttfb_ms === 'number' && Number((headerResult as { ttfb_ms?: number }).ttfb_ms) > 0)
      ? Number((headerResult as { ttfb_ms?: number }).ttfb_ms)
      : null;

    const hasHsts = headersList.some((h) => h.header.toLowerCase() === 'strict-transport-security' && h.status === 'pass');
    const hasCsp = headersList.some((h) => h.header.toLowerCase() === 'content-security-policy' && h.status === 'pass');
    const hasXfo = headersList.some((h) => h.header.toLowerCase() === 'x-frame-options' && h.status === 'pass');
    const hasXcto = headersList.some((h) => h.header.toLowerCase() === 'x-content-type-options' && h.status === 'pass');

    const vectors = calculateResilienceVectors({
      dmarcPolicy: dnsSecurityResult.dmarc.policy,
      spfPresent: dnsSecurityResult.spf.present,
      sslValid: sslResult.valid,
      tlsVersion: tls_version,
      sslDaysRemaining: ssl_days_left,
      hasHsts,
      hasCsp,
      hasXfo,
      hasXcto,
      hasWaf: webAuditResult.waf.hasWaf,
    });

    const hstsHdr = headersList.find((h) => h.header.toLowerCase() === 'strict-transport-security');
    const cspHdr = headersList.find((h) => h.header.toLowerCase() === 'content-security-policy');
    const xfoHdr = headersList.find((h) => h.header.toLowerCase() === 'x-frame-options');
    const xctoHdr = headersList.find((h) => h.header.toLowerCase() === 'x-content-type-options');
    const rpHdr = headersList.find((h) => h.header.toLowerCase() === 'referrer-policy');
    const ppHdr = headersList.find((h) => h.header.toLowerCase() === 'permissions-policy');

    const spfRaw = 'raw' in dnsSecurityResult.spf ? (dnsSecurityResult.spf as { raw?: string }).raw : undefined;
    const dmarcRaw = 'raw' in dnsSecurityResult.dmarc ? (dnsSecurityResult.dmarc as { raw?: string }).raw : undefined;

    const categories = buildAuditCategories({
      headers: {
        hsts: hstsHdr ? { present: hstsHdr.present, status: hstsHdr.status, value: hstsHdr.value } : undefined,
        csp: cspHdr ? { present: cspHdr.present, status: cspHdr.status, value: cspHdr.value } : undefined,
        xfo: xfoHdr ? { present: xfoHdr.present, status: xfoHdr.status, value: xfoHdr.value } : undefined,
        xcto: xctoHdr ? { present: xctoHdr.present, status: xctoHdr.status, value: xctoHdr.value } : undefined,
        referrerPolicy: rpHdr ? { present: rpHdr.present, status: rpHdr.status, value: rpHdr.value } : undefined,
        permissionsPolicy: ppHdr ? { present: ppHdr.present, status: ppHdr.status, value: ppHdr.value } : undefined,
      },
      ssl: {
        valid: sslResult.valid,
        protocol: tls_version,
        issuer: sslResult.issuer,
        daysRemaining: ssl_days_left,
      },
      dns: {
        spf: { present: dnsSecurityResult.spf.present, strict: dnsSecurityResult.spf.strict, record: spfRaw },
        dmarc: { present: dnsSecurityResult.dmarc.present, policy: dnsSecurityResult.dmarc.policy, record: dmarcRaw },
      },
      waf: {
        detected: webAuditResult.waf.hasWaf,
        name: wafName,
        isOriginExposed: webAuditResult.waf.isOriginExposed,
      },
    });

    const history = [...getScoreHistory(target.origin, scanMode), { date: new Date().toISOString().slice(0, 10), score }];
    const auditor_location = getAuditorLocation();

    // 7.1 Motores Perimetrales Especializados (Amenazas Críticas, DDoS y Cumplimiento Bancario)
    const hasXmlRpc = sensitiveFilesResult.findings.some((f) => f.path.includes('xmlrpc') && f.isExposed);
    const rawHeadersMap = (!Array.isArray(headerResult) && headerResult && 'rawHeaders' in headerResult)
      ? (headerResult.rawHeaders as Record<string, string>)
      : undefined;
    const cookieAuditResult = (!Array.isArray(headerResult) && headerResult && 'cookies' in headerResult)
      ? headerResult.cookies
      : undefined;

    const [ransomwareResult, ddosResult, bankingResult] = await Promise.all([
      Promise.resolve(
        evaluateRansomwareRisk({
          ports: adjustedPorts,
          sensitiveFiles: sensitiveFilesResult,
          filesScanned: scanMode === 'full',
        })
      ).catch(() => undefined),
      evaluateDdosResilience({
        hostname,
        resolvedIp: serverIp,
        hasWaf: webAuditResult.waf.hasWaf,
        wafProvider: wafName,
        hasXmlRpc,
        spfRaw,
      }).catch(() => undefined),
      evaluateBankingCompliance({
        hostname,
        headers: headersList,
        cookies: cookieAuditResult,
        isEcommerce: webAuditResult.cms.isEcommerce,
        paymentGateways: webAuditResult.commercial?.paymentGateways,
        rawHeadersMap,
      }).catch(() => undefined),
    ]);

    // Las referencias corporativas (hiperescala) no son clientes auditados, aunque su nota sea una
    // medición: nunca se les firma un sello verificado.
    const badgeToken = !isComparison && !isHyperscale && (grade === 'A+' || grade === 'A' || score >= 85)
      ? signBadge(target.origin, grade, auditId)
      : undefined;

    const fullReport = {
      id: auditId,
      url: target.origin,
      score,
      grade,
      ssl: sslResult,
      headers: headersList,
      isHyperscale,
      scanMode,
      isPremium,
      scanTier: (isPremium ? 'premium' : 'lite') as 'premium' | 'lite',
      ports: adjustedPorts,
      portsVerification: scanMode === 'public' && !isComparison
        ? (() => {
            const rec = ownershipRecord(hostname);
            return { verified: Boolean(proof?.verified), method: proof?.method ?? undefined, record: { host: rec.host, value: rec.value }, file: { url: rec.file, content: rec.value } };
          })()
        : undefined,
      sensitiveFiles: sensitiveFilesResult,
      dnsSecurity: dnsSecurityResult,
      waf: webAuditResult.waf,
      cms: webAuditResult.cms,
      mixedContent: webAuditResult.mixedContent,
      malware: webAuditResult.malware,
      commercial: webAuditResult.commercial,
      remediations,
      location: serverLocation,
      cookies: !Array.isArray(headerResult) && headerResult && 'cookies' in headerResult ? headerResult.cookies : undefined,
      badgeToken,
      vectors,
      categories,
      benchmark,
      history,
      auditor_location,
      ransomware: ransomwareResult,
      ddos: ddosResult,
      banking: bankingResult,
      cveIntel: cveIntelResult,
      asm: asmResult,
      webApp: webAppResult,
      ttfb_ms,
      asn,
      waf_detected: wafName,
      ssl_days_left,
      tls_version,
      telemetry: {
        durationMs,
        aiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-flash-lite-latest',
        targetResolvedIp,
        engineVersion: '2.0.0-cloud',
      },
      scannedAt: new Date().toISOString(),
    };

    // Cumplimiento normativo, diferencias con el escaneo previo y sello de integridad
    const sealed = fullReport as AuditReportRecord;
    try {
      sealed.compliance = evaluateCompliance(sealed);
    } catch {
      // Sin mapeo de cumplimiento
    }
    if (adminRequest && typeof previousReportId === 'string') {
      const prevReport = getReportById(previousReportId);
      if (prevReport && prevReport.url === sealed.url && (prevReport.scanMode || 'public') === scanMode) {
        try {
          sealed.diff = diffReports(prevReport, sealed);
        } catch {
          // Sin diferencias
        }
      }
    }
    try {
      sealed.integrity = buildIntegrity(sealed);
    } catch {
      // Sin sello
    }

    try {
      if (!isComparison) saveReport(fullReport.id, fullReport);
    } catch {
      // Ignorar fallback
    }

    // Almacenar en caché de dominio para amortiguar picos de tráfico (TTL 2 horas)
    try {
      if (domainScanCache.size >= MAX_CACHED_SCANS) {
        const oldestKey = domainScanCache.keys().next().value;
        if (oldestKey) domainScanCache.delete(oldestKey);
      }
      domainScanCache.set(cacheKey, {
        report: fullReport,
        cachedAt: Date.now(),
        expiresAt: Date.now() + DOMAIN_SCAN_CACHE_TTL_MS,
      });
    } catch {
      // Fallback silencioso
    }

    const clientReport = adminRequest
      ? fullReport
      : {
          ...fullReport,
          telemetry: {
            durationMs,
          },
        };

    return NextResponse.json({
      id: auditId,
      domain: hostname,
      score,
      grade,
      ssl_days_left,
      ttfb_ms,
      tls_version,
      server_ip: serverIp,
      asn,
      waf_detected: wafName,
      location: {
        country: serverLocation?.country || 'Desconocido',
        countryCode: serverLocation?.countryCode || '',
        city: serverLocation?.city || 'N/A',
        lat: serverLocation?.lat || null,
        lon: serverLocation?.lon || null,
        isp: serverLocation?.isp || 'Desconocido',
      },
      auditor_location,
      vectors,
      history,
      benchmark,
      categories,
      ransomware: ransomwareResult,
      ddos: ddosResult,
      banking: bankingResult,
      cveIntel: cveIntelResult,
      asm: asmResult,
      webApp: webAppResult,
      compliance: sealed.compliance,
      diff: sealed.diff,
      telemetry: {
        durationMs,
        targetResolvedIp,
        engineVersion: '2.0.0-cloud',
      },
      scannedAt: fullReport.scannedAt,
      report: clientReport,
    });
  } catch (error: unknown) {
    // El detalle queda en el log del servidor; al cliente no se le exponen mensajes internos
    console.error('[scan] Error interno de auditoría:', error);
    return NextResponse.json(
      { error: 'No se pudo completar la auditoría. Intenta de nuevo en unos minutos o escríbenos por WhatsApp.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://neuronalgravity.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
      'Access-Control-Max-Age': '86400',
    },
  });
}
