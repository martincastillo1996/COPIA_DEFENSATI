import { IndustrySector, IndustryBenchmark, ResilienceVectors, AuditCategory } from '@/types/security';

/**
 * Benchmarks de referencia para Perú y Latinoamérica (Calibrados 2026)
 */
export const INDUSTRY_BENCHMARKS: Record<IndustrySector, IndustryBenchmark> = {
  banca: {
    industry: 'banca',
    average: 82.5,
    median: 85.0,
    percentile_75: 88.0,
    sample_size: 40,
    updated_at: '2026-11-19T00:00:00Z',
  },
  fintech: {
    industry: 'fintech',
    average: 79.2,
    median: 82.0,
    percentile_75: 86.0,
    sample_size: 35,
    updated_at: '2026-11-19T00:00:00Z',
  },
  retail: {
    industry: 'retail',
    average: 68.4,
    median: 70.0,
    percentile_75: 78.0,
    sample_size: 50,
    updated_at: '2026-11-19T00:00:00Z',
  },
  tecnologia: {
    industry: 'tecnologia',
    average: 74.8,
    median: 75.0,
    percentile_75: 82.0,
    sample_size: 45,
    updated_at: '2026-11-19T00:00:00Z',
  },
  salud: {
    industry: 'salud',
    average: 58.1,
    median: 60.0,
    percentile_75: 70.0,
    sample_size: 35,
    updated_at: '2026-11-19T00:00:00Z',
  },
  educacion: {
    industry: 'educacion',
    average: 52.3,
    median: 50.0,
    percentile_75: 65.0,
    sample_size: 40,
    updated_at: '2026-11-19T00:00:00Z',
  },
  general: {
    industry: 'general',
    average: 67.5,
    median: 68.0,
    percentile_75: 76.0,
    sample_size: 245,
    updated_at: '2026-11-19T00:00:00Z',
  },
};

export function getIndustryBenchmark(industry?: string): IndustryBenchmark {
  if (industry && industry in INDUSTRY_BENCHMARKS) {
    return INDUSTRY_BENCHMARKS[industry as IndustrySector];
  }
  return INDUSTRY_BENCHMARKS.general;
}

/**
 * Determina automáticamente el sector del dominio a partir de su nombre o TLD
 */
export function inferIndustryFromDomain(domain: string): IndustrySector {
  const clean = domain.toLowerCase();
  if (clean.endsWith('.edu.pe') || clean.includes('univ') || clean.includes('colegio') || clean.includes('escuela')) {
    return 'educacion';
  }
  if (clean.includes('banco') || clean.includes('bank') || clean.includes('caja') || clean.includes('financ')) {
    return 'banca';
  }
  if (clean.includes('pay') || clean.includes('plin') || clean.includes('yape') || clean.includes('kambista') || clean.includes('rextie') || clean.includes('culqi')) {
    return 'fintech';
  }
  if (clean.includes('clinica') || clean.includes('salud') || clean.includes('hospital') || clean.includes('farma') || clean.includes('med')) {
    return 'salud';
  }
  if (clean.includes('tienda') || clean.includes('shop') || clean.includes('mall') || clean.includes('plaza') || clean.includes('tottus') || clean.includes('metro') || clean.includes('falabella') || clean.includes('ripley')) {
    return 'retail';
  }
  if (clean.includes('cloud') || clean.includes('tech') || clean.includes('software') || clean.includes('dev') || clean.includes('telecom') || clean.includes('fibra')) {
    return 'tecnologia';
  }
  return 'general';
}

/**
 * Calcula los vectores de resiliencia perimetral (escala 1 a 5)
 */
