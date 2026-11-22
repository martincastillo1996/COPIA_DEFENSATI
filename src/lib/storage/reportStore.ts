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
import type { CveIntelResult } from '@/lib/scanner/cveIntelScanner';
import type { AsmResult } from '@/lib/scanner/asmScanner';
import type { WebAppResult } from '@/lib/scanner/webAppScanner';
import type { ComplianceResult } from '@/lib/scanner/complianceMapper';
import type { ReportDiff } from '@/lib/scanner/findingsDiff';
import type { ReportIntegrity } from '@/lib/security/reportIntegrity';
import {
  WafCheckResult,
  CmsCheckResult,
  MixedContentResult,
  MalwareScanResult,
  CommercialImpactResult,
} from '@/lib/scanner/webAuditScanner';
import {
  ResilienceVectors,
  AuditCategory,
  IndustryBenchmark,
  ScoreHistoryPoint,
  RansomwareRiskResult,
  DdosResilienceResult,
  BankingComplianceResult,
} from '@/types/security';

export interface AuditTelemetry {
  durationMs: number;
  aiModel?: string;
  targetResolvedIp?: string;
  engineVersion?: string;
}

export interface AuditReportRecord {
  id?: string;
  url: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  ssl?: SslCheckResult;
  headers?: HeaderCheckItem[];
  ports?: PortCheckResult[];
  /** Escáner público: los puertos solo se sondean si se demuestra la titularidad del dominio. */
  portsVerification?: {
    verified: boolean;
    method?: string;
    record: { host: string; value: string };
    file: { url: string; content: string };
  };
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
  /** 'public' = revisión básica; 'full' = auditoría completa autorizada (puertos y archivos). */
  scanMode?: 'public' | 'full';
  badgeToken?: string;
  vectors?: ResilienceVectors;
  categories?: AuditCategory[];
  benchmark?: IndustryBenchmark;
  history?: ScoreHistoryPoint[];
  ttfb_ms?: number | null;
  asn?: string;
  auditor_location?: { provider: string; region: string; lat: number; lon: number } | null;
  waf_detected?: string;
  ssl_days_left?: number;
  tls_version?: string;
  ransomware?: RansomwareRiskResult;
  ddos?: DdosResilienceResult;
  banking?: BankingComplianceResult;
  cveIntel?: CveIntelResult;
  asm?: AsmResult;
  webApp?: WebAppResult;
  compliance?: ComplianceResult;
  integrity?: ReportIntegrity;
  diff?: ReportDiff;
}

// Persistencia en disco: un archivo JSON por informe en data/reports/<uuid>.json.
// Los enlaces /report/[id] sobreviven a reinicios de PM2 y a cada despliegue.
const REPORTS_DIR = path.join(process.cwd(), 'data', 'reports');
const REPORT_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Informes completos mantenidos en memoria (caché caliente) y tope total en disco
const MAX_CACHED_REPORTS = 200;
const MAX_STORED_REPORTS = 5000;

// Retención de los informes del escáner público. La política de privacidad publicada promete
// depurarlos en un máximo de 24 horas; se puede ajustar con REPORT_RETENTION_HOURS (y entonces
// hay que actualizar el texto de la política). Las auditorías completas ('full') son entregables
// de clientes con contrato y no caducan por esta regla.
const RETENTION_HOURS = Number(process.env.REPORT_RETENTION_HOURS) > 0 ? Number(process.env.REPORT_RETENTION_HOURS) : 24;
const RETENTION_MS = RETENTION_HOURS * 60 * 60 * 1000;

function isExpired(scannedAt: number, isFull: boolean): boolean {
  return !isFull && scannedAt > 0 && Date.now() - scannedAt > RETENTION_MS;
}

function reportTime(report: AuditReportRecord): number {
  return report.scannedAt ? new Date(report.scannedAt).getTime() || 0 : 0;
}

interface ReportIndexEntry {
  domain: string;
  scannedAt: number;
  full?: boolean;
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
          scannedAt: reportTime(report),
          full: report.scanMode === 'full',
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

function removeReport(key: string): void {
  reportIndex.delete(key);
  reportStore.delete(key);
  deleteReportFromDisk(key);
}

export function saveReport(id: string, report: AuditReportRecord): void {
  ensureIndexLoaded();
  const key = id.toLowerCase();

  cacheReport(key, report);
  reportIndex.delete(key);
  reportIndex.set(key, {
    domain: cleanDomain(report.url),
    scannedAt: report.scannedAt ? new Date(report.scannedAt).getTime() || Date.now() : Date.now(),
    full: report.scanMode === 'full',
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

  // Retención por antigüedad: se depuran los informes públicos vencidos
  for (const [oldId, entry] of reportIndex) {
    if (isExpired(entry.scannedAt, Boolean(entry.full))) removeReport(oldId);
  }

  // Retención: el tope solo depura informes públicos; los entregables 'full' no se borran
  let publicCount = 0;
  for (const entry of reportIndex.values()) if (!entry.full) publicCount++;
  for (const [oldId, entry] of reportIndex) {
    if (publicCount <= MAX_STORED_REPORTS) break;
    if (entry.full) continue;
    removeReport(oldId);
    publicCount--;
  }
}

/**
 * Historial medido del mismo host y modo: el último valor de cada día anterior a hoy.
 * Un informe público nunca muestra las notas de las auditorías privadas.
 */
export function getScoreHistory(url: string, mode: 'public' | 'full'): ScoreHistoryPoint[] {
  ensureIndexLoaded();
  const domain = cleanDomain(url);
  const today = new Date().toISOString().slice(0, 10);
  const days = new Map<string, string>();
  for (const [id, entry] of reportIndex) {
    if (entry.domain !== domain || Boolean(entry.full) !== (mode === 'full') || !entry.scannedAt) continue;
    if (isExpired(entry.scannedAt, Boolean(entry.full))) continue;
    const day = new Date(entry.scannedAt).toISOString().slice(0, 10);
    if (day !== today) days.set(day, id);
  }
  const points: ScoreHistoryPoint[] = [];
  for (const [date, id] of [...days].sort().slice(-12)) {
    const report = readReportFromDisk(id);
    // Los informes anteriores con nota fija de hiperescala no son mediciones
    if (report && !report.isHyperscale) points.push({ date, score: report.score });
  }
  return points;
}

export function getReportById(id: string): AuditReportRecord | undefined {
  const key = (id || '').toLowerCase();
  const report = reportStore.get(key) || readReportFromDisk(key);
  if (!report) return undefined;

  // Un informe público vencido se depura en el momento y deja de estar disponible
  if (isExpired(reportTime(report), report.scanMode === 'full')) {
    removeReport(key);
    return undefined;
  }

  if (!reportStore.has(key)) cacheReport(key, report);
  return report;
}

export function getReportByDomain(domain: string): AuditReportRecord | undefined {
  const clean = cleanDomain(domain).replace(/^www\./, '');
  if (!clean) return undefined;

  ensureIndexLoaded();

  let latestId: string | undefined;
  let latestTime = -1;
  for (const [id, entry] of reportIndex) {
    const d = entry.domain;
    if (!d) continue;
    // Coincidencia exacta (solo se ignora "www."): el informe de un dominio padre o de un
    // subdominio no certifica a otro host distinto.
    if (d.replace(/^www\./, '') === clean) {
      if (entry.scannedAt >= latestTime) {
        latestTime = entry.scannedAt;
        latestId = id;
      }
    }
  }
  return latestId ? getReportById(latestId) : undefined;
}
