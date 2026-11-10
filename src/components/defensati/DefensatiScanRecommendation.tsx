'use client';

import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  AlertTriangle, 
  Sparkles, 
  Activity, 
  Zap,
  Lock,
  Wrench
} from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { AuditReportRecord } from '@/lib/storage/reportStore';

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

  // Determinar nivel de diagnóstico comercial
  let planType: 'limpieza' | 'blindaje' | 'monitoreo' = 'blindaje';
  let badgeText = 'Vulnerabilidades Detectadas';
  let title = 'Recomendación: Blindaje Perimetral de tu Sitio Web';
  let priceText = 'S/ 165 (Pago único)';
  let diagnosisText = `Tu sitio presenta ${missingHeadersCount} cabeceras de seguridad ausentes y posibles puntos ciegos perimetrales. Aunque carga en el navegador, no cuenta con barreras defensivas contra ataques automatizados.`;
  let solutionText = 'Aplicamos cabeceras de seguridad estrictas (HSTS, CSP, X-Frame), ocultamos versiones de servidor y fortalecemos los accesos en menos de 48 horas sin alterar tu diseño.';
  let primaryIssue = `Faltan cabeceras OWASP (${missingHeadersCount}) y configuración perimetral`;

  if (score < 60 || grade === 'F' || grade === 'D') {
    planType = 'limpieza';
    badgeText = 'Alerta de Riesgo Alto / Crítico';
    title = 'Recomendación: Diagnóstico Forense & Limpieza de Urgencia';
    priceText = 'Desde S/ 250 (Garantía 30 días)';
    diagnosisText = `Tu sitio obtuvo nota baja (${score}/100, Grado ${grade}) con ${missingHeadersCount} fallas defensivas graves. Este estado lo hace un blanco fácil para virus, desvío de clientes a webs de spam o sanción en Google.`;
    solutionText = 'Desinfectamos los archivos y bases de datos, eliminamos posibles puertas traseras (backdoors) y dejamos el sitio blindado con garantía formal de 30 días.';
    primaryIssue = `Puntaje crítico (${score}/100, Grado ${grade}) y vulnerabilidad perimetral`;
  } else if (score >= 85 && (grade === 'A' || grade === 'A+')) {
    planType = 'monitoreo';
    badgeText = 'Configuración Saludable';
    title = 'Recomendación: Monitoreo Preventivo & Mantenimiento Mensual';
    priceText = 'S/ 49 / mes (Sin permanencia)';
    diagnosisText = `¡Excelente trabajo! Tu web obtuvo ${score}/100 (Grado ${grade}). Para que este estándar no se degrade con futuras actualizaciones de plugins o caídas de servidor, te conviene mantenerla vigilada.`;
    solutionText = 'Verificamos caídas cada 15 min, monitoreamos la expiración de tu SSL y te enviamos alertas directas a WhatsApp antes de que cualquier incidente afecte a tus clientes.';
    primaryIssue = 'Sitio en buen estado, mantener con monitoreo preventivo';
  }

  const whatsappUrl = DEFENSATI_WHATSAPP_MESSAGES.escanerContextual({
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
          <span className="text-xs text-neutral-400 block font-mono">Inversión sugerida:</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{priceText}</span>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-extrabold text-base sm:text-lg shadow-[0_10px_30px_rgba(37,211,102,0.35)] flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <MessageCircle className="w-5 h-5 fill-current shrink-0" />
          <span>
            {planType === 'limpieza'
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