export function calculateResilienceVectors(params: {
  dmarcPolicy: 'reject' | 'quarantine' | 'none' | 'missing';
  spfPresent: boolean;
  sslValid: boolean;
  tlsVersion: string;
  sslDaysRemaining: number;
  hasHsts: boolean;
  hasCsp: boolean;
  hasXfo: boolean;
  hasXcto: boolean;
  hasWaf: boolean;
}): ResilienceVectors {
  // 1. Anti-Phishing (SPF & DMARC)
  let antiPhishing = 1;
  if (params.dmarcPolicy === 'reject') {
    antiPhishing = 5;
  } else if (params.dmarcPolicy === 'quarantine') {
    antiPhishing = 4;
  } else if (params.dmarcPolicy === 'none') {
    antiPhishing = 3;
  } else if (params.spfPresent) {
    antiPhishing = 2;
  } else {
    antiPhishing = 1;
  }

  // 2. Cifrado Web (SSL, TLS 1.3, HSTS, Vigencia)
  let webEncryption = 1;
  if (params.sslValid) {
    const isTls13 = params.tlsVersion.includes('1.3');
    if (isTls13 && params.hasHsts && params.sslDaysRemaining > 30) {
      webEncryption = 5;
    } else if (params.hasHsts && params.sslDaysRemaining > 15) {
      webEncryption = 4;
    } else if (params.sslDaysRemaining > 30) {
      webEncryption = 3;
    } else {
      webEncryption = 2;
    }
  } else {
    webEncryption = 1;
  }

  // 3. Exposición de Red (Cabeceras OWASP + WAF)
  let networkExposure = 1;
  const headerCount = (params.hasCsp ? 1 : 0) + (params.hasXfo ? 1 : 0) + (params.hasXcto ? 1 : 0);
  if (params.hasWaf && headerCount >= 2) {
    networkExposure = 5;
  } else if (params.hasWaf || headerCount === 3) {
    networkExposure = 4;
  } else if (headerCount === 2) {
    networkExposure = 3;
  } else if (headerCount === 1) {
    networkExposure = 2;
  } else {
    networkExposure = 1;
  }

  return {
    anti_phishing: antiPhishing,
    web_encryption: webEncryption,
    network_exposure: networkExposure,
  };
}

/**
 * Construye las categorías detalladas con snippets de remediación Nginx / Apache / Cloudflare
 */
