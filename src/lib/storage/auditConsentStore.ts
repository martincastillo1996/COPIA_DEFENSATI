import fs from 'fs';
import path from 'path';
import { appendChained, readChained } from '@/lib/audit/chain.mjs';

export interface AuditConsentRecord {
  id: string;
  domain: string;
  normalizedUrl: string;
  timestamp: string; // ISO 8601
  date: string;      // DD de MMMM de YYYY
  time: string;      // HH:mm:ss
  ip: string;
  userAgent: string;
  hasSwornDeclaration: true;
  declarationText: string;
  /** Autorización escrita que respalda una auditoría completa. */
  engagementId?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const LEGACY_FILE = path.join(DATA_DIR, 'audit-consents.json');
const CHAIN_FILE = path.join(DATA_DIR, 'audit-consents.jsonl');

// El JSON anterior se conserva intacto: sus registros se copian a la cadena.
function importLegacy(): void {
  if (fs.existsSync(CHAIN_FILE) || !fs.existsSync(LEGACY_FILE)) return;
  const records = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf-8')) as AuditConsentRecord[];
  for (const record of [...records].reverse()) appendChained(CHAIN_FILE, record);
}

/**
 * Añade el consentimiento al registro encadenado. Sin tope ni rotación.
 * Lanza si no se puede escribir: sin constancia no hay escaneo.
 */
export function saveAuditConsent(record: AuditConsentRecord): void {
  importLegacy();
  // El user-agent lo controla el visitante: se acota para que cada eslabón sea pequeño
  appendChained(CHAIN_FILE, { ...record, userAgent: record.userAgent.slice(0, 512), normalizedUrl: record.normalizedUrl.slice(0, 2048) });
}

/** Retorna todos los consentimientos, del más reciente al más antiguo. */
export function getAllAuditConsents(): AuditConsentRecord[] {
  importLegacy();
  return (readChained(CHAIN_FILE) as AuditConsentRecord[]).reverse();
}

/** Busca consentimientos registrados por nombre de dominio. */
export function getAuditConsentsByDomain(domain: string): AuditConsentRecord[] {
  const clean = domain.trim().toLowerCase();
  return getAllAuditConsents().filter((c) => c.domain.toLowerCase().includes(clean));
}
