'use client';

import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  Zap,
  Lock,
  Wrench
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackWhatsAppClick } from '@/lib/analytics';
import { AuditReportRecord } from '@/lib/storage/reportStore';
import { isHyperscalePlatform } from '@/lib/hyperscalers';

interface Props {
  report: AuditReportRecord;
  cleanDomain: string;
}

export default function DefensatiScanRecommendation({ report, cleanDomain }: Props) {
  const score = report.score ?? 0;
  const grade = report.grade || 'F';
  const sslDays = report.ssl?.daysRemaining;
  const hasSslIssue = !report.ssl?.valid || (typeof sslDays === 'number' && sslDays < 30);
  const openPortsCount = report.ports?.filter(p => p.isOpen).length ?? 0;
  const missingHeadersCount = report.headers?.filter(h => !h.present || h.status === 'missing' || h.status === 'fail').length ?? 0;
  const isHyperscale = Boolean(report.isHyperscale) || isHyperscalePlatform(cleanDomain) || isHyperscalePlatform(report.url);
  const isFullySecure = missingHeadersCount === 0 && (score >= 90 || grade === 'A' || grade === 'A+');

  // Determinar nivel de diagnóstico comercial
  let planType: 'limpieza' | 'blindaje' | 'monitoreo' = 'blindaje';
  let badgeText = 'Vulnerabilidades Detectadas';
  let title = 'Recomendación: Blindaje + WAF Cloudflare (Unificado)';
  let priceText = 'S/ 450 (Pago único)';
  let diagnosisText = `Tu sitio presenta ${missingHeadersCount} cabeceras de seguridad ausentes y posibles puntos ciegos perimetrales. Aunque carga en el navegador, no cuenta con barreras defensivas contra ataques automatizados ni bots.`;
  let solutionText = 'Aplicamos cabeceras estrictas (HSTS, CSP, X-Frame), Firewall WAF Cloudflare perimetral y optimización DNS anti-suplantación en 3 a 5 días sin alterar tu diseño.';
  let primaryIssue = `Faltan cabeceras OWASP (${missingHeadersCount}) y protección perimetral WAF`;

  if (isHyperscale) {
    planType = 'monitoreo';
    badgeText = '🏢 Infraestructura Global de Hiperescala';
    title = 'Caso de Estudio: Arquitectura Multinacional Dedicada';
    priceText = 'Infraestructura Propietaria (Multi-Cloud)';
    diagnosisText = `Este dominio pertenece a una corporación tecnológica global con centros de datos propios, Anycast CDN y mitigación masiva contra ataques DDoS. Las directivas perimetrales se gestionan internamente a nivel de cluster.`;
    solutionText = 'Las grandes multinacionales cuentan con redes privadas y equipos de ciberdefensa 24/7. Esta auditoría sirve como caso de estudio de cómo una empresa puede replicar este nivel de protección con cabeceras OWASP estrictas y WAF Cloudflare.';
    primaryIssue = 'Infraestructura multinacional de hiperescala';
  } else if (isFullySecure) {
    planType = 'monitoreo';
    badgeText = '✅ 100% Blindado y Conforme';
    title = '¡Excelente! Tu web cumple todos los estándares de seguridad';
    priceText = 'Estado Óptimo • S/ 0 (Sin fallas)';
    diagnosisText = `¡Felicitaciones! Tu sitio web obtuvo ${score}/100 (Grado ${grade}) con directivas de seguridad completas y sin puertos vulnerables expuestos. La navegación viaja cifrada y tus clientes navegan con total confianza.`;
    solutionText = 'Tu infraestructura perimetral se encuentra en el más alto nivel técnico. No requieres servicios de remediación ni blindaje de emergencia. Si en el futuro deseas tranquilidad permanente contra caídas imprevistas o expiración SSL, nuestro plan mensual es 100% opcional.';
    primaryIssue = 'Sitio en estado óptimo, no requiere intervención correctiva';
  } else if (score < 60 || grade === 'F' || grade === 'D') {
    planType = 'limpieza';
    badgeText = 'Alerta de Riesgo Alto / Crítico';
    title = 'Recomendación: Rescate / Limpieza de malware';
    priceText = 'S/ 380 (Corp) | S/ 550 (WooCommerce)';
    diagnosisText = `Tu sitio obtuvo nota baja (${score}/100, Grado ${grade}) con ${missingHeadersCount} fallas defensivas graves. Este estado lo hace un blanco fácil para virus, desvío de clientes a webs de spam o sanción en Google.`;
    solutionText = 'Desinfectamos los archivos y base de datos con respaldo previo, eliminamos virus o puertas traseras y reactivamos tu hosting con garantía formal de 30 días.';
    primaryIssue = `Puntaje crítico (${score}/100, Grado ${grade}) y vulnerabilidad perimetral`;
  } else if (score >= 85 && (grade === 'A' || grade === 'A+')) {
    planType = 'monitoreo';
    badgeText = 'Configuración Saludable';
    title = 'Recomendación: Mantenimiento Mensual 24/7';
    priceText = 'S/ 90 / mes (Sin permanencia)';
    diagnosisText = `¡Excelente trabajo! Tu web obtuvo ${score}/100 (Grado ${grade}). Para que este estándar no se degrade con futuras actualizaciones de plugins o caídas de servidor, te conviene mantenerla vigilada.`;
    solutionText = 'Verificamos caídas cada 15 min, monitoreamos la expiración de tu SSL y te enviamos alertas directas a WhatsApp con soporte técnico incluido.';
    primaryIssue = 'Sitio en buen estado, mantener con monitoreo preventivo';
  }

  const whatsappUrl = isHyperscale
    ? `https://wa.me/17856433991?text=${encodeURIComponent(
        `Hola Martín, estuve revisando el análisis de referencia de ${cleanDomain} en DEFENSA TI y quisiera cotizar una arquitectura de blindaje perimetral para mi empresa.`
      )}`
    : DEFENSATI_WHATSAPP_MESSAGES.escanerContextual({
        domain: cleanDomain,
        score,
        grade,
        primaryIssue,
        recommendation: planType,
      });

  return (
    <div className="p-6 sm:p-9 rounded-[32px] bg-gradient-to-b from-[#101826]/95 via-[#0c121e]/95 to-[#080d16]/98 border-2 border-[#0071e3]/50 shadow-[0_20px_60px_rgba(0,113,227,0.25)] backdrop-blur-2xl space-y-6 text-left">
      
      {/* Encabezado del Hallazgo Comercial */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <span className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
            planType === 'limpieza'
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : planType === 'monitoreo'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-sky-500/15 border-sky-500/30 text-[#38bdf8]'
          }`}>
            {badgeText}
          </span>
          <span className="text-xs text-neutral-400 font-mono">
            Dictamen oficial DEFENSA TI
          </span>
        </div>

        <div className="text-xs font-mono text-neutral-300">
          Dominio: <strong className="text-white">{cleanDomain}</strong>
        </div>
      </div>

      {/* Explicación en lenguaje directo */}
      <div className="space-y-3">
        <h4 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
          {title}
        </h4>
        
        <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-normal">
          {diagnosisText}
        </p>
      </div>

      {/* Resumen de hallazgos técnicos en lenguaje para negocio */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <span className="text-[11px] uppercase font-mono text-neutral-400">Certificado SSL/TLS</span>
          <p className="text-sm font-bold text-white flex items-center gap-1.5">
            {hasSslIssue ? (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Requiere atención ({sslDays ?? 0} días)
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Válido ({sslDays ?? 0} días restantes)
              </span>
            )}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <span className="text-[11px] uppercase font-mono text-neutral-400">Cabeceras OWASP</span>
          <p className="text-sm font-bold text-white flex items-center gap-1.5">
            {missingHeadersCount > 0 ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {missingHeadersCount} cabeceras sin aplicar
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Cabeceras completas
              </span>
            )}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
          <span className="text-[11px] uppercase font-mono text-neutral-400">Puertos de Servidor</span>
          <p className="text-sm font-bold text-white flex items-center gap-1.5">
            {openPortsCount > 2 ? (
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {openPortsCount} puertos expuestos
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Puertos estándar
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Solución técnica propuesta */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#38bdf8]">
          <Wrench className="w-4 h-4 text-[#38bdf8]" />
          <span>Plan de acción técnico llave en mano:</span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-normal">
          {solutionText}
        </p>
      </div>

      {/* Botón de Conversión Contextual */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-neutral-400 block font-mono">
            {isHyperscale
              ? 'Nivel de Infraestructura:'
              : isFullySecure
              ? 'Diagnóstico perimetral:'
              : 'Inversión sugerida:'}
          </span>
          <span className={`text-xl sm:text-2xl font-extrabold font-mono ${
            isHyperscale
              ? 'text-sky-400'
              : isFullySecure
              ? 'text-emerald-400'
              : 'text-white'
          }`}>
            {priceText}
          </span>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackWhatsAppClick({
              service: isHyperscale ? 'general' : isFullySecure ? 'general' : planType,
              placement: 'post_scan_recommendation_card',
              domain: cleanDomain,
            })
          }
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-extrabold text-base sm:text-lg shadow-[0_10px_30px_rgba(37,211,102,0.35)] flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <WhatsAppIcon className="w-5 h-5 fill-current shrink-0" />
          <span>
            {isHyperscale
              ? 'Cotizar blindaje similar para mi empresa por WhatsApp'
              : isFullySecure
              ? 'Consultar o solicitar reporte por WhatsApp'
              : planType === 'limpieza'
              ? 'Solicitar desinfección y blindaje por WhatsApp'
              : planType === 'monitoreo'
              ? 'Activar monitoreo mensual por WhatsApp'
              : 'Corregir y blindar mi web por WhatsApp'}
          </span>
        </a>
      </div>

      <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
        <span>No se requieren contraseñas ni accesos confidenciales para este diagnóstico.</span>
        <span className="text-emerald-400 font-semibold">Garantía por escrito &bull; Factura formal con RUC</span>
      </div>

    </div>
  );
}
