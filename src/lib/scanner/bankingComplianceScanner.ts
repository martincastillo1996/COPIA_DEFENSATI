/**
 * Motor Perimetral de Cumplimiento Bancario, PCI-DSS 4.0 y Prevención de Fraude Financiero
 * DEFENSA TI Enterprise Engine - Standard PCI-DSS v4.0 / OWASP Financial Grade
 * 
 * Evalúa los vectores específicos explotados en el sector bancario, fintech y e-commerce de alto valor:
 * 1. Fuga de Banners y Huella Tecnológica (Server Tokens, X-Powered-By, X-AspNet-Version).
 * 2. Vulnerabilidad a e-Skimming / Magecart (PCI-DSS 4.0 Requisito 6.4.3): Protección CSP en pasarelas de cobro.
 * 3. Misconfiguración CORS (Cross-Origin Resource Sharing): Fuga de tokens de sesión y APIs de pago.
 * 4. Bastionado de Cookies de Sesión (Secure, HttpOnly, SameSite).
 * 5. Registros DNS CAA (Certificate Authority Authorization): Prevención de emisión ilegítima de certificados TLS.
 */

import * as dns from 'dns';
import { CookieScanResult } from '@/lib/scanner/cookieScanner';
import { HeaderCheckItem } from '@/lib/scanner/headerScanner';

export interface ServerLeakItem {
  header: string;
  value: string;
  severity: 'ALTA' | 'MEDIA' | 'BAJA';
  description: string;
  remediation: string;
}

export interface PciDssCheck {
  requirement: string;
  title: string;
  status: 'pass' | 'fail' | 'warning';
  details: string;
  mitreTechnique?: string;
}

export interface BankingComplianceResult {
  score: number; // 0-100 (100 = Máxima conformidad bancaria)
  grade: 'CONFORME_BANCARIO' | 'OBSERVADO_FINTECH' | 'NO_CONFORME';
  serverLeaks: {
    hasLeaks: boolean;
    leakedHeaders: ServerLeakItem[];
  };
  corsAudit: {
    isPermissive: boolean;
    allowsWildcard: boolean;
    credentialsExposed: boolean;
    details: string;
    remediation?: string;
  };
  eSkimmingProtection: {
    hasPaymentGateway: boolean;
    gatewaysDetected: string[];
    cspCompliant: boolean;
    riskLevel: 'BAJO' | 'MEDIO' | 'CRÍTICO';
    details: string;
    remediation?: string;
  };
  caaSecurity: {
    hasCaa: boolean;
    records: string[];
    details: string;
    remediation?: string;
  };
  pciChecks: PciDssCheck[];
  summary: string;
  remediationPlan: string[];
}

