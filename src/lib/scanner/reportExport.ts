/**
 * Exportación del informe a formatos de intercambio:
 *  - SARIF 2.1.0 (GitHub code scanning, Azure DevOps, DefectDojo, SIEM).
 *  - JSON plano de hallazgos normalizados (Splunk, Elastic, QRadar, Sentinel).
 */

import type { AuditReportRecord } from '@/lib/storage/reportStore';

export interface NormalizedFinding {
  id: string;
  source: 'cve' | 'asm' | 'webapp' | 'puertos' | 'archivos';
  title: string;
  severity: 'CRÍTICO' | 'ALTO' | 'MEDIO' | 'BAJO';
  confidence: string;
  cves: string[];
  cvss?: number;
  epss?: number;
  kev?: boolean;
  attackVector?: string;
  mitigation?: string;
  evidence?: string;
}

export function normalizeFindings(r: AuditReportRecord): NormalizedFinding[] {
  const out: NormalizedFinding[] = [];
  for (const f of r.cveIntel?.findings || []) {
    out.push({ id: f.id, source: 'cve', title: f.title, severity: f.severity, confidence: f.confidence, cves: f.cves, cvss: f.cvss, epss: f.epss, kev: f.kev, attackVector: f.attackVector, mitigation: f.mitigation, evidence: f.detectedVersion ? `${f.product} ${f.detectedVersion}` : f.product });
  }
  for (const f of r.asm?.findings || []) {
    out.push({ id: f.id, source: 'asm', title: f.title, severity: f.severity, confidence: f.confidence, cves: [], attackVector: f.attackVector, mitigation: f.mitigation, evidence: f.evidence });
  }
  for (const f of r.webApp?.findings || []) {
    out.push({ id: f.id, source: 'webapp', title: f.title, severity: f.severity, confidence: f.confidence, cves: (f.title.match(/CVE-\d{4}-\d{4,}/g) || []), attackVector: f.attackVector, mitigation: f.mitigation, evidence: f.evidence });
  }
  for (const p of r.ports || []) {
    if (p.isOpen && (p.risk === 'CRÍTICO' || p.risk === 'ALTO')) {
      out.push({ id: `port-${p.port}`, source: 'puertos', title: `Puerto ${p.port} (${p.service}) expuesto`, severity: p.risk, confidence: 'confirmado', cves: [], mitigation: p.description, evidence: p.banner });
    }
  }
  for (const f of r.sensitiveFiles?.findings || []) {
    if (f.isExposed) out.push({ id: `file-${f.path}`, source: 'archivos', title: `Archivo sensible expuesto: ${f.path}`, severity: 'CRÍTICO', confidence: 'confirmado', cves: [] });
  }
  return out;
}

const LEVEL = { 'CRÍTICO': 'error', 'ALTO': 'error', 'MEDIO': 'warning', 'BAJO': 'note' } as const;
const SCORE = { 'CRÍTICO': '9.5', 'ALTO': '7.5', 'MEDIO': '5.0', 'BAJO': '2.0' } as const;

export function toSarif(r: AuditReportRecord): object {
  const findings = normalizeFindings(r);
  const rules = new Map<string, object>();
  for (const f of findings) {
    const ruleId = f.id.slice(0, 120);
    if (rules.has(ruleId)) continue;
    rules.set(ruleId, {
      id: ruleId,
      name: f.source,
      shortDescription: { text: f.title.slice(0, 200) },
      fullDescription: { text: (f.attackVector || f.title).slice(0, 1000) },
      help: { text: (f.mitigation || 'Ver informe DEFENSA TI.').slice(0, 1000) },
      properties: {
        'security-severity': f.cvss !== undefined ? String(f.cvss) : SCORE[f.severity],
        tags: ['security', f.source, ...f.cves],
      },
    });
  }
  return {
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: { driver: { name: 'DEFENSA TI Perimeter Engine', version: r.telemetry?.engineVersion || '3.0.0', informationUri: 'https://neuronalgravity.com', rules: [...rules.values()] } },
        automationDetails: { id: `defensati/${r.id}` },
        results: findings.map((f) => ({
          ruleId: f.id.slice(0, 120),
          level: LEVEL[f.severity],
          message: { text: `${f.title}${f.evidence ? ` — ${f.evidence}` : ''}`.slice(0, 1000) },
          locations: [{ physicalLocation: { artifactLocation: { uri: r.url } } }],
          properties: { severity: f.severity, confidence: f.confidence, cves: f.cves, kev: f.kev, epss: f.epss },
        })),
        properties: { score: r.score, grade: r.grade, scannedAt: r.scannedAt, scanMode: r.scanMode || 'public', integrity: r.integrity },
      },
    ],
  };
}

export function toJsonExport(r: AuditReportRecord): object {
  return {
    schema: 'defensati.findings.v1',
    id: r.id,
    target: r.url,
    score: r.score,
    grade: r.grade,
    scanMode: r.scanMode || 'public',
    scannedAt: r.scannedAt,
    integrity: r.integrity,
    compliance: r.compliance?.frameworks.map((f) => ({ framework: f.name, pct: f.pct, failed: f.controls.filter((c) => c.status === 'no_cumple').map((c) => c.id) })),
    findings: normalizeFindings(r),
  };
}
