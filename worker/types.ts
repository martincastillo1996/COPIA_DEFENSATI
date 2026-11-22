import {
  MonitoredDomain,
  ScanHistory,
  AlertsLog,
  AlertType,
  ChecksDetail,
  ResilienceVectors
} from '@/types/security';

export interface DiffEngineResult {
  hasAlert: boolean;
  alerts: Array<{
    alert_type: AlertType;
    diff_summary: string;
  }>;
}

export interface WorkerScanResult {
  domain: MonitoredDomain;
  score: number;
  ssl_days_left: number;
  ttfb_ms: number;
  tls_version: string;
  server_ip: string;
  asn: string;
  waf_detected: string;
  vectors: ResilienceVectors;
  checks_detail: ChecksDetail;
}