export async function evaluateBankingCompliance(params: {
  hostname: string;
  headers: HeaderCheckItem[];
  cookies?: CookieScanResult;
  isEcommerce?: boolean;
  paymentGateways?: string[];
  rawHeadersMap?: Record<string, string>;
}): Promise<BankingComplianceResult> {
  const cleanDomain = params.hostname.replace(/^www\./i, '').toLowerCase();
  let score = 100;
  const pciChecks: PciDssCheck[] = [];
  const remediationPlan: string[] = [];

  // ==========================================
  // 1. FUGA DE BANNERS Y HUELLA TECNOLÓGICA (CWE-200)
  // ==========================================
  const leakedHeaders: ServerLeakItem[] = [];
  const rawMap = params.rawHeadersMap || {};

  // Server Header con versión exacta
  const serverHeader = rawMap['server'] || '';
  if (serverHeader) {
    const hasDetailedVersion = /[0-9]+\.[0-9]+/i.test(serverHeader);
    if (hasDetailedVersion) {
      leakedHeaders.push({
        header: 'Server',
        value: serverHeader,
        severity: 'ALTA',
        description: `El servidor revela su versión exacta (${serverHeader}), permitiendo a atacantes buscar exploits específicos (CVEs).`,
        remediation: 'Ocultar la versión del servidor (Nginx: server_tokens off; Apache: ServerTokens Prod; ServerSignature Off).',
      });
      score -= 10;
    } else if (!serverHeader.toLowerCase().includes('cloudflare') && !serverHeader.toLowerCase().includes('akamai')) {
      leakedHeaders.push({
        header: 'Server',
        value: serverHeader,
        severity: 'BAJA',
        description: `El servidor expone la tecnología base (${serverHeader}). En auditorías bancarias se recomienda suprimir completamente este encabezado.`,
        remediation: 'Eliminar o enmascarar la cabecera Server en el reverse proxy.',
      });
      score -= 3;
    }
  }

  // X-Powered-By
  const poweredBy = rawMap['x-powered-by'] || '';
  if (poweredBy) {
    leakedHeaders.push({
      header: 'X-Powered-By',
      value: poweredBy,
      severity: 'ALTA',
      description: `Cabecera informativa activa que revela el framework o lenguaje subyacente (${poweredBy}).`,
      remediation: 'Desactivar la cabecera X-Powered-By (PHP: expose_php = Off; Express: app.disable("x-powered-by")).',
    });
    score -= 10;
  }

  // X-AspNet-Version / X-Runtime
  const aspNet = rawMap['x-aspnet-version'] || rawMap['x-aspnetmvc-version'] || '';
  if (aspNet) {
    leakedHeaders.push({
      header: 'X-AspNet-Version',
      value: aspNet,
      severity: 'ALTA',
      description: `Fuga de versión exacta de ASP.NET (${aspNet}).`,
      remediation: 'Configurar <httpRuntime enableVersionHeader="false" /> en web.config.',
    });
    score -= 10;
  }

  pciChecks.push({
    requirement: 'PCI-DSS 4.0 - Req 2.2.4',
    title: 'Ocultamiento de Información de Versión del Sistema',
    status: leakedHeaders.some((l) => l.severity === 'ALTA') ? 'fail' : leakedHeaders.length > 0 ? 'warning' : 'pass',
    details: leakedHeaders.length > 0
      ? `Se detectaron ${leakedHeaders.length} cabeceras que revelan tecnología y versiones internas.`
      : 'Banners y firmas de versión de software debidamente suprimidos en la respuesta HTTP.',
    mitreTechnique: 'T1592.002 (Gather Victim Host Information)',
  });

  // ==========================================
  // 2. AUDITORÍA DE CORS (Cross-Origin Resource Sharing)
  // ==========================================
  const acao = rawMap['access-control-allow-origin'] || '';
  const acac = rawMap['access-control-allow-credentials'] || '';

  const allowsWildcard = acao.trim() === '*';
  const credentialsExposed = acac.toLowerCase().includes('true') && (allowsWildcard || acao.includes('null'));
  const isPermissiveCors = allowsWildcard || credentialsExposed;

  let corsDetails = 'Políticas de intercambio entre orígenes (CORS) restringidas o no expuestas públicamente.';
  let corsRemediation: string | undefined;

  if (credentialsExposed) {
    score -= 25;
    corsDetails = 'CRÍTICO: Cabecera CORS permite credenciales (Access-Control-Allow-Credentials: true) combinada con comodín o null. Permite a sitios externos robar sesiones autenticadas.';
    corsRemediation = 'Restringir Access-Control-Allow-Origin a una lista blanca estricta de dominios autorizados y nunca usar "*" con credenciales.';
  } else if (allowsWildcard) {
    score -= 5;
    corsDetails = 'Advertencia: CORS configurado con comodín (*). Aceptable para APIs públicas, pero no recomendado en endpoints bancarios o de usuarios.';
    corsRemediation = 'Definir orígenes específicos autorizados en lugar de comodines en rutas sensibles.';
  }

  pciChecks.push({
    requirement: 'PCI-DSS 4.0 - Req 6.5.8',
    title: 'Seguridad en Políticas de Origen Cruzado (CORS)',
    status: credentialsExposed ? 'fail' : allowsWildcard ? 'warning' : 'pass',
    details: corsDetails,
    mitreTechnique: 'T1557 (Adversary-in-the-Middle)',
  });

  // ==========================================
  // 3. PREVENCIÓN DE E-SKIMMING / MAGECART (PCI-DSS 4.0 Req 6.4.3)
  // ==========================================
  const gateways = params.paymentGateways || [];
  const hasPaymentGateway = gateways.length > 0 || Boolean(params.isEcommerce);
  const cspHeader = params.headers.find((h) => h.header?.toLowerCase() === 'content-security-policy');
  const hasCsp = Boolean(cspHeader && cspHeader.present && cspHeader.status === 'pass');

  let eSkimRisk: 'BAJO' | 'MEDIO' | 'CRÍTICO' = 'BAJO';
  let eSkimDetails = 'Sin pasarelas de pago ni módulos e-commerce expuestos a manipulación en el cliente.';
  let eSkimRemediation: string | undefined;

  if (hasPaymentGateway) {
    if (!hasCsp) {
      eSkimRisk = 'CRÍTICO';
      score -= 30;
      eSkimDetails = `ALERTA DE SEGURIDAD PCI-DSS: El sitio procesa transacciones (${gateways.join(', ') || 'E-commerce'}) pero carece de cabecera Content-Security-Policy (CSP). Vulnerable a ataques de e-Skimming / Magecart donde un script inyectado puede exfiltrar los números de tarjeta de crédito hacia un servidor malicioso en tiempo real.`;
      eSkimRemediation = 'Implementar una directiva Content-Security-Policy estricta con script-src y connect-src limitados únicamente a los dominios autorizados de la pasarela de pagos, conforme al Requisito 6.4.3 de PCI-DSS 4.0.';
    } else {
      eSkimRisk = 'BAJO';
      eSkimDetails = `Pasarelas de cobro (${gateways.join(', ')}) respaldadas por directiva CSP activa, mitigando inyecciones de código malicioso en formularios de checkout.`;
    }
  }

  pciChecks.push({
    requirement: 'PCI-DSS 4.0 - Req 6.4.3 & 11.6.1',
    title: 'Protección contra e-Skimming y Alteración de Checkout (Magecart)',
    status: eSkimRisk === 'CRÍTICO' ? 'fail' : 'pass',
    details: eSkimDetails,
    mitreTechnique: 'T1059.007 (JavaScript Injection / Web Skimming)',
  });

  // ==========================================
  // 4. BASTIONADO DE COOKIES DE SESIÓN
  // ==========================================
  const cookies = params.cookies;
  let cookieStatus: 'pass' | 'fail' | 'warning' = 'pass';
  let cookieDetails = 'Cero cookies transmitidas en la portada o todas cuentan con atributos Secure y HttpOnly.';

  if (cookies && cookies.totalCookies > 0) {
    const nonCompliant = cookies.totalCookies - cookies.compliantCount;
    if (nonCompliant > 0) {
      cookieStatus = nonCompliant > 2 ? 'fail' : 'warning';
      score -= nonCompliant * 5;
      cookieDetails = `${nonCompliant} de ${cookies.totalCookies} cookies carecen de atributos esenciales de seguridad (HttpOnly, Secure o SameSite=Strict/Lax), facilitando el secuestro de sesiones vía XSS o CSRF.`;
      remediationPlan.push('Forzar los atributos "; Secure; HttpOnly; SameSite=Strict" en todas las cookies emitidas por el backend.');
    } else {
      cookieDetails = `Las ${cookies.totalCookies} cookies auditadas cumplen con los estándares de aislamiento de sesión.`;
    }
  }

  pciChecks.push({
    requirement: 'PCI-DSS 4.0 - Req 6.5.10',
    title: 'Gestión y Blindaje de Cookies de Sesión',
    status: cookieStatus,
    details: cookieDetails,
    mitreTechnique: 'T1539 (Steal Web Session Cookie)',
  });

  // ==========================================
  // 5. REGISTROS DNS CAA (Certificate Authority Authorization - RFC 8659)
  // ==========================================
  let caaRecords: string[] = [];
  let hasCaa = false;
  let caaDetails = '';
  let caaRemediation: string | undefined;

  try {
    const rawCaa = await dns.promises.resolveCaa(cleanDomain).catch(() => []);
    if (rawCaa && rawCaa.length > 0) {
      hasCaa = true;
      caaRecords = rawCaa.map((r) => `${r.issue || r.issuewild || 'tag'}`);
      caaDetails = `Registro CAA activo en DNS. Solo las Autoridades Certificadoras autorizadas (${caaRecords.join(', ')}) tienen permiso para emitir certificados SSL para este dominio.`;
    } else {
      hasCaa = false;
      score -= 8;
      caaDetails = 'Sin registro DNS CAA configurado. Cualquier Autoridad Certificadora (CA) en el mundo puede emitir un certificado para este dominio en caso de compromiso o engaño.';
      caaRemediation = 'Agregar un registro DNS de tipo CAA especificando la Autoridad Certificadora oficial (ej. issue "letsencrypt.org" o issue "digicert.com").';
    }
  } catch {
    hasCaa = false;
    caaDetails = 'No se pudo verificar el registro CAA en la zona DNS.';
  }

  pciChecks.push({
    requirement: 'NIST SP 800-52 / RFC 8659',
    title: 'Autorización Estricta de Entidad Certificadora (DNS CAA)',
    status: hasCaa ? 'pass' : 'warning',
    details: caaDetails,
    mitreTechnique: 'T1588.004 (Digital Certificates)',
  });

  // Consolidación de Puntuación y Grado Bancario
  const finalScore = Math.min(100, Math.max(0, score));
  let grade: BankingComplianceResult['grade'] = 'NO_CONFORME';
  if (finalScore >= 85 && !pciChecks.some((c) => c.status === 'fail')) {
    grade = 'CONFORME_BANCARIO';
  } else if (finalScore >= 65) {
    grade = 'OBSERVADO_FINTECH';
  }

  if (leakedHeaders.length > 0) {
    remediationPlan.push(...leakedHeaders.map((l) => l.remediation));
  }
  if (corsRemediation) remediationPlan.push(corsRemediation);
  if (eSkimRemediation) remediationPlan.push(eSkimRemediation);
  if (caaRemediation) remediationPlan.push(caaRemediation);

  if (remediationPlan.length === 0) {
    remediationPlan.push('Mantener auditorías periódicas de cumplimiento y revisión de directivas CSP.');
  }

  let summary = '';
  if (grade === 'CONFORME_BANCARIO') {
    summary = 'ESTÁNDAR BANCARIO VERIFICADO: El sitio cumple con los requisitos perimetrales de mitigación de e-skimming, aislamiento de cookies y supresión de firmas técnicas conforme a PCI-DSS 4.0.';
  } else if (grade === 'OBSERVADO_FINTECH') {
    summary = 'OBSERVACIONES DE CUMPLIMIENTO: Existen debilidades en cabeceras de versión, registros CAA o directivas CSP que deben subsanarse para auditorías formales.';
  } else {
    summary = 'NO CONFORME CON ESTÁNDARES FINANCIEROS: El perímetro presenta brechas críticas en protección transaccional, fuga de software o cookies inseguras.';
  }

  return {
    score: finalScore,
    grade,
    serverLeaks: {
      hasLeaks: leakedHeaders.length > 0,
      leakedHeaders,
    },
    corsAudit: {
      isPermissive: isPermissiveCors,
      allowsWildcard,
      credentialsExposed,
      details: corsDetails,
      remediation: corsRemediation,
    },
    eSkimmingProtection: {
      hasPaymentGateway,
      gatewaysDetected: gateways,
      cspCompliant: hasCsp,
      riskLevel: eSkimRisk,
      details: eSkimDetails,
      remediation: eSkimRemediation,
    },
    caaSecurity: {
      hasCaa,
      records: caaRecords,
      details: caaDetails,
      remediation: caaRemediation,
    },
    pciChecks,
    summary,
    remediationPlan,
  };
}
