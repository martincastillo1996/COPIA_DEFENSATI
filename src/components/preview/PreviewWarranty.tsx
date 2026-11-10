'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

export default function PreviewWarranty() {
  return (
    <section id="garantia" className="w-full max-w-6xl xl:max-w-7xl mx-auto scroll-mt-24">
      <div className="p-7 sm:p-10 rounded-[32px] bg-gradient-to-b from-[#0e271c]/90 via-[#091a13]/90 to-[#050f0b]/95 border-2 border-emerald-400/50 shadow-[0_20px_60px_rgba(16,185,129,0.22)] backdrop-blur-2xl relative overflow-hidden">
        
        {/* Glow de seguridad verde esmeralda */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/18 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
          
          {/* Icono de Escudo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center text-[#34d399] shrink-0 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          {/* Textos de Garantía */}
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold tracking-tight shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Garantía de Satisfacción DEFENSA TI</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug">
              Garantía de 30 Días
            </h3>

            <p className="text-lg sm:text-2xl font-extrabold text-[#34d399] leading-snug drop-shadow-[0_0_15px_rgba(16,185,129,0.35)]">
              “Si tu web se vuelve a infectar en 30 días por la misma causa, la limpio gratis.”
            </p>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl font-normal">
              Trabajamos con total transparencia técnica. Nos aseguramos de erradicar la causa raíz del problema para que puedas operar tu negocio con la certeza de que tu sitio está realmente protegido.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs sm:text-[13px] text-emerald-200/80">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
                Respaldo formal con RUC 10704877850
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                <RotateCcw className="w-4 h-4 text-[#34d399]" />
                Soporte de remediación inmediata
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
