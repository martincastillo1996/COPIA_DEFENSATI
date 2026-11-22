/**
 * Diferencias entre dos informes del mismo dominio (monitoreo continuo / ASM).
 * Responde a la pregunta del SOC: "¿qué cambió desde la última vez?".
 */

import type { AuditReportRecord } from '@/lib/storage/reportStore';

export interface SignatureEntry {
  title: string;
  severity: 'CRÍTICO' | 'ALTO' | 'MEDIO' | 'BAJO';
}

export interface ReportDiff {
  previousId?: string;
  previousScore: number;
  scoreDelta: number;
  newFindings: Array<SignatureEntry & { key: string }>;
  resolvedFindings: Array<SignatureEntry & { key: string }>;
  newSubdomains: string[];
  newHighOrCritical: number;
  summary: string;
}

export function collectSignatures(r: AuditReportRecord): Map<string, SignatureEntry> {
  const out = new Map<string, SignatureEntry>();

  for (const p of r.ports || []) {
    if (p.isOpen && (p.risk === 'CRÍTICO' || p.risk === 'ALTO')) {
      out.set(`port:${p.port}`, { title: `Puerto ${p.port} (${p.shortName || p.service}) abierto`, severity: p.risk });
    }
  }
  for (const f of r.sensitiveFiles?.findings || []) {
    if (f.isExposed) out.set(`file:${f.path}`, { title: `Archivo sensible expuesto: ${f.path}`, severity: 'CRÍTICO' });
  }
  for (const f of r.cveIntel?.findings || []) {
    if (f.severity === 'CRÍTICO' || f.severity === 'ALTO') out.set(`cve:${f.id}`, { title: f.title, severity: f.severity });
  }
  for (const f of r.asm?.findings || []) out.set(`asm:${f.id}`, { title: f.title, severity: f.severity });
  for (const f of r.webApp?.findings || []) out.set(`web:${f.id}`, { title: f.title, severity: f.severity });
  return out;
}

const RANK = { 'CRÍTICO': 4, 'ALTO': 3, 'MEDIO': 2, 'BAJO': 1 } as const;

export function diffReports(previous: AuditReportRecord, current: AuditReportRecord): ReportDiff {
  const prev = collectSignatures(previous);
  const curr = collectSignatures(current);
  // Si uno de los dos no midió puertos, un puerto no es "nuevo" ni "resuelto"
  if (!previous.ports?.length || !current.ports?.length) {
    for (const m of [prev, curr]) for (const k of m.keys()) if (k.startsWith('port:')) m.delete(k);
  }

  const newFindings = [...curr].filter(([k]) => !prev.has(k)).map(([key, v]) => ({ key, ...v }));
  const resolvedFindings = [...prev].filter(([k]) => !curr.has(k)).map(([key, v]) => ({ key, ...v }));
  newFindings.sort((a, b) => RANK[b.severity] - RANK[a.severity]);
  resolvedFindings.sort((a, b) => RANK[b.severity] - RANK[a.severity]);

  const prevSubs = new Set((previous.asm?.subdomains.list || []).map((s) => s.name));
  const newSubdomains = (current.asm?.subdomains.list || []).map((s) => s.name).filter((n) => prevSubs.size > 0 && !prevSubs.has(n));

  const newHighOrCritical = newFindings.filter((f) => RANK[f.severity] >= 3).length;
  const scoreDelta = (current.score ?? 0) - (previous.score ?? 0);

  const parts: string[] = [];
  if (scoreDelta !== 0) parts.push(`Calificación ${scoreDelta > 0 ? '+' : ''}${scoreDelta} (${previous.score} → ${current.score})`);
  if (newFindings.length) parts.push(`${newFindings.length} hallazgo(s) nuevo(s)${newHighOrCritical ? `, ${newHighOrCritical} alto/crítico` : ''}`);
  if (resolvedFindings.length) parts.push(`${resolvedFindings.length} resuelto(s)`);
  if (newSubdomains.length) parts.push(`${newSubdomains.length} subdominio(s) nuevo(s)`);

  return {
    previousId: previous.id,
    previousScore: previous.score,
    scoreDelta,
    newFindings: newFindings.slice(0, 25),
    resolvedFindings: resolvedFindings.slice(0, 25),
    newSubdomains: newSubdomains.slice(0, 25),
    newHighOrCritical,
    summary: parts.length ? parts.join(' · ') : 'Sin cambios respecto al escaneo anterior.',
  };
}
