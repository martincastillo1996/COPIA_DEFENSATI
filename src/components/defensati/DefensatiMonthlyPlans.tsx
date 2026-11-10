'use client';

import React from 'react';
import { 
  Activity, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Zap, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { trackPlanSelect, trackWhatsAppClick } from '@/lib/analytics';

export default function DefensatiMonthlyPlans() {
  return (
    <section id="planes" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-8 scroll-mt-24 text-left relative">
      <div id="planes-mensuales" className="absolute -top-24 pointer-events-none" />
      
      {/* Encabezado Estilo Apple Pro */}
      <div className="space-y-2 border-b border-white/10 pb-5 max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#30d158] font-semibold px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 inline-block">
          TRANQUILIDAD CONTINUA &bull; MENSUALIDADES ACCESIBLES
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold text-[#f5f5f7] tracking-[-0.03em] leading-tight pt-2">
          Monitoreo y Mantenimiento Mensual
        </h2>
        <p className="text-base sm:text-lg text-[#86868b] font-normal">
          Un sitio web no se protege una sola vez. Vigilamos tu web día y noche para avisarte de inmediato si algo falla antes de que lo noten tus clientes.
        </p>
      </div>

      {/* Cuadrícula de 2 Planes Mensuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Plan 1: Esencial (S/ 49/mes) */}
        <div className="p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] bg-[#161618]/70 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-6 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#f5f5f7] uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full border border-white/10">
                Plan Esencial
              </span>
              <span className="text-xs text-[#86868b] font-mono">Sin permanencia</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-bold text-[#f5f5f7] font-mono">S/ 49</span>
                <span className="text-[#86868b] text-sm font-normal">/ mes (prepago)</span>
              </div>
              <p className="text-xs text-[#86868b] mt-1 font-normal">Menos de S/ 1.70 al día por cuidar tu web.</p>
              <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed mt-3 font-normal">
                Ideal para blogs de negocio, páginas corporativas y profesionales independientes.
              </p>
            </div>

            <ul className="space-y-2.5 pt-3 border-t border-white/10 text-xs sm:text-sm text-neutral-200">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Uptime Check cada 15 min:</strong> Detección de caídas y aviso inmediato a tu WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Alerta preventiva de SSL:</strong> Aviso 30 días antes del vencimiento del certificado.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Re-escaneo mensual de seguridad:</strong> Informe ejecutivo directo a tu WhatsApp.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Soporte técnico incluido:</strong> Hasta 30 min al mes de intervención directa para ajustes menores de configuración perimetral o renovación básica de SSL (horas adicionales con tarifa preferencial).</span>
              </li>
            </ul>
          </div>

          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.precioMensual()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackPlanSelect({
                planName: 'Monitoreo Esencial',
                priceMonthlyPen: 49,
                planId: 'plan_esencial_49',
              });
              trackWhatsAppClick({
                service: 'monitoreo_esencial',
                placement: 'monthly_plans_esencial',
              });
            }}
            className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-[#f5f5f7] text-sm font-semibold border border-white/15 backdrop-blur-xl transition-all text-center cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Activar Monitoreo por WhatsApp (S/ 49/mes)</span>
          </a>
        </div>

        {/* Plan 2: Pro (S/ 99/mes) */}
        <div className="p-7 sm:p-9 rounded-[28px] sm:rounded-[32px] bg-[#161618]/70 border-2 border-[#0071e3]/40 hover:border-[#0071e3]/70 shadow-[0_20px_50px_rgba(0,113,227,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all flex flex-col justify-between space-y-6 backdrop-blur-2xl relative">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#2997ff] uppercase tracking-wider bg-[#0071e3]/20 px-3 py-1 rounded-full border border-[#0071e3]/30">
                Nivel Pro &bull; Alta Disponibilidad
              </span>
              <span className="text-xs text-sky-400 font-mono font-semibold">Prioridad Máxima</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-bold text-[#f5f5f7] font-mono">S/ 99</span>
                <span className="text-[#86868b] text-sm font-normal">/ mes (prepago)</span>
              </div>
              <p className="text-xs text-[#86868b] mt-1 font-normal">S/ 3.30 al día para blindar tu negocio transaccional.</p>
              <p className="text-xs sm:text-sm text-[#86868b] leading-relaxed mt-3 font-normal">
                Para tiendas WooCommerce, e-commerce activos y empresas con facturación constante en internet.
              </p>
            </div>

            <ul className="space-y-2.5 pt-3 border-t border-white/10 text-xs sm:text-sm text-neutral-200">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Uptime Check cada 5 min:</strong> Verificación continua de caídas con aviso prioritario.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Escaneos perimetrales semanales:</strong> Auditoría recurrente de puertos y cabeceras.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Alerta inmediata a WhatsApp:</strong> Reporte técnico listo para reenviar a tu hosting.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Soporte técnico prioritario:</strong> Hasta 60 min (1 hora) al mes de intervención directa para optimización de seguridad, reglas WAF o parches urgentes (horas adicionales con 25% de descuento).</span>
              </li>
            </ul>
          </div>

          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.precioMensualPro()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackPlanSelect({
                planName: 'Monitoreo Pro',
                priceMonthlyPen: 99,
                planId: 'plan_pro_99',
              });
              trackWhatsAppClick({
                service: 'monitoreo_pro',
                placement: 'monthly_plans_pro',
              });
            }}
            className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold shadow-[0_4px_16px_rgba(0,113,227,0.35)] transition-all text-center cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-current shrink-0" />
            <span>Contratar Plan Pro por WhatsApp (S/ 99/mes)</span>
          </a>
        </div>

      </div>

      {/* Delimitación de Alcance y Garantía de Rentabilidad */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0a0f18]/80 border border-white/10 text-xs sm:text-sm text-neutral-300 space-y-2">
        <div className="flex items-center gap-2 text-white font-semibold">
          <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
          <span>Alcance claro y delimitado del servicio mensual</span>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed font-normal">
          Los planes de monitoreo cubren vigilancia automatizada 24/7, detección temprana de caídas, alerta preventiva de certificados SSL y respuesta ante incidencias de seguridad. <strong className="text-neutral-200">No incluyen</strong> maquetación web, rediseño gráfico, creación de contenidos ni programación a medida ajena a la seguridad. Esta delimitación garantiza que podamos responderte en minutos manteniendo una tarifa accesible y sostenible.
        </p>
      </div>

      {/* Nota de Tranquilidad y Cero Compromisos */}
      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400 text-center">
        <span className="flex items-center gap-1.5 text-neutral-300">
          <RotateCcw className="w-4 h-4 text-emerald-400" />
          Cancela en cualquier momento con un mensaje por WhatsApp
        </span>
        <span className="hidden sm:inline">&bull;</span>
        <span className="flex items-center gap-1.5 text-neutral-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Sin permanencia forzosa
        </span>
        <span className="hidden sm:inline">&bull;</span>
        <span className="flex items-center gap-1.5 text-neutral-300">
          <Clock className="w-4 h-4 text-emerald-400" />
          Vigilancia automatizada 24/7 &bull; Soporte Lun-Sáb 9:00 - 20:00
        </span>
      </div>

    </section>
  );
}