export function buildAuditCategories(params: {
  headers: {
    hsts?: { present: boolean; status: string; value: string | null };
    csp?: { present: boolean; status: string; value: string | null };
    xfo?: { present: boolean; status: string; value: string | null };
    xcto?: { present: boolean; status: string; value: string | null };
    referrerPolicy?: { present: boolean; status: string; value: string | null };
    permissionsPolicy?: { present: boolean; status: string; value: string | null };
  };
  ssl: {
    valid: boolean;
    protocol: string;
    issuer: string;
    daysRemaining: number;
  };
  dns: {
    spf: { present: boolean; strict: boolean; record?: string };
    dmarc: { present: boolean; policy: 'reject' | 'quarantine' | 'none' | 'missing'; record?: string };
  };
  waf: {
    detected: boolean;
    name: string;
    isOriginExposed: boolean;
  };
}): AuditCategory[] {
  // Criterios de cabeceras
  const hstsPass = Boolean(params.headers.hsts?.present && params.headers.hsts.status === 'pass');
  const cspPass = Boolean(params.headers.csp?.present && params.headers.csp.status === 'pass');
  const xfoPass = Boolean(params.headers.xfo?.present && params.headers.xfo.status === 'pass');
  const xctoPass = Boolean(params.headers.xcto?.present && params.headers.xcto.status === 'pass');
  const rpPass = Boolean(params.headers.referrerPolicy?.present && params.headers.referrerPolicy.status === 'pass');
  const ppPass = Boolean(params.headers.permissionsPolicy?.present && params.headers.permissionsPolicy.status === 'pass');

  const httpHeadersItems = [
    {
      name: 'Strict-Transport-Security (HSTS)',
      status: hstsPass ? ('pass' as const) : ('fail' as const),
      description: hstsPass
        ? 'Activo: Fuerza navegación HTTPS e impide ataques Man-in-the-Middle y SSL-Stripping.'
        : 'Ausente o insuficiente: Permite degradación a conexiones en texto plano HTTP sin cifrar.',
      remediationSnippet: {
        nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
        apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
        cloudflare: 'SSL/TLS > Edge Certificates > HTTP Strict Transport Security (HSTS) > Habilitar (max-age 12 meses + subdominios + preload)',
      },
    },
    {
      name: 'Content-Security-Policy (CSP)',
      status: cspPass ? ('pass' as const) : ('fail' as const),
      description: cspPass
        ? 'Activo: Restringe la ejecución de scripts no autorizados, mitigando ataques XSS.'
        : 'Ausente: Vulnerable a Cross-Site Scripting (XSS) y manipulación de datos en cliente.',
      remediationSnippet: {
        nginx: `add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' https: data:; frame-ancestors 'self';" always;`,
        apache: `Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;"`,
        cloudflare: 'Rules > Transform Rules > Modify Response Header > Add Content-Security-Policy',
      },
    },
    {
      name: 'X-Frame-Options (Anti-Clickjacking)',
      status: xfoPass ? ('pass' as const) : ('fail' as const),
      description: xfoPass
        ? 'Activo: Bloquea incrustación maliciosa en iframes externos.'
        : 'Ausente: Permite incrustación en iframes invisibles para secuestro de clics (Clickjacking).',
      remediationSnippet: {
        nginx: 'add_header X-Frame-Options "SAMEORIGIN" always;',
        apache: 'Header always set X-Frame-Options "SAMEORIGIN"',
        cloudflare: 'Rules > Transform Rules > Modify Response Header > Add X-Frame-Options: SAMEORIGIN',
      },
    },
    {
      name: 'X-Content-Type-Options (MIME Sniffing)',
      status: xctoPass ? ('pass' as const) : ('fail' as const),
      description: xctoPass
        ? 'Activo: Impide que navegadores interpreten tipos MIME ambiguos como scripts ejecutables.'
        : 'Ausente: Expone a ataques de ejecución de contenido disfrazado (MIME confusion).',
      remediationSnippet: {
        nginx: 'add_header X-Content-Type-Options "nosniff" always;',
        apache: 'Header always set X-Content-Type-Options "nosniff"',
        cloudflare: 'Rules > Transform Rules > Modify Response Header > Add X-Content-Type-Options: nosniff',
      },
    },
    {
      name: 'Referrer-Policy',
      status: rpPass ? ('pass' as const) : ('fail' as const),
      description: rpPass
        ? 'Activo: Protege tokens y parámetros sensibles de URL al navegar hacia sitios externos.'
        : 'Ausente o permisivo: Expone rutas privadas de la URL a servidores de terceros.',
      remediationSnippet: {
        nginx: 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
        apache: 'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
        cloudflare: 'Rules > Transform Rules > Modify Response Header > Add Referrer-Policy: strict-origin-when-cross-origin',
      },
    },
    {
      name: 'Permissions-Policy',
      status: ppPass ? ('pass' as const) : ('warning' as const),
      description: ppPass
        ? 'Activo: Deshabilita hardware del usuario no requerido (cámara, micrófono, geolocalización).'
        : 'Opcional / Ausente: No restringe el uso de sensores de hardware del cliente.',
      remediationSnippet: {
        nginx: 'add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;',
        apache: 'Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"',
        cloudflare: 'Rules > Transform Rules > Modify Response Header > Add Permissions-Policy',
      },
    },
  ];

  // Seguridad de Correo
  const dmarcPass = params.dns.dmarc.policy === 'reject' || params.dns.dmarc.policy === 'quarantine';
  const dmarcWarning = params.dns.dmarc.policy === 'none';
  const spfPass = params.dns.spf.present;

  const emailItems = [
    {
      name: 'DMARC (Domain-based Message Authentication)',
      status: dmarcPass ? ('pass' as const) : dmarcWarning ? ('warning' as const) : ('fail' as const),
      description: dmarcPass
        ? `Política activa (${params.dns.dmarc.policy}): Suplantadores rechazados globalmente.`
        : dmarcWarning
        ? 'Modo monitoreo (p=none): Genera informes pero NO bloquea correos falsificados.'
        : 'Ausente: Atacantes pueden suplantar el dominio para enviar phishing a clientes.',
      remediationSnippet: {
        cloudflare: 'DNS Management > Add Record: Type TXT, Name: _dmarc, Value: "v=DMARC1; p=reject; sp=reject; pct=100; rua=mailto:dmarc-rua@tudominio.com"',
        nginx: '# Configurar en servidor DNS autoritativo (BIND, PowerDNS o Cloudflare)',
        apache: '# Configurar en servidor DNS autoritativo (BIND, PowerDNS o Cloudflare)',
      },
    },
    {
      name: 'SPF (Sender Policy Framework)',
      status: spfPass ? ('pass' as const) : ('fail' as const),
      description: spfPass
        ? `Configurado (${params.dns.spf.strict ? '-all estricto' : '~all permisivo'}): Servidores de correo autorizados definidos.`
        : 'Ausente: Cualquier servidor no autorizado puede despachar correo con tu identidad corporativa.',
      remediationSnippet: {
        cloudflare: 'DNS Management > Add Record: Type TXT, Name: @, Value: "v=spf1 include:_spf.google.com ~all"',
        nginx: '# Configurar en servidor DNS autoritativo para tu dominio',
        apache: '# Configurar en servidor DNS autoritativo para tu dominio',
      },
    },
  ];

  // Certificado y Cifrado
  const sslDaysPass = params.ssl.daysRemaining > 30;
  const sslDaysWarning = params.ssl.daysRemaining > 0 && params.ssl.daysRemaining <= 30;
  const isTls13 = params.ssl.protocol.includes('1.3');

  const cryptoItems = [
    {
      name: 'Vigencia de Certificado SSL/TLS',
      status: sslDaysPass ? ('pass' as const) : sslDaysWarning ? ('warning' as const) : ('fail' as const),
      description: params.ssl.valid
        ? `Certificado emitido por ${params.ssl.issuer}. Válido por ${params.ssl.daysRemaining} días.`
        : 'Certificado no válido, expirado o autofirmado.',
      remediationSnippet: {
        nginx: '# Renovar certificado con Certbot:\nsudo certbot renew --nginx',
        apache: '# Renovar certificado con Certbot:\nsudo certbot renew --apache',
        cloudflare: 'SSL/TLS > Edge Certificates > Ensure Universal SSL is Active',
      },
    },
    {
      name: 'Protocolo de Transporte Cifrado',
      status: isTls13 ? ('pass' as const) : params.ssl.protocol.includes('1.2') ? ('warning' as const) : ('fail' as const),
      description: isTls13
        ? 'TLS 1.3 activo: Máxima velocidad de handshake 0-RTT y algoritmos criptográficos modernos.'
        : `Protocolo ${params.ssl.protocol}: Recomendado actualizar a TLS 1.3 para rendimiento y seguridad.`,
      remediationSnippet: {
        nginx: 'ssl_protocols TLSv1.2 TLSv1.3;\nssl_ciphers HIGH:!aNULL:!MD5;\nssl_prefer_server_ciphers on;',
        apache: 'SSLProtocol -all +TLSv1.2 +TLSv1.3\nSSLCipherSuite HIGH:!aNULL:!MD5',
        cloudflare: 'SSL/TLS > Edge Certificates > Minimum TLS Version: 1.2 > TLS 1.3: Enable',
      },
    },
  ];

  // Exposición y WAF
  const wafPass = params.waf.detected;
  const perimeterItems = [
    {
      name: 'Firewall de Aplicaciones Web (WAF)',
      status: wafPass ? ('pass' as const) : ('warning' as const),
      description: wafPass
        ? `Protegido por ${params.waf.name}: Mitigación de inyecciones SQL, botnets y denegación de servicio.`
        : 'Origen expuesto directamente: Sin proxy perimetral de filtrado L7 ni mitigación anti-DDoS activa.',
      remediationSnippet: {
        cloudflare: 'Security > WAF > Managed Rules > Enable Cloudflare Managed Ruleset & OWASP Core Ruleset',
        nginx: '# Instalar ModSecurity + OWASP CRS v3:\napt install libnginx-mod-security2',
        apache: '# Instalar ModSecurity en Apache:\napt install libapache2-mod-security2',
      },
    },
  ];

  return [
    {
      name: `Cabeceras HTTP (${httpHeadersItems.filter((i) => i.status === 'pass').length}/${httpHeadersItems.length})`,
      passed: httpHeadersItems.filter((i) => i.status === 'pass').length,
      total: httpHeadersItems.length,
      items: httpHeadersItems,
    },
    {
      name: `Seguridad de Correo (${emailItems.filter((i) => i.status === 'pass').length}/${emailItems.length})`,
      passed: emailItems.filter((i) => i.status === 'pass').length,
      total: emailItems.length,
      items: emailItems,
    },
    {
      name: `Certificado y Cifrado (${cryptoItems.filter((i) => i.status === 'pass').length}/${cryptoItems.length})`,
      passed: cryptoItems.filter((i) => i.status === 'pass').length,
      total: cryptoItems.length,
      items: cryptoItems,
    },
    {
      name: `Exposición Perimetral y WAF (${perimeterItems.filter((i) => i.status === 'pass').length}/${perimeterItems.length})`,
      passed: perimeterItems.filter((i) => i.status === 'pass').length,
      total: perimeterItems.length,
      items: perimeterItems,
    },
  ];
}

