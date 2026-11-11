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
  remediations?: RemediationItem[];
  telemetry?: AuditTelemetry;
  location?: ServerGeoLocation | null;
  cookies?: CookieScanResult;
  scannedAt?: string;
  isHyperscale?: boolean;
  badgeToken?: string;
}

const globalForReports = globalThis as unknown as {
  __reportsMap?: Map<string, AuditReportRecord>;
};

if (!globalForReports.__reportsMap) {
  globalForReports.__reportsMap = new Map<string, AuditReportRecord>();
}

export const reportStore = globalForReports.__reportsMap;

const MAX_STORED_REPORTS = 1000;

export function saveReport(id: string, report: AuditReportRecord): void {
  if (reportStore.size >= MAX_STORED_REPORTS) {
    // Evict oldest entry (first key in map iterator)
    const oldestKey = reportStore.keys().next().value;
    if (oldestKey) {
      reportStore.delete(oldestKey);
    }
  }
  reportStore.set(id, report);
}

export function getReportById(id: string): AuditReportRecord | undefined {
  return reportStore.get(id);
}

export function getReportByDomain(domain: string): AuditReportRecord | undefined {
  const clean = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .replace(/[^a-z0-9.-]/g, '');

  if (!clean) return undefined;

  let latest: AuditReportRecord | undefined;
  for (const report of reportStore.values()) {
    const reportDomain = (report.url || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/\/.*$/, '')
      .replace(/[^a-z0-9.-]/g, '');

    if (reportDomain === clean || reportDomain.endsWith('.' + clean) || clean.endsWith('.' + reportDomain)) {
      if (!latest) {
        latest = report;
      } else {
        const t1 = report.scannedAt ? new Date(report.scannedAt).getTime() : 0;
        const t0 = latest.scannedAt ? new Date(latest.scannedAt).getTime() : 0;
        if (t1 >= t0) {
          latest = report;
        }
      }
    }
  }
  return latest;
}
