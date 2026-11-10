'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

export default function PreviewWarranty() {
  return (
    <section id="garantia" className="w-full max-w-6xl xl:max-w-7xl mx-auto scroll-mt-24">
      <div className="p-7 sm:p-10 rounded-[32px] bg-linear-to-b from-[#10141e] via-[#0d1017] to-[#090b10] border border-emerald-500/30 shadow-[0_15px_40px_rgba(16,185,129,0.1)] relative overflow-hidden">
        
        {/* Glow de seguridad verde esmeralda */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
          
          {/* Icono de Escudo */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          {/* Textos de Garantía */}
          <div className="space-y-3 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Garantía de Satisfacción DEFENSA TI</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Garantía de 30 Días
            </h3>

            <p className="text-base sm:text-lg font-bold text-emerald-300 leading-snug">
              “Si tu web se vuelve a infectar en 30 días por la misma causa, la limpio gratis.”
            </p>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
              Trabajamos con total transparencia técnica. Nos aseguramos de erradicar la causa raíz del problema para que puedas operar tu negocio con la certeza de que tu sitio está realmente protegido.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-neutral-400">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Respaldo directo con RUC 10704877850
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="inline-flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                Soporte de remediación inmediata
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
