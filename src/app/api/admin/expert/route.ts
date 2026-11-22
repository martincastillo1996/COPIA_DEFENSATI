import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/security/adminAuth';
import { buildReport, toHtml, toMarkdown, toSummaryHtml } from '@/lib/audit/expert.mjs';
import { logEvent } from '@/lib/audit/store.mjs';

const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

/** GET /api/admin/expert?id=<autorización>&format=json|md|html|resumen (cualquier rol). Cada lectura queda registrada con su autor. */
export async function GET(req: Request) {
  const principal = authenticate(req);
  if (!principal) return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id') || '';
    if (!/^[a-f0-9]{16}$/.test(id)) return NextResponse.json({ error: 'Falta id de autorización.' }, { status: 400, headers });
    const report = buildReport(id);
    const format = url.searchParams.get('format');
    logEvent('report.read', { actor: principal.actor, id, format: format || 'json' });
    // El HTML lleva texto del sitio auditado (escapado): se sirve con CSP que impide scripts
    if (format === 'html' || format === 'resumen') {
      return new NextResponse(format === 'resumen' ? toSummaryHtml(report) : toHtml(report), { headers: { ...headers, 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" } });
    }
    if (format === 'md') return new NextResponse(toMarkdown(report), { headers: { ...headers, 'Content-Type': 'text/markdown; charset=utf-8' } });
    return NextResponse.json(report, { headers });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Informe no disponible.' }, { status: 404, headers });
  }
}
