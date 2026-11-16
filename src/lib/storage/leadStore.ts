import fs from 'fs';
import path from 'path';

export interface LeadRecord {
  id: string;
  name: string;
  company?: string;
  ruc?: string;
  email: string;
  phone?: string;
  domain?: string;
  service: string;
  budget?: string;
  details?: string;
  acceptedTerms?: boolean;
  acceptedDisclaimer?: boolean;
  createdAt: string;
  userAgent?: string;
  ip?: string;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const MAX_LEADS = 5000;

function loadLeadsFromDisk(): LeadRecord[] {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const raw = fs.readFileSync(LEADS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // Fallback silencioso en entornos de solo lectura 
  }
  return [];
}

function persistLeadsToDisk(leads: LeadRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Respaldo diario: la primera escritura de cada dia conserva una copia del archivo previo
    const backupDir = path.join(DATA_DIR, 'backups');
    const backupFile = path.join(backupDir, `leads-${new Date().toISOString().slice(0, 10)}.json`);
    if (fs.existsSync(LEADS_FILE) && !fs.existsSync(backupFile)) {
      fs.mkdirSync(backupDir, { recursive: true });
      fs.copyFileSync(LEADS_FILE, backupFile);
      // Los respaldos contienen datos personales: se conservan solo los 60 más recientes
      const old = fs.readdirSync(backupDir).filter((f) => /^leads-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
      for (const f of old.slice(0, Math.max(0, old.length - 60))) {
        try {
          fs.unlinkSync(path.join(backupDir, f));
        } catch {
          // Se reintenta en el siguiente respaldo
        }
      }
    }
    // Escritura atomica para no dejar un JSON truncado si el proceso se corta
    const tmp = `${LEADS_FILE}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(leads, null, 2), 'utf-8');
    fs.renameSync(tmp, LEADS_FILE);
  } catch {
    // Fallback silencioso en entornos donde el FS sea de solo lectura
  }
}

const globalForLeads = globalThis as unknown as {
  __leadsStore?: LeadRecord[];
};

if (!globalForLeads.__leadsStore) {
  globalForLeads.__leadsStore = loadLeadsFromDisk();
}

export const leadsStore = globalForLeads.__leadsStore;

export function saveLead(lead: LeadRecord): void {
  // 1. Guardar en memoria activa
  leadsStore.unshift(lead);
  if (leadsStore.length > MAX_LEADS) {
    leadsStore.pop();
  }

  // 2. Persistir en disco para que sobreviva reinicios de PM2 en el servidor
  persistLeadsToDisk(leadsStore);
}

export function getAllLeads(): LeadRecord[] {
  // Si la memoria está vacía, intentar sincronizar desde el disco
  if (leadsStore.length === 0) {
    const fromDisk = loadLeadsFromDisk();
    if (fromDisk.length > 0) {
      leadsStore.push(...fromDisk);
    }
  }
  return [...leadsStore];
}
