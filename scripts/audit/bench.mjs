// Banco de pruebas: mide qué detecta tu escáner en un laboratorio vulnerable que tú controlas
// y cuántos hallazgos sobran. Da cifras defendibles, no adjetivos.
//
// truth.json:
// { "lab": "juice-shop",
//   "vulnerabilities": [
//     { "id": "listado-ftp", "class": "exposicion", "match": "listado de directorio.*/ftp",
//       "probe": { "path": "/ftp", "contains": "legal\\.md" } } ],
//   "accepted": ["cabecera", "HSTS"] }   // hallazgos de infraestructura que no cuentan como falsos positivos
//
// class: exposicion (se ve desde fuera sin enviar nada raro), activa (exige pruebas activas: inyección, XSS)
//        o logica (precios, pagos, permisos: ninguna herramienta automática la encuentra sola).
// probe: GET que confirma que la vulnerabilidad existe en TU laboratorio. Si falla, se descarta: la verdad de
//        referencia no se fía de la memoria de nadie. Sin probe no se puede verificar y se marca como tal.
import { pinnedGet } from '../../src/lib/audit/net.mjs';

const text = (f) => `${f.title} ${f.cwe || ''} ${f.evidence || ''}`;
const CLASSES = ['exposicion', 'activa', 'logica'];
const PROBE_PATH = /^\/[A-Za-z0-9_\-./%~]*(\?[A-Za-z0-9_\-./%=&~]*)?$/;

/** Valida el archivo de verdad: identificadores únicos, expresiones válidas y sondas de solo GET. */
export function validateTruth(truth) {
  const ids = new Set();
  if (!truth || !Array.isArray(truth.vulnerabilities) || !truth.vulnerabilities.length) throw new Error('truth.json necesita una lista "vulnerabilities".');
  for (const v of truth.vulnerabilities) {
    if (!v.id || ids.has(v.id)) throw new Error(`Identificador repetido o vacío: ${v.id}`);
    ids.add(v.id);
    try { new RegExp(v.match, 'i'); } catch { throw new Error(`"match" no es una expresión válida en ${v.id}`); }
    if (v.class && !CLASSES.includes(v.class)) throw new Error(`class debe ser ${CLASSES.join(', ')} en ${v.id}`);
    if (v.probe) {
      if (!PROBE_PATH.test(v.probe.path || '')) throw new Error(`La sonda de ${v.id} debe ser una ruta que empiece por "/"`);
      if (v.probe.contains) try { new RegExp(v.probe.contains, 'i'); } catch { throw new Error(`"contains" no es una expresión válida en ${v.id}`); }
    }
  }
  return truth;
}

/**
 * Comprueba contra el laboratorio cada vulnerabilidad que declara una sonda. Solo GET, a una IP ya validada.
 * @returns {{ truth: any, dropped: { id: string, reason: string }[], unverifiable: string[] }}
 */
export async function verifyTruth(truth, { origin, ip, get = pinnedGet, check = () => {} }) {
  validateTruth(truth);
  const kept = [];
  const dropped = [];
  const unverifiable = [];
  for (const v of truth.vulnerabilities) {
    if (!v.probe) { kept.push(v); unverifiable.push(v.id); continue; }
    check();
    try {
      const res = await get(origin + v.probe.path, ip, { maxBytes: 200000 });
      const statusOk = v.probe.status ? res.status === v.probe.status : res.status >= 200 && res.status < 300;
      const bodyOk = v.probe.contains ? new RegExp(v.probe.contains, 'i').test(res.body) : true;
      if (statusOk && bodyOk) kept.push(v);
      else dropped.push({ id: v.id, reason: `GET ${v.probe.path} → ${res.status}${statusOk ? ', sin el contenido esperado' : ''}` });
    } catch (e) {
      dropped.push({ id: v.id, reason: `GET ${v.probe.path} falló: ${e.message}` });
    }
  }
  return { truth: { ...truth, vulnerabilities: kept }, dropped, unverifiable };
}