/**
 * Convierte cualquier registro AuditReportRecord a la estructura ScanApiResponse
 */
interface HeaderLike { header?: string; status?: string; present?: boolean; value?: string }

// Acepta informes persistidos de versiones anteriores con forma heterogénea.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toScanApiResponse(report: any, auditId?: string): import('@/types/security').ScanApiResponse {
  const cleanDomain = (report.url || 'tudominio.com').replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
  const detectedSector = report.benchmark?.industry || inferIndustryFromDomain(cleanDomain);
  const benchmark = report.benchmark || getIndustryBenchmark(detectedSector);

  const ssl_days_left = report.ssl_days_left ?? (report.ssl?.daysRemaining || 0);
  const tls_version = report.tls_version || (report.ssl?.protocol || 'N/D');
  const waf_detected = report.waf_detected || (report.waf?.hasWaf ? (report.waf.provider || 'WAF Activo') : 'Ninguno');
  const server_ip = report.server_ip || report.telemetry?.targetResolvedIp || report.location?.ip || 'N/D';
  const asn = report.asn || report.location?.as || (report.location?.isp ? `AS - ${report.location.isp}` : 'AS Desconocido');
  const ttfb_ms = report.ttfb_ms ?? null;

  const vectors: ResilienceVectors = report.vectors || calculateResilienceVectors({
    dmarcPolicy: report.dnsSecurity?.dmarc?.policy || 'missing',
    spfPresent: Boolean(report.dnsSecurity?.spf?.present),
    sslValid: Boolean(report.ssl?.valid),
    tlsVersion: tls_version,
    sslDaysRemaining: ssl_days_left,
    hasHsts: Boolean(report.headers?.some((h: HeaderLike) => h.header?.toLowerCase() === 'strict-transport-security' && h.status === 'pass')),
    hasCsp: Boolean(report.headers?.some((h: HeaderLike) => h.header?.toLowerCase() === 'content-security-policy' && h.status === 'pass')),
    hasXfo: Boolean(report.headers?.some((h: HeaderLike) => h.header?.toLowerCase() === 'x-frame-options' && h.status === 'pass')),
    hasXcto: Boolean(report.headers?.some((h: HeaderLike) => h.header?.toLowerCase() === 'x-content-type-options' && h.status === 'pass')),
    hasWaf: Boolean(report.waf?.hasWaf),
  });

  const categories: AuditCategory[] = (report.categories && report.categories.length > 0)
    ? report.categories
    : buildAuditCategories({
        headers: {
          hsts: report.headers?.find((h: HeaderLike) => h.header?.toLowerCase() === 'strict-transport-security'),
          csp: report.headers?.find((h: HeaderLike) => h.header?.toLowerCase() === 'content-security-policy'),
          xfo: report.headers?.find((h: HeaderLike) => h.header?.toLowerCase() === 'x-frame-options'),
          xcto: report.headers?.find((h: HeaderLike) => h.header?.toLowerCase() === 'x-content-type-options'),
          referrerPolicy: report.headers?.find((h: HeaderLike) => h.header?.toLowerCase() === 'referrer-policy'),
          permissionsPolicy: report.headers?.find((h: HeaderLike) => h.header?.toLowerCase() === 'permissions-policy'),
        },
        ssl: {
          valid: Boolean(report.ssl?.valid),
          protocol: tls_version,
          issuer: report.ssl?.issuer || 'Desconocido',
          daysRemaining: ssl_days_left,
        },
        dns: {
          spf: {
            present: Boolean(report.dnsSecurity?.spf?.present),
            strict: Boolean(report.dnsSecurity?.spf?.strict),
            record: report.dnsSecurity?.spf?.raw,
          },
          dmarc: {
            present: Boolean(report.dnsSecurity?.dmarc?.present),
            policy: report.dnsSecurity?.dmarc?.policy || 'missing',
            record: report.dnsSecurity?.dmarc?.raw,
          },
        },
        waf: {
          detected: Boolean(report.waf?.hasWaf),
          name: waf_detected,
          isOriginExposed: Boolean(report.waf?.isOriginExposed),
        },
      });

  // Los informes antiguos guardaron un historial sintético ("Hace 30d"): se descarta
  const history = ((report.history || []) as { date: string; score: number }[]).filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.date));

  return {
    id: auditId || report.id || 'scan-preview',
    domain: cleanDomain,
    score: report.score,
    grade: report.grade,
    ssl_days_left,
    ttfb_ms,
    tls_version,
    server_ip,
    asn,
    waf_detected,
    location: {
      country: report.location?.country || 'Desconocido',
      countryCode: report.location?.countryCode || '',
      city: report.location?.city || 'N/A',
      lat: report.location?.lat || null,
      lon: report.location?.lon || null,
      isp: report.location?.isp || 'Desconocido',
    },
    auditor_location: report.auditor_location ?? null,
    vectors,
    history,
    benchmark,
    categories,
    ransomware: report.ransomware,
    ddos: report.ddos,
    banking: report.banking,
    telemetry: {
      durationMs: report.telemetry?.durationMs || 0,
      targetResolvedIp: server_ip,
      engineVersion: '2.0.0-saas',
    },
    scannedAt: report.scannedAt || new Date().toISOString(),
  };
}
