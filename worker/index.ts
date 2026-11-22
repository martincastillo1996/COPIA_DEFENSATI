import { getActiveMonitoredDomains, getLatestScanHistory, recordScanHistory, recordAlertLog } from './db';
import { executeDomainAudit } from './scanner';
import { evaluateDiff } from './diffEngine';
import { dispatchAlert } from './alerter';
import { runWithConcurrencyLimit } from './concurrency';
import { MonitoredDomain } from '@/types/security';

const CONCURRENCY_LIMIT = 3;

/**
 * DEFENSA TI - Worker de Monitoreo Continuo y Diff Engine
 * Ejecutable periódicamente mediante Cron en Droplets Linux de DigitalOcean.
 */
async function runMonitoringCycle() {
  const startTime = Date.now();
  console.log('='.repeat(70));
  console.log('🛡️  DEFENSA TI - WORKER DE MONITOREO CONTINUO & DIFF ENGINE');
  console.log(`   Hora de inicio (UTC): ${new Date().toISOString()}`);
  console.log(`   Límite de concurrencia: ${CONCURRENCY_LIMIT} dominios en paralelo`);
  console.log('='.repeat(70));

  // 1. Cargar dominios activos
  const activeDomains: MonitoredDomain[] = await getActiveMonitoredDomains();
  console.log(`[+] Dominios activos para procesar: ${activeDomains.length}\n`);

  if (activeDomains.length === 0) {
    console.log('ℹ️  No hay dominios activos configurados para monitoreo.');
    return;
  }

  let successCount = 0;
  let errorCount = 0;
  let totalAlertsCount = 0;

  // 2. Procesar con control estricto de concurrencia (máximo 3 en paralelo)
  await runWithConcurrencyLimit(activeDomains, CONCURRENCY_LIMIT, async (domain, index) => {
    const itemPrefix = `[${index + 1}/${activeDomains.length}] [${domain.domain}]`;
    console.log(`${itemPrefix} Iniciando inspección perimetral...`);

    try {
      // A. Ejecutar escaneo perimétrico con Anti-SSRF
      const scanResult = await executeDomainAudit(domain);
      console.log(`${itemPrefix} Escaneo completado -> Score: ${scanResult.score}/100 | SSL: ${scanResult.ssl_days_left}d | TTFB: ${scanResult.ttfb_ms}ms | WAF: ${scanResult.waf_detected}`);

      // B. Obtener el último escaneo previo para comparar regresiones
      const previousScan = await getLatestScanHistory(domain.id);

      // C. Ejecutar Diff Engine
      const diffResult = await evaluateDiff(scanResult, previousScan);

      if (diffResult.hasAlert) {
        console.log(`${itemPrefix} ⚠️ ${diffResult.alerts.length} anomalía(s) detectada(s) por el Diff Engine.`);

        for (const alert of diffResult.alerts) {
          totalAlertsCount++;
          // Registrar en alerts_log
          await recordAlertLog(domain.id, alert.alert_type, alert.diff_summary);

          // Despachar alerta (Email / Webhook)
          await dispatchAlert({
            domain,
            alertType: alert.alert_type,
            diffSummary: alert.diff_summary,
          });
        }
      } else {
        console.log(`${itemPrefix} ✅ Sin regresiones. Perímetro estable.`);
      }

      // D. Guardar nuevo escaneo en scan_history y actualizar last_score
      await recordScanHistory(scanResult);
      successCount++;
    } catch (err: unknown) {
      errorCount++;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`${itemPrefix} ❌ Error en ciclo de auditoría:`, errMsg);
    }
  });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN DEL CICLO DE MONITOREO');
  console.log(`   Procesados exitosamente: ${successCount}`);
  console.log(`   Errores:                 ${errorCount}`);
  console.log(`   Alertas disparadas:      ${totalAlertsCount}`);
  console.log(`   Tiempo total:            ${durationSec}s`);
  console.log('='.repeat(70));
}

// Ejecución directa si se invoca por CLI
if (require.main === module || process.argv[1]?.endsWith('worker/index.ts') || process.argv[1]?.endsWith('worker\\index.ts')) {
  runMonitoringCycle()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fallo fatal en el Worker:', err);
      process.exit(1);
    });
}

export { runMonitoringCycle };
