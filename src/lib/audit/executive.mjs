// Resumen para gerencia: una página, lenguaje de negocio y sin sobrevender.
// Solo reordena lo que el informe ya midió; no añade hallazgos ni suaviza la gravedad.
//
// Regla de honestidad: "sin hallazgos" NUNCA se muestra como "seguro". Si la cobertura es parcial o no hay datos,
// el nivel es "NO CONCLUYENTE" y se dice arriba del todo.

const RANK = /** @type {Record<string, number>} */ ({ 'CRÍTICO': 4, ALTO: 3, MEDIO: 2, BAJO: 1 });
const clip = (/** @type {string} */ s, n) => (String(s || '').length > n ? `${String(s).slice(0, n - 1).trimEnd()}…` : String(s || ''));
const plural = (/** @type {number} */ n, one, many) => `${n} ${n === 1 ? one : many}`;

/** @typedef {'CRÍTICO'|'ALTO'|'MEDIO'|'BAJO'|'SIN HALLAZGOS'|'NO CONCLUYENTE'} Level */

/** @param {any} r informe de buildReport */
export function buildExecutive(r) {
  const c = r.summary.counts;
  const urgent = c['CRÍTICO'] + c.ALTO;
  const engines = r.coverage.engines.length;
  const incomplete = r.coverage.notRun.length > 0;
  const reliability = engines === 0 ? 'sin datos' : incomplete ? 'parcial' : 'completa';
  const proven = r.paths.filter((/** @type {any} */ p) => p.allProven && RANK[p.severity] >= 3);

  /** @type {Level} */
  let level;
  if (c['CRÍTICO'] > 0 || proven.length > 0) level = 'CRÍTICO';
  else if (c.ALTO > 0) level = 'ALTO';
  else if (c.MEDIO > 0) level = 'MEDIO';
  else if (c.BAJO > 0) level = 'BAJO';
  else level = reliability === 'completa' ? 'SIN HALLAZGOS' : 'NO CONCLUYENTE';

  let headline;
  if (level === 'NO CONCLUYENTE') headline = 'No se puede concluir nada todavía: las pruebas no se completaron, así que la ausencia de hallazgos no significa que el sitio esté seguro.';
  else if (level === 'SIN HALLAZGOS') headline = 'Las pruebas automáticas no detectaron hallazgos. Eso no demuestra que no existan fallos, solo que estas pruebas no encontraron ninguno.';
  else if (urgent > 0) headline = `Hay ${plural(urgent, 'hallazgo urgente', 'hallazgos urgentes')} que conviene corregir esta semana${proven.length ? ' y al menos una ruta de ataque comprobada' : ''}.`;
  else headline = `El sitio funciona, pero tiene ${plural(c.MEDIO + c.BAJO, 'punto', 'puntos')} por mejorar; ninguno es urgente.`;

  const priorities = r.findings
    .filter((/** @type {any} */ f) => f.status !== 'accepted')
    .slice(0, 3)
    .map((/** @type {any} */ f) => ({
      title: clip(f.title, 110), severity: f.severity, impact: clip(f.impact, 150),
      action: clip(f.fix || f.defense.h24[0] || f.defense.d7[0] || f.retest, 170), needsValidation: f.needsValidation,
    }));

  const nextSteps = [];
  if (urgent > 0 || r.plan.h24.length) nextSteps.push('Aplicar las correcciones urgentes del plan de 24 horas.');
  nextSteps.push('Cuando esté corregido, pedir un re-test para comprobarlo.');
  if (r.summary.needsValidation > 0) nextSteps.push(`Confirmar a mano ${plural(r.summary.needsValidation, 'hallazgo pendiente', 'hallazgos pendientes')} antes de tratarlos como hechos.`);
  nextSteps.push('Revisar a mano la lógica del negocio (precios, pagos y permisos): las herramientas automáticas no la cubren.');

  return {
    level, reliability, headline,
    numbers: { critical: c['CRÍTICO'], high: c.ALTO, medium: c.MEDIO, low: c.BAJO, toValidate: r.summary.needsValidation, resolved: r.summary.resolved },
    priorities,
    chains: proven.slice(0, 2).map((/** @type {any} */ p) => ({ title: clip(p.title, 100), impact: clip(p.impact, 130) })),
    coverageNote: incomplete ? `Cobertura incompleta: ${r.coverage.notRun.slice(0, 4).map((/** @type {any} */ n) => n.engine).join(', ')}${r.coverage.notRun.length > 4 ? '…' : ''} no se completaron.` : null,
    retestNote: r.coverage.retest ? 'El último trabajo fue un re-test: comprobó lo que estaba abierto y no descubre hallazgos nuevos.' : null,
    nextSteps: nextSteps.slice(0, 4),
    limits: ['Análisis automático: no demuestra la ausencia de fallos y no cubre la lógica del negocio.', 'Un hallazgo "por confirmar" no está probado hasta que una persona lo valide.'],
  };
}

const LEVEL_TEXT = /** @type {Record<string, string>} */ ({
  'CRÍTICO': 'Riesgo crítico', ALTO: 'Riesgo alto', MEDIO: 'Riesgo medio', BAJO: 'Riesgo bajo', 'SIN HALLAZGOS': 'Sin hallazgos', 'NO CONCLUYENTE': 'No concluyente',
});
export const levelText = (/** @type {string} */ l) => LEVEL_TEXT[l] || l;

/** @param {ReturnType<typeof buildExecutive>} x */
export function executiveMarkdown(x) {
  const n = x.numbers;
  const L = ['## Resumen para gerencia', '', `**${levelText(x.level)}** · fiabilidad de las pruebas: ${x.reliability}`, '', x.headline, ''];
  if (x.coverageNote) L.push(`> ${x.coverageNote}`, '');
  if (x.retestNote) L.push(`> ${x.retestNote}`, '');
  L.push(`Críticos ${n.critical} · Altos ${n.high} · Medios ${n.medium} · Bajos ${n.low} · Por confirmar ${n.toValidate} · Corregidos ${n.resolved}`, '');
  if (x.priorities.length) {
    L.push('**Lo primero que hay que atender**', '');
    x.priorities.forEach((p, i) => L.push(`${i + 1}. ${p.title} (${p.severity})${p.needsValidation ? ' · por confirmar' : ''}: ${p.impact} → ${p.action}`));
    L.push('');
  }
  L.push('**Próximos pasos**', '', ...x.nextSteps.map((s) => `- ${s}`), '');
  return L.join('\n');
}
