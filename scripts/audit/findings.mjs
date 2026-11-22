import { createHash } from 'node:crypto';
import { db, logEvent } from '../../src/lib/audit/store.mjs';

export const STATES = ['open', 'mitigated', 'accepted', 'verified'];

/**
 * Guarda una corrida de un motor y devuelve lo nuevo o reabierto.
 * Solo una corrida completa puede marcar como verificado lo que ya no aparece.
 */
export function recordRun({ engagement, host, engine, findings, complete }) {
  const d = db();
  const now = Date.now();
  const alerts = [];
  const seen = new Set();
  d.exec('BEGIN IMMEDIATE');
  try {
    for (const f of findings) {
      const id = createHash('sha256').update([engagement, host, engine, f.key].join('|')).digest('hex').slice(0, 20);
      if (seen.has(id)) continue;
      seen.add(id);
      const old = d.prepare('SELECT status FROM findings WHERE id=?').get(id);
      // Un riesgo aceptado o un falso positivo marcado a mano no se reabre solo ni vuelve a alertar
      const status = old?.status === 'accepted' || old?.status === 'false_positive' ? old.status : 'open';
      // La validación a mano (validated) no se toca aquí: sobrevive a las corridas siguientes
      d.prepare(`INSERT INTO findings(id,engagement,host,engine,title,severity,confidence,cwe,cvss,evidence,reproduction,fix,attack,status,first_seen,last_seen)
        VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET title=excluded.title, severity=excluded.severity, confidence=excluded.confidence,
          cwe=excluded.cwe, cvss=excluded.cvss, evidence=excluded.evidence, reproduction=excluded.reproduction,
          fix=excluded.fix, attack=excluded.attack, status=excluded.status, last_seen=excluded.last_seen`)
        .run(id, engagement, host, engine, f.title, f.severity, f.confidence, f.cwe ?? null, f.cvss ?? null,
          f.evidence ?? null, f.reproduction ?? null, f.fix ?? null, f.attack ?? null, status, now, now);
      if (!old || old.status === 'verified' || old.status === 'mitigated') alerts.push({ ...f, id });
    }
    if (complete) {
      for (const row of d.prepare("SELECT id FROM findings WHERE engagement=? AND host=? AND engine=? AND status IN ('open','mitigated')").all(engagement, host, engine)) {
        if (!seen.has(row.id)) d.prepare("UPDATE findings SET status='verified' WHERE id=?").run(row.id);
      }
    }
    d.exec('COMMIT');
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
  return alerts;
}

/** Una persona comprobó el hallazgo: pasa a confirmado en el informe. Exige quién y cómo. */
export function validate(id, note) {
  if (!note || note.trim().length < 8) throw new Error('Validar exige una nota: quién lo comprobó y cómo.');
  if (db().prepare('SELECT status FROM findings WHERE id=?').get(id)?.status === 'false_positive') throw new Error('Está marcado como falso positivo: reábrelo primero con status open.');
  if (!db().prepare('UPDATE findings SET validated=1, validated_note=? WHERE id=?').run(note.trim(), id).changes) throw new Error('Hallazgo inexistente.');
  logEvent('finding.validate', { id, note });
}

export function setStatus(id, status, note) {
  if (!['open', 'mitigated', 'accepted', 'false_positive'].includes(status)) throw new Error('Estado válido: open, mitigated, accepted o false_positive. "verified" solo lo pone un re-test.');
  if (status === 'accepted' && !note) throw new Error('Aceptar un riesgo exige una nota con quién lo aprobó.');
  if (status === 'false_positive' && (!note || note.trim().length < 8)) throw new Error('Un falso positivo exige una nota: quién lo comprobó y por qué no es real.');
  // Un falso positivo deja de contar como validado: alimenta la precisión del motor
  if (!db().prepare('UPDATE findings SET status=?, note=?, validated=CASE WHEN ?=\'false_positive\' THEN 0 ELSE validated END WHERE id=?').run(status, note ?? null, status, id).changes) throw new Error('Hallazgo inexistente.');
  logEvent('finding.status', { id, status, note });
}
