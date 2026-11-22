import { NextResponse } from 'next/server';
import { getReportById } from '@/lib/storage/reportStore';
import { toSarif, toJsonExport } from '@/lib/scanner/reportExport';
import { hasRole } from '@/lib/security/adminAuth';
import { verifyShare } from '@/lib/audit/share.mjs';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** GET /api/report/<id>/export?format=sarif|json — descarga para SIEM y pipelines DevSecOps. */
export async function GET(req: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400 });
  }
  const report = getReportById(id);
  if (!report) return NextResponse.json({ error: 'Informe no encontrado.' }, { status: 404 });
  // Igual que el informe: el de auditoría completa solo con sesión del personal o enlace firmado
  if (report.scanMode === 'full' && !hasRole(req, 'viewer') && !verifyShare(id, new URL(req.url).searchParams.get('t') || '')) {
    return NextResponse.json({ error: 'Informe no encontrado.' }, { status: 404 });
  }

  const format = new URL(req.url).searchParams.get('format') === 'sarif' ? 'sarif' : 'json';
  const body = format === 'sarif' ? toSarif(report) : toJsonExport(report);
  const host = (report.url || 'informe').replace(/^https?:\/\//, '').replace(/[^a-z0-9.-]/gi, '_');

  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      'Content-Type': format === 'sarif' ? 'application/sarif+json; charset=utf-8' : 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="defensati-${host}-${id.slice(0, 8)}.${format === 'sarif' ? 'sarif' : 'json'}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