export function scoreBench(truth, findings, jobs = []) {
  validateTruth(truth);
  const vulns = truth.vulnerabilities.map((v) => {
    const re = new RegExp(v.match, 'i');
    return { id: v.id, cls: v.class || 'exposicion', hits: findings.filter((f) => re.test(text(f))) };
  });
  const detected = vulns.filter((v) => v.hits.length);
  const matched = new Set(detected.flatMap((v) => v.hits.map((f) => f.id)));
  const accepted = (truth.accepted || []).map((a) => new RegExp(a, 'i'));
  const extras = findings.filter((f) => !matched.has(f.id) && !accepted.some((re) => re.test(text(f))));

  const engines = {};
  for (const f of findings) engines[f.engine] ??= { findings: 0, detected: new Set() };
  for (const f of findings) engines[f.engine].findings++;
  for (const v of vulns) for (const f of v.hits) engines[f.engine].detected.add(v.id);

  const byClass = {};
  for (const v of vulns) {
    byClass[v.cls] ??= { total: 0, detected: 0 };
    byClass[v.cls].total++;
    if (v.hits.length) byClass[v.cls].detected++;
  }
  const total = vulns.length;
  const seconds = jobs.filter((j) => j.finished).reduce((s, j) => s + (j.finished - j.created) / 1000, 0);
  return {
    lab: truth.lab, total, detected: detected.length,
    recall: total ? detected.length / total : 0,
    precision: matched.size + extras.length ? matched.size / (matched.size + extras.length) : 1,
    byClass,
    missed: vulns.filter((v) => !v.hits.length).map((v) => ({ id: v.id, class: v.cls })),
    unexplained: extras.map((f) => ({ engine: f.engine, title: f.title, severity: f.severity })),
    byEngine: Object.fromEntries(Object.entries(engines).map(([k, v]) => [k, { findings: v.findings, detected: v.detected.size, recall: total ? v.detected.size / total : 0 }])),
    seconds: Math.round(seconds),
  };
}

const pct = (x) => `${Math.round(x * 100)}%`;
const CLASS_NAME = { exposicion: 'Exposición visible desde fuera', activa: 'Exige pruebas activas', logica: 'Lógica de negocio (no automatizable)' };

export function benchMarkdown(r) {
  const L = [`# Banco de pruebas: ${r.lab}`, '', `- Vulnerabilidades verificadas detectadas: **${r.detected}/${r.total}** (${pct(r.recall)})`,
    `- Precisión (hallazgos explicados / hallazgos): **${pct(r.precision)}**`, `- Tiempo de las corridas: ${r.seconds} s`, '',
    '| Clase | Detectadas | Total |', '|---|---|---|'];
  for (const c of CLASSES) if (r.byClass[c]) L.push(`| ${CLASS_NAME[c]} | ${r.byClass[c].detected} | ${r.byClass[c].total} |`);
  L.push('', '| Motor | Hallazgos | Detecta | Cobertura sola |', '|---|---|---|---|');
  for (const [k, v] of Object.entries(r.byEngine)) L.push(`| ${k} | ${v.findings} | ${v.detected} | ${pct(v.recall)} |`);
  L.push('', `## No detectadas (${r.missed.length})`, '', ...(r.missed.length ? r.missed.map((m) => `- ${m.id} (${CLASS_NAME[m.class] || m.class})`) : ['- Ninguna.']));
  L.push('', `## Hallazgos sin explicar: posibles falsos positivos (${r.unexplained.length})`, '', ...(r.unexplained.length ? r.unexplained.slice(0, 40).map((u) => `- [${u.severity}] ${u.engine}: ${u.title}`) : ['- Ninguno.']), '');
  if (r.dropped?.length) L.push(`## Descartadas: no existen en tu laboratorio (${r.dropped.length})`, '', ...r.dropped.map((d) => `- ${d.id}: ${d.reason}`), '');
  if (r.unverifiable?.length) L.push(`## Sin sonda: no se pudieron verificar (${r.unverifiable.length})`, '', ...r.unverifiable.map((u) => `- ${u}`), '');
  return L.join('\n');
}
