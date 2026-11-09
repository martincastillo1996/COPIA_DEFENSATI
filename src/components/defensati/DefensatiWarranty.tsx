'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

export default function DefensatiWarranty() {
  return (
    <section id="garantia" className="w-full max-w-5xl mx-auto scroll-mt-24 px-4 sm:px-6">
      <div className="p-7 sm:p-10 rounded-[32px] bg-gradient-to-b from-[#101824]/90 via-[#0d141e]/90 to-[#0a0f16]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative overflow-hidden">
        
        {/* Glow de seguridad verde esmeralda */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
          
          {/* Icono de Escudo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#30d158] shrink-0 shadow-inner">
            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          {/* Textos de Garantía */}
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[#2997ff] text-xs font-medium tracking-tight">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Garantía de Satisfacción DEFENSA TI</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-semibold text-[#f5f5f7] tracking-[-0.03em] leading-snug">
              Garantía de 30 Días
            </h3>

            <p className="text-lg sm:text-xl font-medium text-[#30d158] leading-snug">
              “Si tu web se vuelve a infectar en 30 días por la misma causa, la limpio gratis.”
            </p>

            <p className="text-sm sm:text-base text-[#a1a1a6] leading-relaxed max-w-2xl font-normal">
              Trabajamos con total transparencia técnica. Nos aseguramos de erradicar la causa raíz del problema para que puedas operar tu negocio con la certeza de que tu sitio está realmente protegido.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs sm:text-[13px] text-[#86868b]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#30d158]" />
                Respaldo formal con RUC 10704877850
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-[#30d158]" />
                Soporte de remediación inmediata
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
