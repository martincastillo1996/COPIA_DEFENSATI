import { NextResponse } from 'next/server';
import { authenticate, allows } from '@/lib/security/adminAuth';
import { authorizeFull } from '@/lib/audit/authorization.mjs';
import { planRetest } from '@/lib/audit/retest.mjs';
import { cleanHost, db, enqueue, getJob } from '@/lib/audit/store.mjs';

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** GET /api/admin/jobs[?id=]: estado y progreso para consulta periódica (cualquier rol). */
export async function GET(req: Request) {
  if (!authenticate(req)) return json({ error: 'No autorizado.' }, 401);
  try {
    const id = new URL(req.url).searchParams.get('id');
    if (!id) return json({ jobs: db().prepare('SELECT id,host,status,progress,step,created,finished FROM jobs ORDER BY created DESC LIMIT 50').all() });
    const job = getJob(id);
    return job ? json({ job }) : json({ error: 'Trabajo no encontrado.' }, 404);
  } catch (err) {
    console.error('[jobs]', err);
    return json({ error: 'Cola no disponible.' }, 503);
  }
}

/** POST { host, retest? }: encola una auditoría completa autorizada, o solo el re-test de lo abierto (analista o admin). */
export async function POST(req: Request) {
  const principal = authenticate(req);
  if (!principal) return json({ error: 'No autorizado.' }, 401);
  if (!allows(principal, 'analyst')) return json({ error: 'Tu rol solo permite leer.' }, 403);
  try {
    const body = await req.json();
    const host = cleanHost(body?.host);
    const engagement = await authorizeFull(host);
    if (body?.retest === true) {
      const plan = planRetest(engagement.id, host);
      return json({ id: enqueue(engagement.id, host, 'queued', { only: plan.engines, ports: plan.ports, actor: principal.actor }), plan }, 202);
    }
    return json({ id: enqueue(engagement.id, host, 'queued', { actor: principal.actor }) }, 202);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'No se pudo encolar.' }, 400);
  }
}
