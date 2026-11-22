import { MonitoredDomain, ScanHistory, AlertsLog, AlertType } from '@/types/security';
import { WorkerScanResult } from './types';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * DEFENSA TI - Capa de Abstracción de Base de Datos para el Worker
 * Soporta conexión REST nativa a Supabase / PostgreSQL con fallback resiliente a almacenamiento local en JSON.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

// Archivo local de persistencia (fallback cuando no hay Supabase configurado en el Droplet)
const LOCAL_STORAGE_DIR = path.join(process.cwd(), 'data', 'worker');
const LOCAL_DOMAINS_FILE = path.join(LOCAL_STORAGE_DIR, 'monitored_domains.json');
const LOCAL_HISTORY_FILE = path.join(LOCAL_STORAGE_DIR, 'scan_history.json');
const LOCAL_ALERTS_FILE = path.join(LOCAL_STORAGE_DIR, 'alerts_log.json');

function ensureLocalDir() {
  if (!fs.existsSync(LOCAL_STORAGE_DIR)) {
    fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, defaultVal: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {
    // Ignorar fallback
  }
  return defaultVal;
}

function writeJsonFile<T>(filePath: string, data: T) {
  ensureLocalDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * 1. Obtiene los dominios activos de monitored_domains
 */
export async function getActiveMonitoredDomains(): Promise<MonitoredDomain[]> {
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/monitored_domains?is_active=eq.true&select=*`, {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[DB] Supabase query falló, recurriendo a almacenamiento local:', err);
    }
  }

  // Fallback Local
  const localDomains = readJsonFile<MonitoredDomain[]>(LOCAL_DOMAINS_FILE, []);
  if (localDomains.length === 0) {
    // Semilla inicial por defecto si está vacío
    const seed: MonitoredDomain[] = [
      {
        id: uuidv4(),
        user_id: uuidv4(),
        domain: 'neuronalgravity.com',
        industry: 'tecnologia',
        frequency: 'daily',
        last_score: 95,
        alert_email: process.env.DEFAULT_ALERT_EMAIL || 'contacto@neuronalgravity.com',
        webhook_url: null,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
    writeJsonFile(LOCAL_DOMAINS_FILE, seed);
    return seed;
  }

  return localDomains.filter((d) => d.is_active);
}

/**
 * 2. Obtiene el último registro histórico de un dominio
 */
export async function getLatestScanHistory(domainId: string): Promise<ScanHistory | null> {
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/scan_history?domain_id=eq.${domainId}&order=created_at.desc&limit=1`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) return rows[0];
      }
    } catch {
      // Fallback
    }
  }

  // Fallback Local
  const allHistory = readJsonFile<ScanHistory[]>(LOCAL_HISTORY_FILE, []);
  const domainScans = allHistory
    .filter((h) => h.domain_id === domainId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return domainScans[0] || null;
}

/**
 * 3. Registra un nuevo escaneo en scan_history y actualiza last_score
 */
export async function recordScanHistory(scan: WorkerScanResult): Promise<string> {
  const historyRecord: ScanHistory = {
    id: uuidv4(),
    domain_id: scan.domain.id,
    score: scan.score,
    ssl_days_left: scan.ssl_days_left,
    ttfb_ms: scan.ttfb_ms,
    tls_version: scan.tls_version,
    server_ip: scan.server_ip,
    asn: scan.asn,
    waf_detected: scan.waf_detected,
    vectors: scan.vectors,
    checks_detail: scan.checks_detail,
    created_at: new Date().toISOString(),
  };

  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      // A. Insertar en scan_history
      await fetch(`${SUPABASE_URL}/rest/v1/scan_history`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(historyRecord),
      });

      // B. Actualizar last_score en monitored_domains
      await fetch(`${SUPABASE_URL}/rest/v1/monitored_domains?id=eq.${scan.domain.id}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ last_score: scan.score }),
      });

      return historyRecord.id;
    } catch {
      // Fallback
    }
  }

  // Fallback Local
  const allHistory = readJsonFile<ScanHistory[]>(LOCAL_HISTORY_FILE, []);
  allHistory.push(historyRecord);
  writeJsonFile(LOCAL_HISTORY_FILE, allHistory);

  // Actualizar last_score en local
  const allDomains = readJsonFile<MonitoredDomain[]>(LOCAL_DOMAINS_FILE, []);
  const target = allDomains.find((d) => d.id === scan.domain.id);
  if (target) {
    target.last_score = scan.score;
    writeJsonFile(LOCAL_DOMAINS_FILE, allDomains);
  }

  return historyRecord.id;
}

/**
 * 4. Registra una alerta en alerts_log
 */
export async function recordAlertLog(domainId: string, alertType: AlertType, diffSummary: string): Promise<string> {
  const alertRecord: AlertsLog = {
    id: uuidv4(),
    domain_id: domainId,
    alert_type: alertType,
    diff_summary: diffSummary,
    sent_at: new Date().toISOString(),
  };

  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/alerts_log`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify(alertRecord),
      });
      return alertRecord.id;
    } catch {
      // Fallback
    }
  }

  // Fallback Local
  const allAlerts = readJsonFile<AlertsLog[]>(LOCAL_ALERTS_FILE, []);
  allAlerts.push(alertRecord);
  writeJsonFile(LOCAL_ALERTS_FILE, allAlerts);

  return alertRecord.id;
}
