import { NextResponse } from 'next/server';
import { getReportById } from '@/lib/storage/reportStore';
import { verifyIntegrity } from '@/lib/security/reportIntegrity';

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Verificación pública del sello de integridad de un informe (no expone su contenido). */
export async function GET(_req: Request, context: RouteContext) {
  const { id } = await context.params;
  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400 });
  }
  const report = getReportById(id);
  if (!report) return NextResponse.json({ error: 'Informe no encontrado.' }, { status: 404 });

  const check = verifyIntegrity(report);
  return NextResponse.json({
    id,
    valid: check.valid,
    reason: check.reason,
    signedAt: report.integrity?.signedAt,
    contentHash: report.integrity?.contentHash,
    algorithm: report.integrity?.algorithm,
  });
}
