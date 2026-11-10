'use client';

import React from 'react';
import { MessageCircle, Search, ShieldCheck, CheckCircle2, Sparkles, Clock, FileText } from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';
import { trackWhatsAppClick, trackDiagnosticRequest } from '@/lib/analytics';

export default function DefensatiFinalCTA() {
  const scrollToScan = () => {
    trackDiagnosticRequest({ source: 'final_cta_scan_button' });
    const el = document.getElementById('escaner-gratis');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="w-full max-w-5xl mx-auto scroll-mt-24 text-center">
      <div className="relative p-8 sm:p-14 rounded-[36px] bg-gradient-to-b from-[#0e1626]/95 via-[#0c121e]/95 to-[#080d14]/98 border border-white/12 shadow-[0_25px_70px_rgba(0,0,0,0.7)] backdrop-blur-3xl overflow-hidden space-y-8">
        
        {/* Glow de fondo Apple Pro */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#0071e3]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-1/4 w-80 h-80 bg-[#30d158]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[#38bdf8] text-xs font-semibold tracking-tight">
            <Sparkles className="w-3.5 h-3.5 text-[#30d158]" />
            <span>ATENCIÓN TÉCNICA INMEDIATA</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            No arriesgues la reputación ni las ventas de tu negocio
          </h2>

          <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
            Escríbenos por WhatsApp y te decimos qué vulnerabilidades o archivos infectados encontramos en tu web antes de que contrates cualquier servicio.
          </p>
        </div>

        {/* Botones de Conversión */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto pt-2">
          <a
            href={DEFENSATI_WHATSAPP_MESSAGES.hero()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackWhatsAppClick({
                service: 'general',
                placement: 'final_cta_button',
              })
            }
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-bold text-base sm:text-lg shadow-[0_12px_35px_rgba(37,211,102,0.35)] flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current shrink-0" />
            <span>Hablar por WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={scrollToScan}
            className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/[0.06] hover:bg-white/[0.1] active:scale-[0.98] border border-white/15 text-white font-medium text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#38bdf8]" />
            <span>Probar escáner gratis</span>
          </button>
        </div>

        {/* Micro-Garantías de Cierre */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-y-2.5 gap-x-6 text-xs sm:text-[13px] text-neutral-400">
          <span className="inline-flex items-center gap-1.5 text-neutral-300">
            <CheckCircle2 className="w-4 h-4 text-[#30d158] shrink-0" />
            Diagnóstico inicial sin costo
          </span>
          <span className="hidden sm:inline text-white/20">&bull;</span>
          <span className="inline-flex items-center gap-1.5 text-neutral-300">
            <ShieldCheck className="w-4 h-4 text-[#30d158] shrink-0" />
            Garantía de 30 días
          </span>
          <span className="hidden sm:inline text-white/20">&bull;</span>
          <span className="inline-flex items-center gap-1.5 text-neutral-300">
            <Clock className="w-4 h-4 text-[#38bdf8] shrink-0" />
            Respuesta en &lt; 2 horas
          </span>
          <span className="hidden sm:inline text-white/20">&bull;</span>
          <span className="inline-flex items-center gap-1.5 text-neutral-300">
            <FileText className="w-4 h-4 text-[#c084fc] shrink-0" />
            Factura / Boleta RUC {siteConfig.business.ruc}
          </span>
        </div>

      </div>
    </section>
  );
}
