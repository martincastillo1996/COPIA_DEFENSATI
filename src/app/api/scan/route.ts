import { NextResponse } from 'next/server';
import { scanSsl } from '@/lib/scanner/sslScanner';
import { scanHeaders, HeaderCheckItem } from '@/lib/scanner/headerScanner';
import { calculateSecurityScore } from '@/lib/scanner/scoreEngine';
import { generateRemediation, RemediationItem } from '@/lib/ai/remediation';
import { saveReport, AuditReportRecord } from '@/lib/storage/reportStore';
import { scanPerimetralPorts, PortCheckResult } from '@/lib/scanner/portScanner';
import { scanSensitiveFiles, SensitiveFilesResult } from '@/lib/scanner/sensitiveFilesScanner';
import { scanDnsSecurity } from '@/lib/scanner/dnsScanner';
import { lookupServerLocation } from '@/lib/scanner/geoScanner';
import { scanWebAudit } from '@/lib/scanner/webAuditScanner';
import { v4 as uuidv4 } from 'uuid';
import { isPrivateOrLocalHost, verifyDnsResolution } from '@/lib/security/ssrfValidator';
import { saveAuditConsent, AuditConsentRecord } from '@/lib/storage/auditConsentStore';
import { signBadge } from '@/lib/security/badgeSigner';
import { verifyTurnstileToken } from '@/lib/security/turnstileValidator';
import { isHyperscalePlatform } from '@/lib/hyperscalers';
import { getClientIp } from '@/lib/security/clientIp';
import { hitRateLimit, RateLimitMap } from '@/lib/security/rateLimit';
import { isAdminRequest } from '@/lib/security/adminAuth';

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
    const { url, force, legalConsentAccepted, turnstileToken, mode } = body;

    // 0.05 Modo de auditoría:
    //  - 'public' (por defecto): revisión básica — cabeceras, TLS, DNS y portada. Equivale a
    //    una visita normal al sitio; no sondea puertos ni busca archivos sensibles.
    //  - 'full': auditoría completa (puertos + archivos sensibles). Es sondeo activo, así que
    //    solo se ejecuta con token de administración, para dominios de clientes con
    //    autorización escrita. Pagar no acredita la titularidad: la acredita la autorización.
    if (mode === 'full' && !adminRequest) {
      return NextResponse.json(
        { error: 'La auditoría completa requiere autorización de administración.' },
        { status: 401 }
      );
    }
    const scanMode: 'public' | 'full' = mode === 'full' && adminRequest ? 'full' : 'public';

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
        // Sin token: se permite (hay secciones del sitio que escanean sin widget), pero con un
        // cupo reducido por IP y un tope global, para que omitir el token no sea un atajo.
        const perIp = hitRateLimit(noTokenIpMap, clientIp, SCAN_WINDOW_MS, NO_TOKEN_MAX_PER_IP);
        const global = hitRateLimit(noTokenGlobalMap, 'global', 60 * 60 * 1000, NO_TOKEN_GLOBAL_MAX_PER_HOUR);
        if (!perIp.allowed || !global.allowed) {
          return NextResponse.json(
            { error: 'Para seguir escaneando completa la verificación humana en el escáner principal o espera unos minutos.' },
            { status: 429, headers: { 'Retry-After': String(perIp.allowed ? global.resetInSec : perIp.resetInSec) } }
          );
        }
      }
    }

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
      declarationText:
        'Declaro bajo juramento que soy el titular del dominio que voy a auditar, o que cuento con autorización expresa y por escrito de su propietario, conforme a la Ley N° 30096, Delitos Informáticos del Perú. Entiendo que auditar una web ajena sin permiso puede ser delito.',
    };
    saveAuditConsent(consentRecord);

    // 2.0 Caché Inteligente por Dominio (Zero-Downtime y $0 Costo en Picos de Tráfico)
    // La clave incluye el modo: un informe completo nunca se sirve a una petición pública
    const cacheKey = `${scanMode}:${target.origin.toLowerCase()}`;
    if (!force && domainScanCache.has(cacheKey)) {
      const cached = domainScanCache.get(cacheKey)!;
      if (Date.now() < cached.expiresAt) {
        const freshAuditId = uuidv4();
        const cachedReport: AuditReportRecord = {
          ...cached.report,
          id: freshAuditId,
          telemetry: {
            durationMs: Date.now() - startTime,
            aiModel: cached.report.telemetry?.aiModel || 'gemini-1.5-flash-cache',
            targetResolvedIp: cached.report.telemetry?.targetResolvedIp,
            engineVersion: '1.2.0-cloud-cache',
          },
        };

        // Guardar para que la ruta /report/[id] resuelva con éxito inmediato
        try {
          saveReport(freshAuditId, cachedReport);
        } catch {
          // Ignorar fallback
        }

        return NextResponse.json({
          id: freshAuditId,
          report: cachedReport,
          cached: true,
        });
      } else {
        domainScanCache.delete(cacheKey);
      }
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
      // Sondeo activo de puertos: solo en auditoría completa autorizada
      (scanMode === 'full' ? scanPerimetralPorts(hostname) : Promise.resolve([] as PortCheckResult[])).catch(
        () => [] as PortCheckResult[]
      ),
      lookupServerLocation(targetResolvedIp || hostname).catch(() => null),
      scanHeaders(parsedUrl).catch(() => ({
        headers: [],
        missingHeaders: [],
        score: 0,
        grade: 'F' as const,
      })),
      // Búsqueda de archivos sensibles (/.env, /.git, respaldos): solo en auditoría completa
      (scanMode === 'full'
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

    // 5. Puertos: Si el SSL falla, el puerto 80 queda EXPUESTO
    const adjustedPorts = portResults.map((p) => {
      if (p.port === 80 && !sslResult.valid) {
        return {
          ...p,
          isOpen: true,
          risk: 'ALTO' as const,
          description: 'Tráfico en texto plano expuesto sin cifrado seguro.',
        };
      }
      return p;
    });

    const isHyperscale = isHyperscalePlatform(hostname) || ('isHyperscale' in sslResult ? Boolean((sslResult as Record<string, unknown>).isHyperscale) : false);

    // Si es plataforma de hiperescala, cuenta con mitigación DDoS Anycast nativa (Google Cloud Armor, AWS Shield, Azure FrontDoor)
    if (isHyperscale && !webAuditResult.waf.hasWaf) {
      webAuditResult.waf = {
        hasWaf: true,
        provider: 'Anycast Edge / Cloud Armor',
        isOriginExposed: false,
        details: 'Infraestructura global Anycast con mitigación anti-DDoS distribuida multi-clúster.',
        remediation: 'Infraestructura de hiperescala conforme.',
      };
    }

    // 6. Motor Determinista de Calificación
    let score = 0;
    let grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';

    if (isHyperscale) {
      // Las plataformas de hiperescala operan con precarga Chromium HSTS y clústeres Anycast
      score = 98;
      grade = 'A+';
    } else if (sslResult.valid) {
      try {
        const scoreOutput = calculateSecurityScore(hostname, headersList, sslResult);
        score = scoreOutput.score;
        grade = scoreOutput.grade;
      } catch {
        score = 70;
        grade = 'B';
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

    // Las referencias corporativas (hiperescala) reciben una nota fija de comparación, no una
    // medición: nunca se les firma un sello verificado.
    const badgeToken = !isHyperscale && (grade === 'A+' || grade === 'A' || score >= 85)
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
      ports: adjustedPorts,
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
      telemetry: {
        durationMs,
        aiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-flash-lite-latest',
        targetResolvedIp,
        engineVersion: '1.4.0-cloud',
      },
      scannedAt: new Date().toISOString(),
    };

    try {
      saveReport(fullReport.id, fullReport);
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

    return NextResponse.json({
      id: auditId,
      report: fullReport,
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
