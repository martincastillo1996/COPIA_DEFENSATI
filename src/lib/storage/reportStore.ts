import fs from 'fs';
import path from 'path';
import { PortCheckResult } from '@/lib/scanner/portScanner';
import { HeaderCheckItem } from '@/lib/scanner/headerScanner';
import { SslCheckResult } from '@/lib/scanner/sslScanner';
import { RemediationItem } from '@/lib/ai/remediation';
import { ServerGeoLocation } from '@/lib/scanner/geoScanner';
import { CookieScanResult } from '@/lib/scanner/cookieScanner';
import { SensitiveFilesResult } from '@/lib/scanner/sensitiveFilesScanner';
import { DnsSecurityResult } from '@/lib/scanner/dnsScanner';
import {
  WafCheckResult,
  CmsCheckResult,
  MixedContentResult,
  MalwareScanResult,
  CommercialImpactResult,
} from '@/lib/scanner/webAuditScanner';

export interface AuditTelemetry {
  durationMs: number;
  aiModel: string;
  targetResolvedIp?: string;
  engineVersion: string;
}

export interface AuditReportRecord {
  id?: string;
  url: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  ssl?: SslCheckResult;
  headers?: HeaderCheckItem[];
  ports?: PortCheckResult[];
  sensitiveFiles?: SensitiveFilesResult;
  dnsSecurity?: DnsSecurityResult;
  waf?: WafCheckResult;
  cms?: CmsCheckResult;
  mixedContent?: MixedContentResult;
  malware?: MalwareScanResult;
  commercial?: CommercialImpactResult;
  remediations?: RemediationItem[];
  telemetry?: AuditTelemetry;
  location?: ServerGeoLocation | null;
  cookies?: CookieScanResult;
  scannedAt?: string;
  isHyperscale?: boolean;
  badgeToken?: string;
}

// Persistencia en disco: un archivo JSON por informe en data/reports/<uuid>.json.
// Los enlaces /report/[id] sobreviven a reinicios de PM2 y a cada despliegue.
const REPORTS_DIR = path.join(process.cwd(), 'data', 'reports');
const REPORT_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Informes completos mantenidos en memoria (caché caliente) y tope total en disco
const MAX_CACHED_REPORTS = 200;
const MAX_STORED_REPORTS = 5000;

interface ReportIndexEntry {
  domain: string;
  scannedAt: number;
}

const globalForReports = globalThis as unknown as {
  __reportsMap?: Map<string, AuditReportRecord>;
  __reportsIndex?: Map<string, ReportIndexEntry>;
  __reportsIndexLoaded?: boolean;
};

if (!globalForReports.__reportsMap) {
  globalForReports.__reportsMap = new Map<string, AuditReportRecord>();
}
if (!globalForReports.__reportsIndex) {
  globalForReports.__reportsIndex = new Map<string, ReportIndexEntry>();
}

export const reportStore = globalForReports.__reportsMap;
const reportIndex = globalForReports.__reportsIndex;

function cleanDomain(value: string): string {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/[^a-z0-9.-]/g, '');
}

function reportFilePath(id: string): string | null {
  // El id llega desde la URL: solo se aceptan UUID para impedir path traversal
  if (!REPORT_ID_REGEX.test(id)) return null;
  return path.join(REPORTS_DIR, `${id.toLowerCase()}.json`);
}

function readReportFromDisk(id: string): AuditReportRecord | undefined {
  const file = reportFilePath(id);
  if (!file) return undefined;
  try {
    if (!fs.existsSync(file)) return undefined;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (parsed && typeof parsed === 'object' && typeof parsed.url === 'string') {
      return parsed as AuditReportRecord;
    }
  } catch {
    // Archivo ilegible o corrupto: se trata como inexistente
  }
  return undefined;
}

function deleteReportFromDisk(id: string): void {
  const file = reportFilePath(id);
  if (!file) return;
  try {
    fs.unlinkSync(file);
  } catch {
    // Ya no existe o el FS es de solo lectura
  }
}

function cacheReport(id: string, report: AuditReportRecord): void {
  reportStore.delete(id);
  reportStore.set(id, report);
  if (reportStore.size > MAX_CACHED_REPORTS) {
    const oldestKey = reportStore.keys().next().value;
    if (oldestKey) reportStore.delete(oldestKey);
  }
}

/**
 * Construye (una sola vez por proceso) el índice id → dominio/fecha leyendo data/reports.
 */
function ensureIndexLoaded(): void {
  if (globalForReports.__reportsIndexLoaded) return;
  globalForReports.__reportsIndexLoaded = true;
  try {
    if (!fs.existsSync(REPORTS_DIR)) return;
    const entries: Array<[string, ReportIndexEntry]> = [];
    for (const name of fs.readdirSync(REPORTS_DIR)) {
      if (!name.endsWith('.json')) continue;
      const id = name.slice(0, -5);
      if (reportIndex.has(id)) continue;
      const report = readReportFromDisk(id);
      if (!report) continue;
      entries.push([
        id,
        {
          domain: cleanDomain(report.url),
          scannedAt: report.scannedAt ? new Date(report.scannedAt).getTime() || 0 : 0,
        },
      ]);
    }
    // Orden cronológico: el primero del Map es siempre el más antiguo
    entries.sort((a, b) => a[1].scannedAt - b[1].scannedAt);
    const merged = new Map<string, ReportIndexEntry>([...entries, ...reportIndex]);
    reportIndex.clear();
    for (const [id, entry] of merged) reportIndex.set(id, entry);
  } catch {
    // Sin acceso al disco: el almacén opera solo en memoria
  }
}

export function saveReport(id: string, report: AuditReportRecord): void {
  ensureIndexLoaded();
  const key = id.toLowerCase();

  cacheReport(key, report);
  reportIndex.delete(key);
  reportIndex.set(key, {
    domain: cleanDomain(report.url),
    scannedAt: report.scannedAt ? new Date(report.scannedAt).getTime() || Date.now() : Date.now(),
  });

  const file = reportFilePath(key);
  if (file) {
    try {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
      // Escritura atómica: un corte a mitad de escritura no deja un JSON truncado
      const tmp = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(report), 'utf-8');
      fs.renameSync(tmp, file);
    } catch {
      // FS de solo lectura: el informe queda disponible solo en memoria
    }
  }

  // Retención: al superar el tope se eliminan los informes más antiguos
  while (reportIndex.size > MAX_STORED_REPORTS) {
    const oldestKey = reportIndex.keys().next().value;
    if (!oldestKey) break;
    reportIndex.delete(oldestKey);
    reportStore.delete(oldestKey);
    deleteReportFromDisk(oldestKey);
  }
}

export function getReportById(id: string): AuditReportRecord | undefined {
  const key = (id || '').toLowerCase();
  const cached = reportStore.get(key);
  if (cached) return cached;

  const fromDisk = readReportFromDisk(key);
  if (fromDisk) cacheReport(key, fromDisk);
  return fromDisk;
}

export function getReportByDomain(domain: string): AuditReportRecord | undefined {
  const clean = cleanDomain(domain);
  if (!clean) return undefined;

  ensureIndexLoaded();

  let latestId: string | undefined;
  let latestTime = -1;
  for (const [id, entry] of reportIndex) {
    const d = entry.domain;
    if (!d) continue;
    if (d === clean || d.endsWith('.' + clean) || clean.endsWith('.' + d)) {
      if (entry.scannedAt >= latestTime) {
        latestTime = entry.scannedAt;
        latestId = id;
      }
    }
  }
  return latestId ? getReportById(latestId) : undefined;
}
