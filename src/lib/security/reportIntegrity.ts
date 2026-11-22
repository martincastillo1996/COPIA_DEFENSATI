import crypto from 'crypto';
import type { AuditReportRecord } from '@/lib/storage/reportStore';
import { collectSignatures } from '@/lib/scanner/findingsDiff';
import { signPayload, verifyPayloadSignature } from '@/lib/security/badgeSigner';

export interface ReportIntegrity {
  algorithm: 'HMAC-SHA256';
  /** SHA-256 del contenido canónico del informe (hallazgos, nota y metadatos). */
  contentHash: string;
  /** Firma HMAC-SHA256 del hash junto con el identificador, emitida por DEFENSA TI. */
  signature: string;
  signedAt: string;
}

/** Subconjunto estable del informe: lo que un auditor necesita poder comprobar que no cambió. */
function canonical(r: AuditReportRecord): string {
  const findings = [...collectSignatures(r)].map(([k, v]) => `${k}|${v.severity}`).sort();
  return JSON.stringify({
    id: r.id,
    url: r.url,
    score: r.score,
    grade: r.grade,
    scannedAt: r.scannedAt,
    scanMode: r.scanMode || 'public',
    findings,
  });
}

export function buildIntegrity(r: AuditReportRecord): ReportIntegrity {
  const contentHash = crypto.createHash('sha256').update(canonical(r)).digest('hex');
  const signedAt = new Date().toISOString();
  return { algorithm: 'HMAC-SHA256', contentHash, signature: signPayload(`${r.id}:${contentHash}:${signedAt}`), signedAt };
}

export function verifyIntegrity(r: AuditReportRecord): { valid: boolean; reason?: string } {
  const i = r.integrity;
  if (!i) return { valid: false, reason: 'El informe no tiene sello de integridad (generado antes de esta función).' };
  const hash = crypto.createHash('sha256').update(canonical(r)).digest('hex');
  if (hash !== i.contentHash) return { valid: false, reason: 'El contenido del informe fue modificado después de firmarse.' };
  return verifyPayloadSignature(`${r.id}:${i.contentHash}:${i.signedAt}`, i.signature)
    ? { valid: true }
    : { valid: false, reason: 'La firma no corresponde a DEFENSA TI.' };
}
