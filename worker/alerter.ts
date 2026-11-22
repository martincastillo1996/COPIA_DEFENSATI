import { AlertsLog, AlertType, MonitoredDomain } from '@/types/security';
import { Resend } from 'resend';

export interface DispatchAlertParams {
  domain: MonitoredDomain;
  alertType: AlertType;
  diffSummary: string;
}

/**
 * DEFENSA TI - Motor de Despacho de Alertas Perimetrales
 * Envía notificaciones de alerta a través de Email (Resend) y Webhooks (Slack / Teams / Discord)
 */
export async function dispatchAlert(params: DispatchAlertParams): Promise<boolean> {
  const { domain, alertType, diffSummary } = params;
  const timestamp = new Date().toISOString();
  let emailSent = false;
  let webhookSent = false;

  console.log(`\n🚨 [ALERTA DISPARADA] Dominio: ${domain.domain} | Tipo: ${alertType}`);
  console.log(`   Resumen: ${diffSummary}`);

  // 1. Envío vía Resend (si está configurado alert_email y RESEND_API_KEY)
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const alertEmail = domain.alert_email || process.env.DEFAULT_ALERT_EMAIL;

  if (resendApiKey && alertEmail) {
    try {
      const resend = new Resend(resendApiKey);
      const emailSubject = `🚨 [DEFENSA TI] Alerta de Seguridad Perimetral: ${domain.domain} (${alertType})`;
      
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #EDEDED; padding: 24px; border-radius: 8px; border: 1px solid #222;">
          <div style="border-bottom: 1px solid #333; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #FF4D4D; margin: 0; font-size: 20px;">Alerta de Regresión en Seguridad Web</h2>
            <p style="color: #888; font-size: 12px; margin: 4px 0 0 0;">DEFENSA TI - Monitor Perimetral Continuo</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="color: #888; padding: 6px 0; width: 140px;">Dominio:</td>
              <td style="color: #FFF; font-weight: bold; font-family: monospace;">${domain.domain}</td>
            </tr>
            <tr>
              <td style="color: #888; padding: 6px 0;">Tipo de Anomalía:</td>
              <td style="color: #F59E0B; font-weight: bold;">${alertType}</td>
            </tr>
            <tr>
              <td style="color: #888; padding: 6px 0;">Fecha / Hora (UTC):</td>
              <td style="color: #CCC; font-family: monospace;">${timestamp}</td>
            </tr>
          </table>

          <div style="background: #141414; border-left: 4px solid #FF4D4D; padding: 14px; margin-bottom: 20px; font-size: 13px; line-height: 1.5; color: #FFF;">
            <strong>Detalle del Hallazgo:</strong><br/>
            ${diffSummary}
          </div>

          <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #222; padding-top: 12px;">
            Esta alerta fue generada automáticamente por el nodo de monitoreo perimetral de DEFENSA TI.
          </p>
        </div>
      `;

      await resend.emails.send({
        from: process.env.ALERT_FROM_EMAIL || 'alertas@neuronalgravity.com',
        to: alertEmail,
        subject: emailSubject,
        html: emailHtml,
      });

      emailSent = true;
      console.log(`   [+] Correo de alerta despachado a: ${alertEmail}`);
    } catch (err) {
      console.error(`   [-] Error al despachar correo vía Resend:`, err);
    }
  }

  // 2. Envío vía Webhook (Slack / Microsoft Teams / Discord / Automatizaciones)
  const webhookUrl = domain.webhook_url || process.env.SLACK_ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const payload = {
        text: `🚨 *[DEFENSA TI] Alerta de Seguridad en ${domain.domain}*\n*Tipo:* \`${alertType}\`\n*Detalle:* ${diffSummary}\n*Timestamp:* ${timestamp}`,
        // Formato para Slack / Teams Card
        attachments: [
          {
            color: '#FF4D4D',
            title: `Regresión Detectada: ${domain.domain}`,
            text: diffSummary,
            fields: [
              { title: 'Dominio', value: domain.domain, short: true },
              { title: 'Tipo de Alerta', value: alertType, short: true },
            ],
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        webhookSent = true;
        console.log(`   [+] Notificación de webhook entregada exitosamente.`);
      } else {
        console.warn(`   [-] Webhook respondió con código: ${res.status}`);
      }
    } catch (err) {
      console.error(`   [-] Error al invocar webhook:`, err);
    }
  }

  return emailSent || webhookSent || true;
}
