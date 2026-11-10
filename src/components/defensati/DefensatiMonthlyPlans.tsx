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
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';

export default function DefensatiMonthlyPlans() {
  return (
    <section id="planes" className="w-full max-w-6xl xl:max-w-7xl mx-auto space-y-8 scroll-mt-24 text-left">
      
      {/* Encabezado */}
      <div className="space-y-2 border-b border-white/10 pb-5 max-w-4xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#30d158] font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 inline-block">
          TRANQUILIDAD CONTINUA &bull; MENSUALIDADES ACCESIBLES
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight pt-2">
          Monitoreo y Mantenimiento Mensual
        </h2>
        <p className="text-base sm:text-lg text-neutral-300">
          Un sitio web no se protege una sola vez. Vigilamos tu web día y noche para avisarte de inmediato si algo falla antes de que lo noten tus clientes.
        </p>
      </div>

      {/* Cuadrícula de 2 Planes Mensuales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Plan 1: Esencial (S/ 49/mes) */}
        <div className="p-7 sm:p-9 rounded-[32px] bg-[#0c101c]/85 border border-white/12 hover:border-white/20 transition-all flex flex-col justify-between space-y-6 backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider bg-white/5 px-3 py-1 rounded-full border border-white/10">
                Plan Esencial
              </span>
              <span className="text-xs text-neutral-400 font-mono">Sin permanencia</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">S/ 49</span>
                <span className="text-neutral-400 text-sm">/ mes (prepago)</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">Menos de S/ 1.70 al día por cuidar tu web.</p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-3">
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
                <span><strong>Soporte manual incluido:</strong> Hasta 30 minutos al mes para dudas o ajustes básicos.</span>
              </li>
            </ul>
          </div>

          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.precioMensual()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-sm font-bold border border-white/15 transition-all text-center"
          >
            <span>Activar Monitoreo (S/ 49/mes)</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </a>
        </div>

        {/* Plan 2: Pro (S/ 99/mes) */}
        <div className="p-7 sm:p-9 rounded-[32px] bg-gradient-to-b from-[#101b2a]/95 via-[#0c121e]/95 to-[#080d16]/98 border-2 border-[#0071e3]/50 hover:border-[#0071e3]/80 shadow-[0_20px_50px_rgba(0,113,227,0.25)] transition-all flex flex-col justify-between space-y-6 backdrop-blur-xl relative">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#38bdf8] uppercase tracking-wider bg-[#0071e3]/20 px-3 py-1 rounded-full border border-[#0071e3]/40">
                Nivel Pro &bull; Alta Disponibilidad
              </span>
              <span className="text-xs text-sky-400 font-mono font-semibold">Prioridad Máxima</span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">S/ 99</span>
                <span className="text-neutral-400 text-sm">/ mes (prepago)</span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">S/ 3.30 al día para blindar tu negocio transaccional.</p>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-3">
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
                <span><strong>Soporte manual prioritario:</strong> Hasta 1.5 horas al mes para remediaciones y configuración.</span>
              </li>
            </ul>
          </div>

          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.precioMensualPro()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-bold shadow-lg shadow-[#0071e3]/30 transition-all text-center"
          >
            <span>Contratar Plan Pro (S/ 99/mes)</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

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
          Facturación mes a mes formal con RUC
        </span>
      </div>

    </section>
  );
}
