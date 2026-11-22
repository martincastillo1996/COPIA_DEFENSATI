import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { clientView } from '@/lib/audit/portal.mjs';
import RetestButton from './RetestButton';

// El token va en la URL: sin indexar y sin enviarlo como Referer a otros sitios
export const metadata: Metadata = {
  title: 'Estado de seguridad',
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
};

const SEV: Record<string, string> = {
  'CRÍTICO': 'border-rose-500 text-rose-300',
  ALTO: 'border-orange-500 text-orange-300',
  MEDIO: 'border-amber-500 text-amber-300',
  BAJO: 'border-sky-500 text-sky-300',
};
const STATE: Record<string, string> = { comprobado: 'Comprobado', 'por validar': 'Por validar', supuesto: 'Supuesto, no probado' };
const day = (t: number) => new Date(t - 5 * 3600000).toISOString().slice(0, 10);

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  let view: ReturnType<typeof clientView> = null;
  try { view = clientView(token); } catch { view = null; }
  if (!view) notFound();

  const { engagement: e, summary: s } = view;
  const counts = s.counts as Record<string, number>;
  const job = view.lastJob;

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl space-y-10 px-4 py-10 text-[#EDEDED]">
      <header className="space-y-1 border-b border-white/10 pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-neutral-400">DEFENSA TI · estado de seguridad</p>
        <h1 className="text-3xl font-bold">{e.domain}</h1>
        <p className="text-sm text-neutral-400">{e.client} · ventana de pruebas {day(e.starts)} a {day(e.ends)}</p>
      </header>

      <section aria-label="Resumen" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['CRÍTICO', 'ALTO', 'MEDIO', 'BAJO'] as const).map((k) => (
          <div key={k} className={`border-l-4 bg-white/[0.03] p-4 ${SEV[k]}`}>
            <p className="text-3xl font-bold">{counts[k] ?? 0}</p>
            <p className="text-xs uppercase tracking-wider">{k}</p>
          </div>
        ))}
      </section>
      <p className="text-sm text-neutral-400">
        {s.needsValidation} hallazgo(s) todavía por confirmar por nuestro equipo · {s.resolved} corregido(s) y verificado(s).
      </p>

      <section className="space-y-3 border border-white/10 p-5">
        <h2 className="text-lg font-semibold">Volver a probar</h2>
        {job && (
          <p className="text-sm text-neutral-300">
            Última corrida: {job.status === 'running' ? `en curso (${job.progress}%${job.step ? `, ${job.step}` : ''})` : job.status === 'queued' ? 'en cola' : job.status === 'done' ? 'completa' : 'parcial o con errores'}
            {job.retest ? ' (re-test)' : ''} · {new Date(job.at).toLocaleString('es-PE', { timeZone: 'America/Lima' })}
          </p>
        )}
        <RetestButton token={token} disabled={!view.canRetest} />
        {!view.canRetest && <p className="text-sm text-neutral-400">El re-test solo está disponible durante la ventana de pruebas autorizada.</p>}
        {view.notRun.length > 0 && (
          <p className="text-sm text-amber-300">Pruebas que no se completaron: {view.notRun.map((n: { engine: string }) => n.engine).join(', ')}.</p>
        )}
      </section>

      {view.plan.h24.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Qué hacer primero (24 horas)</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            {view.plan.h24.slice(0, 8).map((a: { action: string; covers: number }) => (
              <li key={a.action}>{a.action}{a.covers > 1 ? <span className="text-neutral-400"> (resuelve {a.covers} hallazgos)</span> : null}</li>
            ))}
          </ol>
        </section>
      )}

      {view.paths.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Cómo podrían atacarte</h2>
          {view.paths.map((p: { id: string; title: string; severity: string; impact: string; allProven: boolean; steps: { text: string; state: string }[] }) => (
            <article key={p.id} className={`space-y-2 border-l-4 bg-white/[0.03] p-4 ${SEV[p.severity]}`}>
              <h3 className="font-semibold text-[#EDEDED]">{p.title}</h3>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-neutral-200">
                {p.steps.map((st, i) => (
                  <li key={i}>{st.text} <span className="text-xs text-neutral-400">({STATE[st.state] || st.state})</span></li>
                ))}
              </ol>
              <p className="text-sm text-neutral-300">Impacto: {p.impact}</p>
            </article>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Hallazgos ({view.findings.length})</h2>
        {view.findings.map((f: { id: string; title: string; severity: string; confidence: string; needsValidation: boolean; attack: string; impact: string; fix?: string; retest: string; evidence?: string; mitre: string[]; host: string }) => (
          <details key={f.id} className={`border-l-4 bg-white/[0.03] p-4 ${SEV[f.severity]}`}>
            <summary className="cursor-pointer text-[#EDEDED]">
              <span className="font-mono text-xs">[{f.severity}]</span> {f.title}
              {f.needsValidation && <span className="ml-2 text-xs text-neutral-400">(por confirmar)</span>}
            </summary>
            <div className="mt-3 space-y-2 text-sm text-neutral-200">
              <p><strong>Cómo se ataca:</strong> {f.attack}</p>
              <p><strong>Impacto:</strong> {f.impact}</p>
              {f.evidence && <p><strong>Evidencia:</strong> <code className="break-all bg-white/10 px-1">{f.evidence}</code></p>}
              {f.fix && <p><strong>Corrección:</strong> {f.fix}</p>}
              <p><strong>Cómo comprobar que quedó corregido:</strong> {f.retest}</p>
              <p className="text-xs text-neutral-400">{f.host} · MITRE ATT&amp;CK {f.mitre.join(', ')}</p>
            </div>
          </details>
        ))}
      </section>

      {view.snippets.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Correcciones listas para pegar</h2>
          <p className="text-sm text-neutral-400">Adáptalas a tu entorno y pruébalas primero en staging.</p>
          {view.snippets.map((sn: { rule: string; name: string; items: { label: string; code: string }[] }) => (
            <details key={sn.rule} className="border border-white/10 p-4">
              <summary className="cursor-pointer">{sn.name}</summary>
              {sn.items.map((it) => (
                <div key={it.label} className="mt-3">
                  <p className="text-xs uppercase tracking-wider text-neutral-400">{it.label}</p>
                  <pre className="overflow-x-auto bg-black/60 p-3 text-xs"><code>{it.code}</code></pre>
                </div>
              ))}
            </details>
          ))}
        </section>
      )}

      <footer className="border-t border-white/10 pt-6 text-xs text-neutral-500">
        Este análisis automático no cubre la lógica de tu negocio ni demuestra la ausencia de fallos. No compartas este enlace: da acceso a tu informe.
      </footer>
    </main>
  );
}
