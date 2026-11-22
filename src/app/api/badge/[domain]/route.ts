import { NextResponse } from 'next/server';
import { getReportById, getReportByDomain } from '@/lib/storage/reportStore';
import { normalizeDomain, verifyBadgeToken, VERIFIED_CLIENT_DOMAINS } from '@/lib/security/badgeSigner';
import { isHyperscalePlatform } from '@/lib/hyperscalers';

const stripWww = (d: string) => d.replace(/^www\./, '');

interface RouteContext {
  params: Promise<{ domain: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { domain } = await context.params;
  const cleanDomain = normalizeDomain(domain || 'sitio-desconocido');

  const { searchParams } = new URL(request.url);
  const auditId = searchParams.get('auditId') || searchParams.get('id') || '';
  const token = searchParams.get('token') || '';
  const format = searchParams.get('format') || 'svg';

  let status: 'verified' | 'at_risk' | 'unverified' = 'unverified';
  let badgeGrade: string = 'A';

  // 1. Verificación en lista blanca oficial de clientes blindados o dominios de la empresa
  if (VERIFIED_CLIENT_DOMAINS.has(cleanDomain)) {
    status = 'verified';
    badgeGrade = 'A';
  }

  // Las grandes corporaciones de referencia (hiperescala) no son clientes auditados:
  // nunca obtienen sello por token ni por informes almacenados.
  const isReferenceGiant = isHyperscalePlatform(cleanDomain);

  // 2. Verificación criptográfica mediante token firmado HMAC-SHA256
  if (status === 'unverified' && !isReferenceGiant && token && auditId) {
    if (verifyBadgeToken(cleanDomain, 'A', auditId, token) || verifyBadgeToken(cleanDomain, 'A+', auditId, token)) {
      status = 'verified';
      badgeGrade = 'A';
    }
  }

  // 3. Verificación contra el almacén de reportes por auditId directo
  if (status === 'unverified' && !isReferenceGiant && auditId) {
    const report = getReportById(auditId);
    // Un informe de auditoría completa es del cliente: no certifica ni desacredita en público
    if (report && !report.isHyperscale && report.scanMode !== 'full') {
      const repDomain = normalizeDomain(report.url);
      // Dominio exacto (solo se ignora "www."): un informe ajeno no certifica a otro host
      if (stripWww(repDomain) === stripWww(cleanDomain)) {
        if (report.grade === 'A+' || report.grade === 'A' || report.score >= 85) {
          status = 'verified';
          badgeGrade = report.grade || 'A';
        } else {
          status = 'at_risk';
          badgeGrade = report.grade || 'F';
        }
      }
    }
  }

  // 4. Verificación retrospectiva contra el almacén en memoria por nombre de dominio
  if (status === 'unverified' && !isReferenceGiant) {
    const domainReport = getReportByDomain(cleanDomain);
    if (domainReport && !domainReport.isHyperscale && domainReport.scanMode !== 'full') {
      if (domainReport.grade === 'A+' || domainReport.grade === 'A' || domainReport.score >= 85) {
        status = 'verified';
        badgeGrade = domainReport.grade || 'A';
      } else {
        status = 'at_risk';
        badgeGrade = domainReport.grade || 'F';
      }
    }
  }

  // Si se solicita en formato JSON
  if (format === 'json') {
    return NextResponse.json({
      domain: cleanDomain,
      status,
      grade: status === 'verified' ? badgeGrade : (status === 'at_risk' ? badgeGrade : null),
      isVerified: status === 'verified',
      verifiedAt: status === 'verified' ? new Date().toISOString() : null,
      verificationMethod: status === 'verified' ? (token ? 'cryptographic-token' : 'report-store') : 'none',
    }, {
      headers: {
        'Cache-Control': status === 'verified' ? 'public, max-age=3600' : 'no-store',
        'X-DefensaTI-Verified': String(status === 'verified'),
      }
    });
  }

  // 5. Renderizado de Sello en SVG según estado de verificación
  let svg = '';

  if (status === 'verified') {
    // Sello Oficial de Grado A (Solo para sitios legítimamente auditados y aprobados)
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="42" viewBox="0 0 280 42" fill="none">
  <defs>
    <linearGradient id="bg_grad_v" x1="0" y1="0" x2="280" y2="42" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0a0d14"/>
      <stop offset="1" stop-color="#121824"/>
    </linearGradient>
    <linearGradient id="border_grad_v" x1="0" y1="0" x2="280" y2="42" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0071e3"/>
      <stop offset="0.5" stop-color="#7928ca"/>
      <stop offset="1" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>

  <!-- Fondo Dark Glass -->
  <rect x="1" y="1" width="278" height="40" rx="8" fill="url(#bg_grad_v)" stroke="url(#border_grad_v)" stroke-width="1.5"/>

  <!-- Icono Escudo Perimetral -->
  <g transform="translate(14, 11)">
    <path d="M10 2L3 5.5V11C3 15.5 6 19.5 10 21C14 19.5 17 15.5 17 11V5.5L10 2Z" fill="#0071e3" fill-opacity="0.25" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.5 11.5L9.2 13.2L12.8 9.5" stroke="#30d158" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Textos de Certificación -->
  <text x="40" y="17" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" letter-spacing="1">DEFENSA TI &bull; BLINDAJE WEB</text>
  <text x="40" y="30" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700">GRADO ${badgeGrade} VERIFICADO</text>

  <!-- Tag de Certificación -->
  <rect x="206" y="11" width="60" height="20" rx="5" fill="#30d158" fill-opacity="0.15" stroke="#30d158" stroke-width="1"/>
  <text x="236" y="24" fill="#30d158" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9.5" font-weight="800" text-anchor="middle">ACTIVO</text>
</svg>`;
  } else if (status === 'at_risk') {
    // Sello de Dominio Auditado pero con Vulnerabilidades / Calificación Baja
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="42" viewBox="0 0 280 42" fill="none">
  <defs>
    <linearGradient id="bg_grad_r" x1="0" y1="0" x2="280" y2="42" gradientUnits="userSpaceOnUse">
      <stop stop-color="#140c0f"/>
      <stop offset="1" stop-color="#1c1014"/>
    </linearGradient>
  </defs>

  <rect x="1" y="1" width="278" height="40" rx="8" fill="url(#bg_grad_r)" stroke="#f43f5e" stroke-width="1.5"/>

  <!-- Icono Alerta -->
  <g transform="translate(14, 11)">
    <path d="M10 2L3 5.5V11C3 15.5 6 19.5 10 21C14 19.5 17 15.5 17 11V5.5L10 2Z" fill="#e11d48" fill-opacity="0.2" stroke="#f43f5e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 8V12M10 15H10.01" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <text x="40" y="17" fill="#fb7185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" letter-spacing="1">DEFENSA TI &bull; DIAGNÓSTICO WEB</text>
  <text x="40" y="30" fill="#fff1f2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700">CALIFICACIÓN: GRADO ${badgeGrade}</text>

  <rect x="194" y="11" width="72" height="20" rx="5" fill="#e11d48" fill-opacity="0.2" stroke="#f43f5e" stroke-width="1"/>
  <text x="230" y="24" fill="#fb7185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="800" text-anchor="middle">EN RIESGO</text>
</svg>`;
  } else {
    // Sello para Sitio No Auditado / Sin Verificación (Protege el valor de marca ante incrustaciones fraudulentas)
    svg = `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="42" viewBox="0 0 280 42" fill="none">
  <defs>
    <linearGradient id="bg_grad_u" x1="0" y1="0" x2="280" y2="42" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0b0f17"/>
      <stop offset="1" stop-color="#111622"/>
    </linearGradient>
  </defs>

  <rect x="1" y="1" width="278" height="40" rx="8" fill="url(#bg_grad_u)" stroke="#334155" stroke-width="1.5"/>

  <!-- Icono Escudo Sin Verificar -->
  <g transform="translate(14, 11)">
    <path d="M10 2L3 5.5V11C3 15.5 6 19.5 10 21C14 19.5 17 15.5 17 11V5.5L10 2Z" fill="#334155" fill-opacity="0.2" stroke="#64748b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="10" cy="11.5" r="1.5" fill="#94a3b8"/>
  </g>

  <text x="40" y="17" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="600" letter-spacing="1">DEFENSA TI &bull; ESTADO WEB</text>
  <text x="40" y="30" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600">DOMINIO NO AUDITADO</text>

  <rect x="186" y="11" width="80" height="20" rx="5" fill="#334155" fill-opacity="0.25" stroke="#475569" stroke-width="1"/>
  <text x="226" y="24" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="9" font-weight="700" text-anchor="middle">SIN AUDITAR</text>
</svg>`;
  }

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': status === 'verified'
        ? 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
        : 'public, max-age=300, s-maxage=600',
      'X-Content-Type-Options': 'nosniff',
      'X-DefensaTI-Verified': String(status === 'verified'),
      'X-DefensaTI-Status': status,
    },
  });
}
