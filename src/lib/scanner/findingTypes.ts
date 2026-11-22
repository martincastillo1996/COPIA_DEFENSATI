/**
 * Tipos y utilidades compartidas por los motores de auditoría avanzada
 * (superficie de ataque, aplicación web, cumplimiento).
 */

export type FindingSeverity = 'CRÍTICO' | 'ALTO' | 'MEDIO' | 'BAJO';
/** confirmado = evidencia directa; probable = indicio sujeto a verificación; informativo = buena práctica */
export type FindingConfidence = 'confirmado' | 'probable' | 'informativo';
export type FindingCategory = 'asm' | 'dns' | 'tls' | 'email' | 'webapp' | 'api' | 'secrets';

export interface ScanFinding {
  id: string;
  category: FindingCategory;
  title: string;
  severity: FindingSeverity;
  confidence: FindingConfidence;
  /** Cómo lo aprovecharía un atacante (explicación defensiva, sin cargas útiles). */
  attackVector: string;
  /** Cómo corregirlo. */
  mitigation: string;
  /** Evidencia observada (versión, cabecera, host...). Nunca contiene secretos completos. */
  evidence?: string;
  cwe?: string;
  cvss?: number;
}

export const SEVERITY_RANK: Record<FindingSeverity, number> = { 'CRÍTICO': 4, 'ALTO': 3, 'MEDIO': 2, 'BAJO': 1 };

export function sortFindings<T extends { severity: FindingSeverity; confidence?: FindingConfidence }>(list: T[]): T[] {
  const conf = { confirmado: 3, probable: 2, informativo: 1 } as const;
  return [...list].sort(
    (a, b) =>
      SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity] ||
      (conf[b.confidence ?? 'informativo'] ?? 0) - (conf[a.confidence ?? 'informativo'] ?? 0)
  );
}

/**
 * Impacto en el score de un conjunto de hallazgos. Solo cuentan los confirmados o probables:
 * una buena práctica ausente (informativo) no debe hundir la nota.
 */
export function findingsScoreImpact(findings: ScanFinding[] | undefined): { cap: number; minus: number } {
  let cap = 100;
  let minus = 0;
  for (const f of findings || []) {
    if (f.confidence === 'informativo') continue;
    const weight = f.confidence === 'confirmado' ? 1 : 0.5;
    if (f.severity === 'CRÍTICO') {
      if (f.confidence === 'confirmado') cap = Math.min(cap, 30);
      else minus += 8;
    } else if (f.severity === 'ALTO') minus += 6 * weight;
    else if (f.severity === 'MEDIO') minus += 2 * weight;
  }
  return { cap, minus: Math.min(Math.round(minus), 35) };
}

export function redact(secret: string): string {
  if (secret.length <= 8) return '****';
  return `${secret.slice(0, 4)}…${'*'.repeat(6)}(${secret.length} car.)`;
}
