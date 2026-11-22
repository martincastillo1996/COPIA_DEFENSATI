import { NextResponse } from 'next/server';
import { getReportById, saveReport } from '@/lib/storage/reportStore';
import { isAdminRequest, hasRole } from '@/lib/security/adminAuth';
import { verifyShare } from '@/lib/audit/share.mjs';
import { evaluateRansomwareRisk } from '@/lib/scanner/ransomwareRiskScanner';
import { evaluateDdosResilience } from '@/lib/scanner/ddosResilienceScanner';
import { evaluateBankingCompliance } from '@/lib/scanner/bankingComplianceScanner';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!id || !UUID_V4_REGEX.test(id)) {
    return NextResponse.json(
      { error: 'Identificador de reporte inválido. Debe ser un UUID v4 canónico.' },
      { status: 400 }
    );
  }

  const report = getReportById(id);

  if (!report) {
    return NextResponse.json(
      { error: 'Reporte perimetral no encontrado o expirado' },
      { status: 404 }
    );
  }

  // Un informe de auditoría completa lleva hallazgos sensibles: solo con sesión del personal o con un enlace firmado vigente.
  // Se responde 404 y no 403 para no confirmar que existe.
  if (report.scanMode === 'full' && !hasRole(request, 'viewer') && !verifyShare(id, new URL(request.url).searchParams.get('t') || '')) {
    return NextResponse.json({ error: 'Reporte perimetral no encontrado o expirado' }, { status: 404 });
  }

  // Enriquecimiento dinámico para reportes persistidos antes de la actualización
  const cleanHostname = (report.url || '').replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  let wasUpdated = false;

  if (!report.ransomware && report.ports) {
    try {
      report.ransomware = evaluateRansomwareRisk({
        ports: report.ports,
        sensitiveFiles: report.sensitiveFiles,
        filesScanned: report.scanMode === 'full',
      });
      wasUpdated = true;
    } catch {
      // Ignorar fallback
    }
  }

  if (!report.ddos) {
    try {
      report.ddos = await evaluateDdosResilience({
        hostname: cleanHostname,
        resolvedIp: report.telemetry?.targetResolvedIp || report.location?.ip,
        hasWaf: Boolean(report.waf?.hasWaf),
        wafProvider: report.waf?.provider,
        hasXmlRpc: report.sensitiveFiles?.findings?.some(f => f.path.includes('xmlrpc') && f.isExposed),
        spfRaw: report.dnsSecurity?.spf?.raw,
      });
      wasUpdated = true;
    } catch {
      // Ignorar fallback
    }
  }

  if (!report.banking) {
    try {
      report.banking = await evaluateBankingCompliance({
        hostname: cleanHostname,
        headers: report.headers || [],
        cookies: report.cookies,
        isEcommerce: report.cms?.isEcommerce,
        paymentGateways: report.commercial?.paymentGateways,
      });
      wasUpdated = true;
    } catch {
      // Ignorar fallback
    }
  }

  if (wasUpdated) {
    try {
      saveReport(id, report);
    } catch {
      // Ignorar
    }
  }

  const adminRequest = isAdminRequest(request);
  const clientReport = adminRequest
    ? report
    : {
        ...report,
        telemetry: report.telemetry
          ? {
              durationMs: report.telemetry.durationMs,
            }
          : undefined,
      };

  return NextResponse.json(clientReport, {
    status: 200,
    headers: {
      // Solo caché del propio navegador: el informe no debe quedar en cachés compartidas/CDN
      'Cache-Control': report.scanMode === 'full' ? 'no-store' : 'private, max-age=60',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
