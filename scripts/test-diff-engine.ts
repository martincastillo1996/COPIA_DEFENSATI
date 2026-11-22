import { evaluateDiff } from '../worker/diffEngine';
import { MonitoredDomain, ScanHistory } from '../src/types/security';
import { WorkerScanResult } from '../worker/types';

const mockDomain: MonitoredDomain = {
  id: 'domain-uuid-1',
  user_id: 'user-uuid-1',
  domain: 'falabella.com.pe',
  industry: 'retail',
  frequency: 'daily',
  last_score: 85,
  alert_email: 'seguridad@falabella.com.pe',
  webhook_url: null,
  is_active: true,
  created_at: new Date().toISOString(),
};

const mockPrevious: ScanHistory = {
  id: 'scan-prev-1',
  domain_id: mockDomain.id,
  score: 85,
  ssl_days_left: 60,
  ttfb_ms: 30,
  tls_version: 'TLSv1.3',
  server_ip: '104.26.12.1',
  asn: 'AS13335 CLOUDFLARENET',
  waf_detected: 'Cloudflare WAF',
  vectors: { anti_phishing: 5, web_encryption: 5, network_exposure: 5 },
  checks_detail: {
    headers: {} as never,
    ssl: {} as never,
    dns: {
      spf: { present: true, strict: true },
      dmarc: { present: true, policy: 'reject' },
    },
    waf: { detected: true, name: 'Cloudflare', isOriginExposed: false },
    geo: { country: 'Peru', countryCode: 'PE', city: 'Lima', lat: -12.04, lon: -77.04 },
    performance: { ttfb_ms: 30 },
  },
  created_at: '2026-11-18T10:00:00Z',
};

const mockCurrent: WorkerScanResult = {
  domain: mockDomain,
  score: 78, // Drop of 7 points (>= 5) -> SCORE_DROP
  ssl_days_left: 12, // <= 15 days -> SSL_EXPIRING
  ttfb_ms: 45,
  tls_version: 'TLSv1.3',
  server_ip: '198.51.100.22', // Changed IP -> IP_CHANGE
  asn: 'AS-NEW',
  waf_detected: 'Ninguno',
  vectors: { anti_phishing: 2, web_encryption: 2, network_exposure: 2 },
  checks_detail: {
    headers: {} as never,
    ssl: {} as never,
    dns: {
      spf: { present: false, strict: false }, // SPF deleted -> DNS_CHANGE
      dmarc: { present: true, policy: 'none' }, // DMARC degraded from reject to none -> DNS_CHANGE
    },
    waf: { detected: false, name: 'Ninguno', isOriginExposed: true },
    geo: { country: 'Peru', countryCode: 'PE', city: 'Lima', lat: -12.04, lon: -77.04 },
    performance: { ttfb_ms: 45 },
  },
};

console.log('--- TEST DIFF ENGINE ---');
const diff = evaluateDiff(mockCurrent, mockPrevious);
console.log('Has alert:', diff.hasAlert);
console.log('Total alerts triggered:', diff.alerts.length);
diff.alerts.forEach((a, i) => {
  console.log(`[${i + 1}] [${a.alert_type}]: ${a.diff_summary}`);
});

const types = diff.alerts.map((a) => a.alert_type);
if (
  types.includes('SCORE_DROP') &&
  types.includes('SSL_EXPIRING') &&
  types.includes('DNS_CHANGE') &&
  types.includes('IP_CHANGE')
) {
  console.log('✅ ALL 4 REGRESSION CONDITIONS MET EXACTLY AS SPECIFIED!');
} else {
  console.error('❌ Missing expected alert types:', types);
  process.exit(1);
}
