'use client';

import React from 'react';
import { ShieldCheck, MessageCircle, CheckCircle2 } from 'lucide-react';
import { DEFENSATI_WHATSAPP_MESSAGES } from '@/lib/whatsapp';
import { siteConfig } from '@/config/site';

export default function DefensatiHero() {
  const whatsappUrl = DEFENSATI_WHATSAPP_MESSAGES.hero();

  return (
    <section className="relative w-full pt-8 pb-12 sm:pt-14 sm:pb-16 text-center">
      {/* Badge superior */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-[#38bdf8] text-xs sm:text-[13px] font-semibold mb-6 backdrop-blur-2xl shadow-[0_0_15px_rgba(56,189,248,0.2)]">
        <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
        <span>DEFENSA TI &bull; Seguridad y Limpieza Web en Perú</span>
      </div>

      {/* Título Principal en Primera Persona (Sin jerga técnica) */}
      <div className="max-w-4xl mx-auto space-y-4 px-4">
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] text-[#f5f5f7] leading-[1.08] whitespace-normal drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]">
          ¿Tu web fue hackeada o tiene virus?
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#2997ff] via-[#70baff] to-[#c084fc] mt-2 sm:mt-3 font-semibold tracking-[-0.035em]">
            Yo te limpio la web y la dejo blindada
          </span>
        </h1>

        {/* Subtítulo claro y directo */}
        <p className="text-base sm:text-xl text-[#d1d5db] font-normal leading-relaxed max-w-2xl mx-auto pt-2 tracking-[-0.01em] whitespace-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
          Soy Martín Castillo. Reviso tu página sin costo, encuentro los virus y te muestro la verdad antes de que decidas pagar.
        </p>
      </div>

      {/* UN SOLO BOTÓN PRINCIPAL DE WHATSAPP (Requerido por instrucción) */}
      <div className="mt-8 sm:mt-10 flex items-center justify-center max-w-md mx-auto px-4">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-[#30d158] hover:bg-[#28cd41] active:scale-[0.98] text-[#000000] font-bold text-base sm:text-lg shadow-[0_10px_35px_rgba(48,209,88,0.45),inset_0_1px_0_rgba(255,255,255,0.4)] transition-all cursor-pointer group"
        >
          <MessageCircle className="w-5 h-5 fill-current shrink-0" />
          <span className="leading-snug">Escríbeme por WhatsApp</span>
        </a>
      </div>

      {/* Micro-garantías visuales */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-[13px] text-[#a1a1a6] px-4 font-normal tracking-[-0.01em]">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
          Revisión previa sin costo
        </span>
        <span className="hidden sm:inline text-neutral-600">&bull;</span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
          Garantía de 30 días
        </span>
        <span className="hidden sm:inline text-neutral-600">&bull;</span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#30d158]" />
          Atención directa por Martín Castillo (RUC {siteConfig.business.ruc})
        </span>
      </div>
    </section>
  );
}
