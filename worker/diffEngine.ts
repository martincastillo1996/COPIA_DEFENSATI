import { ScanHistory, AlertType } from '@/types/security';
import { DiffEngineResult, WorkerScanResult } from './types';

/**
 * DEFENSA TI - Diff Engine de Regresiones Perimetrales
 * Compara el escaneo actual contra el último registro histórico y detecta anomalías críticas.
 */
export function evaluateDiff(
  current: WorkerScanResult,
  previous: ScanHistory | null
): DiffEngineResult {
  const alerts: Array<{ alert_type: AlertType; diff_summary: string }> = [];

  // =========================================================================
  // 1. REGLA: Certificado SSL próximo a expirar (<= 15 días)
  // (Aplica tanto si es el primer escaneo como si es recurrente)
  // =========================================================================
  if (current.ssl_days_left <= 15) {
    const days = current.ssl_days_left;
    const desc = days <= 0
      ? `ALERTA CRÍTICA: El certificado SSL/TLS de ${current.domain.domain} ha EXPIRADO o es inválido. Los navegadores muestran advertencia de seguridad.`
      : `ALERTA SSL: El certificado SSL/TLS de ${current.domain.domain} vence en ${days} días (<= 15 días). Renovar inmediatamente para evitar caída de servicio.`;

    alerts.push({
      alert_type: 'SSL_EXPIRING',
      diff_summary: desc,
    });
  }

  // Si no hay historial previo, no podemos evaluar caída de puntaje ni cambios de IP/DNS relativos
  if (!previous) {
    return {
      hasAlert: alerts.length > 0,
      alerts,
    };
  }

  // =========================================================================
  // 2. REGLA: Caída de puntaje mayor o igual a 5 puntos (score_drop >= 5)
  // =========================================================================
  const scoreDrop = previous.score - current.score;
  if (scoreDrop >= 5) {
    alerts.push({
      alert_type: 'SCORE_DROP',
      diff_summary: `REGRESIÓN DE SEGURIDAD: La puntuación cayó de ${previous.score} a ${current.score} (-${scoreDrop} puntos). Posible desconfiguración de cabeceras OWASP, degradación TLS o desactivación de WAF.`,
    });
  }

  // =========================================================================
  // 3. REGLA: Eliminación o degradación de registros SPF o DMARC
  // =========================================================================
  const prevDmarc = previous.checks_detail?.dns?.dmarc;
  const currDmarc = current.checks_detail?.dns?.dmarc;

  const prevSpf = previous.checks_detail?.dns?.spf;
  const currSpf = current.checks_detail?.dns?.spf;

  // A. Evaluación DMARC
  const dmarcPolicyRank: Record<string, number> = {
    reject: 3,
    quarantine: 2,
    none: 1,
    missing: 0,
  };

  const prevDmarcPolicy = prevDmarc?.policy || 'missing';
  const currDmarcPolicy = currDmarc?.policy || 'missing';
  const prevDmarcRank = dmarcPolicyRank[prevDmarcPolicy] ?? 0;
  const currDmarcRank = dmarcPolicyRank[currDmarcPolicy] ?? 0;

  if (currDmarcRank < prevDmarcRank) {
    alerts.push({
      alert_type: 'DNS_CHANGE',
      diff_summary: `DEGRADACIÓN DMARC: La política de autenticación de correo cambió de 'p=${prevDmarcPolicy}' a 'p=${currDmarcPolicy}'. El dominio se encuentra vulnerable a suplantación y phishing corporativo.`,
    });
  }

  // B. Evaluación SPF
  if (prevSpf?.present && !currSpf?.present) {
    alerts.push({
      alert_type: 'DNS_CHANGE',
      diff_summary: `ELIMINACIÓN SPF: El registro TXT SPF fue eliminado del dominio ${current.domain.domain}. Los servidores mundiales no pueden validar los remitentes autorizados.`,
    });
  } else if (prevSpf?.strict && currSpf?.present && !currSpf.strict) {
    alerts.push({
      alert_type: 'DNS_CHANGE',
      diff_summary: `DEGRADACIÓN SPF: La política estricta '-all' fue reemplazada por una regla permisiva '~all' o '?all'.`,
    });
  }

  // =========================================================================
  // 4. REGLA: Cambio inesperado en la IP resuelta (server_ip)
  // =========================================================================
  const prevIp = previous.server_ip?.trim();
  const currIp = current.server_ip?.trim();

  if (prevIp && currIp && prevIp !== '0.0.0.0' && currIp !== '0.0.0.0' && prevIp !== currIp) {
    alerts.push({
      alert_type: 'IP_CHANGE',
      diff_summary: `CAMBIO DE DIRECCIÓN IP: El servidor cambió de ${prevIp} (${previous.asn || 'ASN previo'}) a ${currIp} (${current.asn || 'ASN actual'}). Verificar si se trata de una migración planificada o una alteración de DNS.`,
    });
  }

  return {
    hasAlert: alerts.length > 0,
    alerts,
  };
}
