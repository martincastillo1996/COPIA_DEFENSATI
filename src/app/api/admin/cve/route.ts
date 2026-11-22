import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/security/adminAuth';
import { scanCveIntel } from '@/lib/scanner/cveIntelScanner';

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * POST { technologies: [{ product, version, label?, evidence?, distroPatched? }] }
 * Cruza servicios con versión (de nmap) con la base local, NVD, KEV y EPSS.
 * A los servicios externos solo salen producto y versión, nunca el dominio.
 */
export async function POST(req: Request) {
  if (!isAdminRequest(req)) return json({ error: 'No autorizado.' }, 401);
  try {
    const body = await req.json();
    const list: unknown[] = Array.isArray(body?.technologies) ? body.technologies.slice(0, 40) : [];
    const extra = list.flatMap((t) => {
      const x = t as Record<string, unknown>;
      const product = String(x.product ?? '');
      const version = String(x.version ?? '');
      if (!/^[a-z0-9_-]{1,30}$/.test(product) || !/^[0-9][0-9a-z._~+-]{0,30}$/i.test(version)) return [];
      return [{ product, version, label: String(x.label ?? product).slice(0, 60), evidence: String(x.evidence ?? '').slice(0, 120), distroPatched: Boolean(x.distroPatched) }];
    });
    if (!extra.length) return json({ error: 'Sin servicios válidos.' }, 400);
    const result = await scanCveIntel({ extra });
    return json({ findings: result.findings, sources: result.sources, complete: result.sources.nvd });
  } catch (err) {
    console.error('[admin/cve]', err);
    return json({ error: 'No se pudo consultar.' }, 500);
  }
}
