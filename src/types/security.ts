/**
 * DEFENSA TI - Contratos de Datos y Tipos TypeScript
 * Esquema compatible con PostgreSQL / Supabase y API Contract /api/scan
 */

export type IndustrySector = 
  | 'retail'
  | 'fintech'
  | 'banca'
  | 'salud'
  | 'educacion'
  | 'tecnologia'
  | 'general';

export type ScanFrequency = 'daily' | 'weekly';

export type AlertType = 
  | 'SCORE_DROP'
  | 'SSL_EXPIRING'
  | 'DNS_CHANGE'
  | 'IP_CHANGE';

export type SecurityGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export type { RansomwareRiskResult } from '@/lib/scanner/ransomwareRiskScanner';
export type { DdosResilienceResult } from '@/lib/scanner/ddosResilienceScanner';
export type { BankingComplianceResult } from '@/lib/scanner/bankingComplianceScanner';

import type { RansomwareRiskResult } from '@/lib/scanner/ransomwareRiskScanner';
import type { DdosResilienceResult } from '@/lib/scanner/ddosResilienceScanner';
import type { BankingComplianceResult } from '@/lib/scanner/bankingComplianceScanner';

/**
 * Tabla: monitored_domains
 */
export interface MonitoredDomain {
  id: string; // UUID
  user_id: string;
  domain: string;
  industry: IndustrySector;
  frequency: ScanFrequency;
  last_score: number | null;
  alert_email: string | null;
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Vectores de Resiliencia Perimetral (Escala 1 - 5)
 */
export interface ResilienceVectors {
  anti_phishing: number;   // 1-5 basado en SPF y DMARC (p=reject -> 5, p=quarantine -> 4, p=none -> 3, spf solo -> 2, ninguno -> 1)
  web_encryption: number;  // 1-5 basado en TLS 1.3/1.2, HSTS y vigencia SSL
  network_exposure: number;// 1-5 basado en cabeceras de seguridad OWASP (CSP, XFO, XCTO) y presencia de WAF
}

/**
 * Detalle completo de chequeos perimetrales almacenado en JSONB
 */
export interface ChecksDetail {
  headers: {
    hsts: { present: boolean; status: 'pass' | 'warning' | 'fail'; value: string | null; maxAge?: number; includeSubDomains?: boolean; preload?: boolean };
    csp: { present: boolean; status: 'pass' | 'warning' | 'fail'; value: string | null };
    xfo: { present: boolean; status: 'pass' | 'warning' | 'fail'; value: string | null };
    xcto: { present: boolean; status: 'pass' | 'warning' | 'fail'; value: string | null };
    referrerPolicy: { present: boolean; status: 'pass' | 'warning' | 'fail'; value: string | null };
    permissionsPolicy: { present: boolean; status: 'pass' | 'warning' | 'fail'; value: string | null };
  };
  ssl: {
    valid: boolean;
    protocol: string;
    issuer: string;
    validTo: string;
    daysRemaining: number;
    cipher?: string;
    isHyperscale?: boolean;
    error?: string;
  };
  dns: {
    spf: { present: boolean; strict: boolean; record?: string; raw?: string };
    dmarc: { present: boolean; policy: 'reject' | 'quarantine' | 'none' | 'missing'; record?: string; raw?: string };
  };
  waf: {
    detected: boolean;
    name: string;
    provider?: string;
    isOriginExposed: boolean;
  };
  geo: {
    country: string;
    countryCode: string;
    city: string;
    lat: number;
    lon: number;
    isp?: string;
    asn?: string;
  };
  performance: {
    ttfb_ms: number;
  };
  ransomware?: RansomwareRiskResult;
  ddos?: DdosResilienceResult;
  banking?: BankingComplianceResult;
}

/**
 * Tabla: scan_history
 */
export interface ScanHistory {
  id: string; // UUID
  domain_id: string;
  score: number; // 0-100
  ssl_days_left: number;
  ttfb_ms: number;
  tls_version: string;
  server_ip: string;
  asn: string;
  waf_detected: string;
  vectors: ResilienceVectors;
  checks_detail: ChecksDetail;
  created_at: string;
}

/**
 * Tabla: alerts_log
 */
export interface AlertsLog {
  id: string; // UUID
  domain_id: string;
  alert_type: AlertType;
  diff_summary: string;
  sent_at: string;
}

/**
 * Snippets de remediación para servidores
 */
export interface RemediationSnippet {
  nginx?: string;
  apache?: string;
  cloudflare?: string;
}

/**
 * Item de remediación y chequeo para los acordeones
 */
export interface AuditCheckItem {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  description: string;
  remediationSnippet?: RemediationSnippet;
}

export interface AuditCategory {
  name: string;
  passed: number;
  total: number;
  items: AuditCheckItem[];
}

/**
 * Benchmark del sector
 */
export interface IndustryBenchmark {
  industry: IndustrySector;
  average: number;
  median: number;
  percentile_75: number;
  sample_size?: number;
  updated_at?: string;
}

/**
 * Puntos del gráfico de evolución histórica
 */
export interface ScoreHistoryPoint {
  date: string;
  score: number;
  label?: string;
}

/**
 * Contrato de Respuesta JSON devuelto por /api/scan para alimentar la UI de alta densidad
 */
export interface ScanApiResponse {
  id: string;
  domain: string;
  score: number;
  grade: SecurityGrade;
  ssl_days_left: number;
  ttfb_ms: number | null;
  tls_version: string;
  server_ip: string;
  asn: string;
  waf_detected: string;
  location: {
    country: string;
    countryCode: string;
    city: string;
    lat: number | null;
    lon: number | null;
    isp: string;
  };
  auditor_location: {
    provider: string;
    region: string;
    lat: number;
    lon: number;
  } | null;
  vectors: ResilienceVectors;
  history: ScoreHistoryPoint[];
  benchmark: IndustryBenchmark;
  categories: AuditCategory[];
  ransomware?: RansomwareRiskResult;
  ddos?: DdosResilienceResult;
  banking?: BankingComplianceResult;
  telemetry: {
    durationMs: number;
    cached?: boolean;
    targetResolvedIp?: string;
    engineVersion: string;
  };
  scannedAt: string;
}
